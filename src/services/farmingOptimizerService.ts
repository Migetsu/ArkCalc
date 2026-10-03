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
  // ==================== ORIROCK CLUSTER (30013) ====================
  // --- 1-7: Rock Heaven ---
  {
    stageCode: '1-7',
    chapter: 1,
    apCost: 6,
    primaryItemId: '30013', // Crafts from cubes (30012)
    primaryDropRate: 124.8, // 1.25 Orirock Cubes per run -> 0.25 T3 equivalent per run
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
  // --- 2-4: Direct Orirock Cluster ---
  {
    stageCode: '2-4',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30013',
    primaryDropRate: 42.3,
    sanityPerItem: 28.4,
    byproducts: [
      { itemId: '30012', dropRate: 22.0 },
      { itemId: '30022', dropRate: 14.0 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Direct T3',
    tagRu: 'Прямой дроп T3',
    notesEn: 'Direct T3 drop without manual crafting',
    notesRu: 'Прямой дроп группы орирока без необходимости ручного крафта',
  },
  // --- 10-6: Ch 10 Orirock Cluster ---
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
    notesEn: 'Highest direct T3 drop rate in Main Theme',
    notesRu: 'Самый высокий прямой шанс дропа T3 в основной теме',
  },

  // ==================== SUGAR PACK (30023) ====================
  // --- 2-5: Fast & Low AP ---
  {
    stageCode: '2-5',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30023',
    primaryDropRate: 37.0,
    sanityPerItem: 32.4,
    byproducts: [
      { itemId: '30022', dropRate: 20.0 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Fast & Low AP',
    tagRu: 'Быстрый фарм',
    notesEn: 'Low sanity consumption per run with high efficiency',
    notesRu: 'Низкий расход энергии за заход с высокой эффективностью',
  },
  // --- 10-10: Ch 10 Sugar Pack ---
  {
    stageCode: '10-10',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30023',
    primaryDropRate: 46.9,
    sanityPerItem: 44.8,
    byproducts: [
      { itemId: '30012', dropRate: 36.2 },
      { itemId: '30011', dropRate: 21.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'High Rate',
    tagRu: 'Высокий шанс',
    notesEn: 'Solid drop rate in Chapter 10',
    notesRu: 'Отличный шанс выпадения в 10 главе',
  },
  // --- 11-6: Best Sanity Sugar ---
  {
    stageCode: '11-6',
    chapter: 11,
    apCost: 21,
    primaryItemId: '30023',
    primaryDropRate: 50.1,
    sanityPerItem: 42.0,
    byproducts: [
      { itemId: '30022', dropRate: 24.0 },
      { itemId: '30032', dropRate: 20.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Optimal Chapter 11 farming route for Sugar',
    notesRu: 'Оптимальный маршрут фарминга сахара в 11 главе',
  },

  // ==================== POLYESTER PACK (30033) ====================
  // --- 7-4: Polyester Best Sanity ---
  {
    stageCode: '7-4',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30033',
    primaryDropRate: 55.8,
    sanityPerItem: 32.3,
    byproducts: [
      { itemId: '30032', dropRate: 25.0 },
      { itemId: '30022', dropRate: 20.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Authoritative best stage for Polyester packs',
    notesRu: 'Признанная лучшая карта для добычи пачек полиэстера',
  },
  // --- 2-6: Early Polyester ---
  {
    stageCode: '2-6',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30033',
    primaryDropRate: 36.8,
    sanityPerItem: 32.6,
    byproducts: [
      { itemId: '30032', dropRate: 20.0 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
    notesEn: 'Low cost alternative in Chapter 2',
    notesRu: 'Дешевая альтернатива во 2 главе',
  },

  // ==================== ORIRON CLUSTER (30043) ====================
  // --- 14-12: Oriron Best Sanity ---
  {
    stageCode: '14-12',
    chapter: 14,
    apCost: 21,
    primaryItemId: '30043',
    primaryDropRate: 52.0,
    sanityPerItem: 40.4,
    byproducts: [
      { itemId: '30042', dropRate: 26.0 },
      { itemId: '30062', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Record Efficiency',
    tagRu: 'Рекордная выносливость',
    notesEn: 'Best endgame stage for Oriron Cluster',
    notesRu: 'Лучшая стадия поздней игры для орижелеза',
  },
  // --- 10-11: Ch 10 Oriron Cluster ---
  {
    stageCode: '10-11',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30043',
    primaryDropRate: 45.7,
    sanityPerItem: 46.0,
    byproducts: [
      { itemId: '30062', dropRate: 24.8 },
      { itemId: '30052', dropRate: 26.1 },
      { itemId: '30042', dropRate: 18.5 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Byproducts',
    tagRu: 'Богатые побочные',
    notesEn: 'Rich Device and Polyketon byproducts',
    notesRu: 'Дает ценные сопутствующие устройства и поликетоны',
  },
  // --- 7-18: Oriron Classic ---
  {
    stageCode: '7-18',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30043',
    primaryDropRate: 39.3,
    sanityPerItem: 45.8,
    byproducts: [
      { itemId: '30062', dropRate: 20.0 },
      { itemId: '30052', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic Farm',
    tagRu: 'Классический фарм',
    notesEn: 'Popular mid-game Oriron farming stage',
    notesRu: 'Популярная стадия 7 главы для орижелеза',
  },
  // --- 2-8: Early Oriron ---
  {
    stageCode: '2-8',
    chapter: 2,
    apCost: 12,
    primaryItemId: '30043',
    primaryDropRate: 21.9,
    sanityPerItem: 54.8,
    byproducts: [
      { itemId: '30042', dropRate: 18.0 },
    ],
    lmdPerRun: 1440,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },

  // ==================== AKETON (30053) ====================
  // --- 10-4: Aketon Best Sanity ---
  {
    stageCode: '10-4',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30053',
    primaryDropRate: 55.1,
    sanityPerItem: 38.1,
    byproducts: [
      { itemId: '30062', dropRate: 46.2 }, // Device T2
      { itemId: '30052', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Over 55% drop rate with exceptional Device byproducts',
    notesRu: 'Свыше 55% шанса выпадения с отличным побочным дропом устройств',
  },
  // --- 3-1: Aketon Early ---
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
    notesEn: 'Fast and cheap early game stage',
    notesRu: 'Быстрый и надежный фарм в 3 главе',
  },

  // ==================== INTEGRATED DEVICE (30063) ====================
  // --- 14-16: Device Record Efficiency ---
  {
    stageCode: '14-16',
    chapter: 14,
    apCost: 21,
    primaryItemId: '30063',
    primaryDropRate: 58.3,
    sanityPerItem: 36.0,
    byproducts: [
      { itemId: '30062', dropRate: 25.0 },
      { itemId: '30042', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Record Efficiency',
    tagRu: 'Рекордная выносливость',
    notesEn: 'Top-tier endgame Device farming with ~58% drop rate',
    notesRu: 'Топовая стадия поздней игры для приборов с шансом ~58%',
  },
  // --- 11-7: Device Ch 11 ---
  {
    stageCode: '11-7',
    chapter: 11,
    apCost: 21,
    primaryItemId: '30063',
    primaryDropRate: 40.4,
    sanityPerItem: 52.0,
    byproducts: [
      { itemId: '30042', dropRate: 24.5 },
      { itemId: '30052', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Reliable Chapter 11 stage for Device farming',
    notesRu: 'Надежная стадия 11 главы для фарма приборов',
  },
  // --- 7-15: Device Classic ---
  {
    stageCode: '7-15',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30063',
    primaryDropRate: 33.3,
    sanityPerItem: 54.0,
    byproducts: [
      { itemId: '30062', dropRate: 20.0 },
      { itemId: '30032', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic Farm',
    tagRu: 'Классический фарм',
    notesEn: 'Long-standing popular mid-game Device stage',
    notesRu: 'Популярная проверенная классическая стадия 7 главы',
  },
  // --- S3-4: Early Device ---
  {
    stageCode: 'S3-4',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30063',
    primaryDropRate: 24.2,
    sanityPerItem: 62.0,
    byproducts: [
      { itemId: '30062', dropRate: 15.0 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },

  // ==================== LOXIC KOHL (30073) ====================
  // --- 12-10: Kohl Record Efficiency ---
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
    notesEn: 'Highest Sanity efficiency for Loxic Kohl in story',
    notesRu: 'Рекордная выносливость для локсического угля в сюжете',
  },
  // --- 10-15: Ch 10 Kohl ---
  {
    stageCode: '10-15',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30073',
    primaryDropRate: 50.3,
    sanityPerItem: 41.7,
    byproducts: [
      { itemId: '30031', dropRate: 41.5 },
      { itemId: '30051', dropRate: 33.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'High Rate',
    tagRu: 'Высокий шанс',
    notesEn: 'Over 50% drop rate in Chapter 10',
    notesRu: 'Свыше 50% шанса выпадения в 10 главе',
  },
  // --- 4-4: Kohl Classic ---
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
    notesEn: 'Available early from Chapter 4',
    notesRu: 'Доступна уже с 4 главы',
  },

  // ==================== MANGANESE ORE (30083) ====================
  // --- 10-16: Manganese Best Sanity ---
  {
    stageCode: '10-16',
    chapter: 10,
    apCost: 21,
    primaryItemId: '30083',
    primaryDropRate: 54.9,
    sanityPerItem: 38.2,
    byproducts: [
      { itemId: '30032', dropRate: 77.2 },
      { itemId: '30022', dropRate: 20.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Highest manganese drop rate (54.9%) and superb polyester byproducts',
    notesRu: 'Рекордный шанс марганца (54.9%) и отличный сопутствующий дроп полиэстера',
  },
  // --- 7-16: Manganese Classic ---
  {
    stageCode: '7-16',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30083',
    primaryDropRate: 43.8,
    sanityPerItem: 41.1,
    byproducts: [
      { itemId: '30042', dropRate: 20.0 },
      { itemId: '30022', dropRate: 19.5 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic Farm',
    tagRu: 'Классический фарм',
    notesEn: 'Community favorite stage in Chapter 7',
    notesRu: 'Самая известная проверенная стадия 7 главы',
  },
  // --- 3-2: Early Manganese Ore ---
  {
    stageCode: '3-2',
    chapter: 3,
    apCost: 15,
    primaryItemId: '30083',
    primaryDropRate: 37.0,
    sanityPerItem: 40.6,
    byproducts: [
      { itemId: '30042', dropRate: 15.0 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },

  // ==================== GRINDSTONE (30093) ====================
  // --- 9-16: Grindstone Best Sanity ---
  {
    stageCode: '9-16',
    chapter: 9,
    apCost: 18,
    primaryItemId: '30093',
    primaryDropRate: 40.0,
    sanityPerItem: 45.0,
    byproducts: [
      { itemId: '30052', dropRate: 22.0 },
      { itemId: '30022', dropRate: 20.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Best sanity-to-item ratio in Chapter 9',
    notesRu: 'Лучшее соотношение выносливости к предмету в 9 главе',
  },
  // --- 10-12: Ch 10 Grindstone ---
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
    tagEn: 'High Rate',
    tagRu: 'Высокий шанс',
    notesEn: '45.4% drop rate in Chapter 10',
    notesRu: '45.4% шанс выпадения в 10 главе',
  },
  // --- 11-15: Grindstone Ch 11 ---
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
    ],
    lmdPerRun: 2520,
    tagEn: 'Alternative',
    tagRu: 'Альтернатива',
  },
  // --- 4-8: Grindstone Classic ---
  {
    stageCode: '4-8',
    chapter: 4,
    apCost: 18,
    primaryItemId: '30093',
    primaryDropRate: 30.6,
    sanityPerItem: 58.8,
    byproducts: [
      { itemId: '30052', dropRate: 18.0 },
      { itemId: '30022', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic',
    tagRu: 'Классическая',
  },

  // ==================== RMA70-12 (30103) ====================
  // --- 9-19: RMA Best Sanity ---
  {
    stageCode: '9-19',
    chapter: 9,
    apCost: 21,
    primaryItemId: '30103',
    primaryDropRate: 40.1,
    sanityPerItem: 52.4,
    byproducts: [
      { itemId: '30062', dropRate: 24.0 },
      { itemId: '30032', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Highest RMA drop rate and efficiency in Chapter 9',
    notesRu: 'Лучшая энергоэффективность для RMA в 9 главе',
  },
  // --- 7-10: RMA Classic ---
  {
    stageCode: '7-10',
    chapter: 7,
    apCost: 18,
    primaryItemId: '30103',
    primaryDropRate: 34.0,
    sanityPerItem: 53.0,
    byproducts: [
      { itemId: '30062', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic Farm',
    tagRu: 'Классический фарм',
    notesEn: 'Reliable 18 AP stage in Chapter 7',
    notesRu: 'Надежная проверенная карта за 18 выносливости',
  },
  // --- 4-9: RMA Early Classic ---
  {
    stageCode: '4-9',
    chapter: 4,
    apCost: 18,
    primaryItemId: '30103',
    primaryDropRate: 29.0,
    sanityPerItem: 62.1,
    byproducts: [
      { itemId: '30062', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
  },

  // ==================== COAGULATING GEL (31013) ====================
  // --- 14-7: Coagulating Gel Best Sanity ---
  {
    stageCode: '14-7',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 48.5,
    sanityPerItem: 43.3,
    byproducts: [
      { itemId: '30042', dropRate: 25.0 },
      { itemId: '30022', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Authoritative top stage for Gel in late game (48.5% drop rate)',
    notesRu: 'Абсолютно лучшая стадия для геля в поздней игре (48.5% шанс)',
  },
  // --- JT8-2: Coagulating Gel Mid-Game ---
  {
    stageCode: 'JT8-2',
    chapter: 8,
    apCost: 18,
    primaryItemId: '31013',
    primaryDropRate: 33.3,
    sanityPerItem: 54.0,
    byproducts: [
      { itemId: '30022', dropRate: 20.0 },
      { itemId: '30012', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
    notesEn: 'Classic staple stage for Gel in Chapter 8',
    notesRu: 'Классическая проверенная стадия 8 главы',
  },
  // --- 10-3: Coagulating Gel Ch 10 ---
  {
    stageCode: '10-3',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31013',
    primaryDropRate: 33.3,
    sanityPerItem: 63.0,
    byproducts: [
      { itemId: '30022', dropRate: 20.3 },
      { itemId: '30042', dropRate: 16.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Alternative',
    tagRu: 'Альтернатива',
    notesEn: 'Primary Gel drop in Chapter 10 with sugar & oriron byproducts',
    notesRu: 'Прямой дроп геля в 10 главе с побочными ресурсами',
  },
  // --- S4-10: Coagulating Gel Classic Early ---
  {
    stageCode: 'S4-10',
    chapter: 4,
    apCost: 18,
    primaryItemId: '31013',
    primaryDropRate: 28.1,
    sanityPerItem: 64.1,
    byproducts: [
      { itemId: '30042', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Early Game',
    tagRu: 'Ранняя игра',
    notesEn: 'Earliest unlocked primary Gel stage in Chapter 4',
    notesRu: 'Самая ранняя доступная стадия с прямым дропом геля',
  },

  // ==================== INCANDESCENT ALLOY (31023) ====================
  // --- 16-14: Alloy Record Efficiency ---
  {
    stageCode: '16-14',
    chapter: 16,
    apCost: 21,
    primaryItemId: '31023',
    primaryDropRate: 55.6,
    sanityPerItem: 37.8,
    byproducts: [
      { itemId: '30052', dropRate: 25.0 },
      { itemId: '30032', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Record Efficiency',
    tagRu: 'Рекордная выносливость',
    notesEn: 'Highest drop rate (55.6%) for Alloy in late game',
    notesRu: 'Рекордный шанс дропа (55.6%) для сплава в поздней игре',
  },
  // --- S3-6: Alloy Fast & Low AP ---
  {
    stageCode: 'S3-6',
    chapter: 3,
    apCost: 15,
    primaryItemId: '31023',
    primaryDropRate: 39.6,
    sanityPerItem: 37.9,
    byproducts: [
      { itemId: '30042', dropRate: 18.0 },
    ],
    lmdPerRun: 1800,
    tagEn: 'Fast & Low AP',
    tagRu: 'Быстрый фарм',
    notesEn: 'Top early game stage for Alloy at only 15 AP per run',
    notesRu: 'Лучшая ранняя стадия для сплава всего за 15 выносливости',
  },
  // --- 11-2: Alloy Ch 11 ---
  {
    stageCode: '11-2',
    chapter: 11,
    apCost: 21,
    primaryItemId: '31023',
    primaryDropRate: 45.6,
    sanityPerItem: 46.1,
    byproducts: [
      { itemId: '30022', dropRate: 24.0 },
      { itemId: '30042', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Reliable Chapter 11 Alloy stage',
    notesRu: 'Надежная карта 11 главы для добычи сплава',
  },
  // --- 10-14: Alloy Ch 10 ---
  {
    stageCode: '10-14',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31023',
    primaryDropRate: 39.5,
    sanityPerItem: 53.2,
    byproducts: [
      { itemId: '30031', dropRate: 41.5 },
      { itemId: '30051', dropRate: 33.2 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Alternative',
    tagRu: 'Альтернатива',
    notesEn: 'Chapter 10 Alloy stage',
    notesRu: 'Стадия добычи сплава в 10 главе',
  },

  // ==================== CRYSTALLINE COMPONENT (31033) ====================
  // --- 16-17: Crystalline Component Record ---
  {
    stageCode: '16-17',
    chapter: 16,
    apCost: 21,
    primaryItemId: '31033',
    primaryDropRate: 70.9,
    sanityPerItem: 29.6,
    byproducts: [
      { itemId: '30062', dropRate: 25.0 },
      { itemId: '30012', dropRate: 24.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Record Efficiency',
    tagRu: 'Рекордная выносливость',
    notesEn: 'Over 70% drop rate in Chapter 16',
    notesRu: 'Свыше 70% шанса выпадения в 16 главе',
  },
  // --- 9-14: Crystalline Component Best Sanity ---
  {
    stageCode: '9-14',
    chapter: 9,
    apCost: 21,
    primaryItemId: '31033',
    primaryDropRate: 58.1,
    sanityPerItem: 36.1,
    byproducts: [
      { itemId: '30062', dropRate: 25.0 },
      { itemId: '30032', dropRate: 24.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: '58% drop rate in Chapter 9',
    notesRu: '58% шанс выпадения в 9 главе',
  },
  // --- S5-7: Crystalline Component Classic ---
  {
    stageCode: 'S5-7',
    chapter: 5,
    apCost: 18,
    primaryItemId: '31033',
    primaryDropRate: 36.9,
    sanityPerItem: 48.8,
    byproducts: [
      { itemId: '30062', dropRate: 18.0 },
    ],
    lmdPerRun: 2160,
    tagEn: 'Classic',
    tagRu: 'Классическая',
    notesEn: 'Early accessible stage from Chapter 5',
    notesRu: 'Доступна уже с 5 главы',
  },

  // ==================== SEMI-SYNTHETIC SOLVENT (31043) ====================
  // --- 17-10: Solvent Record Efficiency ---
  {
    stageCode: '17-10',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 46.8,
    sanityPerItem: 44.8,
    byproducts: [
      { itemId: '30042', dropRate: 24.0 },
      { itemId: '30022', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Best solvent efficiency in Chapter 17',
    notesRu: 'Лучшая энергоэффективность для растворителя в 17 главе',
  },
  // --- 9-4: Solvent Ch 9 ---
  {
    stageCode: '9-4',
    chapter: 9,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 41.5,
    sanityPerItem: 50.6,
    byproducts: [
      { itemId: '30042', dropRate: 22.0 },
      { itemId: '30022', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Recommended',
    tagRu: 'Рекомендуемая',
    notesEn: 'Most popular Solvent stage in Chapter 9',
    notesRu: 'Самая популярная стадия для растворителя в 9 главе',
  },
  // --- 12-10: Solvent Ch 12 ---
  {
    stageCode: '12-10',
    chapter: 12,
    apCost: 21,
    primaryItemId: '31043',
    primaryDropRate: 34.2,
    sanityPerItem: 61.4,
    byproducts: [
      { itemId: '30032', dropRate: 24.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Alternative',
    tagRu: 'Альтернатива',
  },

  // ==================== COMPOUND CUTTING FLUID (31053) ====================
  // --- 14-11: Cutting Fluid Record Efficiency ---
  {
    stageCode: '14-11',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31053',
    primaryDropRate: 70.1,
    sanityPerItem: 30.0,
    byproducts: [
      { itemId: '30062', dropRate: 24.0 },
      { itemId: '30042', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Record Efficiency',
    tagRu: 'Рекордная выносливость',
    notesEn: 'Unrivaled 70.1% drop rate for Cutting Fluid in Chapter 14',
    notesRu: 'Непревзойденный 70.1% шанс дропа СОЖ в 14 главе',
  },
  // --- 10-17: Cutting Fluid Best Sanity (Ch 10) ---
  {
    stageCode: '10-17',
    chapter: 10,
    apCost: 21,
    primaryItemId: '31053',
    primaryDropRate: 53.6,
    sanityPerItem: 39.2,
    byproducts: [
      { itemId: '30012', dropRate: 33.1 },
      { itemId: '30011', dropRate: 21.6 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Chapter 10 primary drop for Compound Cutting Fluid (53.6% drop rate)',
    notesRu: 'Основной источник СОЖ в 10 главе (53.6% шанс дропа)',
  },
  // --- 12-17: Cutting Fluid Ch 12 ---
  {
    stageCode: '12-17',
    chapter: 12,
    apCost: 21,
    primaryItemId: '31053',
    primaryDropRate: 47.0,
    sanityPerItem: 44.7,
    byproducts: [
      { itemId: '30032', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Alternative',
    tagRu: 'Альтернатива',
  },

  // ==================== TRANSMUTED SALT (31063) ====================
  // --- 14-2: Salt Record Efficiency ---
  {
    stageCode: '14-2',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31063',
    primaryDropRate: 42.3,
    sanityPerItem: 49.7,
    byproducts: [
      { itemId: '30022', dropRate: 25.0 },
      { itemId: '30042', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Record Efficiency',
    tagRu: 'Рекордная выносливость',
    notesEn: 'Best salt drop rate in Chapter 14',
    notesRu: 'Лучший шанс соли в 14 главе',
  },
  // --- 11-3: Salt Ch 11 ---
  {
    stageCode: '11-3',
    chapter: 11,
    apCost: 21,
    primaryItemId: '31063',
    primaryDropRate: 31.4,
    sanityPerItem: 66.8,
    byproducts: [
      { itemId: '30022', dropRate: 25.0 },
      { itemId: '30042', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Primary Salt stage in Chapter 11',
    notesRu: 'Основная стадия добычи соли в 11 главе',
  },

  // ==================== FUSCOUS FIBER (31073) ====================
  // --- 13-5: Fiber Best Sanity ---
  {
    stageCode: '13-5',
    chapter: 13,
    apCost: 21,
    primaryItemId: '31073',
    primaryDropRate: 37.0,
    sanityPerItem: 56.8,
    byproducts: [
      { itemId: '30052', dropRate: 24.0 },
      { itemId: '30032', dropRate: 25.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Optimal Chapter 13 stage for Fuscous Fiber',
    notesRu: 'Оптимальная стадия 13 главы для бурого волокна',
  },

  // ==================== AGGREGATE CYCLICENE (31083) ====================
  // --- 15-20: Cyclicene Best Sanity ---
  {
    stageCode: '15-20',
    chapter: 15,
    apCost: 21,
    primaryItemId: '31083',
    primaryDropRate: 32.6,
    sanityPerItem: 64.4,
    byproducts: [
      { itemId: '30062', dropRate: 24.0 },
      { itemId: '30042', dropRate: 23.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Top stage for Aggregate Cyclicene in Chapter 15',
    notesRu: 'Топовая стадия для цикличена в 15 главе',
  },
  // --- 14-19: Cyclicene Ch 14 ---
  {
    stageCode: '14-19',
    chapter: 14,
    apCost: 21,
    primaryItemId: '31083',
    primaryDropRate: 27.4,
    sanityPerItem: 76.6,
    byproducts: [
      { itemId: '30042', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Alternative',
    tagRu: 'Альтернатива',
    notesEn: 'Accessible from Chapter 14',
    notesRu: 'Доступна с 14 главы',
  },

  // ==================== COAGULATIVE NODULE (31093) ====================
  // --- 15-9: Coagulative Nodule ---
  {
    stageCode: '15-9',
    chapter: 15,
    apCost: 21,
    primaryItemId: '31093',
    primaryDropRate: 33.3,
    sanityPerItem: 63.0,
    byproducts: [
      { itemId: '30022', dropRate: 22.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Chapter 15 Coagulative Nodule farming',
    notesRu: 'Фарм коагуляционных узелков в 15 главе',
  },

  // ==================== LIQUEFIED HIGH-ENERGY GAS (31103) ====================
  // --- 17-5: Liquefied Gas ---
  {
    stageCode: '17-5',
    chapter: 17,
    apCost: 21,
    primaryItemId: '31103',
    primaryDropRate: 30.7,
    sanityPerItem: 68.4,
    byproducts: [
      { itemId: '30052', dropRate: 20.0 },
    ],
    lmdPerRun: 2520,
    tagEn: 'Best Sanity',
    tagRu: 'Лучшая выносливость',
    notesEn: 'Chapter 17 Liquefied Gas farming',
    notesRu: 'Фарм сжиженного газа в 17 главе',
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
