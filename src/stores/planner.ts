import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, type OperatorTargetPlan } from '@/services/db';
import { useGameDataStore } from '@/stores/gamedata';
import { useInventoryStore } from '@/stores/inventory';
import { useAuthStore } from '@/stores/auth';
import { calculateAllPlans, calculateOperatorPlanCosts } from '@/services/calculatorEngine';
import type { CalculationResult } from '@/types/game';

const LS_KEY = 'ark_plans_v1';
const LS_ORDER_KEY = 'ark_plan_order_v1';

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

function saveOrderToLocalStorage(order: string[]) {
  try {
    localStorage.setItem(LS_ORDER_KEY, JSON.stringify(order));
  } catch (e) {
    console.warn('Cannot save plan order:', e);
  }
}

function loadOrderFromLocalStorage(): string[] {
  try {
    const raw = localStorage.getItem(LS_ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const usePlannerStore = defineStore('planner', () => {
  const plans = ref<Record<string, OperatorTargetPlan>>({});
  const planOrder = ref<string[]>(loadOrderFromLocalStorage());
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
    if (!planOrder.value.includes(cleanPlan.charId)) {
      planOrder.value.push(cleanPlan.charId);
      saveOrderToLocalStorage(planOrder.value);
    }
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
    planOrder.value = planOrder.value.filter((id) => id !== charId);
    saveOrderToLocalStorage(planOrder.value);
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
    planOrder.value = [];
    saveOrderToLocalStorage([]);
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
    planOrder.value = Object.keys(newPlans);
    saveOrderToLocalStorage(planOrder.value);
    savePlansToLocalStorage(newPlans);
    try {
      await db.plans.clear();
      await db.plans.bulkPut(Object.values(newPlans));
    } catch (e) {
      console.warn('Dexie bulk import plans failed:', e);
    }
  }

  function movePlan(charId: string, direction: 'up' | 'down') {
    const currentList = orderedPlanList.value.map((p) => p.charId);
    const idx = currentList.indexOf(charId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;
    const temp = currentList[idx];
    currentList[idx] = currentList[targetIdx];
    currentList[targetIdx] = temp;
    planOrder.value = currentList;
    saveOrderToLocalStorage(currentList);
  }

  function setPlanTop(charId: string) {
    const currentList = orderedPlanList.value.map((p) => p.charId).filter((id) => id !== charId);
    currentList.unshift(charId);
    planOrder.value = currentList;
    saveOrderToLocalStorage(currentList);
  }

  function setPlanOrder(newOrder: string[]) {
    planOrder.value = [...newOrder];
    saveOrderToLocalStorage(planOrder.value);
  }

  async function completePlanStep(charId: string, deductMaterials: boolean = true) {
    const plan = plans.value[charId];
    const op = gameData.getOperator(charId);
    if (!plan || !op || !gameData.constants) return;

    if (deductMaterials) {
      const costs = calculateOperatorPlanCosts(op, plan, gameData.constants);
      // Deduct materials from inventory
      for (const [matId, count] of Object.entries(costs.materials)) {
        if (count > 0) {
          const currentStock = inventory.getStock(matId) || 0;
          await inventory.setItemStock(matId, Math.max(0, currentStock - count));
        }
      }
      // Deduct LMD ('4001')
      const totalLmd = costs.lmdLevel + costs.lmdEvolve;
      if (totalLmd > 0) {
        const curLmd = inventory.getStock('4001') || 0;
        await inventory.setItemStock('4001', Math.max(0, curLmd - totalLmd));
      }
    }

    // Set current to target
    plan.current = JSON.parse(JSON.stringify(plan.target));
    await savePlan(plan);
  }

  const planList = computed(() => Object.values(plans.value));
  const planCount = computed(() => Object.keys(plans.value).length);

  const orderedPlanList = computed<OperatorTargetPlan[]>(() => {
    const list = Object.values(plans.value);
    const orderMap = new Map(planOrder.value.map((id, index) => [id, index]));
    return [...list].sort((a, b) => {
      const idxA = orderMap.has(a.charId) ? orderMap.get(a.charId)! : 9999;
      const idxB = orderMap.has(b.charId) ? orderMap.get(b.charId)! : 9999;
      return idxA - idxB;
    });
  });

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
    planOrder,
    isLoaded,
    planList,
    planCount,
    orderedPlanList,
    calculationResult,
    loadPlans,
    savePlan,
    removePlan,
    clearAllPlans,
    bulkImportPlans,
    movePlan,
    setPlanTop,
    setPlanOrder,
    completePlanStep,
  };
});
