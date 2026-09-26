import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, type OperatorTargetPlan } from '@/services/db';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { calculateAllPlans } from '@/services/calculatorEngine';
import type { CalculationResult } from '@/types/game';

const LS_KEY = 'ark_plans_v1';

function savePlansToLocalStorage(planMap: Record<string, OperatorTargetPlan>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(planMap));
  } catch (e) {
    console.warn('Cannot save plans to localStorage:', e);
  }
}

function loadPlansFromLocalStorage(): Record<string, OperatorTargetPlan> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, OperatorTargetPlan>;
  } catch {
    return null;
  }
}

export const usePlannerStore = defineStore('planner', () => {
  const plans = ref<Record<string, OperatorTargetPlan>>({});
  const isLoaded = ref<boolean>(false);

  const gameData = useGameDataStore();
  const inventory = useInventoryStore();

  async function loadPlans() {
    try {
      // Try Dexie IndexedDB first
      const records = await db.plans.toArray();
      if (records.length > 0) {
        const planMap: Record<string, OperatorTargetPlan> = {};
        for (const p of records) {
          planMap[p.charId] = p;
        }
        plans.value = planMap;
        isLoaded.value = true;
        // Keep localStorage in sync as backup
        savePlansToLocalStorage(planMap);
        return;
      }
    } catch (err) {
      console.error('Failed to load plans from Dexie:', err);
    }

    // Fallback: restore from localStorage if Dexie was empty or failed
    const lsData = loadPlansFromLocalStorage();
    if (lsData && Object.keys(lsData).length > 0) {
      plans.value = lsData;
      isLoaded.value = true;
      // Re-populate Dexie
      try {
        await db.plans.bulkPut(Object.values(lsData));
      } catch (e) {
        console.warn('Could not sync localStorage plans back to Dexie:', e);
      }
      return;
    }

    isLoaded.value = true;
  }

  async function savePlan(plan: OperatorTargetPlan) {
    plans.value[plan.charId] = JSON.parse(JSON.stringify(plan));
    savePlansToLocalStorage(plans.value);
    try {
      await db.plans.put(plan);
    } catch (e) {
      console.warn('Dexie save failed, plan is still in localStorage:', e);
    }
  }

  async function removePlan(charId: string) {
    delete plans.value[charId];
    savePlansToLocalStorage(plans.value);
    try {
      await db.plans.delete(charId);
    } catch (e) {
      console.warn('Dexie delete failed:', e);
    }
  }

  async function clearAllPlans() {
    plans.value = {};
    localStorage.removeItem(LS_KEY);
    try {
      await db.plans.clear();
    } catch (e) {
      console.warn('Dexie clear failed:', e);
    }
  }

  const planList = computed(() => Object.values(plans.value));
  const planCount = computed(() => Object.keys(plans.value).length);

  const calculationResult = computed<CalculationResult>(() => {
    // Don't wait for isReady — it can lag after data is already in memory.
    // Just require constants and at least one operator to be present.
    if (!gameData.constants || Object.keys(gameData.operators).length === 0) {
      return {
        totalExp: 0,
        totalLmdLevel: 0,
        totalLmdEvolve: 0,
        totalLmdCraft: 0,
        totalLmd: 0,
        rawMaterials: {},
        directDeficit: [],
        craftingSteps: [],
        farmRequirements: [],
      };
    }

    return calculateAllPlans(
      planList.value,
      gameData.operators,
      gameData.items,
      gameData.recipes,
      gameData.constants,
      inventory.stock
    );
  });

  return {
    plans,
    isLoaded,
    planList,
    planCount,
    calculationResult,
    loadPlans,
    savePlan,
    removePlan,
    clearAllPlans,
  };
});
