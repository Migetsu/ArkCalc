import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  OperatorSummary,
  ItemSummary,
  WorkshopRecipe,
  GameConstants,
  Profession,
  OperatorModule,
} from '@/types/game';
import { getAvatarUrl } from '@/utils/imageUrl';
import {
  getLocalizedItemName,
  isCraftResource,
  OPERATOR_CANONICAL_EN_NAMES,
} from '@/data/materialTranslations';

const CACHE_DB_NAME = 'ARKCalcCacheDB';
const CACHE_STORE_NAME = 'gamedata_cache';
const CACHE_KEY = 'ark_cleaned_gamedata_v6';

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
      const uniequipData = await fetchJsonWithFallback(
        `${rawBase}/uniequip_table.json`,
        `${jsdelivrBase}/uniequip_table.json`
      );
      const equipDict = uniequipData.equipDict || {};
      const charEquip = uniequipData.charEquip || {};

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

      // 5. character_table.json
      loadingStatus.value = 'Загрузка данных оперативников...';
      loadingProgress.value = 80;
      const charData = await fetchJsonWithFallback(
        `${rawBase}/character_table.json`,
        `${jsdelivrBase}/character_table.json`
      );

      const parsedOperators: Record<string, OperatorSummary> = {};

      for (const charId in charData) {
        const char = charData[charId];

        // Skip non-operator summon tokens / traps / enemies
        if (
          charId.startsWith('trap_') ||
          charId.startsWith('token_') ||
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

        // Clean modules
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

          const typeName1 = eq.typeName1 || 'ADVANCED';
          const typeName2 = eq.typeName2 || '';
          const formattedName = typeName2
            ? `Модуль ${typeName2} (${typeName1})`
            : `Модуль (${typeName1})`;

          modules.push({
            id: mId,
            name: eq.uniEquipName || mId,
            uniEquipIcon: eq.uniEquipIcon || mId,
            typeIcon: eq.typeIcon || 'original',
            typeName: typeName1,
            typeName1,
            typeName2,
            formattedName,
            costs: itemCosts,
          });
        }

        const canonicalEn = OPERATOR_CANONICAL_EN_NAMES[charId];
        const rawApp = (char.appellation || '').replace(/^["']|["']$/g, '').trim();
        const opName = canonicalEn || rawApp || char.name;
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
    operatorList,
    getOperator,
    getItem,
    getRecipe,
    loadGameData,
  };
});
