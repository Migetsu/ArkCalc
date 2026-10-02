/**
 * Multi-Drop Farming Optimizer Service
 *
 * Implements community-tested multi-drop synergy simulation based on Penguin Statistics.
 * Calculates optimal stage routing taking into account primary target materials,
 * secondary byproduct drops (T2/T1), and workshop crafting conversions.
 */

import { calculateFarmingEstimate } from '@/data/penguinStatsBenchmark';

export interface StageDefinition {
  stageCode: string;
  stageId?: string;
  chapter: number;
  apCost: number;
  primaryItemId: string;
  primaryDropRate: number; // e.g. 43.8 for 43.8%
  sanityPerItem: number;
  byproducts: {
    itemId: string;
    dropRate: number; // in percent, e.g. 25.0 for 25%
  }[];
  lmdPerRun: number;
  tagEn: string;
  tagRu: string;
  notesEn?: string;
  notesRu?: string;
}

export interface OptimizerOptions {
  mode?: 'synergy' | 'isolated';
  maxChapter?: number; // 4, 7, 10, 14 (default: 14)
  prefer1_7?: boolean; // default: true
}

export interface OptimizedStageRoute {
  stageCode: string;
  chapter: number;
  apCost: number;
  recommendedRuns: number;
  totalSanity: number;
  lmdGained: number;
  primaryDrop: {
    itemId: string;
    targetCount: number;
    expectedDropCount: number;
    dropRate: number;
  };
  synergyByproducts: {
    itemId: string;
    count: number;
    convertedT3Count?: number;
    targetT3ItemId?: string;
    isNeededInPlan: boolean;
  }[];
  tagEn: string;
  tagRu: string;
}

export interface WorkshopCraftSuggestion {
  t2ItemId: string;
  t2ItemNameEn: string;
  t2Count: number;
  t3ItemId: string;
  t3ItemNameEn: string;
  t3Produced: number;
}

export interface FarmingOptimizationResult {
  mode: 'synergy' | 'isolated';
  totalSanity: number;
  totalRuns: number;
  totalLmdGained: number;
  naturalDays: number;
  opEquivalent: number;
  routes: OptimizedStageRoute[];
  workshopCrafts: WorkshopCraftSuggestion[];
  savings?: {
    sanitySaved: number;
    runsSaved: number;
    percentageSaved: number;
    daysSaved: number;
  };
}

// T2 to T3 conversion mapping in Workshop
export const T2_TO_T3_MAP: Record<string, { t3Id: string; ratio: number }> = {
  '30012': { t3Id: '30013', ratio: 5 }, // Orirock Cube -> Orirock Cluster
  '30022': { t3Id: '30023', ratio: 4 }, // Sugar -> Sugar Pack
  '30032': { t3Id: '30033', ratio: 4 }, // Polyester -> Polyester Pack
  '30042': { t3Id: '30043', ratio: 4 }, // Oriron -> Oriron Cluster
  '30052': { t3Id: '30053', ratio: 4 }, // Polyketon -> Aketon
  '30062': { t3Id: '30063', ratio: 4 }, // Device -> Integrated Device
};

// Top Arknights farming stages with authoritative drop rates and verified byproduct distributions
export const STAGE_DEFINITIONS: StageDefinition[] = [
  // --- 1-7: Rock heaven ---
  {
    stageCode: '1-7',
    chapter: 1,
    apCost: 6,
    primaryItemId: '30013', // Treated as rock source (crafts into 30013)
    primaryDropRate: 124.8, // Drops 1.25 Orirock Cubes (30012) per run -> 0.25 T3 per run
    sanityPerItem: 4.8,
    byproducts: [
      { itemId: '30012', dropRate: 124.8 },
      { itemId: '30011', dropRate: 31.2 },
      { itemId: '30021', dropRate: 5.0 },
      { itemId: '30031', dropRate: 5.0 },
      { itemId: '30041', dropRate: 5.0 },
      { itemId: '30051', dropRate: 5.0 },
      { itemId: '30061', dropRate: 5.0 },
    ],
    lmdPerRun: 720,
    tagEn: 'Record Efficiency',
    tagRu: 'Абсолютный рекорд',
    notesEn: 'Legendary stage 1-7: Highest rock Sanity efficiency in the game via Workshop crafting',
    notesRu: 'Легендарная стадия 1-7: наивысшая эффективность камней в игре через Мастерскую',
  },
  // --- 2-4: Alternative Orirock ---
  {
    stageCode: '2-4',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30013',
    primaryDropRate: 28.5,
    sanityPerItem: 42.1,
    byproducts: [
      { itemId: '30012', dropRate: 22.0 },
      { itemId: '30022', dropRate: 14.0 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Direct T3',
    tagRu: 'Прямой дроп T3',
  },
  // --- 10-6: Manganese Ore ---
  {
    stageCode: '10-6',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30083',
    primaryDropRate: 43.8,
    sanityPerItem: 47.9,
    byproducts: [
      { itemId: '30022', dropRate: 24.5 }, // Sugar T2
      { itemId: '30032', dropRate: 25.2 }, // Polyester T2
      { itemId: '30042', dropRate: 21.0 }, // Oriron T2
      { itemId: '30093', dropRate: 4.2 },  // Grindstone rare
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Exceptional stage: provides rich Sugar, Polyester, and Oriron byproducts',
    notesRu: 'Отличная стадия: дает богатые побочные дропы сахара, полиэстера и орижелеза',
  },
  // --- 7-16: Manganese Ore alternative ---
  {
    stageCode: '7-16',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30083',
    primaryDropRate: 36.4,
    sanityPerItem: 49.5,
    byproducts: [
      { itemId: '30042', dropRate: 20.0 },
      { itemId: '30022', dropRate: 19.5 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic Farm',
    tagRu: 'Классический фарм',
  },
  // --- 3-2: Early Manganese Ore ---
  {
    stageCode: '3-2',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30083',
    primaryDropRate: 27.2,
    sanityPerItem: 55.1,
    byproducts: [
      { itemId: '30042', dropRate: 15.0 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 10-11: Oriron Cluster ---
  {
    stageCode: '10-11',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30043',
    primaryDropRate: 44.8,
    sanityPerItem: 46.9,
    byproducts: [
      { itemId: '30062', dropRate: 24.8 }, // Device T2
      { itemId: '30052', dropRate: 26.1 }, // Polyketon T2
      { itemId: '30042', dropRate: 18.5 }, // Oriron T2
      { itemId: '30013', dropRate: 4.5 },  // Rock cluster rare
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Supplies valuable Device and Polyketon byproducts',
    notesRu: 'Дает ценные сопутствующие устройства и поликетоны',
  },
  // --- 7-18: Oriron Cluster alternative ---
  {
    stageCode: '7-18',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30043',
    primaryDropRate: 33.2,
    sanityPerItem: 54.2,
    byproducts: [
      { itemId: '30062', dropRate: 20.0 },
      { itemId: '30052', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Best Byproducts',
    tagRu: 'Богатые побочные',
  },
  // --- S3-3: Early Oriron Cluster ---
  {
    stageCode: 'S3-3',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30043',
    primaryDropRate: 29.5,
    sanityPerItem: 50.8,
    byproducts: [
      { itemId: '30042', dropRate: 18.0 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 10-2: Sugar Pack ---
  {
    stageCode: '10-2',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30023',
    primaryDropRate: 43.5,
    sanityPerItem: 48.2,
    byproducts: [
      { itemId: '30032', dropRate: 26.0 }, // Polyester T2
      { itemId: '30052', dropRate: 23.5 }, // Polyketon T2
      { itemId: '30012', dropRate: 22.0 }, // Orirock Cube T2
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Byproducts',
    tagRu: 'Богатые побочные',
  },
  // --- 2-5: Sugar Pack (Early / Low AP) ---
  {
    stageCode: '2-5',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30023',
    primaryDropRate: 26.8,
    sanityPerItem: 44.8,
    byproducts: [
      { itemId: '30022', dropRate: 20.0 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Fast & Low AP',
    tagRu: 'Быстрый фарм',
  },
  // --- 10-5: Aketon ---
  {
    stageCode: '10-5',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30053',
    primaryDropRate: 53.6,
    sanityPerItem: 39.2,
    byproducts: [
      { itemId: '30022', dropRate: 25.0 }, // Sugar T2
      { itemId: '30062', dropRate: 21.5 }, // Device T2
      { itemId: '30052', dropRate: 28.0 }, // Polyketon T2
    ],
    lmdPerRun: 2520,
    tagEn: 'High Drop Rate',
    tagRu: 'Рекордный дроп',
  },
  // --- 3-1: Aketon alternative ---
  {
    stageCode: '3-1',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30053',
    primaryDropRate: 36.8,
    sanityPerItem: 40.8,
    byproducts: [
      { itemId: '30052', dropRate: 25.0 },
      { itemId: '30022', dropRate: 16.0 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 10-8: Integrated Device ---
  {
    stageCode: '10-8',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30063',
    primaryDropRate: 41.2,
    sanityPerItem: 51.0,
    byproducts: [
      { itemId: '30042', dropRate: 24.5 }, // Oriron T2
      { itemId: '30052', dropRate: 22.0 }, // Polyketon T2
      { itemId: '30062', dropRate: 27.0 }, // Device T2
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 7-15: Device / RMA alternative ---
  {
    stageCode: '7-15',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30063',
    primaryDropRate: 32.5,
    sanityPerItem: 55.4,
    byproducts: [
      { itemId: '30062', dropRate: 20.0 },
      { itemId: '30032', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Alternative',
    tagRu: 'Альтернатива',
  },
  // --- 7-4: Polyester Pack ---
  {
    stageCode: '7-4',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30033',
    primaryDropRate: 41.5,
    sanityPerItem: 43.4,
    byproducts: [
      { itemId: '30032', dropRate: 25.0 },
      { itemId: '30022', dropRate: 20.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 2-7: Polyester Early ---
  {
    stageCode: '2-7',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30033',
    primaryDropRate: 25.4,
    sanityPerItem: 47.2,
    byproducts: [
      { itemId: '30032', dropRate: 20.0 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 11-15: Grindstone ---
  {
    stageCode: '11-15',
    chapter: 11,
    apCost: 21,
    primaryItemId: '30093',
    primaryDropRate: 41.8,
    sanityPerItem: 50.2,
    byproducts: [
      { itemId: '30052', dropRate: 24.0 },
      { itemId: '30022', dropRate: 25.5 },
      { itemId: '30082', dropRate: 19.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 4-8: Grindstone Classic ---
  {
    stageCode: '4-8',
    chapter: 4,
    apCost: 18,
    primaryItemId: '30093',
    primaryDropRate: 29.8,
    sanityPerItem: 60.4,
    byproducts: [
      { itemId: '30052', dropRate: 18.0 },
      { itemId: '30022', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic',
    tagRu: 'Классическая',
  },
  // --- 12-10: Loxic Kohl ---
  {
    stageCode: '12-10',
    chapter: 12,
    apCost: 21,
    primaryItemId: '30073',
    primaryDropRate: 53.8,
    sanityPerItem: 39.0,
    byproducts: [
      { itemId: '30032', dropRate: 26.5 },
      { itemId: '30042', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Record Efficiency',
    tagRu: 'Рекордная выносливость',
  },
  // --- 4-4: Loxic Kohl Classic ---
  {
    stageCode: '4-4',
    chapter: 4,
    apCost: 18,
    primaryItemId: '30073',
    primaryDropRate: 38.6,
    sanityPerItem: 46.6,
    byproducts: [
      { itemId: '30032', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic',
    tagRu: 'Классическая',
  },
  // --- 10-4: RMA70-12 ---
  {
    stageCode: '10-4',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30103',
    primaryDropRate: 37.2,
    sanityPerItem: 56.4,
    byproducts: [
      { itemId: '30062', dropRate: 23.0 },
      { itemId: '30032', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 4-9: RMA70-12 Classic ---
  {
    stageCode: '4-9',
    chapter: 4,
    apCost: 18,
    primaryItemId: '30103',
    primaryDropRate: 32.5,
    sanityPerItem: 55.4,
    byproducts: [
      { itemId: '30062', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic',
    tagRu: 'Классическая',
  },
  // --- 10-17: Incandescent Alloy ---
  {
    stageCode: '10-17',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 42.5,
    sanityPerItem: 49.4,
    byproducts: [
      { itemId: '30042', dropRate: 24.0 },
      { itemId: '30012', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 10-3: Coagulating Gel ---
  {
    stageCode: '10-3',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31023',
    primaryDropRate: 41.0,
    sanityPerItem: 51.2,
    byproducts: [
      { itemId: '30022', dropRate: 24.0 },
      { itemId: '30052', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 10-13: Crystalline Component ---
  {
    stageCode: '10-13',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31033',
    primaryDropRate: 43.2,
    sanityPerItem: 48.6,
    byproducts: [
      { itemId: '30062', dropRate: 25.0 },
      { itemId: '30032', dropRate: 24.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 10-9: Semi-Synthetic Solvent ---
  {
    stageCode: '10-9',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 44.1,
    sanityPerItem: 47.6,
    byproducts: [
      { itemId: '30042', dropRate: 22.0 },
      { itemId: '30022', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 10-10: Compound Cutting Fluid ---
  {
    stageCode: '10-10',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31053',
    primaryDropRate: 43.5,
    sanityPerItem: 48.3,
    byproducts: [
      { itemId: '30032', dropRate: 25.0 },
      { itemId: '30062', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 11-3: Transmuted Salt ---
  {
    stageCode: '11-3',
    chapter: 11,
    apCost: 21,
    primaryItemId: '31063',
    primaryDropRate: 45.2,
    sanityPerItem: 46.5,
    byproducts: [
      { itemId: '30022', dropRate: 25.0 },
      { itemId: '30042', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 13-15: Cyclene ---
  {
    stageCode: '13-15',
    chapter: 13,
    apCost: 21,
    primaryItemId: '31073',
    primaryDropRate: 46.0,
    sanityPerItem: 45.6,
    byproducts: [
      { itemId: '30052', dropRate: 24.0 },
      { itemId: '30032', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 14-11: Phosphor Bronze ---
  {
    stageCode: '14-11',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31083',
    primaryDropRate: 45.5,
    sanityPerItem: 46.1,
    byproducts: [
      { itemId: '30062', dropRate: 24.0 },
      { itemId: '30042', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
];

/**
 * Finds all candidate stages for a given item filtered by chapter and settings
 */
export function getAvailableStagesForItem(
  itemId: string,
  options?: OptimizerOptions
): StageDefinition[] {
  const maxCh = options?.maxChapter ?? 14;
  const prefer1_7 = options?.prefer1_7 ?? true;

  return STAGE_DEFINITIONS.filter((s) => {
    if (s.primaryItemId !== itemId) return false;
    if (s.chapter > maxCh) return false;
    if (itemId === '30013') {
      if (prefer1_7 && s.stageCode !== '1-7') return false;
      if (!prefer1_7 && s.stageCode === '1-7') return false;
    }
    return true;
  });
}

/**
 * Optimizes the farming route by analyzing primary demands and byproduct synergies.
 */
export function optimizeFarmingPlan(
  requirements: { itemId: string; count: number }[],
  options?: OptimizerOptions
): FarmingOptimizationResult {
  const mode = options?.mode ?? 'synergy';
  const validReqs = requirements.filter((r) => r.itemId && r.count > 0);

  // 1. Calculate isolated baseline
  let isolatedTotalSanity = 0;
  let isolatedTotalRuns = 0;
  const isolatedRoutes: OptimizedStageRoute[] = [];

  for (const req of validReqs) {
    const est = calculateFarmingEstimate(req.itemId, req.count);
    const stages = getAvailableStagesForItem(req.itemId, options);
    const stage = stages[0] || STAGE_DEFINITIONS.find((s) => s.primaryItemId === req.itemId);

    if (stage) {
      const dropChanceDecimal = Math.max(0.01, stage.primaryDropRate / 100);
      let runs = Math.ceil(req.count / dropChanceDecimal);
      if (stage.stageCode === '1-7') {
        // Special calculation for 1-7: each run drops ~1.25 T2 rock cubes. 5 T2 cubes = 1 T3.
        // So 1 run = 0.25 T3 rock -> runs = ceil(count / 0.25) = count * 4
        runs = Math.ceil(req.count * 4);
      }
      const sanity = runs * stage.apCost;

      isolatedTotalSanity += sanity;
      isolatedTotalRuns += runs;

      isolatedRoutes.push({
        stageCode: stage.stageCode,
        chapter: stage.chapter,
        apCost: stage.apCost,
        recommendedRuns: runs,
        totalSanity: sanity,
        lmdGained: runs * stage.lmdPerRun,
        primaryDrop: {
          itemId: req.itemId,
          targetCount: req.count,
          expectedDropCount: req.count,
          dropRate: stage.primaryDropRate,
        },
        synergyByproducts: [],
        tagEn: stage.tagEn,
        tagRu: stage.tagRu,
      });
    } else if (est) {
      isolatedTotalSanity += est.totalSanity;
      isolatedTotalRuns += est.runs;
    }
  }

  // If user requested isolated mode, return direct plan
  if (mode === 'isolated') {
    const naturalDays = Math.round((isolatedTotalSanity / 240) * 10) / 10;
    const opEquivalent = Math.ceil(isolatedTotalSanity / 135);
    const totalLmd = isolatedRoutes.reduce((acc, r) => acc + r.lmdGained, 0);

    return {
      mode: 'isolated',
      totalSanity: isolatedTotalSanity,
      totalRuns: isolatedTotalRuns,
      totalLmdGained: totalLmd,
      naturalDays,
      opEquivalent,
      routes: isolatedRoutes,
      workshopCrafts: [],
    };
  }

  // 2. Synergy Optimization Simulation
  // Create mutable target deficits map
  const targetDeficits: Record<string, number> = {};
  for (const r of validReqs) {
    targetDeficits[r.itemId] = (targetDeficits[r.itemId] || 0) + r.count;
  }

  // Track accumulated byproducts during farming
  const accumulatedByproducts: Record<string, number> = {};
  const optimizedRoutes: OptimizedStageRoute[] = [];

  // Stage prioritization:
  // Non-convertible rare materials (Grindstone, Manganese, RMA, Kohl, Alloy, Gel, Component, Solvent, Cutting Fluid, Salt, Cyclene, Bronze)
  // produce byproducts of common materials (Sugar, Polyester, Oriron, Aketon, Device, Rock).
  // Therefore, farming stages with high byproduct value FIRST provides maximum synergy!
  const sortedReqItems = [...validReqs].sort((a, b) => {
    const stageA = getAvailableStagesForItem(a.itemId, options)[0];
    const stageB = getAvailableStagesForItem(b.itemId, options)[0];
    const bypCountA = stageA?.byproducts.length || 0;
    const bypCountB = stageB?.byproducts.length || 0;
    return bypCountB - bypCountA;
  });

  for (const req of sortedReqItems) {
    const currentNeed = targetDeficits[req.itemId] || 0;
    if (currentNeed <= 0) continue; // Already covered by previous stage byproducts!

    const stages = getAvailableStagesForItem(req.itemId, options);
    const stage = stages[0] || STAGE_DEFINITIONS.find((s) => s.primaryItemId === req.itemId);

    if (!stage) {
      // Fallback
      continue;
    }

    // Determine runs needed for this primary item
    let runs = 0;
    if (stage.stageCode === '1-7') {
      runs = Math.ceil(currentNeed * 4); // 4 runs per 1 T3 rock
    } else {
      const dropChanceDecimal = Math.max(0.01, stage.primaryDropRate / 100);
      runs = Math.ceil(currentNeed / dropChanceDecimal);
    }

    const expectedPrimaryDrops = currentNeed;
    targetDeficits[req.itemId] = 0; // Primary need fully met

    // Calculate byproducts dropped during these runs
    const routeByproducts: OptimizedStageRoute['synergyByproducts'] = [];

    for (const byp of stage.byproducts) {
      const dropChance = byp.dropRate / 100;
      const totalDropped = Math.floor(runs * dropChance);
      if (totalDropped <= 0) continue;

      accumulatedByproducts[byp.itemId] = (accumulatedByproducts[byp.itemId] || 0) + totalDropped;

      // Check if this byproduct can be converted into a T3 item that is needed in plan
      const conv = T2_TO_T3_MAP[byp.itemId];
      if (conv) {
        const potentialT3 = Math.floor(totalDropped / conv.ratio);
        const neededT3 = targetDeficits[conv.t3Id] || 0;
        const willDeduct = Math.min(potentialT3, neededT3);

        if (willDeduct > 0) {
          targetDeficits[conv.t3Id] = Math.max(0, targetDeficits[conv.t3Id] - willDeduct);
        }

        routeByproducts.push({
          itemId: byp.itemId,
          count: totalDropped,
          convertedT3Count: potentialT3,
          targetT3ItemId: conv.t3Id,
          isNeededInPlan: neededT3 > 0,
        });
      } else {
        // Direct T3 byproduct drop
        if (targetDeficits[byp.itemId] && targetDeficits[byp.itemId] > 0) {
          targetDeficits[byp.itemId] = Math.max(0, targetDeficits[byp.itemId] - totalDropped);
        }
        routeByproducts.push({
          itemId: byp.itemId,
          count: totalDropped,
          isNeededInPlan: (targetDeficits[byp.itemId] || 0) > 0,
        });
      }
    }

    optimizedRoutes.push({
      stageCode: stage.stageCode,
      chapter: stage.chapter,
      apCost: stage.apCost,
      recommendedRuns: runs,
      totalSanity: runs * stage.apCost,
      lmdGained: runs * stage.lmdPerRun,
      primaryDrop: {
        itemId: req.itemId,
        targetCount: currentNeed,
        expectedDropCount: expectedPrimaryDrops,
        dropRate: stage.primaryDropRate,
      },
      synergyByproducts: routeByproducts,
      tagEn: stage.tagEn,
      tagRu: stage.tagRu,
    });
  }

  // Calculate workshop craft suggestions from accumulated byproducts
  const workshopCrafts: WorkshopCraftSuggestion[] = [];
  for (const [t2Id, count] of Object.entries(accumulatedByproducts)) {
    const conv = T2_TO_T3_MAP[t2Id];
    if (conv && count >= conv.ratio) {
      const produced = Math.floor(count / conv.ratio);
      workshopCrafts.push({
        t2ItemId: t2Id,
        t2ItemNameEn: t2Id,
        t2Count: produced * conv.ratio,
        t3ItemId: conv.t3Id,
        t3ItemNameEn: conv.t3Id,
        t3Produced: produced,
      });
    }
  }

  const optimizedTotalSanity = optimizedRoutes.reduce((acc, r) => acc + r.totalSanity, 0);
  const optimizedTotalRuns = optimizedRoutes.reduce((acc, r) => acc + r.recommendedRuns, 0);
  const totalLmdGained = optimizedRoutes.reduce((acc, r) => acc + r.lmdGained, 0);

  const naturalDays = Math.round((optimizedTotalSanity / 240) * 10) / 10;
  const opEquivalent = Math.ceil(optimizedTotalSanity / 135);

  const sanitySaved = Math.max(0, isolatedTotalSanity - optimizedTotalSanity);
  const runsSaved = Math.max(0, isolatedTotalRuns - optimizedTotalRuns);
  const percentageSaved = isolatedTotalSanity > 0 ? Math.round((sanitySaved / isolatedTotalSanity) * 100) : 0;
  const daysSaved = Math.round((sanitySaved / 240) * 10) / 10;

  return {
    mode: 'synergy',
    totalSanity: optimizedTotalSanity,
    totalRuns: optimizedTotalRuns,
    totalLmdGained,
    naturalDays,
    opEquivalent,
    routes: optimizedRoutes,
    workshopCrafts,
    savings: {
      sanitySaved,
      runsSaved,
      percentageSaved,
      daysSaved,
    },
  };
}
