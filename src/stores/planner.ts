import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, type OperatorTargetPlan } from '@/services/db';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { useAuthStore } from '@/stores/auth';
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
    const dexiePlans: Record<string, OperatorTargetPlan> = {};
    let lsPlans: Record<string, OperatorTargetPlan> = {};

    try {
      const records = await db.plans.toArray();
      for (const p of records) {
        if (p && p.charId) {
          dexiePlans[p.charId] = p;
        }
      }
    } catch (err) {
      console.error('Failed to load plans from Dexie:', err);
    }

    const lsData = loadPlansFromLocalStorage();
    if (lsData && typeof lsData === 'object') {
      lsPlans = lsData;
    }

    // Dexie is primary source of truth; if empty (first run or reset), fallback to localStorage
    let effectivePlans: Record<string, OperatorTargetPlan> = {};
    if (Object.keys(dexiePlans).length > 0) {
      effectivePlans = dexiePlans;
      savePlansToLocalStorage(dexiePlans);
    } else if (Object.keys(lsPlans).length > 0) {
      effectivePlans = lsPlans;
      try {
        await db.plans.bulkPut(Object.values(lsPlans));
      } catch (e) {
        console.warn('Could not sync localStorage plans to Dexie:', e);
      }
    }

    plans.value = effectivePlans;
    isLoaded.value = true;
  }

  async function savePlan(plan: OperatorTargetPlan) {
    const cleanPlan: OperatorTargetPlan = JSON.parse(JSON.stringify(plan));
    plans.value = {
      ...plans.value,
      [cleanPlan.charId]: cleanPlan,
    };
    savePlansToLocalStorage(plans.value);
    try {
      await db.plans.put(cleanPlan);
      useAuthStore().triggerAutoSync();
    } catch (e) {
      console.error('Dexie save failed, plan is preserved in localStorage:', e);
    }
  }

  async function removePlan(charId: string) {
    const updated = { ...plans.value };
    delete updated[charId];
    plans.value = updated;
    savePlansToLocalStorage(updated);
    try {
      await db.plans.delete(charId);
      useAuthStore().triggerAutoSync();
    } catch (e) {
      console.warn('Dexie delete failed:', e);
    }
  }

  async function clearAllPlans() {
    plans.value = {};
    savePlansToLocalStorage({});
    try {
      await db.plans.clear();
      useAuthStore().triggerAutoSync();
    } catch (e) {
      console.warn('Dexie clear failed:', e);
    }
  }

  async function bulkImportPlans(newPlans: Record<string, OperatorTargetPlan>) {
    plans.value = { ...newPlans };
    savePlansToLocalStorage(newPlans);
    try {
      await db.plans.clear();
      await db.plans.bulkPut(Object.values(newPlans));
    } catch (e) {
      console.warn('Dexie bulk import plans failed:', e);
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
    bulkImportPlans,
  };
});
