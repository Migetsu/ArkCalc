import type {
  OperatorSummary,
  GameConstants,
  WorkshopRecipe,
  ItemSummary,
  CalculationResult,
  ItemRequirementSummary,
  CraftingStep,
  FarmingRequirement,
} from '@/types/game';
import type { OperatorTargetPlan } from '@/services/db';

export function calculateOperatorPlanCosts(
  operator: OperatorSummary,
  plan: OperatorTargetPlan,
  constants: GameConstants
): {
  exp: number;
  lmdLevel: number;
  lmdEvolve: number;
  materials: Record<string, number>;
} {
  let exp = 0;
  let lmdLevel = 0;
  let lmdEvolve = 0;
  const materials: Record<string, number> = {};

  const addMaterial = (itemId: string, count: number) => {
    if (itemId === '4001') {
      lmdLevel += count;
    } else {
      materials[itemId] = (materials[itemId] || 0) + count;
    }
  };

  const rarityIdx = Math.max(0, Math.min(5, operator.rarity - 1));
  const maxLevels = operator.maxLevels || [30];

  const curE = plan.current.elite;
  const curL = plan.current.level;
  const tarE = plan.target.elite;
  const tarL = plan.target.level;

  // 1. Level & Elite Evolution
  if (curE === tarE) {
    if (tarL > curL) {
      const expMap = constants.characterExpMap[String(curE)] || [];
      const costMap = constants.characterUpgradeCostMap[String(curE)] || [];
      for (let l = curL; l < tarL; l++) {
        exp += expMap[l - 1] || 0;
        lmdLevel += costMap[l - 1] || 0;
      }
    }
  } else if (tarE > curE) {
    for (let e = curE; e <= tarE; e++) {
      const maxLvl = maxLevels[e] || 50;
      const expMap = constants.characterExpMap[String(e)] || [];
      const costMap = constants.characterUpgradeCostMap[String(e)] || [];

      if (e === curE) {
        // From curL to maxLvl
        for (let l = curL; l < maxLvl; l++) {
          exp += expMap[l - 1] || 0;
          lmdLevel += costMap[l - 1] || 0;
        }
        // Promotion to e + 1
        const evolveCostLmd = constants.evolveGoldCost[rarityIdx]?.[e] ?? 0;
        if (evolveCostLmd > 0) lmdEvolve += evolveCostLmd;
        const evolveMats = operator.phases[e + 1]?.evolveCost || [];
        for (const m of evolveMats) {
          addMaterial(m.id, m.count);
        }
      } else if (e < tarE) {
        // Full phase from 1 to maxLvl
        for (let l = 1; l < maxLvl; l++) {
          exp += expMap[l - 1] || 0;
          lmdLevel += costMap[l - 1] || 0;
        }
        // Promotion to e + 1
        const evolveCostLmd = constants.evolveGoldCost[rarityIdx]?.[e] ?? 0;
        if (evolveCostLmd > 0) lmdEvolve += evolveCostLmd;
        const evolveMats = operator.phases[e + 1]?.evolveCost || [];
        for (const m of evolveMats) {
          addMaterial(m.id, m.count);
        }
      } else {
        // Final phase: from 1 to tarL
        for (let l = 1; l < tarL; l++) {
          exp += expMap[l - 1] || 0;
          lmdLevel += costMap[l - 1] || 0;
        }
      }
    }
  }

  // 2. Common Skills (1 -> 7)
  const curCommonSkill = plan.current.skills?.[0] ?? 1;
  const tarCommonSkill = plan.target.skills?.[0] ?? 1;
  if (tarCommonSkill > curCommonSkill) {
    for (let s = curCommonSkill; s < tarCommonSkill; s++) {
      const stepCosts = operator.allSkillLvlup[s - 1]?.lvlUpCost || [];
      for (const m of stepCosts) {
        addMaterial(m.id, m.count);
      }
    }
  }

  // 3. Masteries (M1 -> M3)
  const curMasteries = plan.current.masteries || [];
  const tarMasteries = plan.target.masteries || [];
  for (let k = 0; k < operator.skills.length; k++) {
    const curM = curMasteries[k] || 0;
    const tarM = tarMasteries[k] || 0;
    if (tarM > curM) {
      const skill = operator.skills[k];
      for (let m = curM + 1; m <= tarM; m++) {
        const masteryObj = skill.masteries.find((entry) => entry.masteryLevel === m);
        if (masteryObj) {
          for (const mat of masteryObj.costs) {
            addMaterial(mat.id, mat.count);
          }
        }
      }
    }
  }

  // 4. Modules (Stages 1 -> 3)
  const curModules = plan.current.modules || {};
  const tarModules = plan.target.modules || {};
  for (const mod of operator.modules) {
    const curStage = curModules[mod.id] || 0;
    const tarStage = tarModules[mod.id] || 0;
    if (tarStage > curStage) {
      for (let st = curStage + 1; st <= tarStage; st++) {
        const stageCosts = mod.costs[st] || [];
        for (const mat of stageCosts) {
          addMaterial(mat.id, mat.count);
        }
      }
    }
  }

  return { exp, lmdLevel, lmdEvolve, materials };
}

export function calculateAllPlans(
  plans: OperatorTargetPlan[],
  operators: Record<string, OperatorSummary>,
  items: Record<string, ItemSummary>,
  recipes: Record<string, WorkshopRecipe>,
  constants: GameConstants,
  userStock: Record<string, number>
): CalculationResult {
  let totalExp = 0;
  let totalLmdLevel = 0;
  let totalLmdEvolve = 0;
  let totalLmdCraft = 0;

  const rawMaterials: Record<string, number> = {};

  // Aggregate raw requirements across all plans
  for (const plan of plans) {
    const op = operators[plan.charId];
    if (!op) continue;

    const opResult = calculateOperatorPlanCosts(op, plan, constants);
    totalExp += opResult.exp;
    totalLmdLevel += opResult.lmdLevel;
    totalLmdEvolve += opResult.lmdEvolve;

    for (const itemId in opResult.materials) {
      rawMaterials[itemId] = (rawMaterials[itemId] || 0) + opResult.materials[itemId];
    }
  }

  // Calculate direct deficits (Item by item without crafting)
  const directDeficit: ItemRequirementSummary[] = [];
  for (const itemId in rawMaterials) {
    const needed = rawMaterials[itemId];
    const stock = userStock[itemId] || 0;
    const deficit = Math.max(0, needed - stock);
    const craftable = !!recipes[itemId];

    directDeficit.push({
      itemId,
      needed,
      stock,
      deficit,
      craftable,
    });
  }

  // Sort direct deficit by rarity descending, then name
  directDeficit.sort((a, b) => {
    const rA = items[a.itemId]?.rarity || 0;
    const rB = items[b.itemId]?.rarity || 0;
    if (rB !== rA) return rB - rA;
    return (items[a.itemId]?.name || a.itemId).localeCompare(items[b.itemId]?.name || b.itemId);
  });

  // Crafting Tree Resolver (Section 5.2)
  // We work on a clone of user stock
  const virtualStock: Record<string, number> = { ...userStock };
  const craftingStepsMap: Record<string, CraftingStep> = {};
  const farmMap: Record<string, number> = {};

  function decomposeItem(
    itemId: string,
    neededAmount: number,
    visitingPath: Set<string> = new Set()
  ) {
    if (neededAmount <= 0) return;

    // Cycle detection guard: prevent infinite recursion
    if (visitingPath.has(itemId) || visitingPath.size > 20) {
      farmMap[itemId] = (farmMap[itemId] || 0) + neededAmount;
      return;
    }

    const recipe = recipes[itemId];
    if (!recipe) {
      // Base item or uncraftable -> must be farmed directly
      farmMap[itemId] = (farmMap[itemId] || 0) + neededAmount;
      return;
    }

    // In Arknights, players directly farm T3 materials from main story stages.
    // Only decompose T3 materials into T2/T1 if the player actually has ingredients in stock to craft them.
    const itemRarity = items[itemId]?.rarity || 1;
    const isDualChip = itemId.startsWith('32') && itemRarity >= 4;
    if (itemRarity <= 3 && !isDualChip) {
      const hasIngredientsInStock = recipe.costs.some((c) => (virtualStock[c.id] || 0) > 0);
      if (!hasIngredientsInStock) {
        farmMap[itemId] = (farmMap[itemId] || 0) + neededAmount;
        return;
      }
    }

    const nextVisiting = new Set(visitingPath);
    nextVisiting.add(itemId);

    // Number of crafts needed (accounting for yield count if > 1)
    const yieldCount = recipe.count || 1;
    const craftsNeeded = Math.ceil(neededAmount / yieldCount);
    const producedCount = craftsNeeded * yieldCount;

    // Track total crafting LMD
    totalLmdCraft += (recipe.goldCost || 0) * craftsNeeded;

    // Record step
    if (!craftingStepsMap[itemId]) {
      craftingStepsMap[itemId] = {
        itemId,
        countToCraft: 0,
        goldCost: 0,
        ingredients: [],
      };
    }
    const step = craftingStepsMap[itemId];
    step.countToCraft += producedCount;
    step.goldCost += (recipe.goldCost || 0) * craftsNeeded;

    // Process ingredients
    for (const ingredient of recipe.costs) {
      const subItemId = ingredient.id;
      const subCountNeeded = ingredient.count * craftsNeeded;
      const availableOnStock = virtualStock[subItemId] || 0;

      let usedFromStock = 0;
      let missingToDecompose = 0;

      if (availableOnStock >= subCountNeeded) {
        virtualStock[subItemId] -= subCountNeeded;
        usedFromStock = subCountNeeded;
      } else {
        usedFromStock = availableOnStock;
        missingToDecompose = subCountNeeded - availableOnStock;
        virtualStock[subItemId] = 0;
      }

      // Record ingredient info for UI
      let existingIng = step.ingredients.find((i) => i.itemId === subItemId);
      if (!existingIng) {
        existingIng = {
          itemId: subItemId,
          countPerCraft: ingredient.count,
          totalNeeded: 0,
          usedFromStock: 0,
          missingToCraftOrFarm: 0,
        };
        step.ingredients.push(existingIng);
      }
      existingIng.totalNeeded += subCountNeeded;
      existingIng.usedFromStock += usedFromStock;
      existingIng.missingToCraftOrFarm += missingToDecompose;

      if (missingToDecompose > 0) {
        decomposeItem(subItemId, missingToDecompose, nextVisiting);
      }
    }
  }

  // Decompose items that have a direct deficit, starting from highest tier items
  const deficitItemsToDecompose = Object.keys(rawMaterials).sort((a, b) => {
    const rA = items[a]?.rarity || 0;
    const rB = items[b]?.rarity || 0;
    return rB - rA; // T5 first, then T4, T3...
  });

  for (const itemId of deficitItemsToDecompose) {
    const needed = rawMaterials[itemId];
    const available = virtualStock[itemId] || 0;

    if (available >= needed) {
      virtualStock[itemId] -= needed;
    } else {
      const deficit = needed - available;
      virtualStock[itemId] = 0;
      decomposeItem(itemId, deficit);
    }
  }

  const craftingSteps = Object.values(craftingStepsMap).sort((a, b) => {
    const rA = items[a.itemId]?.rarity || 0;
    const rB = items[b.itemId]?.rarity || 0;
    return rB - rA;
  });

  const farmRequirements: FarmingRequirement[] = Object.entries(farmMap)
    .map(([itemId, count]) => ({ itemId, count }))
    .sort((a, b) => {
      const rA = items[a.itemId]?.rarity || 0;
      const rB = items[b.itemId]?.rarity || 0;
      if (rB !== rA) return rB - rA;
      return (items[a.itemId]?.name || a.itemId).localeCompare(items[b.itemId]?.name || b.itemId);
    });

  const totalLmd = totalLmdLevel + totalLmdEvolve + totalLmdCraft;

  return {
    totalExp,
    totalLmdLevel,
    totalLmdEvolve,
    totalLmdCraft,
    totalLmd,
    rawMaterials,
    directDeficit,
    craftingSteps,
    farmRequirements,
  };
}
