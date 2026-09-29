import { CN_OPERATOR_TRANSLATIONS } from '@/data/cnOperatorTranslations';
import {
  maskTextForTranslation,
  unmaskTextAfterTranslation,
  applyArknightsGlossary,
  cleanArknightsTalentNameRu,
  cleanArknightsTalentTextRu,
} from '@/data/arknightsGlossary';
import {
  getStaticTextTranslation,
  STATIC_OPERATOR_DATA_RU,
} from '@/data/translations/staticTranslationsRu';
import {
  getOperatorLocalizationRu,
  getSkillLocalizationRu,
  getSkinLocalizationRu,
  getModuleLocalizationRu,
  RU_SKIN_BRANDS,
  OPERATOR_ID_ALIASES,
} from '@/data/translations/ruDatabase';
import {
  RU_TALENT_NAMES,
  translateTalentNameRu,
  translateTalentDescriptionRu,
  CURATED_OPERATOR_TALENTS_RU,
} from '@/data/translations/ruTalentsDatabase';
import { CN_TALENT_NAMES_MAP } from '@/data/translations/cnOperatorsComplete';
import type { AppLanguage } from '@/types/game';

const STORAGE_CACHE_KEY = 'ark_trans_cache_v9_arts_damage';

// In-memory cache
const memoryCache: Record<string, string> = {};

// Load cache from localStorage
try {
  const saved = localStorage.getItem(STORAGE_CACHE_KEY);
  if (saved) {
    Object.assign(memoryCache, JSON.parse(saved));
  }
} catch {
  // ignore
}

function saveCacheToStorage() {
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    // ignore quota errors
  }
}

/**
 * Checks if a string contains any Chinese characters (CJK Unified Ideographs)
 */
export function hasChinese(str?: string | null): boolean {
  if (!str) return false;
  return /[\u4e00-\u9fa5]/.test(str);
}

/**
 * Checks if a string contains any Cyrillic characters
 */
export function hasCyrillic(str?: string | null): boolean {
  if (!str) return false;
  return /[а-яёА-ЯЁ]/.test(str);
}

/**
 * Determines if text needs translation based on target language
 */
export function needsTranslation(
  str?: string | null,
  targetLang: AppLanguage = 'en'
): boolean {
  if (!str || !str.trim()) return false;
  const s = str.trim();

  if (targetLang === 'ru') {
    if (hasChinese(s)) return true;
    if (!hasCyrillic(s) && /[a-zA-Z]{2,}/.test(s)) return true;
    return false;
  } else if (targetLang === 'cn') {
    return !hasChinese(s);
  } else {
    return hasChinese(s);
  }
}

/**
 * Optional network fallback to Google Translate with tag protection and timeout
 */
async function fetchGoogleTranslateSafe(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return '';
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((chunk: any) => (Array.isArray(chunk) ? chunk[0] : ''))
        .join('')
        .trim();
      return translated || '';
    }
  } catch {
    // Network offline or rate limited - fail silently and cleanly
  }

  return '';
}

/**
 * Translates a text string into target language ('ru' | 'en' | 'cn')
 * 100% offline-first lookup via curated databases
 */
export async function translateText(
  text: string,
  targetLang: AppLanguage = 'en'
): Promise<string> {
  if (!text) return '';
  const trimmed = text.trim();

  // 1. Target: Chinese (CN)
  if (targetLang === 'cn') {
    if (hasChinese(trimmed)) return text;
    const cacheKey = `cn:${trimmed}`;
    if (memoryCache[cacheKey]) return memoryCache[cacheKey];

    const { maskedText, tokens } = maskTextForTranslation(trimmed);
    const cnRes = await fetchGoogleTranslateSafe(maskedText, 'en', 'zh-CN');
    if (cnRes) {
      const finalCn = unmaskTextAfterTranslation(cnRes, tokens);
      memoryCache[cacheKey] = finalCn;
      saveCacheToStorage();
      return finalCn;
    }
    return text;
  }

  // 2. Target: Russian (RU)
  if (targetLang === 'ru') {
    // Check skin brand dictionary
    if (RU_SKIN_BRANDS[trimmed]) {
      return RU_SKIN_BRANDS[trimmed];
    }

    // Check static generic terms
    const staticRu = getStaticTextTranslation(trimmed);
    if (staticRu) return staticRu;

    // Check talent names dictionary
    if (RU_TALENT_NAMES[trimmed]) {
      return RU_TALENT_NAMES[trimmed];
    }

    // Check memory cache
    const cacheKey = `ru:${trimmed}`;
    if (memoryCache[cacheKey]) return memoryCache[cacheKey];

    if (!needsTranslation(trimmed, 'ru')) return text;

    // Mask tags & blackboard params
    const { maskedText, tokens } = maskTextForTranslation(trimmed);

    let rawRu = '';
    if (hasChinese(trimmed)) {
      // Step 1: ZH -> EN
      const enPivot = await fetchGoogleTranslateSafe(maskedText, 'zh-CN', 'en');
      if (enPivot) {
        rawRu = await fetchGoogleTranslateSafe(enPivot, 'en', 'ru');
      }
      if (!rawRu) {
        rawRu = await fetchGoogleTranslateSafe(maskedText, 'zh-CN', 'ru');
      }
    } else {
      rawRu = await fetchGoogleTranslateSafe(maskedText, 'en', 'ru');
    }

    if (rawRu) {
      const unmasked = unmaskTextAfterTranslation(rawRu, tokens);
      const finalResult = applyArknightsGlossary(unmasked);
      memoryCache[cacheKey] = finalResult;
      saveCacheToStorage();
      return finalResult;
    }

    // If network unavailable, try deterministic Arknights engine first
    const offlineEngineRu = translateTalentDescriptionRu(trimmed);
    if (offlineEngineRu && offlineEngineRu !== trimmed) {
      memoryCache[cacheKey] = offlineEngineRu;
      saveCacheToStorage();
      return offlineEngineRu;
    }

    // If network unavailable, apply glossary directly on available text
    return applyArknightsGlossary(trimmed);
  }

  // 3. Target: English (EN)
  if (!hasChinese(trimmed)) return text;

  // Check offline CN talent names map first for instant zero-latency translation
  if (CN_TALENT_NAMES_MAP[trimmed]?.en) {
    return CN_TALENT_NAMES_MAP[trimmed].en;
  }

  const cacheKey = `en:${trimmed}`;
  if (memoryCache[cacheKey]) return memoryCache[cacheKey];

  const { maskedText, tokens } = maskTextForTranslation(trimmed);
  const enRes = await fetchGoogleTranslateSafe(maskedText, 'zh-CN', 'en');
  if (enRes) {
    const finalEn = unmaskTextAfterTranslation(enRes, tokens);
    memoryCache[cacheKey] = finalEn;
    saveCacheToStorage();
    return finalEn;
  }

  return text;
}

/**
 * Resolves translation for an operator skill (name & description)
 * Offline-first: matches database curated skills, then generic skill dictionary.
 */
export async function getTranslatedSkillInfo(
  charId: string,
  skillId: string,
  rawName: string,
  rawDesc: string,
  rawNameCn?: string,
  rawDescCn?: string,
  targetLang: AppLanguage = 'en'
): Promise<{ name: string; description: string }> {
  if (targetLang === 'cn') {
    return {
      name: rawNameCn || rawName,
      description: rawDescCn || rawDesc,
    };
  }

  if (targetLang === 'ru') {
    // 1. Check comprehensive Arknights RU database
    const localSkill = getSkillLocalizationRu(charId, skillId, rawName);
    if (localSkill) {
      return {
        name: localSkill.name,
        description: localSkill.description,
      };
    }

    // 2. Check static operator translations
    const staticSkill = STATIC_OPERATOR_DATA_RU[charId]?.skills?.[skillId];
    if (staticSkill) {
      return {
        name: staticSkill.name,
        description: staticSkill.description || (await translateText(rawDesc, 'ru')),
      };
    }

    // 3. Translate dynamically with tag protection and glossary
    const [tlName, tlDesc] = await Promise.all([
      needsTranslation(rawName, 'ru') ? translateText(rawName, 'ru') : Promise.resolve(rawName),
      needsTranslation(rawDesc, 'ru') ? translateText(rawDesc, 'ru') : Promise.resolve(rawDesc),
    ]);

    return { name: tlName, description: tlDesc };
  }

  // Target: EN
  return {
    name: needsTranslation(rawName, 'en') ? await translateText(rawName, 'en') : rawName,
    description: needsTranslation(rawDesc, 'en') ? await translateText(rawDesc, 'en') : rawDesc,
  };
}

/**
 * Resolves translation for an operator's talents.
 * Offline-first: matches curated database talents.
 */
export async function getTranslatedTalents(
  charId: string,
  talents: any[],
  targetLang: AppLanguage = 'en'
): Promise<any[]> {
  if (targetLang === 'cn') {
    return talents.map((t) => ({
      ...t,
      candidates: (t.candidates || []).map((cand: any) => ({
        ...cand,
        name: cand.nameCn || cand.name,
        description: cand.descriptionCn || cand.description,
      })),
    }));
  }

  if (targetLang === 'ru') {
    const canonicalId = OPERATOR_ID_ALIASES[charId] || charId;
    const opDb = getOperatorLocalizationRu(charId) || getOperatorLocalizationRu(canonicalId);
    const staticOp = STATIC_OPERATOR_DATA_RU[charId] || STATIC_OPERATOR_DATA_RU[canonicalId];
    const curatedList = CURATED_OPERATOR_TALENTS_RU[charId] || CURATED_OPERATOR_TALENTS_RU[canonicalId];
    const cnCurated = CN_OPERATOR_TRANSLATIONS[charId] || CN_OPERATOR_TRANSLATIONS[canonicalId];

    return talents.map((talent, idx) => {
      const dbTalent = opDb?.talents?.[idx];
      const staticTalent = staticOp?.talents?.[idx];
      const curatedTalent = curatedList?.[idx];
      const cnTalent = cnCurated?.talents?.[idx];

      const candidates = (talent.candidates || []).map((cand: any) => {
        const rawName = cand.name || cand.nameCn || '';
        const rawDesc = cand.description || cand.descriptionCn || '';

        // 1. Resolve Talent Name (100% offline coverage via RU_TALENT_NAMES)
        let name =
          dbTalent?.name ||
          curatedTalent?.name ||
          staticTalent?.name ||
          cnTalent?.name ||
          translateTalentNameRu(rawName);
        name = cleanArknightsTalentNameRu(name);

        // 2. Resolve Talent Description (Offline-first via curated or engine)
        let description = '';
        if (
          dbTalent?.description &&
          (!cand.description || cand.unlockPhase === 2 || (talent.candidates || []).length === 1)
        ) {
          description = dbTalent.description;
        } else if (
          curatedTalent?.description &&
          (!cand.description || cand.unlockPhase === 2 || (talent.candidates || []).length === 1)
        ) {
          description = curatedTalent.description;
        } else if (
          staticTalent?.description &&
          (!cand.description || cand.unlockPhase === 2 || (talent.candidates || []).length === 1)
        ) {
          description = staticTalent.description;
        } else if (
          cnTalent?.description &&
          (!cand.description || cand.unlockPhase === 2 || (talent.candidates || []).length === 1)
        ) {
          description = cnTalent.description;
        } else {
          description = translateTalentDescriptionRu(rawDesc);
        }
        description = cleanArknightsTalentTextRu(description);

        return {
          ...cand,
          name,
          description,
        };
      });

      return {
        ...talent,
        candidates,
      };
    });
  }

  // Target: EN
  const canonicalId = OPERATOR_ID_ALIASES[charId] || charId;
  const curated = CN_OPERATOR_TRANSLATIONS[charId] || CN_OPERATOR_TRANSLATIONS[canonicalId];

  return Promise.all(
    talents.map(async (talent, idx) => {
      const curatedTalent = curated?.talents?.[idx];

      const candidates = await Promise.all(
        (talent.candidates || []).map(async (cand: any) => {
          let name =
            curatedTalent?.name ||
            CN_TALENT_NAMES_MAP[cand.nameCn]?.en ||
            CN_TALENT_NAMES_MAP[cand.name]?.en ||
            cand.name ||
            cand.nameCn ||
            '';
          let description = curatedTalent?.description || cand.description || cand.descriptionCn || '';

          if (needsTranslation(name, 'en')) {
            name = CN_TALENT_NAMES_MAP[name]?.en || (await translateText(name, 'en'));
          }

          if (needsTranslation(description, 'en')) {
            description = await translateText(description, 'en');
          }

          return {
            ...cand,
            name,
            description,
          };
        })
      );

      return {
        ...talent,
        candidates,
      };
    })
  );
}

/**
 * Resolves translation for an operator's lore quote / itemDesc into targetLang ('en' | 'ru' | 'cn').
 */
export async function getTranslatedQuote(
  charId: string,
  quote: string,
  quoteCn?: string,
  targetLang: AppLanguage = 'en'
): Promise<string> {
  if (targetLang === 'cn') {
    return quoteCn || quote || '';
  }

  if (targetLang === 'ru') {
    const dbOp = getOperatorLocalizationRu(charId);
    if (dbOp?.quote) return dbOp.quote;

    const staticOp = STATIC_OPERATOR_DATA_RU[charId];
    if (staticOp?.quote) return staticOp.quote;
  }

  const curated = CN_OPERATOR_TRANSLATIONS[charId];
  const text = curated?.quote || quote || '';
  if (needsTranslation(text, targetLang)) {
    return translateText(text, targetLang);
  }
  return text;
}

/**
 * Resolves translation for operator skins (name, collection brand, story content, voice dialog).
 */
export async function getTranslatedSkinInfo(
  charId: string,
  skinId: string,
  rawName: string,
  rawGroupName: string,
  rawContent: string,
  rawDialog: string,
  targetLang: AppLanguage = 'en'
): Promise<{ skinName: string; skinGroupName: string; content: string; dialog: string }> {
  if (targetLang === 'cn') {
    return {
      skinName: rawName,
      skinGroupName: rawGroupName,
      content: rawContent,
      dialog: rawDialog,
    };
  }

  if (targetLang === 'ru') {
    const dbSkin = getSkinLocalizationRu(charId, skinId, rawGroupName);
    const skinName = dbSkin?.skinName || (needsTranslation(rawName, 'ru') ? await translateText(rawName, 'ru') : rawName);
    const skinGroupName = dbSkin?.skinGroupName || RU_SKIN_BRANDS[rawGroupName] || (needsTranslation(rawGroupName, 'ru') ? await translateText(rawGroupName, 'ru') : rawGroupName);
    const content = dbSkin?.content || (needsTranslation(rawContent, 'ru') ? await translateText(rawContent, 'ru') : rawContent);
    const dialog = dbSkin?.dialog || (needsTranslation(rawDialog, 'ru') ? await translateText(rawDialog, 'ru') : rawDialog);

    return {
      skinName,
      skinGroupName,
      content,
      dialog,
    };
  }

  // Target: EN
  return {
    skinName: needsTranslation(rawName, 'en') ? await translateText(rawName, 'en') : rawName,
    skinGroupName: needsTranslation(rawGroupName, 'en') ? await translateText(rawGroupName, 'en') : rawGroupName,
    content: needsTranslation(rawContent, 'en') ? await translateText(rawContent, 'en') : rawContent,
    dialog: needsTranslation(rawDialog, 'en') ? await translateText(rawDialog, 'en') : rawDialog,
  };
}

/**
 * Resolves translation for operator modules into targetLang ('en' | 'ru' | 'cn').
 * Offline-first: matches curated database module entries.
 */
export async function getTranslatedModules(
  charId: string,
  modules: any[],
  targetLang: AppLanguage = 'en'
): Promise<any[]> {
  if (targetLang === 'cn') {
    return modules.map((mod) => ({
      ...mod,
      name: mod.nameCn || mod.name,
      desc: mod.descCn || mod.desc,
    }));
  }

  return Promise.all(
    modules.map(async (mod) => {
      let name = mod.name;
      let desc = mod.desc;
      let stages = mod.stages;

      if (targetLang === 'ru') {
        const localMod = getModuleLocalizationRu(charId, mod.id);
        if (localMod) {
          name = localMod.name;
          if (localMod.desc) desc = localMod.desc;

          if (Array.isArray(stages) && localMod.stages) {
            stages = stages.map((st: any) => {
              const localStage = localMod.stages?.find((ls) => ls.stage === st.stage);
              return {
                ...st,
                traitChange: localStage?.traitChange || st.traitChange,
                talentChange: localStage?.talentChange || st.talentChange,
              };
            });
          }
        }
      }

      if (needsTranslation(name, targetLang)) {
        name = await translateText(name, targetLang);
      }

      if (desc && needsTranslation(desc, targetLang)) {
        desc = await translateText(desc, targetLang);
      }

      if (Array.isArray(stages)) {
        stages = await Promise.all(
          stages.map(async (st: any) => {
            let traitChange = st.traitChange;
            if (traitChange && needsTranslation(traitChange, targetLang)) {
              traitChange = await translateText(traitChange, targetLang);
            }

            let talentChange = st.talentChange;
            if (talentChange) {
              let tName = talentChange.name;
              let tDesc = talentChange.description;
              if (tName && needsTranslation(tName, targetLang)) {
                tName = await translateText(tName, targetLang);
              }
              if (tDesc && needsTranslation(tDesc, targetLang)) {
                tDesc = await translateText(tDesc, targetLang);
              }
              if (targetLang === 'ru') {
                if (tName) tName = cleanArknightsTalentNameRu(tName);
                if (tDesc) tDesc = cleanArknightsTalentTextRu(tDesc);
              }
              talentChange = {
                ...talentChange,
                name: tName,
                description: tDesc,
              };
            }

            return {
              ...st,
              traitChange,
              talentChange,
            };
          })
        );
      }

      return {
        ...mod,
        name,
        desc,
        stages,
      };
    })
  );
}
