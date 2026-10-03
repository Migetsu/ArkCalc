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
  // --- 1-7: Orirock Cluster ---
  {
    stageCode: '1-7',
    chapter: 1,
    apCost: 6,
    primaryItemId: '30013',
    primaryDropRate: 124.8,
    sanityPerItem: 4.8,
    byproducts: [
      { itemId: '30012', dropRate: 124.8 },
      { itemId: '30011', dropRate: 31.2 },
      { itemId: '30021', dropRate: 5 },
      { itemId: '30031', dropRate: 5 },
      { itemId: '30041', dropRate: 5 },
      { itemId: '30051', dropRate: 5 },
      { itemId: '30061', dropRate: 5 },
    ],
    lmdPerRun: 720,
    tagEn: 'Record Efficiency',
    tagRu: 'Абсолютный рекорд',
    notesEn: 'Legendary stage 1-7: Highest rock Sanity efficiency in the game via Workshop crafting',
    notesRu: 'Легендарная стадия 1-7: наивысшая эффективность камней в игре через Мастерскую',
  },
  // --- 10-6: Orirock Cluster ---
  {
    stageCode: '10-6',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30013',
    primaryDropRate: 75.9,
    sanityPerItem: 27.7,
    byproducts: [
      { itemId: '30012', dropRate: 36.2 },
      { itemId: '30011', dropRate: 21.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 2-4: Orirock Cluster ---
  {
    stageCode: '2-4',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30013',
    primaryDropRate: 42.3,
    sanityPerItem: 28.4,
    byproducts: [
      { itemId: '30011', dropRate: 41.4 },
      { itemId: '30031', dropRate: 27.5 },
      { itemId: '30061', dropRate: 16.4 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 7-6: Orirock Cluster ---
  {
    stageCode: '7-6',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30013',
    primaryDropRate: 60,
    sanityPerItem: 30,
    byproducts: [
      { itemId: '30022', dropRate: 73.3 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 6-5: Orirock Cluster ---
  {
    stageCode: '6-5',
    chapter: 6,
    apCost: 18,
    primaryItemId: '30013',
    primaryDropRate: 60,
    sanityPerItem: 30,
    byproducts: [
      { itemId: '30032', dropRate: 73.3 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 2-5: Sugar Pack ---
  {
    stageCode: '2-5',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30023',
    primaryDropRate: 37,
    sanityPerItem: 32.4,
    byproducts: [
      { itemId: '30021', dropRate: 26.1 },
      { itemId: '30041', dropRate: 20.8 },
      { itemId: '30051', dropRate: 20.7 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 11-6: Sugar Pack ---
  {
    stageCode: '11-6',
    chapter: 11,
    apCost: 21,
    primaryItemId: '30023',
    primaryDropRate: 50.1,
    sanityPerItem: 42,
    byproducts: [
      { itemId: '30042', dropRate: 106.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- M8-7: Sugar Pack ---
  {
    stageCode: 'M8-7',
    chapter: 8,
    apCost: 21,
    primaryItemId: '30023',
    primaryDropRate: 49.8,
    sanityPerItem: 42.2,
    byproducts: [
      { itemId: '30042', dropRate: 107 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 7-12: Sugar Pack ---
  {
    stageCode: '7-12',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30023',
    primaryDropRate: 42,
    sanityPerItem: 42.9,
    byproducts: [
      { itemId: '30052', dropRate: 86.1 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 7-4: Polyester Pack ---
  {
    stageCode: '7-4',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30033',
    primaryDropRate: 55.8,
    sanityPerItem: 32.3,
    byproducts: [
      { itemId: '30022', dropRate: 19.4 },
      { itemId: '30021', dropRate: 16.8 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 2-6: Polyester Pack ---
  {
    stageCode: '2-6',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30033',
    primaryDropRate: 36.8,
    sanityPerItem: 32.6,
    byproducts: [
      { itemId: '30011', dropRate: 41.5 },
      { itemId: '30031', dropRate: 26.8 },
      { itemId: '30061', dropRate: 16.2 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 14-20: Polyester Pack ---
  {
    stageCode: '14-20',
    chapter: 14,
    apCost: 24,
    primaryItemId: '30033',
    primaryDropRate: 69.7,
    sanityPerItem: 34.4,
    byproducts: [
      { itemId: '30012', dropRate: 186.7 },
      { itemId: '30053', dropRate: 88.8 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 5-3: Polyester Pack ---
  {
    stageCode: '5-3',
    chapter: 5,
    apCost: 18,
    primaryItemId: '30033',
    primaryDropRate: 49.8,
    sanityPerItem: 36.1,
    byproducts: [
      { itemId: '30022', dropRate: 83.8 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-12: Oriron Cluster ---
  {
    stageCode: '14-12',
    chapter: 14,
    apCost: 21,
    primaryItemId: '30043',
    primaryDropRate: 52,
    sanityPerItem: 40.4,
    byproducts: [
      { itemId: '30063', dropRate: 58.4 },
      { itemId: '30031', dropRate: 41.2 },
      { itemId: '30051', dropRate: 32.7 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 10-11: Oriron Cluster ---
  {
    stageCode: '10-11',
    chapter: 10,
    apCost: 24,
    primaryItemId: '30043',
    primaryDropRate: 45.7,
    sanityPerItem: 52.6,
    byproducts: [
      { itemId: '30022', dropRate: 18.3 },
      { itemId: '30042', dropRate: 14.8 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 7-18: Oriron Cluster ---
  {
    stageCode: '7-18',
    chapter: 7,
    apCost: 21,
    primaryItemId: '30043',
    primaryDropRate: 39.3,
    sanityPerItem: 53.4,
    byproducts: [
      { itemId: '30052', dropRate: 107.4 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 2-8: Oriron Cluster ---
  {
    stageCode: '2-8',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30043',
    primaryDropRate: 21.9,
    sanityPerItem: 54.7,
    byproducts: [
      { itemId: '30021', dropRate: 26.3 },
      { itemId: '30041', dropRate: 20.9 },
      { itemId: '30051', dropRate: 20.8 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 14-14: Aketon ---
  {
    stageCode: '14-14',
    chapter: 14,
    apCost: 21,
    primaryItemId: '30053',
    primaryDropRate: 78.1,
    sanityPerItem: 26.9,
    byproducts: [
      { itemId: '30083', dropRate: 36.5 },
      { itemId: '30012', dropRate: 36.3 },
      { itemId: '30011', dropRate: 21.3 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 14-6: Aketon ---
  {
    stageCode: '14-6',
    chapter: 14,
    apCost: 21,
    primaryItemId: '30053',
    primaryDropRate: 77.7,
    sanityPerItem: 27,
    byproducts: [
      { itemId: '30073', dropRate: 43.8 },
      { itemId: '30022', dropRate: 19.7 },
      { itemId: '30042', dropRate: 16.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-17: Aketon ---
  {
    stageCode: '14-17',
    chapter: 14,
    apCost: 24,
    primaryItemId: '30053',
    primaryDropRate: 88.9,
    sanityPerItem: 27,
    byproducts: [
      { itemId: '30023', dropRate: 55.9 },
      { itemId: '30022', dropRate: 20.1 },
      { itemId: '30042', dropRate: 16.1 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-20: Aketon ---
  {
    stageCode: '14-20',
    chapter: 14,
    apCost: 24,
    primaryItemId: '30053',
    primaryDropRate: 88.8,
    sanityPerItem: 27,
    byproducts: [
      { itemId: '30012', dropRate: 186.7 },
      { itemId: '30033', dropRate: 69.7 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 10-4: Aketon ---
  {
    stageCode: '10-4',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30053',
    primaryDropRate: 55.1,
    sanityPerItem: 38.1,
    byproducts: [
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 3-1: Aketon ---
  {
    stageCode: '3-1',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30053',
    primaryDropRate: 37,
    sanityPerItem: 40.5,
    byproducts: [
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 14-12: Integrated Device ---
  {
    stageCode: '14-12',
    chapter: 14,
    apCost: 21,
    primaryItemId: '30063',
    primaryDropRate: 58.4,
    sanityPerItem: 36,
    byproducts: [
      { itemId: '30043', dropRate: 52 },
      { itemId: '30031', dropRate: 41.2 },
      { itemId: '30051', dropRate: 32.7 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 14-16: Integrated Device ---
  {
    stageCode: '14-16',
    chapter: 14,
    apCost: 21,
    primaryItemId: '30063',
    primaryDropRate: 58.3,
    sanityPerItem: 36,
    byproducts: [
      { itemId: '30031', dropRate: 41.5 },
      { itemId: '30053', dropRate: 38.1 },
      { itemId: '30051', dropRate: 31.8 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 17-12: Integrated Device ---
  {
    stageCode: '17-12',
    chapter: 17,
    apCost: 24,
    primaryItemId: '30063',
    primaryDropRate: 50,
    sanityPerItem: 48,
    byproducts: [
      { itemId: '30032', dropRate: 83.2 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 11-7: Integrated Device ---
  {
    stageCode: '11-7',
    chapter: 11,
    apCost: 21,
    primaryItemId: '30063',
    primaryDropRate: 40.4,
    sanityPerItem: 52,
    byproducts: [
      { itemId: '30012', dropRate: 36.3 },
      { itemId: '30011', dropRate: 21.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 7-15: Integrated Device ---
  {
    stageCode: '7-15',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30063',
    primaryDropRate: 33.3,
    sanityPerItem: 54,
    byproducts: [
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-18: Loxic Kohl ---
  {
    stageCode: '14-18',
    chapter: 14,
    apCost: 24,
    primaryItemId: '30073',
    primaryDropRate: 71.2,
    sanityPerItem: 33.7,
    byproducts: [
      { itemId: '30031', dropRate: 42.4 },
      { itemId: '30051', dropRate: 32 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 6-11: Loxic Kohl ---
  {
    stageCode: '6-11',
    chapter: 6,
    apCost: 21,
    primaryItemId: '30073',
    primaryDropRate: 49.9,
    sanityPerItem: 42.1,
    byproducts: [
      { itemId: '30062', dropRate: 75.1 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 11-13: Loxic Kohl ---
  {
    stageCode: '11-13',
    chapter: 11,
    apCost: 21,
    primaryItemId: '30073',
    primaryDropRate: 47,
    sanityPerItem: 44.6,
    byproducts: [
      { itemId: '30012', dropRate: 36.2 },
      { itemId: '30011', dropRate: 21.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 2-9: Loxic Kohl ---
  {
    stageCode: '2-9',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30073',
    primaryDropRate: 26.2,
    sanityPerItem: 45.7,
    byproducts: [
      { itemId: '30011', dropRate: 41.3 },
      { itemId: '30031', dropRate: 27.4 },
      { itemId: '30061', dropRate: 16.2 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 10-16: Manganese Ore ---
  {
    stageCode: '10-16',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30083',
    primaryDropRate: 54.9,
    sanityPerItem: 38.3,
    byproducts: [
      { itemId: '30032', dropRate: 77.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 15-11: Manganese Ore ---
  {
    stageCode: '15-11',
    chapter: 15,
    apCost: 21,
    primaryItemId: '30083',
    primaryDropRate: 51.8,
    sanityPerItem: 40.5,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.5 },
      { itemId: '30062', dropRate: 14.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 17-6: Manganese Ore ---
  {
    stageCode: '17-6',
    chapter: 17,
    apCost: 24,
    primaryItemId: '30083',
    primaryDropRate: 59.1,
    sanityPerItem: 40.6,
    byproducts: [
      { itemId: '30012', dropRate: 33.2 },
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30062', dropRate: 13.5 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 3-2: Manganese Ore ---
  {
    stageCode: '3-2',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30083',
    primaryDropRate: 37,
    sanityPerItem: 40.6,
    byproducts: [
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30012', dropRate: 21.2 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 7-16: Manganese Ore ---
  {
    stageCode: '7-16',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30083',
    primaryDropRate: 43.8,
    sanityPerItem: 41.1,
    byproducts: [
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 9-16: Grindstone ---
  {
    stageCode: '9-16',
    chapter: 9,
    apCost: 18,
    primaryItemId: '30093',
    primaryDropRate: 40,
    sanityPerItem: 45,
    byproducts: [
      { itemId: '30042', dropRate: 48 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 10-12: Grindstone ---
  {
    stageCode: '10-12',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30093',
    primaryDropRate: 45.4,
    sanityPerItem: 46.3,
    byproducts: [
      { itemId: '30022', dropRate: 20.2 },
      { itemId: '30042', dropRate: 16.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 3-3: Grindstone ---
  {
    stageCode: '3-3',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30093',
    primaryDropRate: 32.1,
    sanityPerItem: 46.8,
    byproducts: [
      { itemId: '30011', dropRate: 21.7 },
      { itemId: '30012', dropRate: 21.2 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 15-15: Grindstone ---
  {
    stageCode: '15-15',
    chapter: 15,
    apCost: 21,
    primaryItemId: '30093',
    primaryDropRate: 44.6,
    sanityPerItem: 47.1,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30062', dropRate: 14.5 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 4-8: Grindstone ---
  {
    stageCode: '4-8',
    chapter: 4,
    apCost: 21,
    primaryItemId: '30093',
    primaryDropRate: 33.7,
    sanityPerItem: 62.3,
    byproducts: [
    ],
    lmdPerRun: 2520,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 9-19: RMA70-12 ---
  {
    stageCode: '9-19',
    chapter: 9,
    apCost: 21,
    primaryItemId: '30103',
    primaryDropRate: 40.1,
    sanityPerItem: 52.4,
    byproducts: [
      { itemId: '30031', dropRate: 41.3 },
      { itemId: '30051', dropRate: 33 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 7-10: RMA70-12 ---
  {
    stageCode: '7-10',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30103',
    primaryDropRate: 34,
    sanityPerItem: 53,
    byproducts: [
      { itemId: '30031', dropRate: 41.6 },
      { itemId: '30051', dropRate: 33.3 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- R8-9: RMA70-12 ---
  {
    stageCode: 'R8-9',
    chapter: 8,
    apCost: 18,
    primaryItemId: '30103',
    primaryDropRate: 33.9,
    sanityPerItem: 53.1,
    byproducts: [
      { itemId: '30031', dropRate: 41.7 },
      { itemId: '30051', dropRate: 33.2 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 2-10: RMA70-12 ---
  {
    stageCode: '2-10',
    chapter: 2,
    apCost: 15,
    primaryItemId: '30103',
    primaryDropRate: 27.8,
    sanityPerItem: 53.9,
    byproducts: [
      { itemId: '30021', dropRate: 15.6 },
      { itemId: '30022', dropRate: 13 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 4-9: RMA70-12 ---
  {
    stageCode: '4-9',
    chapter: 4,
    apCost: 21,
    primaryItemId: '30103',
    primaryDropRate: 29,
    sanityPerItem: 72.3,
    byproducts: [
    ],
    lmdPerRun: 2520,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 14-8: Coagulating Gel ---
  {
    stageCode: '14-8',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 48.5,
    sanityPerItem: 43.3,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30062', dropRate: 14.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 12-5: Coagulating Gel ---
  {
    stageCode: '12-5',
    chapter: 12,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 35,
    sanityPerItem: 60,
    byproducts: [
      { itemId: '30012', dropRate: 36.8 },
      { itemId: '30011', dropRate: 21.3 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- R8-8: Coagulating Gel ---
  {
    stageCode: 'R8-8',
    chapter: 8,
    apCost: 18,
    primaryItemId: '31013',
    primaryDropRate: 29.9,
    sanityPerItem: 60.2,
    byproducts: [
      { itemId: '30052', dropRate: 86.9 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 16-13: Coagulating Gel ---
  {
    stageCode: '16-13',
    chapter: 16,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 33.3,
    sanityPerItem: 63,
    byproducts: [
      { itemId: '30031', dropRate: 41.3 },
      { itemId: '30051', dropRate: 32.9 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 10-3: Coagulating Gel ---
  {
    stageCode: '10-3',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 33.3,
    sanityPerItem: 63.1,
    byproducts: [
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- JT8-2: Coagulating Gel ---
  {
    stageCode: 'JT8-2',
    chapter: 8,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 33.3,
    sanityPerItem: 63,
    byproducts: [
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- S4-10: Coagulating Gel ---
  {
    stageCode: 'S4-10',
    chapter: 4,
    apCost: 18,
    primaryItemId: '31013',
    primaryDropRate: 27.3,
    sanityPerItem: 65.9,
    byproducts: [
    ],
    lmdPerRun: 2160,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 16-14: Incandescent Alloy ---
  {
    stageCode: '16-14',
    chapter: 16,
    apCost: 21,
    primaryItemId: '31023',
    primaryDropRate: 55.6,
    sanityPerItem: 37.8,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30062', dropRate: 14.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- S3-6: Incandescent Alloy ---
  {
    stageCode: 'S3-6',
    chapter: 3,
    apCost: 15,
    primaryItemId: '31023',
    primaryDropRate: 39.6,
    sanityPerItem: 37.9,
    byproducts: [
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30012', dropRate: 21.2 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },
  // --- 11-2: Incandescent Alloy ---
  {
    stageCode: '11-2',
    chapter: 11,
    apCost: 21,
    primaryItemId: '31023',
    primaryDropRate: 45.6,
    sanityPerItem: 46.1,
    byproducts: [
      { itemId: '30022', dropRate: 123.1 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 13-18: Incandescent Alloy ---
  {
    stageCode: '13-18',
    chapter: 13,
    apCost: 24,
    primaryItemId: '31023',
    primaryDropRate: 48.4,
    sanityPerItem: 49.6,
    byproducts: [
      { itemId: '30022', dropRate: 18.5 },
      { itemId: '30042', dropRate: 14.7 },
      { itemId: '30021', dropRate: 11.3 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 10-14: Incandescent Alloy ---
  {
    stageCode: '10-14',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31023',
    primaryDropRate: 39.5,
    sanityPerItem: 53.2,
    byproducts: [
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 16-17: Crystalline Component ---
  {
    stageCode: '16-17',
    chapter: 16,
    apCost: 21,
    primaryItemId: '31033',
    primaryDropRate: 70.9,
    sanityPerItem: 29.6,
    byproducts: [
      { itemId: '30032', dropRate: 63.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- R8-11: Crystalline Component ---
  {
    stageCode: 'R8-11',
    chapter: 8,
    apCost: 21,
    primaryItemId: '31033',
    primaryDropRate: 58.2,
    sanityPerItem: 36.1,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 9-14: Crystalline Component ---
  {
    stageCode: '9-14',
    chapter: 9,
    apCost: 21,
    primaryItemId: '31033',
    primaryDropRate: 58.1,
    sanityPerItem: 36.1,
    byproducts: [
      { itemId: '30012', dropRate: 36.3 },
      { itemId: '30011', dropRate: 21.7 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-3: Crystalline Component ---
  {
    stageCode: '14-3',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31033',
    primaryDropRate: 42.8,
    sanityPerItem: 49.1,
    byproducts: [
      { itemId: '30011', dropRate: 145.7 },
      { itemId: '30031', dropRate: 97.3 },
      { itemId: '30051', dropRate: 77.7 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 17-10: Semi-Synthetic Solvent ---
  {
    stageCode: '17-10',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 46.8,
    sanityPerItem: 44.8,
    byproducts: [
      { itemId: '30022', dropRate: 20 },
      { itemId: '30042', dropRate: 16.5 },
      { itemId: '30021', dropRate: 11.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 12-10: Semi-Synthetic Solvent ---
  {
    stageCode: '12-10',
    chapter: 12,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 34.2,
    sanityPerItem: 61.4,
    byproducts: [
      { itemId: '30031', dropRate: 42 },
      { itemId: '30051', dropRate: 32.5 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 15-5: Semi-Synthetic Solvent ---
  {
    stageCode: '15-5',
    chapter: 15,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 34.2,
    sanityPerItem: 61.4,
    byproducts: [
      { itemId: '30031', dropRate: 41.2 },
      { itemId: '30051', dropRate: 32.7 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 13-14: Semi-Synthetic Solvent ---
  {
    stageCode: '13-14',
    chapter: 13,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 33.3,
    sanityPerItem: 63,
    byproducts: [
      { itemId: '30022', dropRate: 20.3 },
      { itemId: '30042', dropRate: 16.1 },
      { itemId: '30021', dropRate: 11.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-11: Compound Cutting Fluid ---
  {
    stageCode: '14-11',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31053',
    primaryDropRate: 70.1,
    sanityPerItem: 30,
    byproducts: [
      { itemId: '30062', dropRate: 116.9 },
      { itemId: '30022', dropRate: 20.2 },
      { itemId: '30042', dropRate: 16.3 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 12-17: Compound Cutting Fluid ---
  {
    stageCode: '12-17',
    chapter: 12,
    apCost: 21,
    primaryItemId: '31053',
    primaryDropRate: 47,
    sanityPerItem: 44.7,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.7 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 10-17: Compound Cutting Fluid ---
  {
    stageCode: '10-17',
    chapter: 10,
    apCost: 24,
    primaryItemId: '31053',
    primaryDropRate: 53.6,
    sanityPerItem: 44.7,
    byproducts: [
      { itemId: '30012', dropRate: 33.1 },
      { itemId: '30011', dropRate: 21.6 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-15: Compound Cutting Fluid ---
  {
    stageCode: '14-15',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31053',
    primaryDropRate: 46.3,
    sanityPerItem: 45.4,
    byproducts: [
      { itemId: '30022', dropRate: 20.6 },
      { itemId: '30042', dropRate: 16.1 },
      { itemId: '30021', dropRate: 11.5 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-2: Transmuted Salt ---
  {
    stageCode: '14-2',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31063',
    primaryDropRate: 42.3,
    sanityPerItem: 49.7,
    byproducts: [
      { itemId: '30021', dropRate: 97.3 },
      { itemId: '30031', dropRate: 97.2 },
      { itemId: '30041', dropRate: 77.6 },
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
    primaryDropRate: 31.4,
    sanityPerItem: 66.8,
    byproducts: [
      { itemId: '30022', dropRate: 20.2 },
      { itemId: '30042', dropRate: 15.9 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 17-15: Transmuted Salt ---
  {
    stageCode: '17-15',
    chapter: 17,
    apCost: 24,
    primaryItemId: '31063',
    primaryDropRate: 35.5,
    sanityPerItem: 67.6,
    byproducts: [
      { itemId: '30022', dropRate: 19.3 },
      { itemId: '30042', dropRate: 14.9 },
      { itemId: '30021', dropRate: 11.9 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 16-10: Transmuted Salt ---
  {
    stageCode: '16-10',
    chapter: 16,
    apCost: 21,
    primaryItemId: '31063',
    primaryDropRate: 29.5,
    sanityPerItem: 71.1,
    byproducts: [
      { itemId: '30012', dropRate: 36.7 },
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30062', dropRate: 14.4 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 13-5: Fuscous Fiber ---
  {
    stageCode: '13-5',
    chapter: 13,
    apCost: 24,
    primaryItemId: '31073',
    primaryDropRate: 37,
    sanityPerItem: 64.8,
    byproducts: [
      { itemId: '30012', dropRate: 33.2 },
      { itemId: '30011', dropRate: 21.5 },
      { itemId: '30062', dropRate: 13.2 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 17-17: Fuscous Fiber ---
  {
    stageCode: '17-17',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31073',
    primaryDropRate: 30.9,
    sanityPerItem: 68.1,
    byproducts: [
      { itemId: '30022', dropRate: 20.4 },
      { itemId: '30042', dropRate: 15.9 },
      { itemId: '30021', dropRate: 11.1 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 15-18: Fuscous Fiber ---
  {
    stageCode: '15-18',
    chapter: 15,
    apCost: 21,
    primaryItemId: '31073',
    primaryDropRate: 30.7,
    sanityPerItem: 68.5,
    byproducts: [
      { itemId: '30031', dropRate: 41.3 },
      { itemId: '30051', dropRate: 32.9 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- S9-3: Fuscous Fiber ---
  {
    stageCode: 'S9-3',
    chapter: 9,
    apCost: 18,
    primaryItemId: '31073',
    primaryDropRate: 24.1,
    sanityPerItem: 74.7,
    byproducts: [
      { itemId: '30022', dropRate: 19.1 },
      { itemId: '30021', dropRate: 16.6 },
      { itemId: '30042', dropRate: 15.2 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 15-20: Aggregate Cyclicene ---
  {
    stageCode: '15-20',
    chapter: 15,
    apCost: 24,
    primaryItemId: '31083',
    primaryDropRate: 32.6,
    sanityPerItem: 73.6,
    byproducts: [
      { itemId: '30031', dropRate: 41.4 },
      { itemId: '30051', dropRate: 32.6 },
    ],
    lmdPerRun: 2880,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 17-8: Aggregate Cyclicene ---
  {
    stageCode: '17-8',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31083',
    primaryDropRate: 28.2,
    sanityPerItem: 74.4,
    byproducts: [
      { itemId: '30031', dropRate: 41.1 },
      { itemId: '30051', dropRate: 32.7 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 16-15: Aggregate Cyclicene ---
  {
    stageCode: '16-15',
    chapter: 16,
    apCost: 21,
    primaryItemId: '31083',
    primaryDropRate: 27.8,
    sanityPerItem: 75.7,
    byproducts: [
      { itemId: '30022', dropRate: 20.2 },
      { itemId: '30042', dropRate: 16.2 },
      { itemId: '30021', dropRate: 11.3 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 14-19: Aggregate Cyclicene ---
  {
    stageCode: '14-19',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31083',
    primaryDropRate: 27.4,
    sanityPerItem: 76.7,
    byproducts: [
      { itemId: '30012', dropRate: 36.1 },
      { itemId: '30011', dropRate: 21.8 },
      { itemId: '30062', dropRate: 14.5 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 15-9: Coagulative Nodule ---
  {
    stageCode: '15-9',
    chapter: 15,
    apCost: 21,
    primaryItemId: '31093',
    primaryDropRate: 33.3,
    sanityPerItem: 63,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30062', dropRate: 14.5 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 17-4: Coagulative Nodule ---
  {
    stageCode: '17-4',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31093',
    primaryDropRate: 33.2,
    sanityPerItem: 63.2,
    byproducts: [
      { itemId: '30031', dropRate: 40.8 },
      { itemId: '30051', dropRate: 32.4 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
  },
  // --- 17-5: Liquefied High-Energy Gas ---
  {
    stageCode: '17-5',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31103',
    primaryDropRate: 30.7,
    sanityPerItem: 68.3,
    byproducts: [
      { itemId: '30012', dropRate: 36.4 },
      { itemId: '30011', dropRate: 21.6 },
      { itemId: '30062', dropRate: 14.5 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
  },
  // --- 17-11: Electrode Unit ---
  {
    stageCode: '17-11',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31113',
    primaryDropRate: 34.1,
    sanityPerItem: 61.6,
    byproducts: [
      { itemId: '30031', dropRate: 41 },
      { itemId: '30051', dropRate: 32.6 },
      { itemId: '30032', dropRate: 9.5 },
      { itemId: '30052', dropRate: 7.5 },
      { itemId: '31114', dropRate: 4.3 },
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
  const maxCh = options?.maxChapter ?? 99;
  const prefer1_7 = options?.prefer1_7 ?? true;

  const filtered = STAGE_DEFINITIONS.filter((s) => {
    if (s.primaryItemId !== itemId) return false;
    if (s.chapter > maxCh) return false;
    if (itemId === '30013') {
      if (prefer1_7 && s.stageCode !== '1-7') return false;
      if (!prefer1_7 && s.stageCode === '1-7') return false;
    }
    return true;
  });

  // Fallback: If no stage is available within maxChapter (e.g. user selected ch 10, but item is newly introduced in ch 15+),
  // return the available stages so the user still receives a recommendation instead of an empty result.
  if (filtered.length === 0) {
    return STAGE_DEFINITIONS.filter((s) => s.primaryItemId === itemId);
  }
  return filtered;
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
        const neededCount = targetDeficits[byp.itemId] || 0;
        if (neededCount > 0) {
          targetDeficits[byp.itemId] = Math.max(0, neededCount - totalDropped);
        }
        routeByproducts.push({
          itemId: byp.itemId,
          count: totalDropped,
          isNeededInPlan: neededCount > 0,
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
