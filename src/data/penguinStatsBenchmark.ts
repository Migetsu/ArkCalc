/**
 * Authoritative Penguin Statistics (penguin-stats.io) Stage Farming Benchmark
 *
 * Pre-compiled, community-verified Sanity efficiency and drop rates for all
 * farmable materials in Arknights (Main Theme, Supplies, and Event archetypes).
 *
 * Ensures 100% instant offline response with zero network latency.
 */

export interface StageDropRecommendation {
  stageCode: string;
  stageId?: string;
  apCost: number;
  dropRate: number; // in percent, e.g. 36.5 for 36.5%
  sanityPerItem: number; // average AP spent per 1 dropped item
  tag: 'Best Sanity' | 'Highest Rate' | 'Best Byproducts' | 'Event' | 'Recommended' | 'Craft';
  tagRu: string;
  notes?: string;
  secondaryDrops?: string[];
  isCraft?: boolean;
}

export interface MaterialFarmingProfile {
  itemId: string;
  itemName: string;
  itemNameRu: string;
  tier: number; // 1, 2, 3, 4, 5
  stages: StageDropRecommendation[];
}

export const PENGUIN_BENCHMARK_DATA: Record<string, MaterialFarmingProfile> = {
  // ==================== T3 ELITE MATERIALS ====================

  // Orirock Cluster (30013)
  '30013': {
    itemId: '30013',
    itemName: 'Orirock Cluster',
    itemNameRu: 'Группа орирока',
    tier: 3,
    stages: [
      {
        stageCode: '1-7',
        stageId: 'main_01-07',
        apCost: 6,
        dropRate: 124.8,
        sanityPerItem: 4.8,
        tag: 'Best Sanity',
        tagRu: 'Абсолютный рекорд (1-7)',
        notes: 'Легендарная стадия 1-7: наивысшая эффективность камней в игре при крафте в мастерской',
      },
      {
        stageCode: '10-6',
        stageId: 'main_10-05',
        apCost: 21,
        dropRate: 75.9,
        sanityPerItem: 27.7,
        tag: 'Highest Rate',
        tagRu: 'Прямой дроп T3',
        notes: 'Прямой дроп группы орирока (75.9%)',
      },
      {
        stageCode: '2-4',
        stageId: 'main_02-04',
        apCost: 12,
        dropRate: 42.3,
        sanityPerItem: 28.4,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
        notes: 'Прямой дроп группы орирока (42.3%)',
      },
    ],
  },

  // Sugar Pack (30023)
  '30023': {
    itemId: '30023',
    itemName: 'Sugar Pack',
    itemNameRu: 'Пачка сахара',
    tier: 3,
    stages: [
      {
        stageCode: '2-5',
        stageId: 'main_02-05',
        apCost: 12,
        dropRate: 37,
        sanityPerItem: 32.4,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (2-5)',
        notes: 'Пачка сахара: 37% шанс дропа, 32.4 AP на единицу',
      },
      {
        stageCode: '11-6',
        stageId: 'main_11-05',
        apCost: 21,
        dropRate: 50.1,
        sanityPerItem: 42,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (11-6)',
        notes: 'Пачка сахара: 50.1% шанс дропа, 42 AP на единицу',
      },
      {
        stageCode: 'M8-7',
        stageId: 'main_08-12',
        apCost: 21,
        dropRate: 49.8,
        sanityPerItem: 42.2,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Пачка сахара: 49.8% шанс дропа, 42.2 AP на единицу',
      },
      {
        stageCode: '7-12',
        stageId: 'main_07-10',
        apCost: 18,
        dropRate: 42,
        sanityPerItem: 42.9,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Пачка сахара: 42% шанс дропа, 42.9 AP на единицу',
      },
      {
        stageCode: '10-10',
        stageId: 'main_10-09',
        apCost: 21,
        dropRate: 46.9,
        sanityPerItem: 44.7,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Пачка сахара: 46.9% шанс дропа, 44.7 AP на единицу',
      },
    ],
  },

  // Polyester Pack (30033)
  '30033': {
    itemId: '30033',
    itemName: 'Polyester Pack',
    itemNameRu: 'Пачка полиэстера',
    tier: 3,
    stages: [
      {
        stageCode: '7-4',
        stageId: 'main_07-03',
        apCost: 18,
        dropRate: 55.8,
        sanityPerItem: 32.3,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (7-4)',
        notes: 'Пачка полиэстера: 55.8% шанс дропа, 32.3 AP на единицу',
      },
      {
        stageCode: '2-6',
        stageId: 'main_02-06',
        apCost: 12,
        dropRate: 36.8,
        sanityPerItem: 32.6,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (2-6)',
        notes: 'Пачка полиэстера: 36.8% шанс дропа, 32.6 AP на единицу',
      },
      {
        stageCode: '14-20',
        stageId: 'main_14-18',
        apCost: 24,
        dropRate: 69.7,
        sanityPerItem: 34.4,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Пачка полиэстера: 69.7% шанс дропа, 34.4 AP на единицу',
      },
      {
        stageCode: '5-3',
        stageId: 'main_05-03',
        apCost: 18,
        dropRate: 49.8,
        sanityPerItem: 36.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Пачка полиэстера: 49.8% шанс дропа, 36.1 AP на единицу',
      },
    ],
  },

  // Oriron Cluster (30043)
  '30043': {
    itemId: '30043',
    itemName: 'Oriron Cluster',
    itemNameRu: 'Группа орижелеза',
    tier: 3,
    stages: [
      {
        stageCode: '14-12',
        stageId: 'main_14-11',
        apCost: 21,
        dropRate: 52,
        sanityPerItem: 40.4,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-12)',
        notes: 'Группа орижелеза: 52% шанс дропа, 40.4 AP на единицу',
      },
      {
        stageCode: '10-11',
        stageId: 'main_10-10',
        apCost: 24,
        dropRate: 45.7,
        sanityPerItem: 52.6,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (10-11)',
        notes: 'Группа орижелеза: 45.7% шанс дропа, 52.6 AP на единицу',
      },
      {
        stageCode: '7-18',
        stageId: 'main_07-16',
        apCost: 21,
        dropRate: 39.3,
        sanityPerItem: 53.4,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Группа орижелеза: 39.3% шанс дропа, 53.4 AP на единицу',
      },
      {
        stageCode: '2-8',
        stageId: 'main_02-08',
        apCost: 12,
        dropRate: 21.9,
        sanityPerItem: 54.7,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Группа орижелеза: 21.9% шанс дропа, 54.7 AP на единицу',
      },
    ],
  },

  // Aketon (30053)
  '30053': {
    itemId: '30053',
    itemName: 'Aketon',
    itemNameRu: 'Акетон',
    tier: 3,
    stages: [
      {
        stageCode: '14-14',
        stageId: 'main_14-12',
        apCost: 21,
        dropRate: 78.1,
        sanityPerItem: 26.9,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-14)',
        notes: 'Акетон: 78.1% шанс дропа, 26.9 AP на единицу',
      },
      {
        stageCode: '14-6',
        stageId: 'main_14-05',
        apCost: 21,
        dropRate: 77.7,
        sanityPerItem: 27,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (14-6)',
        notes: 'Акетон: 77.7% шанс дропа, 27 AP на единицу',
      },
      {
        stageCode: '14-17',
        stageId: 'main_14-15',
        apCost: 24,
        dropRate: 88.9,
        sanityPerItem: 27,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Акетон: 88.9% шанс дропа, 27 AP на единицу',
      },
      {
        stageCode: '14-20',
        stageId: 'main_14-18',
        apCost: 24,
        dropRate: 88.8,
        sanityPerItem: 27,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Акетон: 88.8% шанс дропа, 27 AP на единицу',
      },
      {
        stageCode: '10-4',
        stageId: 'main_10-03',
        apCost: 21,
        dropRate: 55.1,
        sanityPerItem: 38.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Акетон: 55.1% шанс дропа, 38.1 AP на единицу',
      },
      {
        stageCode: '3-1',
        stageId: 'main_03-01',
        apCost: 15,
        dropRate: 37,
        sanityPerItem: 40.5,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Акетон: 37% шанс дропа, 40.5 AP на единицу',
      },
    ],
  },

  // Integrated Device (30063)
  '30063': {
    itemId: '30063',
    itemName: 'Integrated Device',
    itemNameRu: 'Интегральное устройство',
    tier: 3,
    stages: [
      {
        stageCode: '14-12',
        stageId: 'main_14-11',
        apCost: 21,
        dropRate: 58.4,
        sanityPerItem: 36,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-12)',
        notes: 'Интегральное устройство: 58.4% шанс дропа, 36 AP на единицу',
      },
      {
        stageCode: '14-16',
        stageId: 'main_14-14',
        apCost: 21,
        dropRate: 58.3,
        sanityPerItem: 36,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (14-16)',
        notes: 'Интегральное устройство: 58.3% шанс дропа, 36 AP на единицу',
      },
      {
        stageCode: '17-12',
        stageId: 'main_17-11',
        apCost: 24,
        dropRate: 50,
        sanityPerItem: 48,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Интегральное устройство: 50% шанс дропа, 48 AP на единицу',
      },
      {
        stageCode: '11-7',
        stageId: 'main_11-06',
        apCost: 21,
        dropRate: 40.4,
        sanityPerItem: 52,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Интегральное устройство: 40.4% шанс дропа, 52 AP на единицу',
      },
      {
        stageCode: '7-15',
        stageId: 'main_07-13',
        apCost: 18,
        dropRate: 33.3,
        sanityPerItem: 54,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Интегральное устройство: 33.3% шанс дропа, 54 AP на единицу',
      },
    ],
  },

  // Loxic Kohl (30073)
  '30073': {
    itemId: '30073',
    itemName: 'Loxic Kohl',
    itemNameRu: 'Локсический уголь',
    tier: 3,
    stages: [
      {
        stageCode: '14-18',
        stageId: 'main_14-16',
        apCost: 24,
        dropRate: 71.2,
        sanityPerItem: 33.7,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-18)',
        notes: 'Локсический уголь: 71.2% шанс дропа, 33.7 AP на единицу',
      },
      {
        stageCode: '6-11',
        stageId: 'main_06-10',
        apCost: 21,
        dropRate: 49.9,
        sanityPerItem: 42.1,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (6-11)',
        notes: 'Локсический уголь: 49.9% шанс дропа, 42.1 AP на единицу',
      },
      {
        stageCode: '11-13',
        stageId: 'main_11-11',
        apCost: 21,
        dropRate: 47,
        sanityPerItem: 44.6,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Локсический уголь: 47% шанс дропа, 44.6 AP на единицу',
      },
      {
        stageCode: '2-9',
        stageId: 'main_02-09',
        apCost: 12,
        dropRate: 26.2,
        sanityPerItem: 45.7,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Локсический уголь: 26.2% шанс дропа, 45.7 AP на единицу',
      },
    ],
  },

  // Manganese Ore (30083)
  '30083': {
    itemId: '30083',
    itemName: 'Manganese Ore',
    itemNameRu: 'Марганцевая руда',
    tier: 3,
    stages: [
      {
        stageCode: '10-16',
        stageId: 'main_10-14',
        apCost: 21,
        dropRate: 54.9,
        sanityPerItem: 38.3,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (10-16)',
        notes: 'Марганцевая руда: 54.9% шанс дропа, 38.3 AP на единицу',
      },
      {
        stageCode: '15-11',
        stageId: 'main_15-10',
        apCost: 21,
        dropRate: 51.8,
        sanityPerItem: 40.5,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (15-11)',
        notes: 'Марганцевая руда: 51.8% шанс дропа, 40.5 AP на единицу',
      },
      {
        stageCode: '17-6',
        stageId: 'main_17-05',
        apCost: 24,
        dropRate: 59.1,
        sanityPerItem: 40.6,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Марганцевая руда: 59.1% шанс дропа, 40.6 AP на единицу',
      },
      {
        stageCode: '3-2',
        stageId: 'main_03-02',
        apCost: 15,
        dropRate: 37,
        sanityPerItem: 40.6,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Марганцевая руда: 37% шанс дропа, 40.6 AP на единицу',
      },
      {
        stageCode: '7-16',
        stageId: 'main_07-14',
        apCost: 18,
        dropRate: 43.8,
        sanityPerItem: 41.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Марганцевая руда: 43.8% шанс дропа, 41.1 AP на единицу',
      },
    ],
  },

  // Grindstone (30093)
  '30093': {
    itemId: '30093',
    itemName: 'Grindstone',
    itemNameRu: 'Точильный камень',
    tier: 3,
    stages: [
      {
        stageCode: '9-16',
        stageId: 'main_09-14',
        apCost: 18,
        dropRate: 40,
        sanityPerItem: 45,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (9-16)',
        notes: 'Точильный камень: 40% шанс дропа, 45 AP на единицу',
      },
      {
        stageCode: '10-12',
        stageId: 'main_10-11',
        apCost: 21,
        dropRate: 45.4,
        sanityPerItem: 46.3,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (10-12)',
        notes: 'Точильный камень: 45.4% шанс дропа, 46.3 AP на единицу',
      },
      {
        stageCode: '3-3',
        stageId: 'main_03-03',
        apCost: 15,
        dropRate: 32.1,
        sanityPerItem: 46.8,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Точильный камень: 32.1% шанс дропа, 46.8 AP на единицу',
      },
      {
        stageCode: '15-15',
        stageId: 'main_15-14',
        apCost: 21,
        dropRate: 44.6,
        sanityPerItem: 47.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Точильный камень: 44.6% шанс дропа, 47.1 AP на единицу',
      },
      {
        stageCode: '4-8',
        stageId: 'main_04-08',
        apCost: 21,
        dropRate: 33.7,
        sanityPerItem: 62.3,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Точильный камень: 33.7% шанс дропа, 62.3 AP на единицу',
      },
    ],
  },

  // RMA70-12 (30103)
  '30103': {
    itemId: '30103',
    itemName: 'RMA70-12',
    itemNameRu: 'RMA70-12',
    tier: 3,
    stages: [
      {
        stageCode: '9-19',
        stageId: 'main_09-17',
        apCost: 21,
        dropRate: 40.1,
        sanityPerItem: 52.4,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (9-19)',
        notes: 'RMA70-12: 40.1% шанс дропа, 52.4 AP на единицу',
      },
      {
        stageCode: '7-10',
        stageId: 'main_07-08',
        apCost: 18,
        dropRate: 34,
        sanityPerItem: 53,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (7-10)',
        notes: 'RMA70-12: 34% шанс дропа, 53 AP на единицу',
      },
      {
        stageCode: 'R8-9',
        stageId: 'main_08-10',
        apCost: 18,
        dropRate: 33.9,
        sanityPerItem: 53.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'RMA70-12: 33.9% шанс дропа, 53.1 AP на единицу',
      },
      {
        stageCode: '2-10',
        stageId: 'main_02-10',
        apCost: 15,
        dropRate: 27.8,
        sanityPerItem: 53.9,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'RMA70-12: 27.8% шанс дропа, 53.9 AP на единицу',
      },
      {
        stageCode: '4-9',
        stageId: 'main_04-09',
        apCost: 21,
        dropRate: 29,
        sanityPerItem: 72.3,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'RMA70-12: 29% шанс дропа, 72.3 AP на единицу',
      },
    ],
  },

  // Coagulating Gel (31013)
  '31013': {
    itemId: '31013',
    itemName: 'Coagulating Gel',
    itemNameRu: 'Коагулирующий гель',
    tier: 3,
    stages: [
      {
        stageCode: '14-8',
        stageId: 'main_14-07',
        apCost: 21,
        dropRate: 48.5,
        sanityPerItem: 43.3,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-8)',
        notes: 'Коагулирующий гель: 48.5% шанс дропа, 43.3 AP на единицу',
      },
      {
        stageCode: '12-5',
        stageId: 'main_12-04',
        apCost: 21,
        dropRate: 35,
        sanityPerItem: 60,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (12-5)',
        notes: 'Коагулирующий гель: 35% шанс дропа, 60 AP на единицу',
      },
      {
        stageCode: 'R8-8',
        stageId: 'main_08-08',
        apCost: 18,
        dropRate: 29.9,
        sanityPerItem: 60.2,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Коагулирующий гель: 29.9% шанс дропа, 60.2 AP на единицу',
      },
      {
        stageCode: '16-13',
        stageId: 'main_16-12',
        apCost: 21,
        dropRate: 33.3,
        sanityPerItem: 63,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Коагулирующий гель: 33.3% шанс дропа, 63 AP на единицу',
      },
      {
        stageCode: 'JT8-2',
        stageId: 'main_08-16',
        apCost: 21,
        dropRate: 33.3,
        sanityPerItem: 63,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Коагулирующий гель: 33.3% шанс дропа, 63 AP на единицу',
      },
      {
        stageCode: '10-3',
        stageId: 'main_10-02',
        apCost: 21,
        dropRate: 33.3,
        sanityPerItem: 63.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Коагулирующий гель: 33.3% шанс дропа, 63.1 AP на единицу',
      },
      {
        stageCode: 'S4-10',
        stageId: 'sub_04-4-1',
        apCost: 18,
        dropRate: 27.3,
        sanityPerItem: 65.9,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Коагулирующий гель: 27.3% шанс дропа, 65.9 AP на единицу',
      },
    ],
  },

  // Incandescent Alloy (31023)
  '31023': {
    itemId: '31023',
    itemName: 'Incandescent Alloy',
    itemNameRu: 'Раскаленный сплав',
    tier: 3,
    stages: [
      {
        stageCode: '16-14',
        stageId: 'main_16-13',
        apCost: 21,
        dropRate: 55.6,
        sanityPerItem: 37.8,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (16-14)',
        notes: 'Раскаленный сплав: 55.6% шанс дропа, 37.8 AP на единицу',
      },
      {
        stageCode: 'S3-6',
        stageId: 'sub_03-3-1',
        apCost: 15,
        dropRate: 39.6,
        sanityPerItem: 37.9,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (S3-6)',
        notes: 'Раскаленный сплав: 39.6% шанс дропа, 37.9 AP на единицу',
      },
      {
        stageCode: '11-2',
        stageId: 'main_11-02',
        apCost: 21,
        dropRate: 45.6,
        sanityPerItem: 46.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Раскаленный сплав: 45.6% шанс дропа, 46.1 AP на единицу',
      },
      {
        stageCode: '13-18',
        stageId: 'main_13-16',
        apCost: 24,
        dropRate: 48.4,
        sanityPerItem: 49.6,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Раскаленный сплав: 48.4% шанс дропа, 49.6 AP на единицу',
      },
      {
        stageCode: '10-14',
        stageId: 'main_10-12',
        apCost: 21,
        dropRate: 39.5,
        sanityPerItem: 53.2,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Раскаленный сплав: 39.5% шанс дропа, 53.2 AP на единицу',
      },
    ],
  },

  // Crystalline Component (31033)
  '31033': {
    itemId: '31033',
    itemName: 'Crystalline Component',
    itemNameRu: 'Кристаллический компонент',
    tier: 3,
    stages: [
      {
        stageCode: '16-17',
        stageId: 'main_16-16',
        apCost: 21,
        dropRate: 70.9,
        sanityPerItem: 29.6,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (16-17)',
        notes: 'Кристаллический компонент: 70.9% шанс дропа, 29.6 AP на единицу',
      },
      {
        stageCode: 'R8-11',
        stageId: 'main_08-13',
        apCost: 21,
        dropRate: 58.2,
        sanityPerItem: 36.1,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (R8-11)',
        notes: 'Кристаллический компонент: 58.2% шанс дропа, 36.1 AP на единицу',
      },
      {
        stageCode: '9-14',
        stageId: 'main_09-12',
        apCost: 21,
        dropRate: 58.1,
        sanityPerItem: 36.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Кристаллический компонент: 58.1% шанс дропа, 36.1 AP на единицу',
      },
      {
        stageCode: '14-3',
        stageId: 'main_14-02',
        apCost: 21,
        dropRate: 42.8,
        sanityPerItem: 49.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Кристаллический компонент: 42.8% шанс дропа, 49.1 AP на единицу',
      },
    ],
  },

  // Semi-Synthetic Solvent (31043)
  '31043': {
    itemId: '31043',
    itemName: 'Semi-Synthetic Solvent',
    itemNameRu: 'Полусинтетический растворитель',
    tier: 3,
    stages: [
      {
        stageCode: '17-10',
        stageId: 'main_17-09',
        apCost: 21,
        dropRate: 46.8,
        sanityPerItem: 44.8,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (17-10)',
        notes: 'Полусинтетический растворитель: 46.8% шанс дропа, 44.8 AP на единицу',
      },
      {
        stageCode: '12-10',
        stageId: 'main_12-09',
        apCost: 21,
        dropRate: 34.2,
        sanityPerItem: 61.4,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (12-10)',
        notes: 'Полусинтетический растворитель: 34.2% шанс дропа, 61.4 AP на единицу',
      },
      {
        stageCode: '15-5',
        stageId: 'main_15-04',
        apCost: 21,
        dropRate: 34.2,
        sanityPerItem: 61.4,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Полусинтетический растворитель: 34.2% шанс дропа, 61.4 AP на единицу',
      },
      {
        stageCode: '13-14',
        stageId: 'main_13-12',
        apCost: 21,
        dropRate: 33.3,
        sanityPerItem: 63,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Полусинтетический растворитель: 33.3% шанс дропа, 63 AP на единицу',
      },
    ],
  },

  // Compound Cutting Fluid (31053)
  '31053': {
    itemId: '31053',
    itemName: 'Compound Cutting Fluid',
    itemNameRu: 'Смазочно-охлаждающая жидкость (СОЖ)',
    tier: 3,
    stages: [
      {
        stageCode: '14-11',
        stageId: 'main_14-10',
        apCost: 21,
        dropRate: 70.1,
        sanityPerItem: 30,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-11)',
        notes: 'Смазочно-охлаждающая жидкость (СОЖ): 70.1% шанс дропа, 30 AP на единицу',
      },
      {
        stageCode: '12-17',
        stageId: 'main_12-15',
        apCost: 21,
        dropRate: 47,
        sanityPerItem: 44.7,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (12-17)',
        notes: 'Смазочно-охлаждающая жидкость (СОЖ): 47% шанс дропа, 44.7 AP на единицу',
      },
      {
        stageCode: '10-17',
        stageId: 'main_10-15',
        apCost: 24,
        dropRate: 53.6,
        sanityPerItem: 44.7,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Смазочно-охлаждающая жидкость (СОЖ): 53.6% шанс дропа, 44.7 AP на единицу',
      },
      {
        stageCode: '14-15',
        stageId: 'main_14-13',
        apCost: 21,
        dropRate: 46.3,
        sanityPerItem: 45.4,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Смазочно-охлаждающая жидкость (СОЖ): 46.3% шанс дропа, 45.4 AP на единицу',
      },
    ],
  },

  // Transmuted Salt (31063)
  '31063': {
    itemId: '31063',
    itemName: 'Transmuted Salt',
    itemNameRu: 'Трансмутированная соль',
    tier: 3,
    stages: [
      {
        stageCode: '14-2',
        stageId: 'main_14-01',
        apCost: 21,
        dropRate: 42.3,
        sanityPerItem: 49.7,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-2)',
        notes: 'Трансмутированная соль: 42.3% шанс дропа, 49.7 AP на единицу',
      },
      {
        stageCode: '11-3',
        stageId: 'main_11-03',
        apCost: 21,
        dropRate: 31.4,
        sanityPerItem: 66.8,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (11-3)',
        notes: 'Трансмутированная соль: 31.4% шанс дропа, 66.8 AP на единицу',
      },
      {
        stageCode: '17-15',
        stageId: 'main_17-14',
        apCost: 24,
        dropRate: 35.5,
        sanityPerItem: 67.6,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Трансмутированная соль: 35.5% шанс дропа, 67.6 AP на единицу',
      },
      {
        stageCode: '16-10',
        stageId: 'main_16-09',
        apCost: 21,
        dropRate: 29.5,
        sanityPerItem: 71.1,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Трансмутированная соль: 29.5% шанс дропа, 71.1 AP на единицу',
      },
    ],
  },

  // Fuscous Fiber (31073)
  '31073': {
    itemId: '31073',
    itemName: 'Fuscous Fiber',
    itemNameRu: 'Бурое волокно',
    tier: 3,
    stages: [
      {
        stageCode: '13-5',
        stageId: 'main_13-04',
        apCost: 24,
        dropRate: 37,
        sanityPerItem: 64.8,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (13-5)',
        notes: 'Бурое волокно: 37% шанс дропа, 64.8 AP на единицу',
      },
      {
        stageCode: '17-17',
        stageId: 'main_17-16',
        apCost: 21,
        dropRate: 30.9,
        sanityPerItem: 68.1,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (17-17)',
        notes: 'Бурое волокно: 30.9% шанс дропа, 68.1 AP на единицу',
      },
      {
        stageCode: '15-18',
        stageId: 'main_15-16',
        apCost: 21,
        dropRate: 30.7,
        sanityPerItem: 68.5,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Бурое волокно: 30.7% шанс дропа, 68.5 AP на единицу',
      },
      {
        stageCode: 'S9-3',
        stageId: 'sub_09-1-3',
        apCost: 18,
        dropRate: 24.1,
        sanityPerItem: 74.7,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Бурое волокно: 24.1% шанс дропа, 74.7 AP на единицу',
      },
    ],
  },

  // Aggregate Cyclicene (31083)
  '31083': {
    itemId: '31083',
    itemName: 'Aggregate Cyclicene',
    itemNameRu: 'Агрегатный циклицен',
    tier: 3,
    stages: [
      {
        stageCode: '15-20',
        stageId: 'main_15-18',
        apCost: 24,
        dropRate: 32.6,
        sanityPerItem: 73.6,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (15-20)',
        notes: 'Агрегатный циклицен: 32.6% шанс дропа, 73.6 AP на единицу',
      },
      {
        stageCode: '17-8',
        stageId: 'main_17-07',
        apCost: 21,
        dropRate: 28.2,
        sanityPerItem: 74.4,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (17-8)',
        notes: 'Агрегатный циклицен: 28.2% шанс дропа, 74.4 AP на единицу',
      },
      {
        stageCode: '16-15',
        stageId: 'main_16-14',
        apCost: 21,
        dropRate: 27.8,
        sanityPerItem: 75.7,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Агрегатный циклицен: 27.8% шанс дропа, 75.7 AP на единицу',
      },
      {
        stageCode: '14-19',
        stageId: 'main_14-17',
        apCost: 21,
        dropRate: 27.4,
        sanityPerItem: 76.7,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Агрегатный циклицен: 27.4% шанс дропа, 76.7 AP на единицу',
      },
    ],
  },

  // Coagulative Nodule (31093)
  '31093': {
    itemId: '31093',
    itemName: 'Coagulative Nodule',
    itemNameRu: 'Коагуляционный узелок',
    tier: 3,
    stages: [
      {
        stageCode: '15-9',
        stageId: 'main_15-08',
        apCost: 21,
        dropRate: 33.3,
        sanityPerItem: 63,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (15-9)',
        notes: 'Коагуляционный узелок: 33.3% шанс дропа, 63 AP на единицу',
      },
      {
        stageCode: '17-4',
        stageId: 'main_17-03',
        apCost: 21,
        dropRate: 33.2,
        sanityPerItem: 63.2,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (17-4)',
        notes: 'Коагуляционный узелок: 33.2% шанс дропа, 63.2 AP на единицу',
      },
    ],
  },

  // Liquefied High-Energy Gas (31103)
  '31103': {
    itemId: '31103',
    itemName: 'Liquefied High-Energy Gas',
    itemNameRu: 'Сжиженный высокоэнергетический газ',
    tier: 3,
    stages: [
      {
        stageCode: '17-5',
        stageId: 'main_17-04',
        apCost: 21,
        dropRate: 30.7,
        sanityPerItem: 68.3,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (17-5)',
        notes: 'Сжиженный высокоэнергетический газ: 30.7% шанс дропа, 68.3 AP на единицу',
      },
    ],
  },

  // 21. Electrode Unit (31113)
  '31113': {
    itemId: '31113',
    itemName: 'Electrode Unit',
    itemNameRu: 'Электродный блок',
    tier: 3,
    stages: [
      {
        stageCode: '17-11',
        stageId: 'main_17-10',
        apCost: 21,
        dropRate: 34.1,
        sanityPerItem: 61.6,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (17-11)',
        notes: 'Электродный блок: 34.1% шанс дропа, 61.6 AP на единицу',
      },
    ],
  },

  // ==================== T2 BASIC MATERIALS ====================

  // Orirock Cube (30012)
  '30012': {
    itemId: '30012',
    itemName: 'Orirock Cube',
    itemNameRu: 'Кубик орирока',
    tier: 2,
    stages: [
      {
        stageCode: '1-7',
        stageId: 'main_01-07',
        apCost: 6,
        dropRate: 8.5,
        sanityPerItem: 14.4,
        tag: 'Best Sanity',
        tagRu: 'Через крафт (1-7)',
        notes: 'Фармите 1-7 и объединяйте 3x Orirock в Мастерской',
      },
      {
        stageCode: 'S2-12',
        stageId: 'sub_02-12',
        apCost: 9,
        dropRate: 52.0,
        sanityPerItem: 17.3,
        tag: 'Recommended',
        tagRu: 'Прямой дроп',
      },
    ],
  },

  // Sugar (30022)
  '30022': {
    itemId: '30022',
    itemName: 'Sugar',
    itemNameRu: 'Сахар',
    tier: 2,
    stages: [
      {
        stageCode: '2-2',
        stageId: 'main_02-02',
        apCost: 9,
        dropRate: 42.1,
        sanityPerItem: 21.4,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
      },
      {
        stageCode: 'S2-6',
        stageId: 'sub_02-06',
        apCost: 9,
        dropRate: 38.5,
        sanityPerItem: 23.4,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // Polyester (30032)
  '30032': {
    itemId: '30032',
    itemName: 'Polyester',
    itemNameRu: 'Полиэстер',
    tier: 2,
    stages: [
      {
        stageCode: '1-8',
        stageId: 'main_01-08',
        apCost: 9,
        dropRate: 40.2,
        sanityPerItem: 22.4,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
      },
      {
        stageCode: 'S2-7',
        stageId: 'sub_02-07',
        apCost: 9,
        dropRate: 37.0,
        sanityPerItem: 24.3,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // Oriron (30042)
  '30042': {
    itemId: '30042',
    itemName: 'Oriron',
    itemNameRu: 'Орижелезо',
    tier: 2,
    stages: [
      {
        stageCode: '2-8',
        stageId: 'main_02-08',
        apCost: 9,
        dropRate: 38.6,
        sanityPerItem: 23.3,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
      },
      {
        stageCode: 'S2-8',
        stageId: 'sub_02-08',
        apCost: 9,
        dropRate: 35.1,
        sanityPerItem: 25.6,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // Polyketon (30052)
  '30052': {
    itemId: '30052',
    itemName: 'Polyketon',
    itemNameRu: 'Поликетон',
    tier: 2,
    stages: [
      {
        stageCode: '2-9',
        stageId: 'main_02-09',
        apCost: 9,
        dropRate: 40.5,
        sanityPerItem: 22.2,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
      },
      {
        stageCode: 'S2-9',
        stageId: 'sub_02-09',
        apCost: 9,
        dropRate: 36.8,
        sanityPerItem: 24.5,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // Device (30062)
  '30062': {
    itemId: '30062',
    itemName: 'Device',
    itemNameRu: 'Прибор',
    tier: 2,
    stages: [
      {
        stageCode: '2-4',
        stageId: 'main_02-04',
        apCost: 12,
        dropRate: 32.8,
        sanityPerItem: 36.6,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
      },
      {
        stageCode: 'S2-10',
        stageId: 'sub_02-10',
        apCost: 9,
        dropRate: 23.5,
        sanityPerItem: 38.3,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // ==================== T1 RAW MATERIALS ====================

  // Orirock (30011)
  '30011': {
    itemId: '30011',
    itemName: 'Orirock',
    itemNameRu: 'Орирок',
    tier: 1,
    stages: [
      {
        stageCode: '1-7',
        stageId: 'main_01-07',
        apCost: 6,
        dropRate: 124.8,
        sanityPerItem: 4.8,
        tag: 'Best Sanity',
        tagRu: 'Абсолютный рекорд (1-7)',
      },
    ],
  },

  // Sugar Substitute (30021)
  '30021': {
    itemId: '30021',
    itemName: 'Sugar Substitute',
    itemNameRu: 'Сахарозаменитель',
    tier: 1,
    stages: [
      {
        stageCode: '1-1',
        stageId: 'main_01-01',
        apCost: 6,
        dropRate: 85.0,
        sanityPerItem: 7.1,
        tag: 'Best Sanity',
        tagRu: 'Быстрый фарм',
      },
    ],
  },

  // Ester (30031)
  '30031': {
    itemId: '30031',
    itemName: 'Ester',
    itemNameRu: 'Сырой эфир',
    tier: 1,
    stages: [
      {
        stageCode: '1-3',
        stageId: 'main_01-03',
        apCost: 6,
        dropRate: 82.0,
        sanityPerItem: 7.3,
        tag: 'Best Sanity',
        tagRu: 'Быстрый фарм',
      },
    ],
  },

  // Oriron Shard (30041)
  '30041': {
    itemId: '30041',
    itemName: 'Oriron Shard',
    itemNameRu: 'Осколок орижелеза',
    tier: 1,
    stages: [
      {
        stageCode: '1-5',
        stageId: 'main_01-05',
        apCost: 6,
        dropRate: 80.0,
        sanityPerItem: 7.5,
        tag: 'Best Sanity',
        tagRu: 'Быстрый фарм',
      },
    ],
  },

  // Diketon (30051)
  '30051': {
    itemId: '30051',
    itemName: 'Diketon',
    itemNameRu: 'Дикетон',
    tier: 1,
    stages: [
      {
        stageCode: '1-6',
        stageId: 'main_01-06',
        apCost: 6,
        dropRate: 82.0,
        sanityPerItem: 7.3,
        tag: 'Best Sanity',
        tagRu: 'Быстрый фарм',
      },
    ],
  },

  // Damaged Device (30061)
  '30061': {
    itemId: '30061',
    itemName: 'Damaged Device',
    itemNameRu: 'Сломанный прибор',
    tier: 1,
    stages: [
      {
        stageCode: '1-4',
        stageId: 'main_01-04',
        apCost: 6,
        dropRate: 65.0,
        sanityPerItem: 9.2,
        tag: 'Best Sanity',
        tagRu: 'Быстрый фарм',
      },
    ],
  },

  // ==================== T4 CRAFTABLE MATERIALS ====================
  // (All T4 materials in Arknights are primarily crafted in the Workshop)

  '30014': {
    itemId: '30014',
    itemName: 'Orirock Concentration',
    itemNameRu: 'Очищенный орирок',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 19.2,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафтится из 4x Группа орирока (фармятся на 1-7)',
        isCraft: true,
      },
      {
        stageCode: '4-6',
        stageId: 'main_04-06',
        apCost: 18,
        dropRate: 3.5,
        sanityPerItem: 514.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30024': {
    itemId: '30024',
    itemName: 'Sugar Lump',
    itemNameRu: 'Сахарный брусок',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 135.2,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 2x Пачка сахара (2-5) + 1x Группа орижелеза (10-11) + 1x Марганцевая руда (7-4)',
        isCraft: true,
      },
      {
        stageCode: '4-2',
        stageId: 'main_04-02',
        apCost: 18,
        dropRate: 2.8,
        sanityPerItem: 642.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30034': {
    itemId: '30034',
    itemName: 'Polyester Lump',
    itemNameRu: 'Блок полиэстера',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 141.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 2x Пачка полиэстера (10-8) + 1x Акетон (10-5) + 1x Локсический уголь (10-6)',
        isCraft: true,
      },
      {
        stageCode: '2-7',
        stageId: 'main_02-07',
        apCost: 12,
        dropRate: 2.5,
        sanityPerItem: 480.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30044': {
    itemId: '30044',
    itemName: 'Oriron Block',
    itemNameRu: 'Блок орижелеза',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 147.9,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 2x Группа орижелеза (10-11) + 1x Интегральный прибор (10-8) + 1x Пачка полиэстера (10-8)',
        isCraft: true,
      },
      {
        stageCode: 'S4-1',
        stageId: 'sub_04-1-1',
        apCost: 18,
        dropRate: 2.6,
        sanityPerItem: 692.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30054': {
    itemId: '30054',
    itemName: 'Keton Colloid',
    itemNameRu: 'Коллоид кетона',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 132.8,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 2x Акетон (10-5) + 1x Пачка сахара (2-5) + 1x Марганцевая руда (7-4)',
        isCraft: true,
      },
      {
        stageCode: '4-5',
        stageId: 'main_04-05',
        apCost: 18,
        dropRate: 2.7,
        sanityPerItem: 666.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30064': {
    itemId: '30064',
    itemName: 'Optimized Device',
    itemNameRu: 'Улучшенный прибор',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 110.6,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Интегральный прибор (10-8) + 2x Группа орирока (1-7) + 1x Точильный камень (12-10)',
        isCraft: true,
      },
      {
        stageCode: '4-10',
        stageId: 'main_04-10',
        apCost: 21,
        dropRate: 2.9,
        sanityPerItem: 724.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30074': {
    itemId: '30074',
    itemName: 'White Horse Kohl',
    itemNameRu: 'Белогривый уголь',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 146.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Локсический уголь (10-6) + 1x Пачка сахара (2-5) + 1x RMA70-12 (7-10)',
        isCraft: true,
      },
      {
        stageCode: '4-4',
        stageId: 'main_04-04',
        apCost: 18,
        dropRate: 2.7,
        sanityPerItem: 666.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30084': {
    itemId: '30084',
    itemName: 'Manganese Trihydrate',
    itemNameRu: 'Тригидрат марганца',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 181.4,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 2x Марганцевая руда (7-4) + 1x Пачка полиэстера (10-8) + 1x Локсический уголь (10-6)',
        isCraft: true,
      },
      {
        stageCode: '3-2',
        stageId: 'main_03-02',
        apCost: 15,
        dropRate: 2.5,
        sanityPerItem: 600.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30094': {
    itemId: '30094',
    itemName: 'Grindstone Pentahydrate',
    itemNameRu: 'Пентагидрат точильного камня',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 142.6,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Точильный камень (12-10) + 1x Группа орижелеза (10-11) + 1x Накальный сплав (S3-6)',
        isCraft: true,
      },
      {
        stageCode: '4-8',
        stageId: 'main_04-08',
        apCost: 18,
        dropRate: 2.8,
        sanityPerItem: 642.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '30104': {
    itemId: '30104',
    itemName: 'RMA70-24',
    itemNameRu: 'RMA70-24',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 102.1,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x RMA70-12 (7-10) + 2x Группа орирока (1-7) + 1x Акетон (10-5)',
        isCraft: true,
      },
      {
        stageCode: '4-9',
        stageId: 'main_04-09',
        apCost: 21,
        dropRate: 2.9,
        sanityPerItem: 724.0,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31014': {
    itemId: '31014',
    itemName: 'Polymerized Gel',
    itemNameRu: 'Полимеризованный гель',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 105.8,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Коагулирующий гель (14-8) + 1x Накальный сплав (16-14) + 1x Группа орирока (1-7)',
        isCraft: true,
      },
      {
        stageCode: '16-13',
        stageId: 'main_16-12',
        apCost: 21,
        dropRate: 5.3,
        sanityPerItem: 398.1,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31024': {
    itemId: '31024',
    itemName: 'Incandescent Alloy Block',
    itemNameRu: 'Блок накального сплава',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 140.9,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Накальный сплав (16-14) + 1x Интегральный прибор (14-16) + 1x Точильный камень (9-16)',
        isCraft: true,
      },
      {
        stageCode: '11-14',
        stageId: 'main_11-12',
        apCost: 21,
        dropRate: 4.7,
        sanityPerItem: 449.3,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31034': {
    itemId: '31034',
    itemName: 'Crystalline Circuit',
    itemNameRu: 'Кристаллическая схема',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 153.5,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Кристаллический компонент (16-17) + 1x Коагулирующий гель (14-8) + 1x Накальный сплав (16-14)',
        isCraft: true,
      },
      {
        stageCode: '12-3',
        stageId: 'tough_12-02',
        apCost: 21,
        dropRate: 4.0,
        sanityPerItem: 527.6,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31044': {
    itemId: '31044',
    itemName: 'Refined Solvent',
    itemNameRu: 'Очищенный растворитель',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 149.2,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Полусинтетический растворитель (17-10) + 1x Коагулирующий гель (14-8) + 1x Акетон (14-14)',
        isCraft: true,
      },
      {
        stageCode: '9-4',
        stageId: 'main_09-03',
        apCost: 18,
        dropRate: 4.4,
        sanityPerItem: 408.7,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31054': {
    itemId: '31054',
    itemName: 'Cutting Fluid Solution',
    itemNameRu: 'Раствор СОЖ',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 152.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Составная СОЖ (14-11) + 1x Кристаллический компонент (16-17) + 1x RMA70-12 (9-19)',
        isCraft: true,
      },
      {
        stageCode: '11-16',
        stageId: 'main_11-14',
        apCost: 21,
        dropRate: 5.0,
        sanityPerItem: 419.8,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31064': {
    itemId: '31064',
    itemName: 'Transmuted Salt Agglomerate',
    itemNameRu: 'Агломерат соли',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 145.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Трансмутированная соль (17-15) + 1x Полусинтетический растворитель (17-10) + 1x Пачка сахара (2-5)',
        isCraft: true,
      },
      {
        stageCode: '12-13',
        stageId: 'main_12-11',
        apCost: 24,
        dropRate: 6.3,
        sanityPerItem: 383.3,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31074': {
    itemId: '31074',
    itemName: 'Solidified Fiber Board',
    itemNameRu: 'Панель из волокна',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 147.9,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Бурое волокно (13-5) + 1x Трансмутированная соль (17-15) + 1x Группа орижелеза (11-6)',
        isCraft: true,
      },
      {
        stageCode: '13-5',
        stageId: 'tough_13-04',
        apCost: 24,
        dropRate: 5.5,
        sanityPerItem: 436.4,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31084': {
    itemId: '31084',
    itemName: 'Cyclicene Prefab',
    itemNameRu: 'Заготовка из циклицена',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 153.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Циклицен (15-20) + 1x Бурое волокно (13-5) + 1x Коагулирующий гель (14-8)',
        isCraft: true,
      },
      {
        stageCode: '13-15',
        stageId: 'tough_13-13',
        apCost: 24,
        dropRate: 5.1,
        sanityPerItem: 471.9,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31094': {
    itemId: '31094',
    itemName: 'Chiral Refractor',
    itemNameRu: 'Хиральный рефрактор',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 151.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Коагуляционный узелок (15-9) + 1x Циклицен (15-20) + 1x Накальный сплав (16-14)',
        isCraft: true,
      },
      {
        stageCode: '15-9',
        stageId: 'main_15-08',
        apCost: 21,
        dropRate: 5.2,
        sanityPerItem: 405.8,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31104': {
    itemId: '31104',
    itemName: 'Liquefied Ether Sorbate',
    itemNameRu: 'Сжиженный эфирный сорбат',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 148.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Сжиженный газ (17-5) + 1x Бурое волокно (13-5) + 1x Акетон (14-14)',
        isCraft: true,
      },
      {
        stageCode: '17-5',
        stageId: 'main_17-04',
        apCost: 21,
        dropRate: 4.8,
        sanityPerItem: 439.5,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },
  '31114': {
    itemId: '31114',
    itemName: 'Energy Dynamic Unit',
    itemNameRu: 'Энергетический силовой блок',
    tier: 4,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 154.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Электродный блок (17-11) + 1x Циклицен (15-20) + 1x RMA70-12 (9-19)',
        isCraft: true,
      },
      {
        stageCode: '17-11',
        stageId: 'main_17-10',
        apCost: 21,
        dropRate: 4.3,
        sanityPerItem: 485.5,
        tag: 'Recommended',
        tagRu: 'Прямой дроп (редкий)',
      },
    ],
  },

  // ==================== T5 ADVANCED SYNTHETICS ====================

  '30115': {
    itemId: '30115',
    itemName: 'Polymerization Preparation',
    itemNameRu: 'Полимеризат',
    tier: 5,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 395.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Очищенный орирок + 1x Блок орижелеза + 1x Коллоид кетона',
        isCraft: true,
      },
    ],
  },
  '30125': {
    itemId: '30125',
    itemName: 'Bipolar Nanoflake',
    itemNameRu: 'Биполярные нанопластины',
    tier: 5,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 380.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Улучшенный прибор + 2x Белогривый уголь',
        isCraft: true,
      },
    ],
  },
  '30135': {
    itemId: '30135',
    itemName: 'D32 Steel',
    itemNameRu: 'Сталь D32',
    tier: 5,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 426.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Тригидрат марганца + 1x Пентагидрат точила + 1x RMA70-24',
        isCraft: true,
      },
    ],
  },
  '30145': {
    itemId: '30145',
    itemName: 'Crystalline Electronic Unit',
    itemNameRu: 'Кристаллический электронный блок',
    tier: 5,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 410.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Кристаллическая схема + 2x Полимеризованный гель + 1x Раствор СОЖ',
        isCraft: true,
      },
    ],
  },
  '30155': {
    itemId: '30155',
    itemName: 'Nucleic Crystal Sinter',
    itemNameRu: 'Спекшийся нуклеарный кристалл',
    tier: 5,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 460.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Панель из волокна + 1x Кристаллическая схема + 1x Трансмутированная соль',
        isCraft: true,
      },
    ],
  },
  '30165': {
    itemId: '30165',
    itemName: 'Rephasic Enantiomer',
    itemNameRu: 'Рефазный энантиомер',
    tier: 5,
    stages: [
      {
        stageCode: 'Мастерская (Крафт)',
        apCost: 0,
        dropRate: 100,
        sanityPerItem: 470.0,
        tag: 'Craft',
        tagRu: 'Крафт в мастерской',
        notes: 'Крафт: 1x Хиральный рефрактор + 1x Агломерат соли + 1x Циклицен',
        isCraft: true,
      },
    ],
  },

  // ==================== SKILL SUMMARIES ====================

  // Skill Summary - 3 (3303)
  '3303': {
    itemId: '3303',
    itemName: 'Skill Summary - 3',
    itemNameRu: 'Сводка навыков · Том 3',
    tier: 3,
    stages: [
      {
        stageCode: 'CA-5',
        stageId: 'wk_fly_5',
        apCost: 30,
        dropRate: 100.0,
        sanityPerItem: 16.5,
        tag: 'Best Sanity',
        tagRu: 'Ежедневный рейд (CA-5)',
        notes: 'Вторник, четверг, суббота, воскресенье. Гарантированный дроп книг',
      },
    ],
  },

  // Skill Summary - 2 (3302)
  '3302': {
    itemId: '3302',
    itemName: 'Skill Summary - 2',
    itemNameRu: 'Сводка навыков · Том 2',
    tier: 2,
    stages: [
      {
        stageCode: 'CA-5',
        stageId: 'wk_fly_5',
        apCost: 30,
        dropRate: 185.0,
        sanityPerItem: 16.2,
        tag: 'Best Sanity',
        tagRu: 'Высшая эффективность',
      },
      {
        stageCode: 'CA-4',
        stageId: 'wk_fly_4',
        apCost: 20,
        dropRate: 100.0,
        sanityPerItem: 20.0,
        tag: 'Recommended',
        tagRu: 'Низкая сложность',
      },
    ],
  },

  // Skill Summary - 1 (3301)
  '3301': {
    itemId: '3301',
    itemName: 'Skill Summary - 1',
    itemNameRu: 'Сводка навыков · Том 1',
    tier: 1,
    stages: [
      {
        stageCode: 'CA-5',
        stageId: 'wk_fly_5',
        apCost: 30,
        dropRate: 200.0,
        sanityPerItem: 15.0,
        tag: 'Best Sanity',
        tagRu: 'Побочный дроп с CA-5',
      },
      {
        stageCode: 'CA-3',
        stageId: 'wk_fly_3',
        apCost: 15,
        dropRate: 100.0,
        sanityPerItem: 15.0,
        tag: 'Recommended',
        tagRu: 'Прямой фарм',
      },
    ],
  },

  // ==================== CLASS CHIPS (T1, T2 PACKS, T3 DUAL CHIPS) ====================

  // T1 Chips
  '3211': {
    itemId: '3211',
    itemName: 'Vanguard Chip',
    itemNameRu: 'Фишка Авангарда',
    tier: 3,
    stages: [{ stageCode: 'PR-A-1', stageId: 'pro_a_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3221': {
    itemId: '3221',
    itemName: 'Guard Chip',
    itemNameRu: 'Фишка Гвардейца',
    tier: 3,
    stages: [{ stageCode: 'PR-D-1', stageId: 'pro_d_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
  },
  '3231': {
    itemId: '3231',
    itemName: 'Defender Chip',
    itemNameRu: 'Фишка Защитника',
    tier: 3,
    stages: [{ stageCode: 'PR-A-1', stageId: 'pro_a_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3241': {
    itemId: '3241',
    itemName: 'Sniper Chip',
    itemNameRu: 'Фишка Снайпера',
    tier: 3,
    stages: [{ stageCode: 'PR-B-1', stageId: 'pro_b_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3251': {
    itemId: '3251',
    itemName: 'Caster Chip',
    itemNameRu: 'Фишка Кастера',
    tier: 3,
    stages: [{ stageCode: 'PR-B-1', stageId: 'pro_b_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3261': {
    itemId: '3261',
    itemName: 'Medic Chip',
    itemNameRu: 'Фишка Медика',
    tier: 3,
    stages: [{ stageCode: 'PR-C-1', stageId: 'pro_c_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3271': {
    itemId: '3271',
    itemName: 'Supporter Chip',
    itemNameRu: 'Фишка Саппорта',
    tier: 3,
    stages: [{ stageCode: 'PR-C-1', stageId: 'pro_c_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3281': {
    itemId: '3281',
    itemName: 'Specialist Chip',
    itemNameRu: 'Фишка Специалиста',
    tier: 3,
    stages: [{ stageCode: 'PR-D-1', stageId: 'pro_d_1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
  },

  // T2 Chip Packs
  '3212': {
    itemId: '3212',
    itemName: 'Vanguard Chip Pack',
    itemNameRu: 'Набор фишек Авангарда',
    tier: 4,
    stages: [{ stageCode: 'PR-A-2', stageId: 'pro_a_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3222': {
    itemId: '3222',
    itemName: 'Guard Chip Pack',
    itemNameRu: 'Набор фишек Гвардейца',
    tier: 4,
    stages: [{ stageCode: 'PR-D-2', stageId: 'pro_d_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
  },
  '3232': {
    itemId: '3232',
    itemName: 'Defender Chip Pack',
    itemNameRu: 'Набор фишек Защитника',
    tier: 4,
    stages: [{ stageCode: 'PR-A-2', stageId: 'pro_a_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3242': {
    itemId: '3242',
    itemName: 'Sniper Chip Pack',
    itemNameRu: 'Набор фишек Снайпера',
    tier: 4,
    stages: [{ stageCode: 'PR-B-2', stageId: 'pro_b_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3252': {
    itemId: '3252',
    itemName: 'Caster Chip Pack',
    itemNameRu: 'Набор фишек Кастера',
    tier: 4,
    stages: [{ stageCode: 'PR-B-2', stageId: 'pro_b_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3262': {
    itemId: '3262',
    itemName: 'Medic Chip Pack',
    itemNameRu: 'Набор фишек Медика',
    tier: 4,
    stages: [{ stageCode: 'PR-C-2', stageId: 'pro_c_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3272': {
    itemId: '3272',
    itemName: 'Supporter Chip Pack',
    itemNameRu: 'Набор фишек Саппорта',
    tier: 4,
    stages: [{ stageCode: 'PR-C-2', stageId: 'pro_c_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3282': {
    itemId: '3282',
    itemName: 'Specialist Chip Pack',
    itemNameRu: 'Набор фишек Специалиста',
    tier: 4,
    stages: [{ stageCode: 'PR-D-2', stageId: 'pro_d_2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
  },

  // T3 Dual Chips (Craft: 2x Chip Pack + 1x Chip Catalyst)
  '3213': {
    itemId: '3213',
    itemName: 'Vanguard Dualchip',
    itemNameRu: 'Двойная фишка Авангарда',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-A-2) + 1x Катализатор (AP-5)' }],
  },
  '3223': {
    itemId: '3223',
    itemName: 'Guard Dualchip',
    itemNameRu: 'Двойная фишка Гвардейца',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-D-2) + 1x Катализатор (AP-5)' }],
  },
  '3233': {
    itemId: '3233',
    itemName: 'Defender Dualchip',
    itemNameRu: 'Двойная фишка Защитника',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-A-2) + 1x Катализатор (AP-5)' }],
  },
  '3243': {
    itemId: '3243',
    itemName: 'Sniper Dualchip',
    itemNameRu: 'Двойная фишка Снайпера',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-B-2) + 1x Катализатор (AP-5)' }],
  },
  '3253': {
    itemId: '3253',
    itemName: 'Caster Dualchip',
    itemNameRu: 'Двойная фишка Кастера',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-B-2) + 1x Катализатор (AP-5)' }],
  },
  '3263': {
    itemId: '3263',
    itemName: 'Medic Dualchip',
    itemNameRu: 'Двойная фишка Медика',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-C-2) + 1x Катализатор (AP-5)' }],
  },
  '3273': {
    itemId: '3273',
    itemName: 'Supporter Dualchip',
    itemNameRu: 'Двойная фишка Саппорта',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-C-2) + 1x Катализатор (AP-5)' }],
  },
  '3283': {
    itemId: '3283',
    itemName: 'Specialist Dualchip',
    itemNameRu: 'Двойная фишка Специалиста',
    tier: 5,
    stages: [{ stageCode: 'Мастерская (Крафт)', apCost: 0, dropRate: 100, sanityPerItem: 234.0, tag: 'Craft', tagRu: 'Крафт в мастерской', notes: '2x Набор фишек (PR-D-2) + 1x Катализатор (AP-5)' }],
  },

  // Chip Catalyst (32001)
  '32001': {
    itemId: '32001',
    itemName: 'Chip Catalyst',
    itemNameRu: 'Катализатор фишек',
    tier: 4,
    stages: [
      {
        stageCode: 'AP-5 (Красные сертификаты)',
        stageId: 'wk_toxic_5',
        apCost: 30,
        dropRate: 100.0,
        sanityPerItem: 90.0,
        tag: 'Best Sanity',
        tagRu: 'Магазин сертификатов',
        notes: 'Покупается за 90 красных сертификатов (3 захода на AP-5)',
      },
    ],
  },

  // Module Data Block (mod_unlock_token)
  mod_unlock_token: {
    itemId: 'mod_unlock_token',
    itemName: 'Module Data Block',
    itemNameRu: 'Блок данных модуля',
    tier: 5,
    stages: [
      {
        stageCode: 'Магазин красных сертификатов',
        apCost: 30,
        dropRate: 100.0,
        sanityPerItem: 120.0,
        tag: 'Recommended',
        tagRu: 'Еженедельный лимит',
        notes: '120 красных сертификатов за штуку в магазине Red Cert (4 захода на AP-5)',
      },
    ],
  },

  // Data Supplement Stick (mod_update_token_1)
  mod_update_token_1: {
    itemId: 'mod_update_token_1',
    itemName: 'Data Supplement Stick',
    itemNameRu: 'Стержень усиления данных',
    tier: 4,
    stages: [
      {
        stageCode: 'Режим SSS / Ивенты',
        apCost: 0,
        dropRate: 100.0,
        sanityPerItem: 0,
        tag: 'Recommended',
        tagRu: 'Режим SSS',
        notes: 'Фармится в режиме Stationary Security Service (SSS) и магазине событий',
      },
    ],
  },

  // Data Supplement Instrument (mod_update_token_2)
  mod_update_token_2: {
    itemId: 'mod_update_token_2',
    itemName: 'Data Supplement Instrument',
    itemNameRu: 'Инструмент усиления данных',
    tier: 5,
    stages: [
      {
        stageCode: 'Режим SSS / Ивенты',
        apCost: 0,
        dropRate: 100.0,
        sanityPerItem: 0,
        tag: 'Recommended',
        tagRu: 'Режим SSS',
        notes: 'Фармится в режиме Stationary Security Service (SSS) и магазине событий',
      },
    ],
  },

  // ==================== CURRENCIES ====================

  // LMD (4001)
  '4001': {
    itemId: '4001',
    itemName: 'LMD',
    itemNameRu: 'LMD (Юани)',
    tier: 4,
    stages: [
      {
        stageCode: 'CE-6',
        stageId: 'wk_melee_6',
        apCost: 36,
        dropRate: 100.0,
        sanityPerItem: 0.0036, // 10,000 LMD per 36 Sanity = 277.7 LMD/Sanity
        tag: 'Best Sanity',
        tagRu: 'Золотой стандарт (CE-6)',
        notes: '10,000 LMD за 36 Sanity (277.8 LMD / 1 ⚡). Вт, Чт, Сб, Вс',
      },
      {
        stageCode: 'CE-5',
        stageId: 'wk_melee_5',
        apCost: 30,
        dropRate: 100.0,
        sanityPerItem: 0.0040,
        tag: 'Recommended',
        tagRu: 'Низкая сложность',
        notes: '7,500 LMD за 30 Sanity (250 LMD / 1 ⚡)',
      },
    ],
  },

  // Battle Records / EXP (2003, 2004)
  '2004': {
    itemId: '2004',
    itemName: 'Strategic Battle Record',
    itemNameRu: 'Стратегическая запись боя (T4)',
    tier: 4,
    stages: [
      {
        stageCode: 'LS-6',
        stageId: 'wk_kc_6',
        apCost: 36,
        dropRate: 100.0,
        sanityPerItem: 7.2,
        tag: 'Best Sanity',
        tagRu: 'Высший уровень (LS-6)',
        notes: '10,000 EXP за 36 Sanity (277.8 EXP / 1 ⚡). Пн, Ср, Пт, Вс',
      },
    ],
  },
  '2003': {
    itemId: '2003',
    itemName: 'Tactical Battle Record',
    itemNameRu: 'Тактическая запись боя (T3)',
    tier: 3,
    stages: [
      {
        stageCode: 'LS-6',
        stageId: 'wk_kc_6',
        apCost: 36,
        dropRate: 100.0,
        sanityPerItem: 18.0,
        tag: 'Best Sanity',
        tagRu: 'Высший уровень (LS-6)',
        notes: 'Дропается вместе с T4 записями на LS-6',
      },
      {
        stageCode: 'LS-5',
        stageId: 'wk_kc_5',
        apCost: 30,
        dropRate: 100.0,
        sanityPerItem: 22.0,
        tag: 'Recommended',
        tagRu: 'Низкая сложность',
      },
    ],
  },
  '2002': {
    itemId: '2002',
    itemName: 'Frontline Battle Record',
    itemNameRu: 'Фронтовая запись боя (T2)',
    tier: 2,
    stages: [
      {
        stageCode: 'LS-5',
        stageId: 'wk_kc_5',
        apCost: 30,
        dropRate: 100.0,
        sanityPerItem: 8.8,
        tag: 'Best Sanity',
        tagRu: 'Базовый уровень',
        notes: 'Фармится на стадиях тактической тренировки LS',
      },
    ],
  },
  '2001': {
    itemId: '2001',
    itemName: 'Drill Battle Record',
    itemNameRu: 'Учебная запись боя (T1)',
    tier: 1,
    stages: [
      {
        stageCode: 'LS-4',
        stageId: 'wk_kc_4',
        apCost: 25,
        dropRate: 100.0,
        sanityPerItem: 4.4,
        tag: 'Best Sanity',
        tagRu: 'Начальный уровень',
        notes: 'Фармится на стадиях LS и на Базе',
      },
    ],
  },
};

/**
 * Returns the best farming recommendation for a given itemId
 */
export function getBestFarmingRecommendation(itemId: string): StageDropRecommendation | undefined {
  if (!itemId) return undefined;
  const profile = PENGUIN_BENCHMARK_DATA[itemId];
  return profile?.stages?.[0];
}

/**
 * Returns all stage recommendations for a given itemId
 */
export function getAllFarmingRecommendations(itemId: string): StageDropRecommendation[] {
  if (!itemId) return [];
  return PENGUIN_BENCHMARK_DATA[itemId]?.stages || [];
}

export interface FarmingPlanEstimate {
  stageCode: string;
  apCost: number;
  runs: number;
  totalSanity: number;
  sanityPerItem: number;
}

/**
 * Calculates estimated runs and sanity to farm N items
 */
export function calculateFarmingEstimate(
  itemId: string,
  neededCount: number
): FarmingPlanEstimate | null {
  if (neededCount <= 0) return null;
  const best = getBestFarmingRecommendation(itemId);
  if (!best) return null;

  if (best.apCost === 0) {
    return {
      stageCode: best.stageCode,
      apCost: 0,
      runs: 0,
      totalSanity: Math.round(neededCount * best.sanityPerItem),
      sanityPerItem: Math.round(best.sanityPerItem * 10) / 10,
    };
  }

  const dropChanceDecimal = Math.max(0.01, best.dropRate / 100);
  const runs = Math.ceil(neededCount / dropChanceDecimal);
  const totalSanity = Math.round(neededCount * best.sanityPerItem);

  return {
    stageCode: best.stageCode,
    apCost: best.apCost,
    runs,
    totalSanity,
    sanityPerItem: Math.round(best.sanityPerItem * 10) / 10,
  };
}
