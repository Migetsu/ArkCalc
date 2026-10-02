import type {
  OperatorSummary,
  GameConstants,
} from '@/types/game';
import type { OperatorTargetPlan } from '@/services/db';
import { calculateOperatorPlanCosts } from '@/services/calculatorEngine';

export interface RoadmapMissingItem {
  itemId: string;
  needed: number;
  available: number;
  missing: number;
}

export interface RoadmapMilestone {
  type: 'elite' | 'level' | 'skill' | 'module';
  title: string;
  detail: string;
  isComplete: boolean;
}

export interface RoadmapOperatorStep {
  charId: string;
  operator: OperatorSummary;
  plan: OperatorTargetPlan;
  priorityRank: number; // 1-indexed (1 is highest)
  status: 'ready' | 'partial' | 'waiting' | 'completed';
  readinessPercentage: number; // 0-100
  totalLmdNeeded: number;
  lmdAvailable: number;
  lmdMissing: number;
  totalExpNeeded: number;
  missingItems: RoadmapMissingItem[];
  allocatedItems: Record<string, number>;
  requiredItems: Record<string, number>;
  milestones: RoadmapMilestone[];
}

export interface RoadmapSimulationResult {
  steps: RoadmapOperatorStep[];
  fullyReadyCount: number;
  partialCount: number;
  waitingCount: number;
  completedCount: number;
  totalLmdRequired: number;
  totalExpRequired: number;
}

export function simulateRoadmapQueue(
  orderedPlans: OperatorTargetPlan[],
  operators: Record<string, OperatorSummary>,
  constants: GameConstants,
  initialInventoryStock: Record<string, number>,
): RoadmapSimulationResult {
  const simulatedStock = { ...initialInventoryStock };
  const steps: RoadmapOperatorStep[] = [];

  let fullyReadyCount = 0;
  let partialCount = 0;
  let waitingCount = 0;
  let completedCount = 0;
  let totalLmdRequired = 0;
  let totalExpRequired = 0;

  for (let i = 0; i < orderedPlans.length; i++) {
    const plan = orderedPlans[i];
    const op = operators[plan.charId];
    if (!op) continue;

    // Check if plan is already completed (target <= current)
    const isEliteDone = plan.target.elite <= plan.current.elite;
    const isLevelDone = plan.target.level <= plan.current.level;
    const isSkillsDone = plan.target.skills.every((s, idx) => s <= (plan.current.skills[idx] || 1));
    const isMasteriesDone = plan.target.masteries.every((m, idx) => m <= (plan.current.masteries[idx] || 0));
    const isModulesDone = Object.entries(plan.target.modules).every(
      ([modId, lvl]) => lvl <= (plan.current.modules[modId] || 0),
    );
    const isFullyCompleted = isEliteDone && isLevelDone && isSkillsDone && isMasteriesDone && isModulesDone;

    // Calculate costs
    const costs = calculateOperatorPlanCosts(op, plan, constants);
    const totalLmd = costs.lmdLevel + costs.lmdEvolve;
    totalLmdRequired += totalLmd;
    totalExpRequired += costs.exp;

    // Generate milestones
    const milestones: RoadmapMilestone[] = [];
    if (plan.target.elite > plan.current.elite) {
      milestones.push({
        type: 'elite',
        title: `Elite ${plan.target.elite}`,
        detail: `E${plan.current.elite} ➔ E${plan.target.elite}`,
        isComplete: false,
      });
    }
    if (plan.target.level > plan.current.level) {
      milestones.push({
        type: 'level',
        title: `Level ${plan.target.level}`,
        detail: `Lv.${plan.current.level} ➔ Lv.${plan.target.level}`,
        isComplete: false,
      });
    }
    plan.target.masteries.forEach((m, idx) => {
      const curM = plan.current.masteries[idx] || 0;
      if (m > curM) {
        milestones.push({
          type: 'skill',
          title: `Skill ${idx + 1} M${m}`,
          detail: `M${curM} ➔ M${m}`,
          isComplete: false,
        });
      }
    });
    Object.entries(plan.target.modules).forEach(([modId, targetLvl]) => {
      const curLvl = plan.current.modules[modId] || 0;
      if (targetLvl > curLvl) {
        const modSummary = op.modules?.find((m) => m.id === modId);
        const modName = modSummary?.typeName || modSummary?.name || 'Module';
        milestones.push({
          type: 'module',
          title: `${modName} Stage ${targetLvl}`,
          detail: `Stage ${curLvl} ➔ Stage ${targetLvl}`,
          isComplete: false,
        });
      }
    });

    if (isFullyCompleted) {
      completedCount++;
      steps.push({
        charId: plan.charId,
        operator: op,
        plan,
        priorityRank: i + 1,
        status: 'completed',
        readinessPercentage: 100,
        totalLmdNeeded: 0,
        lmdAvailable: 0,
        lmdMissing: 0,
        totalExpNeeded: 0,
        missingItems: [],
        allocatedItems: {},
        requiredItems: {},
        milestones,
      });
      continue;
    }

    // Material availability against simulated stock
    const missingItems: RoadmapMissingItem[] = [];
    const allocatedItems: Record<string, number> = {};
    let totalItemsDemandUnits = 0;
    let totalItemsAllocatedUnits = 0;

    for (const [itemId, needed] of Object.entries(costs.materials)) {
      if (needed <= 0) continue;
      totalItemsDemandUnits += needed;
      const currentAvailable = simulatedStock[itemId] || 0;
      const allocated = Math.min(needed, currentAvailable);
      allocatedItems[itemId] = allocated;
      totalItemsAllocatedUnits += allocated;

      // Deduct allocated from running simulated stock
      simulatedStock[itemId] = currentAvailable - allocated;

      if (allocated < needed) {
        missingItems.push({
          itemId,
          needed,
          available: currentAvailable,
          missing: needed - allocated,
        });
      }
    }

    // Check LMD availability
    const availableLmd = simulatedStock['4001'] || 0;
    const allocatedLmd = Math.min(totalLmd, availableLmd);
    simulatedStock['4001'] = Math.max(0, availableLmd - allocatedLmd);
    const lmdMissing = Math.max(0, totalLmd - availableLmd);

    // Calculate overall readiness percentage
    let readinessPercentage = 100;
    if (totalItemsDemandUnits > 0 || totalLmd > 0) {
      const matWeight = totalItemsDemandUnits > 0 ? (totalItemsAllocatedUnits / totalItemsDemandUnits) : 1;
      const lmdWeight = totalLmd > 0 ? (allocatedLmd / totalLmd) : 1;
      readinessPercentage = Math.round((matWeight * 0.8 + lmdWeight * 0.2) * 100);
    }

    let status: 'ready' | 'partial' | 'waiting' = 'waiting';
    if (missingItems.length === 0 && lmdMissing === 0) {
      status = 'ready';
      fullyReadyCount++;
    } else if (readinessPercentage > 20 || totalItemsAllocatedUnits > 0) {
      status = 'partial';
      partialCount++;
    } else {
      status = 'waiting';
      waitingCount++;
    }

    steps.push({
      charId: plan.charId,
      operator: op,
      plan,
      priorityRank: i + 1,
      status,
      readinessPercentage,
      totalLmdNeeded: totalLmd,
      lmdAvailable: allocatedLmd,
      lmdMissing,
      totalExpNeeded: costs.exp,
      missingItems,
      allocatedItems,
      requiredItems: costs.materials,
      milestones,
    });
  }

  return {
    steps,
    fullyReadyCount,
    partialCount,
    waitingCount,
    completedCount,
    totalLmdRequired,
    totalExpRequired,
  };
}
