import { CN_OPERATOR_TRANSLATIONS } from '@/data/cnOperatorTranslations';

const STORAGE_CACHE_KEY = 'ark_trans_cache_v3';

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
  targetLang: 'en' | 'ru' = 'en'
): boolean {
  if (!str || !str.trim()) return false;
  const s = str.trim();

  if (targetLang === 'ru') {
    // Needs translation to Russian if it contains Chinese or Latin words and no Cyrillic
    if (hasChinese(s)) return true;
    if (!hasCyrillic(s) && /[a-zA-Z]{2,}/.test(s)) return true;
    return false;
  } else {
    // Needs translation to English if it contains Chinese
    return hasChinese(s);
  }
}

/**
 * Calls Google Translate GTX endpoint directly for a single pair of languages
 */
async function fetchGoogleTranslate(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((chunk: any) => (Array.isArray(chunk) ? chunk[0] : ''))
        .join('')
        .trim();
      if (translated) {
        return translated;
      }
    }
  } catch (err) {
    console.warn(`Translation (${fromLang}->${toLang}) failed for "${trimmed.slice(0, 30)}...":`, err);
  }

  return '';
}

/**
 * Translates Chinese text to Russian using English as a pivot bridge (ZH -> EN -> RU)
 * for higher quality and natural wording.
 */
async function translateToRussianViaEnglish(chineseText: string): Promise<string> {
  const trimmed = chineseText.trim();
  const cacheKey = `ru:${trimmed}`;
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  // Step 1: Chinese -> English
  const enKey = `zh-en:${trimmed}`;
  let enText = memoryCache[enKey];
  if (!enText) {
    enText = await fetchGoogleTranslate(trimmed, 'zh-CN', 'en');
    if (enText && enText !== trimmed) {
      memoryCache[enKey] = enText;
    }
  }

  // Step 2: English -> Russian
  if (enText && enText !== trimmed) {
    const enRuKey = `en-ru:${enText}`;
    let ruText = memoryCache[enRuKey];
    if (!ruText) {
      ruText = await fetchGoogleTranslate(enText, 'en', 'ru');
      if (ruText) {
        memoryCache[enRuKey] = ruText;
      }
    }
    if (ruText) {
      memoryCache[cacheKey] = ruText;
      saveCacheToStorage();
      return ruText;
    }
  }

  // Fallback: direct zh-CN -> ru if intermediate English step failed
  const directRu = await fetchGoogleTranslate(trimmed, 'zh-CN', 'ru');
  if (directRu) {
    memoryCache[cacheKey] = directRu;
    saveCacheToStorage();
    return directRu;
  }

  return chineseText;
}

/**
 * Translates English text to Russian
 */
async function translateEnglishToRussian(englishText: string): Promise<string> {
  const trimmed = englishText.trim();
  const cacheKey = `ru:${trimmed}`;
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  const ruText = await fetchGoogleTranslate(trimmed, 'en', 'ru');
  if (ruText) {
    memoryCache[cacheKey] = ruText;
    saveCacheToStorage();
    return ruText;
  }

  return englishText;
}

/**
 * Translates a text string to target language ('en' | 'ru').
 * For Russian translation, uses the pivot scheme: Chinese -> English -> Russian
 * when the source text contains Chinese, ensuring significantly more accurate results.
 */
export async function translateText(
  text: string,
  targetLang: 'en' | 'ru' = 'en'
): Promise<string> {
  if (!text || !needsTranslation(text, targetLang)) return text;
  const trimmed = text.trim();

  if (targetLang === 'ru') {
    if (hasChinese(trimmed)) {
      // 2-step pivot translation: Chinese -> English -> Russian
      return translateToRussianViaEnglish(trimmed);
    } else {
      // English source -> Russian translation
      return translateEnglishToRussian(trimmed);
    }
  } else {
    // Target is English
    if (!hasChinese(trimmed)) return text;

    const cacheKey = `en:${trimmed}`;
    if (memoryCache[cacheKey]) {
      return memoryCache[cacheKey];
    }

    const enText = await fetchGoogleTranslate(trimmed, 'zh-CN', 'en');
    if (enText) {
      memoryCache[cacheKey] = enText;
      saveCacheToStorage();
      return enText;
    }

    return text;
  }
}

/**
 * Resolves translation for an operator's talents.
 * Prioritizes curated CN_OPERATOR_TRANSLATIONS, and translates to targetLang (EN or RU) on the fly.
 */
export async function getTranslatedTalents(
  charId: string,
  talents: any[],
  targetLang: 'en' | 'ru' = 'en'
): Promise<any[]> {
  const curated = CN_OPERATOR_TRANSLATIONS[charId];

  return Promise.all(
    talents.map(async (talent, idx) => {
      const curatedTalent = curated?.talents?.[idx];
      const candidates = await Promise.all(
        (talent.candidates || []).map(async (cand: any) => {
          let name = cand.name || '';
          let description = cand.description || '';

          if (curatedTalent?.name) {
            name = curatedTalent.name;
          }
          if (curatedTalent?.description) {
            description = curatedTalent.description;
          }

          if (needsTranslation(name, targetLang)) {
            name = await translateText(name, targetLang);
          }

          if (needsTranslation(description, targetLang)) {
            description = await translateText(description, targetLang);
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
 * Resolves translation for an operator's lore quote / itemDesc into targetLang ('en' | 'ru').
 */
export async function getTranslatedQuote(
  charId: string,
  quote: string,
  targetLang: 'en' | 'ru' = 'en'
): Promise<string> {
  const curated = CN_OPERATOR_TRANSLATIONS[charId];
  let text = curated?.quote || quote || '';
  if (needsTranslation(text, targetLang)) {
    return translateText(text, targetLang);
  }
  return text;
}

/**
 * Resolves translation for operator modules into targetLang ('en' | 'ru').
 */
export async function getTranslatedModules(
  modules: any[],
  targetLang: 'en' | 'ru' = 'en'
): Promise<any[]> {
  if (targetLang !== 'ru' && !modules.some(m => hasChinese(m.name))) {
    return modules;
  }

  return Promise.all(
    modules.map(async (mod) => {
      let name = mod.name;
      if (needsTranslation(name, targetLang)) {
        name = await translateText(name, targetLang);
      }
      return {
        ...mod,
        name,
      };
    })
  );
}
