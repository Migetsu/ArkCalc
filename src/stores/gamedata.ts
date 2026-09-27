import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  OperatorSummary,
  ItemSummary,
  WorkshopRecipe,
  GameConstants,
  Profession,
  OperatorModule,
  RangeInfo,
  OperatorSkin,
} from '@/types/game';
import { getAvatarUrl } from '@/utils/imageUrl';
import {
  getLocalizedItemName,
  isCraftResource,
  OPERATOR_CANONICAL_EN_NAMES,
  stripArknightsTags,
  translateTagToEn,
  getArchetypeTraitEn,
} from '@/data/materialTranslations';
import { CN_OPERATOR_TRANSLATIONS } from '@/data/cnOperatorTranslations';

const CACHE_DB_NAME = 'ARKCalcCacheDB';
const CACHE_STORE_NAME = 'gamedata_cache';
const CACHE_KEY = 'ark_cleaned_gamedata_v15_playable';

// Open simple IndexedDB for game data cache
function openCacheDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CACHE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedGameData(): Promise<any | null> {
  try {
    const db = await openCacheDb();
    return new Promise((resolve) => {
      const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
      const store = tx.objectStore(CACHE_STORE_NAME);
      const req = store.get(CACHE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('Could not read game data cache:', e);
    return null;
  }
}

async function setCachedGameData(data: any): Promise<void> {
  try {
    const db = await openCacheDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CACHE_STORE_NAME);
      const req = store.put(data, CACHE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not write game data cache:', e);
  }
}

export const useGameDataStore = defineStore('gamedata', () => {
  const isLoading = ref<boolean>(false);
  const loadingProgress = ref<number>(0);
  const loadingStatus = ref<string>('');
  const error = ref<string | null>(null);
  const isReady = ref<boolean>(false);

  const operators = ref<Record<string, OperatorSummary>>({});
  const items = ref<Record<string, ItemSummary>>({});
  const recipes = ref<Record<string, WorkshopRecipe>>({}); // mapped by itemId
  const constants = ref<GameConstants | null>(null);
  const ranges = ref<Record<string, RangeInfo>>({});

  function getSavedLanguage(): 'ru' | 'en' {
    try {
      const saved = localStorage.getItem('ark_item_language');
      if (saved === 'ru' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  }

  const itemLanguage = ref<'ru' | 'en'>(getSavedLanguage());

  function setItemLanguage(lang: 'ru' | 'en') {
    itemLanguage.value = lang;
    try {
      localStorage.setItem('ark_item_language', lang);
    } catch {
      // ignore
    }
  }

  const operatorList = computed(() => {
    return Object.values(operators.value).sort((a, b) => {
      if (b.rarity !== a.rarity) return b.rarity - a.rarity;
      return a.name.localeCompare(b.name);
    });
  });

  const getOperator = (id: string): OperatorSummary | undefined => {
    return operators.value[id];
  };

  const getRange = (rangeId: string): RangeInfo | undefined => {
    return ranges.value[rangeId];
  };

  const getItem = (id: string): ItemSummary | undefined => {
    const it = items.value[id];
    if (!it) return undefined;
    const localized = getLocalizedItemName(id, itemLanguage.value);
    if (localized) {
      return { ...it, name: localized };
    }
    return it;
  };

  const getRecipe = (itemId: string): WorkshopRecipe | undefined => {
    return recipes.value[itemId];
  };

  async function fetchJsonWithFallback(urlPrimary: string, urlFallback: string): Promise<any> {
    try {
      const res = await fetch(urlPrimary);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      const resFallback = await fetch(urlFallback);
      if (!resFallback.ok) throw new Error(`HTTP fallback ${resFallback.status}`);
      return await resFallback.json();
    }
  }

  async function loadGameData(forceRefresh = false) {
    if (isReady.value && !forceRefresh) return;

    isLoading.value = true;
    error.value = null;
    loadingProgress.value = 5;
    loadingStatus.value = 'Проверка кэша...';

    if (!forceRefresh) {
      const cached = await getCachedGameData();
      if (cached && cached.operators && cached.items && cached.constants) {
        operators.value = cached.operators;
        items.value = cached.items;
        recipes.value = cached.recipes;
        constants.value = cached.constants;
        ranges.value = cached.ranges || {};
        isReady.value = true;
        isLoading.value = false;
        loadingProgress.value = 100;
        loadingStatus.value = 'Готово (из кэша)';
        return;
      }
    }

    try {
      const rawBase =
        'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel';
      const jsdelivrBase =
        'https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData@master/zh_CN/gamedata/excel';

      const rawEnBase =
        'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel';
      const jsdelivrEnBase =
        'https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData_YoStar@main/en_US/gamedata/excel';

      // 1. gamedata_const.json
      loadingStatus.value = 'Загрузка игровых констант...';
      loadingProgress.value = 15;
      const constData = await fetchJsonWithFallback(
        `${rawBase}/gamedata_const.json`,
        `${jsdelivrBase}/gamedata_const.json`
      );

      const parsedConstants: GameConstants = {
        characterExpMap: constData.characterExpMap || {},
        characterUpgradeCostMap: constData.characterUpgradeCostMap || {},
        evolveGoldCost: constData.evolveGoldCost || [],
        maxLevel: constData.maxLevel || [],
      };
      constants.value = parsedConstants;

      // 2. building_data.json
      loadingStatus.value = 'Загрузка рецептов мастерской...';
      loadingProgress.value = 30;
      const buildingData = await fetchJsonWithFallback(
        `${rawBase}/building_data.json`,
        `${jsdelivrBase}/building_data.json`
      );

      const parsedRecipes: Record<string, WorkshopRecipe> = {};
      const workshopFormulas = buildingData.workshopFormulas || {};
      for (const formulaId in workshopFormulas) {
        const f = workshopFormulas[formulaId];
        // Formulas 39-54 are chip conversions (3:2 cyclic transmutations), which cause infinite loops
        const isChipConversion =
          f.itemId &&
          f.itemId.startsWith('32') &&
          f.costs?.some((c: any) => c.id && c.id.startsWith('32'));
        if (isChipConversion) continue;

        if (f.itemId && f.costs && f.costs.length > 0) {
          parsedRecipes[f.itemId] = {
            formulaId: f.formulaId || formulaId,
            itemId: f.itemId,
            count: f.count || 1,
            goldCost: f.goldCost || 0,
            costs: (f.costs || []).map((c: any) => ({
              id: c.id,
              count: c.count,
            })),
          };
        }
      }

      // Add dual chips (3213 - 3283) from manufactFormulas
      const manufactFormulas = buildingData.manufactFormulas || {};
      for (const formulaId in manufactFormulas) {
        const f = manufactFormulas[formulaId];
        if (f.itemId && f.itemId.startsWith('32') && f.costs && f.costs.length > 0) {
          parsedRecipes[f.itemId] = {
            formulaId: `m_${formulaId}`,
            itemId: f.itemId,
            count: f.count || 1,
            goldCost: 0,
            costs: (f.costs || []).map((c: any) => ({
              id: c.id,
              count: c.count,
            })),
          };
        }
      }
      recipes.value = parsedRecipes;

      // 3. uniequip_table.json
      loadingStatus.value = 'Загрузка модулей оперативников...';
      loadingProgress.value = 45;
      const [uniequipData, enUniequipData] = await Promise.all([
        fetchJsonWithFallback(
          `${rawBase}/uniequip_table.json`,
          `${jsdelivrBase}/uniequip_table.json`
        ),
        fetchJsonWithFallback(
          `${rawEnBase}/uniequip_table.json`,
          `${jsdelivrEnBase}/uniequip_table.json`
        ).catch(() => ({})),
      ]);
      const equipDict = uniequipData.equipDict || {};
      const charEquip = uniequipData.charEquip || {};
      const enEquipDict = enUniequipData?.equipDict || {};

      // 4. item_table.json
      loadingStatus.value = 'Загрузка таблицы предметов...';
      loadingProgress.value = 60;
      const itemData = await fetchJsonWithFallback(
        `${rawBase}/item_table.json`,
        `${jsdelivrBase}/item_table.json`
      );
      const rawItems = itemData.items || {};
      const parsedItems: Record<string, ItemSummary> = {};

      const rarityMap: Record<string, number> = {
        TIER_1: 1,
        TIER_2: 2,
        TIER_3: 3,
        TIER_4: 4,
        TIER_5: 5,
        TIER_6: 6,
      };

      for (const itemId in rawItems) {
        if (!isCraftResource(itemId)) continue;
        const item = rawItems[itemId];
        const rStr = String(item.rarity || 'TIER_1');
        const rNum = rarityMap[rStr] || (typeof item.rarity === 'number' ? item.rarity + 1 : 1);

        // Keep relevant materials, exp, tokens, etc.
        const localized = getLocalizedItemName(itemId, itemLanguage.value);
        parsedItems[itemId] = {
          itemId: item.itemId || itemId,
          name: localized || item.name || itemId,
          rarity: rNum,
          iconId: item.iconId || itemId,
          classifyType: item.classifyType || 'NONE',
          itemType: item.itemType || 'MATERIAL',
          sortId: item.sortId || 999999,
        };
      }
      // Ensure LMD item exists
      if (!parsedItems['4001']) {
        const lmdName = getLocalizedItemName('4001', itemLanguage.value) || 'LMD';
        parsedItems['4001'] = {
          itemId: '4001',
          name: lmdName,
          rarity: 4,
          iconId: 'GOLD',
          classifyType: 'NORMAL',
          itemType: 'GOLD',
          sortId: 1,
        };
      }
      items.value = parsedItems;

      // 5. range_table.json
      loadingStatus.value = 'Загрузка радиусов атаки...';
      loadingProgress.value = 75;
      const rawRanges = await fetchJsonWithFallback(
        `${rawBase}/range_table.json`,
        `${jsdelivrBase}/range_table.json`
      );
      const parsedRanges: Record<string, RangeInfo> = {};
      for (const rId in rawRanges || {}) {
        const r = rawRanges[rId];
        if (r && r.grids) {
          parsedRanges[rId] = {
            id: rId,
            direction: r.direction || 1,
            grids: r.grids || [],
          };
        }
      }
      ranges.value = parsedRanges;

      // 6. skin_table.json
      loadingStatus.value = 'Загрузка гардероба и скинов...';
      loadingProgress.value = 80;
      const [skinData, enSkinData] = await Promise.all([
        fetchJsonWithFallback(
          `${rawBase}/skin_table.json`,
          `${jsdelivrBase}/skin_table.json`
        ).catch(() => ({})),
        fetchJsonWithFallback(
          `${rawEnBase}/skin_table.json`,
          `${jsdelivrEnBase}/skin_table.json`
        ).catch(() => ({})),
      ]);

      const zhCharSkins = skinData?.charSkins || {};
      const enCharSkins = enSkinData?.charSkins || {};

      const operatorSkinsMap: Record<string, OperatorSkin[]> = {};
      for (const sId in zhCharSkins) {
        const s = zhCharSkins[sId];
        if (!s || !s.charId || !s.portraitId) continue;
        const enS = enCharSkins[sId];

        const charId = s.charId;
        if (!operatorSkinsMap[charId]) {
          operatorSkinsMap[charId] = [];
        }

        const isBuy = Boolean(s.isBuySkin || sId.includes('@'));
        const rawSkinName = enS?.displaySkin?.skinName || s.displaySkin?.skinName || '';
        const rawGroupName = enS?.displaySkin?.skinGroupName || s.displaySkin?.skinGroupName || '';

        const skinName = rawSkinName || (isBuy ? 'Special Outfit' : sId.endsWith('#2') ? 'Elite 2' : 'Default');
        const skinGroupName = rawGroupName || (isBuy ? 'Special Collection' : 'Default Outfit');

        operatorSkinsMap[charId].push({
          skinId: s.skinId || sId,
          charId,
          portraitId: s.portraitId,
          avatarId: s.avatarId || s.portraitId,
          isBuySkin: isBuy,
          skinName,
          skinGroupName,
          content: stripArknightsTags(enS?.displaySkin?.content || s.displaySkin?.content || ''),
          dialog: stripArknightsTags(enS?.displaySkin?.dialog || s.displaySkin?.dialog || ''),
          drawerList: s.displaySkin?.drawerList || enS?.displaySkin?.drawerList || [],
          sortId: s.displaySkin?.sortId ?? 0,
        });
      }

      for (const cId in operatorSkinsMap) {
        operatorSkinsMap[cId].sort((a, b) => {
          if (!a.isBuySkin && b.isBuySkin) return -1;
          if (a.isBuySkin && !b.isBuySkin) return 1;
          return (a.sortId ?? 0) - (b.sortId ?? 0);
        });
      }

      // 7. character_table.json
      loadingStatus.value = 'Загрузка данных оперативников...';
      loadingProgress.value = 85;
      const [charData, enCharData] = await Promise.all([
        fetchJsonWithFallback(
          `${rawBase}/character_table.json`,
          `${jsdelivrBase}/character_table.json`
        ),
        fetchJsonWithFallback(
          `${rawEnBase}/character_table.json`,
          `${jsdelivrEnBase}/character_table.json`
        ).catch(() => ({})),
      ]);

      const parsedOperators: Record<string, OperatorSummary> = {};

      for (const charId in charData) {
        const char = charData[charId];

        // Skip non-operator summon tokens / traps / enemies / temporary event characters (IS, Trials, etc.)
        if (
          charId.startsWith('trap_') ||
          charId.startsWith('token_') ||
          char.isNotObtainable ||
          !char.name ||
          !char.phases ||
          char.phases.length === 0
        ) {
          continue;
        }

        const rStr = String(char.rarity || 'TIER_1');
        const rNum = rarityMap[rStr] || (typeof char.rarity === 'number' ? char.rarity + 1 : 1);

        // Clean phases
        const phases = char.phases.map((p: any) => ({
          maxLevel: p.maxLevel,
          rangeId: p.rangeId || undefined,
          evolveCost: p.evolveCost
            ? p.evolveCost.map((ec: any) => ({ id: ec.id, count: ec.count }))
            : null,
        }));

        // Clean common skill level-ups (levels 1 -> 7)
        const allSkillLvlup = (char.allSkillLvlup || []).map((s: any) => ({
          lvlUpCost: (s.lvlUpCost || []).map((c: any) => ({ id: c.id, count: c.count })),
        }));

        // Clean skills & masteries
        const skills = (char.skills || []).map((s: any) => {
          const masteries = (s.levelUpCostCond || []).map((m: any, mIdx: number) => ({
            masteryLevel: mIdx + 1,
            costs: (m.levelUpCost || []).map((c: any) => ({ id: c.id, count: c.count })),
          }));

          return {
            skillId: s.skillId,
            name: s.skillId,
            iconId: s.overrideSkillIcon || s.skillId,
            masteries,
          };
        });

        // Clean modules with English overlay
        const modules: OperatorModule[] = [];
        const moduleIds: string[] = charEquip[charId] || [];
        for (const mId of moduleIds) {
          const eq = equipDict[mId];
          if (!eq || eq.type === 'INITIAL' || eq.typeIcon === 'original') continue;

          const itemCosts: Record<number, { id: string; count: number }[]> = {};
          if (eq.itemCost) {
            for (const stageKey in eq.itemCost) {
              const stageNum = parseInt(stageKey, 10);
              if (!isNaN(stageNum)) {
                itemCosts[stageNum] = (eq.itemCost[stageKey] || []).map((c: any) => ({
                  id: c.id,
                  count: c.count,
                }));
              }
            }
          }

          const enEq = enEquipDict[mId];
          const modName = enEq?.uniEquipName || eq.uniEquipName || mId;

          const typeName1 = eq.typeName1 || 'ADVANCED';
          const typeName2 = eq.typeName2 || '';
          const formattedName = typeName2
            ? `Module ${typeName2} (${typeName1})`
            : `Module (${typeName1})`;

          modules.push({
            id: mId,
            name: modName,
            uniEquipIcon: eq.uniEquipIcon || mId,
            typeIcon: eq.typeIcon || 'original',
            typeName: typeName1,
            typeName1,
            typeName2,
            formattedName,
            costs: itemCosts,
          });
        }

        const enChar = enCharData?.[charId];
        const curated = CN_OPERATOR_TRANSLATIONS[charId];
        const canonicalEn = OPERATOR_CANONICAL_EN_NAMES[charId];
        const rawApp = (char.appellation || '').replace(/^["']|["']$/g, '').trim();
        const opName = canonicalEn || enChar?.name || rawApp || char.name;

        // Parse combat stats from max phase
        const lastKeyFrame = (char.phases?.[char.phases.length - 1]?.attributesKeyFrames || [])[1] || (char.phases?.[0]?.attributesKeyFrames || [])[0];
        const attrData = lastKeyFrame?.data || {};

        const attributes = {
          hp: attrData.maxHp || 0,
          atk: attrData.atk || 0,
          def: attrData.def || 0,
          res: attrData.magicResistance || 0,
          cost: attrData.cost || 0,
          blockCnt: attrData.blockCnt || 1,
          attackTime: char.phases?.[0]?.attributesKeyFrames?.[0]?.data?.baseAttackTime || 1.0,
          respawnTime: char.phases?.[0]?.attributesKeyFrames?.[0]?.data?.respawnTime || 70,
        };

        // Parse talents - prefer enChar talents, fallback to curated CN dictionary, then char.talents
        const rawTalents = (enChar && enChar.talents && enChar.talents.length > 0) ? enChar.talents : (char.talents || []);
        const talents = rawTalents.map((t: any, tIdx: number) => {
          const curatedTalent = curated?.talents?.[tIdx];
          return {
            candidates: (t.candidates || []).map((c: any) => ({
              unlockPhase: c.unlockCondition?.phase === 'PHASE_2' ? 2 : c.unlockCondition?.phase === 'PHASE_1' ? 1 : 0,
              unlockLevel: c.unlockCondition?.level || 1,
              name: curatedTalent?.name || c.name || '',
              description: curatedTalent?.description || stripArknightsTags(c.description || ''),
            })),
          };
        });

        // Trait (description): curated -> enChar description -> archetype description -> CN description
        const traitDescription =
          curated?.trait ||
          stripArknightsTags(enChar?.description || '') ||
          getArchetypeTraitEn(char.subProfessionId) ||
          stripArknightsTags(char.description || '');

        // Lore quote / itemDesc: curated -> enChar itemDesc -> CN itemDesc
        const itemDesc = curated?.quote || stripArknightsTags(enChar?.itemDesc || char.itemDesc || '');

        // Tag list: translate CN tags to English
        const rawTagList: string[] = char.tagList || [];
        const tagList = rawTagList.map((t: string) => translateTagToEn(t));

        parsedOperators[charId] = {
          id: charId,
          name: opName,
          appellation: canonicalEn || rawApp,
          rarity: rNum,
          profession: char.profession as Profession,
          subProfessionId: char.subProfessionId || '',
          avatarUrl: getAvatarUrl(charId),
          maxLevels: phases.map((p: any) => p.maxLevel),
          phases,
          allSkillLvlup,
          skills,
          modules,
          description: traitDescription,
          itemUsage: stripArknightsTags(enChar?.itemUsage || char.itemUsage || ''),
          itemDesc,
          position: char.position || 'MELEE',
          tagList,
          talents,
          attributes,
          skins: operatorSkinsMap[charId] || [],
        };
      }

      operators.value = parsedOperators;

      // Cache cleaned data in IndexedDB
      loadingStatus.value = 'Сохранение в локальный кэш...';
      loadingProgress.value = 95;
      await setCachedGameData({
        operators: parsedOperators,
        items: parsedItems,
        recipes: parsedRecipes,
        constants: parsedConstants,
        ranges: parsedRanges,
        savedAt: Date.now(),
      });

      isReady.value = true;
      loadingProgress.value = 100;
      loadingStatus.value = 'Данные успешно загружены!';
    } catch (err: any) {
      console.error('Failed to load game data:', err);
      error.value = `Ошибка загрузки данных игры: ${err.message || err}`;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    loadingProgress,
    loadingStatus,
    error,
    isReady,
    itemLanguage,
    setItemLanguage,
    operators,
    items,
    recipes,
    constants,
    ranges,
    operatorList,
    getOperator,
    getRange,
    getItem,
    getRecipe,
    loadGameData,
  };
});
