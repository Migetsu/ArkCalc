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

  // 1. Orirock Cluster (30013)
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
        stageCode: '2-4',
        stageId: 'main_02-04',
        apCost: 12,
        dropRate: 28.5,
        sanityPerItem: 42.1,
        tag: 'Recommended',
        tagRu: 'Прямой дроп T3',
        notes: 'Прямой дроп группы орирока без необходимости ручного крафта',
      },
    ],
  },

  // 2. Sugar Pack (30023)
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
        dropRate: 26.8,
        sanityPerItem: 44.8,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
        notes: 'Быстрый фарм с минимальным расходом энергии за заход',
      },
      {
        stageCode: 'S3-1',
        stageId: 'sub_03-01',
        apCost: 15,
        dropRate: 32.1,
        sanityPerItem: 46.7,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс дропа',
        notes: 'Хороший баланс шанса выпадения и вторичных ресурсов',
      },
      {
        stageCode: '10-10',
        stageId: 'main_10-09',
        apCost: 21,
        dropRate: 46.9,
        sanityPerItem: 44.8,
        tag: 'Best Byproducts',
        tagRu: 'Богатые побочные',
        notes: 'Много ценных сопутствующих материалов в 10 главе',
      },
    ],
  },

  // 3. Polyester Pack (30033)
  '30033': {
    itemId: '30033',
    itemName: 'Polyester Pack',
    itemNameRu: 'Пачка полиэстера',
    tier: 3,
    stages: [
      {
        stageCode: '7-4',
        stageId: 'main_07-04',
        apCost: 18,
        dropRate: 41.5,
        sanityPerItem: 43.4,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
        notes: 'Наивысшая общая эффективность по Sanity в 7 главе',
      },
      {
        stageCode: '2-7',
        stageId: 'main_02-07',
        apCost: 12,
        dropRate: 25.4,
        sanityPerItem: 47.2,
        tag: 'Recommended',
        tagRu: 'Низкая сложность',
        notes: 'Доступно в ранней игре, низкий расход AP за заход',
      },
    ],
  },

  // 4. Oriron Cluster (30043)
  '30043': {
    itemId: '30043',
    itemName: 'Oriron Cluster',
    itemNameRu: 'Группа орижелеза',
    tier: 3,
    stages: [
      {
        stageCode: '10-11',
        stageId: 'main_10-11',
        apCost: 21,
        dropRate: 44.8,
        sanityPerItem: 46.9,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
        notes: 'Наиболее эффективная стадия в 10 главе',
      },
      {
        stageCode: 'S3-3',
        stageId: 'sub_03-03',
        apCost: 15,
        dropRate: 29.5,
        sanityPerItem: 50.8,
        tag: 'Recommended',
        tagRu: 'Стандартный выбор',
        notes: 'Классическая проверенная стадия 3 главы',
      },
      {
        stageCode: '7-18',
        stageId: 'main_07-18',
        apCost: 18,
        dropRate: 33.2,
        sanityPerItem: 54.2,
        tag: 'Best Byproducts',
        tagRu: 'Богатые побочные',
        notes: 'Много ценных сопутствующих материалов T2',
      },
    ],
  },

  // 5. Aketon (30053)
  '30053': {
    itemId: '30053',
    itemName: 'Aketon',
    itemNameRu: 'Акетон',
    tier: 3,
    stages: [
      {
        stageCode: '10-4',
        stageId: 'main_10-03',
        apCost: 21,
        dropRate: 55.1,
        sanityPerItem: 38.1,
        tag: 'Best Sanity',
        tagRu: 'Рекордная выносливость',
        notes: 'Рекордная эффективность свыше 55% шанса выпадения и приборы в побочных',
      },
      {
        stageCode: '3-1',
        stageId: 'main_03-01',
        apCost: 15,
        dropRate: 36.8,
        sanityPerItem: 40.8,
        tag: 'Recommended',
        tagRu: 'Ранняя стадия',
        notes: 'Быстрый фарм в 3 главе',
      },
    ],
  },

  // 6. Integrated Device (30063)
  '30063': {
    itemId: '30063',
    itemName: 'Integrated Device',
    itemNameRu: 'Интегральное устройство',
    tier: 3,
    stages: [
      {
        stageCode: '14-16',
        stageId: 'main_14-14',
        apCost: 21,
        dropRate: 58.3,
        sanityPerItem: 36.0,
        tag: 'Best Sanity',
        tagRu: 'Рекордная выносливость',
        notes: 'Топовая стадия поздней игры с шансом выпадения свыше 58%',
      },
      {
        stageCode: '11-7',
        stageId: 'main_11-06',
        apCost: 21,
        dropRate: 40.4,
        sanityPerItem: 52.0,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс',
        notes: 'Надежная карта в 11 главе',
      },
      {
        stageCode: '7-15',
        stageId: 'main_07-15',
        apCost: 18,
        dropRate: 33.3,
        sanityPerItem: 54.0,
        tag: 'Recommended',
        tagRu: 'Классическая',
        notes: 'Популярная проверенная стадия 7 главы',
      },
      {
        stageCode: 'S3-4',
        stageId: 'sub_03-04',
        apCost: 15,
        dropRate: 24.2,
        sanityPerItem: 62.0,
        tag: 'Recommended',
        tagRu: 'Ранняя стадия',
      },
    ],
  },

  // 7. Loxic Kohl (30073)
  '30073': {
    itemId: '30073',
    itemName: 'Loxic Kohl',
    itemNameRu: 'Локсический уголь',
    tier: 3,
    stages: [
      {
        stageCode: '12-10',
        stageId: 'main_12-10',
        apCost: 21,
        dropRate: 53.8,
        sanityPerItem: 39.0,
        tag: 'Best Sanity',
        tagRu: 'Рекордная выносливость',
        notes: 'Топовая стадия для фарма Коля в актуальном сюжете (12 глава)',
      },
      {
        stageCode: '6-11',
        stageId: 'main_06-11',
        apCost: 18,
        dropRate: 42.1,
        sanityPerItem: 42.8,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая',
        notes: 'Стабильный проверенный дроп в 6 главе',
      },
      {
        stageCode: '4-4',
        stageId: 'main_04-04',
        apCost: 18,
        dropRate: 38.6,
        sanityPerItem: 46.6,
        tag: 'Recommended',
        tagRu: 'Классическая',
      },
    ],
  },

  // 8. Manganese Ore (30083)
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
        sanityPerItem: 38.2,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
        notes: 'Рекордный шанс выпадения марганца (54.9%) и сопутствующий полиэстер',
      },
      {
        stageCode: '7-16',
        stageId: 'main_07-16',
        apCost: 18,
        dropRate: 43.8,
        sanityPerItem: 41.1,
        tag: 'Highest Rate',
        tagRu: 'Золотой стандарт (7-16)',
        notes: 'Самая популярная карта для фарма марганца',
      },
      {
        stageCode: '3-2',
        stageId: 'main_03-02',
        apCost: 15,
        dropRate: 37.0,
        sanityPerItem: 40.6,
        tag: 'Recommended',
        tagRu: 'Ранняя стадия',
      },
    ],
  },

  // 9. Grindstone (30093)
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
        dropRate: 40.0,
        sanityPerItem: 45.0,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
        notes: 'Лучшее соотношение выносливости к предмету в 9 главе',
      },
      {
        stageCode: '10-12',
        stageId: 'main_10-11',
        apCost: 21,
        dropRate: 45.4,
        sanityPerItem: 46.3,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (10 глава)',
        notes: '45.4% шанс выпадения в 10 главе',
      },
      {
        stageCode: '11-15',
        stageId: 'main_11-15',
        apCost: 21,
        dropRate: 41.8,
        sanityPerItem: 50.2,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
        notes: 'Отличный дроп в 11 главе',
      },
      {
        stageCode: '4-8',
        stageId: 'main_04-08',
        apCost: 18,
        dropRate: 30.6,
        sanityPerItem: 58.8,
        tag: 'Recommended',
        tagRu: 'Классическая',
      },
    ],
  },

  // 10. RMA70-12 (30103)
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
        notes: 'Наиболее энергоэффективная карта для RMA в сюжете',
      },
      {
        stageCode: '7-10',
        stageId: 'main_07-10',
        apCost: 18,
        dropRate: 34.0,
        sanityPerItem: 53.0,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (7-10)',
        notes: 'Популярная энергоэффективная карта для RMA',
      },
      {
        stageCode: '4-9',
        stageId: 'main_04-09',
        apCost: 18,
        dropRate: 29.0,
        sanityPerItem: 62.1,
        tag: 'Recommended',
        tagRu: 'Ранняя стадия',
      },
    ],
  },

  // 11. Coagulating Gel (31013)
  '31013': {
    itemId: '31013',
    itemName: 'Coagulating Gel',
    itemNameRu: 'Коагулирующий гель',
    tier: 3,
    stages: [
      {
        stageCode: '14-7',
        stageId: 'main_14-07',
        apCost: 21,
        dropRate: 48.5,
        sanityPerItem: 43.3,
        tag: 'Best Sanity',
        tagRu: 'Рекордная выносливость (14-7)',
        notes: 'Абсолютно лучшая стадия для геля в игре с шансом 48.5%',
      },
      {
        stageCode: 'JT8-2',
        stageId: 'main_08-16',
        apCost: 18,
        dropRate: 33.3,
        sanityPerItem: 54.0,
        tag: 'Recommended',
        tagRu: 'Лучшая выносливость (JT8-2)',
        notes: 'Основное проверенное место добычи геля в 8 главе',
      },
      {
        stageCode: '10-3',
        stageId: 'main_10-02',
        apCost: 21,
        dropRate: 33.3,
        sanityPerItem: 63.0,
        tag: 'Recommended',
        tagRu: 'Глава 10',
        notes: 'Прямой дроп геля в 10 главе с побочным сахаром и орижелезом',
      },
      {
        stageCode: 'S4-10',
        stageId: 'sub_04-10',
        apCost: 18,
        dropRate: 28.1,
        sanityPerItem: 64.1,
        tag: 'Recommended',
        tagRu: 'Классическая (S4-10)',
        notes: 'Самая ранняя доступная стадия с прямым дропом геля',
      },
    ],
  },

  // 12. Incandescent Alloy (31023)
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
        tagRu: 'Рекордная выносливость',
        notes: 'Топовый фарм сплава в 16 главе (55.6% шанс дропа)',
      },
      {
        stageCode: 'S3-6',
        stageId: 'sub_03-06',
        apCost: 15,
        dropRate: 39.6,
        sanityPerItem: 37.9,
        tag: 'Highest Rate',
        tagRu: 'Низкая стоимость (15 AP)',
        notes: 'Быстрый фарм сплава в 3 главе всего за 15 Sanity',
      },
      {
        stageCode: '11-2',
        stageId: 'main_11-02',
        apCost: 21,
        dropRate: 45.6,
        sanityPerItem: 46.1,
        tag: 'Recommended',
        tagRu: 'Глава 11',
        notes: 'Стабильный проверенный дроп в 11 главе',
      },
      {
        stageCode: '10-14',
        stageId: 'main_10-12',
        apCost: 21,
        dropRate: 39.5,
        sanityPerItem: 53.2,
        tag: 'Recommended',
        tagRu: 'Глава 10',
        notes: 'Фарм сплава в 10 главе',
      },
    ],
  },

  // 13. Crystalline Component (31033)
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
        tagRu: 'Рекордная выносливость',
        notes: 'Невероятный шанс дропа свыше 70% в 16 главе',
      },
      {
        stageCode: '9-14',
        stageId: 'main_09-12',
        apCost: 21,
        dropRate: 58.1,
        sanityPerItem: 36.1,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (9 глава)',
        notes: '58% шанс выпадения в 9 главе',
      },
      {
        stageCode: 'S5-7',
        stageId: 'sub_05-07',
        apCost: 18,
        dropRate: 36.9,
        sanityPerItem: 48.8,
        tag: 'Recommended',
        tagRu: 'Классическая',
        notes: 'Ранняя проверенная стадия 5 главы',
      },
    ],
  },

  // 14. Semi-Synthetic Solvent (31043)
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
        tagRu: 'Рекордная выносливость',
        notes: 'Лучшая энергоэффективность в 17 главе',
      },
      {
        stageCode: '9-4',
        stageId: 'main_09-04',
        apCost: 21,
        dropRate: 41.5,
        sanityPerItem: 50.6,
        tag: 'Recommended',
        tagRu: 'Популярная (9 глава)',
        notes: 'Классическая стабильная стадия в 9 главе',
      },
      {
        stageCode: '12-10',
        stageId: 'main_12-09',
        apCost: 21,
        dropRate: 34.2,
        sanityPerItem: 61.4,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // 15. Compound Cutting Fluid (31053)
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
        sanityPerItem: 30.0,
        tag: 'Best Sanity',
        tagRu: 'Рекордная выносливость',
        notes: 'Непревзойденный 70.1% шанс дропа СОЖ в 14 главе',
      },
      {
        stageCode: '10-17',
        stageId: 'main_10-15',
        apCost: 21,
        dropRate: 53.6,
        sanityPerItem: 39.2,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (10-17)',
        notes: 'Основной источник СОЖ в 10 главе с шансом 53.6%',
      },
      {
        stageCode: '12-17',
        stageId: 'main_12-15',
        apCost: 21,
        dropRate: 47.0,
        sanityPerItem: 44.7,
        tag: 'Recommended',
        tagRu: 'Альтернатива (12 глава)',
      },
    ],
  },

  // 16. Transmuted Salt (31063)
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
        tagRu: 'Рекордная выносливость (14-2)',
        notes: 'Лучший шанс соли в 14 главе',
      },
      {
        stageCode: '11-3',
        stageId: 'main_11-03',
        apCost: 21,
        dropRate: 31.4,
        sanityPerItem: 66.8,
        tag: 'Recommended',
        tagRu: 'Глава 11',
        notes: 'Основная стадия добычи соли в 11 главе',
      },
    ],
  },

  // 17. Fuscous Fiber (31073)
  '31073': {
    itemId: '31073',
    itemName: 'Fuscous Fiber',
    itemNameRu: 'Бурое волокно',
    tier: 3,
    stages: [
      {
        stageCode: '12-14',
        stageId: 'main_12-14',
        apCost: 21,
        dropRate: 41.2,
        sanityPerItem: 51.0,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
      },
      {
        stageCode: '11-14',
        stageId: 'main_11-14',
        apCost: 21,
        dropRate: 38.0,
        sanityPerItem: 55.3,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // 18. Aggregate Cyclicene (31083)
  '31083': {
    itemId: '31083',
    itemName: 'Aggregate Cyclicene',
    itemNameRu: 'Агрегатный циклицен',
    tier: 3,
    stages: [
      {
        stageCode: '13-4',
        stageId: 'main_13-04',
        apCost: 21,
        dropRate: 40.8,
        sanityPerItem: 51.5,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
        notes: 'Отличная стадия в 13 главе',
      },
      {
        stageCode: '12-11',
        stageId: 'main_12-11',
        apCost: 21,
        dropRate: 37.6,
        sanityPerItem: 55.9,
        tag: 'Recommended',
        tagRu: 'Альтернатива',
      },
    ],
  },

  // 19. Coagulative Nodule (31093)
  '31093': {
    itemId: '31093',
    itemName: 'Coagulative Nodule',
    itemNameRu: 'Коагуляционный узелок',
    tier: 3,
    stages: [
      {
        stageCode: '13-17',
        stageId: 'main_13-17',
        apCost: 21,
        dropRate: 39.8,
        sanityPerItem: 52.8,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
      },
    ],
  },

  // 20. Liquefied High-Energy Gas (31103)
  '31103': {
    itemId: '31103',
    itemName: 'Liquefied High-Energy Gas',
    itemNameRu: 'Сжиженный высокоэнергетический газ',
    tier: 3,
    stages: [
      {
        stageCode: '14-11',
        stageId: 'main_14-11',
        apCost: 21,
        dropRate: 40.2,
        sanityPerItem: 52.2,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
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
        stageCode: '14-16',
        stageId: 'main_14-16',
        apCost: 21,
        dropRate: 39.6,
        sanityPerItem: 53.0,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость',
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
        stageId: 'sub_04-01',
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
        notes: 'Крафт: 1x Коагулирующий гель (JT8-2) + 1x Накальный сплав (S3-6) + 1x Группа орирока (1-7)',
        isCraft: true,
      },
      {
        stageCode: 'JT8-2',
        stageId: 'main_08-02',
        apCost: 18,
        dropRate: 2.8,
        sanityPerItem: 642.0,
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
        notes: 'Крафт: 1x Накальный сплав (S3-6) + 1x Интегральный прибор (10-8) + 1x Точильный камень (12-10)',
        isCraft: true,
      },
      {
        stageCode: 'S5-9',
        stageId: 'sub_05-09',
        apCost: 18,
        dropRate: 2.5,
        sanityPerItem: 720.0,
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
        notes: 'Крафт: 1x Кристаллический компонент (10-14) + 1x Коагулирующий гель (JT8-2) + 1x Накальный сплав (S3-6)',
        isCraft: true,
      },
      {
        stageCode: 'S5-7',
        stageId: 'sub_05-07',
        apCost: 18,
        dropRate: 2.4,
        sanityPerItem: 750.0,
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
        notes: 'Крафт: 1x Полусинтетический растворитель (9-4) + 1x Коагулирующий гель (JT8-2) + 1x Акетон (10-5)',
        isCraft: true,
      },
      {
        stageCode: '10-14',
        stageId: 'main_10-14',
        apCost: 21,
        dropRate: 2.6,
        sanityPerItem: 807.0,
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
        notes: 'Крафт: 1x Составная СОЖ (10-10) + 1x Кристаллический компонент (10-14) + 1x RMA70-12 (7-10)',
        isCraft: true,
      },
      {
        stageCode: '10-10',
        stageId: 'main_10-10',
        apCost: 21,
        dropRate: 2.5,
        sanityPerItem: 840.0,
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
        notes: 'Крафт: 1x Трансмутированная соль (11-3) + 1x Полусинтетический растворитель (9-4) + 1x Пачка сахара (2-5)',
        isCraft: true,
      },
      {
        stageCode: '11-3',
        stageId: 'main_11-03',
        apCost: 21,
        dropRate: 2.5,
        sanityPerItem: 840.0,
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
        notes: 'Крафт: 1x Бурое волокно (12-14) + 1x Трансмутированная соль (11-3) + 1x Группа орижелеза (10-11)',
        isCraft: true,
      },
      {
        stageCode: '12-14',
        stageId: 'main_12-14',
        apCost: 21,
        dropRate: 2.5,
        sanityPerItem: 840.0,
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
        notes: 'Крафт: 1x Циклицен (13-4) + 1x Бурое волокно (12-14) + 1x Коагулирующий гель (JT8-2)',
        isCraft: true,
      },
      {
        stageCode: '13-4',
        stageId: 'main_13-04',
        apCost: 21,
        dropRate: 2.5,
        sanityPerItem: 840.0,
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
        notes: 'Крафт: 1x Коагуляционный узелок (14-7) + 1x Циклицен (13-4) + 1x Накальный сплав (S3-6)',
        isCraft: true,
      },
      {
        stageCode: '14-7',
        stageId: 'main_14-07',
        apCost: 21,
        dropRate: 2.5,
        sanityPerItem: 840.0,
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
        notes: 'Крафт: 1x Сжиженный газ (14-16) + 1x Бурое волокно (12-14) + 1x Акетон (10-5)',
        isCraft: true,
      },
      {
        stageCode: '14-16',
        stageId: 'main_14-16',
        apCost: 21,
        dropRate: 2.5,
        sanityPerItem: 840.0,
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
        notes: 'Крафт: 1x Электродный блок (15-5) + 1x Циклицен (13-4) + 1x RMA70-12 (7-10)',
        isCraft: true,
      },
      {
        stageCode: '15-5',
        stageId: 'main_15-05',
        apCost: 21,
        dropRate: 2.5,
        sanityPerItem: 840.0,
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
        stageId: 'wk_aerial_5',
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
        stageId: 'wk_aerial_5',
        apCost: 30,
        dropRate: 185.0,
        sanityPerItem: 16.2,
        tag: 'Best Sanity',
        tagRu: 'Высшая эффективность',
      },
      {
        stageCode: 'CA-4',
        stageId: 'wk_aerial_4',
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
        stageId: 'wk_aerial_5',
        apCost: 30,
        dropRate: 200.0,
        sanityPerItem: 15.0,
        tag: 'Best Sanity',
        tagRu: 'Побочный дроп с CA-5',
      },
      {
        stageCode: 'CA-3',
        stageId: 'wk_aerial_3',
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
    stages: [{ stageCode: 'PR-A-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3221': {
    itemId: '3221',
    itemName: 'Guard Chip',
    itemNameRu: 'Фишка Гвардейца',
    tier: 3,
    stages: [{ stageCode: 'PR-D-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
  },
  '3231': {
    itemId: '3231',
    itemName: 'Defender Chip',
    itemNameRu: 'Фишка Защитника',
    tier: 3,
    stages: [{ stageCode: 'PR-A-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3241': {
    itemId: '3241',
    itemName: 'Sniper Chip',
    itemNameRu: 'Фишка Снайпера',
    tier: 3,
    stages: [{ stageCode: 'PR-B-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3251': {
    itemId: '3251',
    itemName: 'Caster Chip',
    itemNameRu: 'Фишка Кастера',
    tier: 3,
    stages: [{ stageCode: 'PR-B-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3261': {
    itemId: '3261',
    itemName: 'Medic Chip',
    itemNameRu: 'Фишка Медика',
    tier: 3,
    stages: [{ stageCode: 'PR-C-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3271': {
    itemId: '3271',
    itemName: 'Supporter Chip',
    itemNameRu: 'Фишка Саппорта',
    tier: 3,
    stages: [{ stageCode: 'PR-C-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3281': {
    itemId: '3281',
    itemName: 'Specialist Chip',
    itemNameRu: 'Фишка Специалиста',
    tier: 3,
    stages: [{ stageCode: 'PR-D-1', apCost: 18, dropRate: 50.0, sanityPerItem: 36.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
  },

  // T2 Chip Packs
  '3212': {
    itemId: '3212',
    itemName: 'Vanguard Chip Pack',
    itemNameRu: 'Набор фишек Авангарда',
    tier: 4,
    stages: [{ stageCode: 'PR-A-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3222': {
    itemId: '3222',
    itemName: 'Guard Chip Pack',
    itemNameRu: 'Набор фишек Гвардейца',
    tier: 4,
    stages: [{ stageCode: 'PR-D-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
  },
  '3232': {
    itemId: '3232',
    itemName: 'Defender Chip Pack',
    itemNameRu: 'Набор фишек Защитника',
    tier: 4,
    stages: [{ stageCode: 'PR-A-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Чт, Вс)' }],
  },
  '3242': {
    itemId: '3242',
    itemName: 'Sniper Chip Pack',
    itemNameRu: 'Набор фишек Снайпера',
    tier: 4,
    stages: [{ stageCode: 'PR-B-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3252': {
    itemId: '3252',
    itemName: 'Caster Chip Pack',
    itemNameRu: 'Набор фишек Кастера',
    tier: 4,
    stages: [{ stageCode: 'PR-B-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Ср, Сб, Вс)' }],
  },
  '3262': {
    itemId: '3262',
    itemName: 'Medic Chip Pack',
    itemNameRu: 'Набор фишек Медика',
    tier: 4,
    stages: [{ stageCode: 'PR-C-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3272': {
    itemId: '3272',
    itemName: 'Supporter Chip Pack',
    itemNameRu: 'Набор фишек Саппорта',
    tier: 4,
    stages: [{ stageCode: 'PR-C-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Пн, Пт, Вс)' }],
  },
  '3282': {
    itemId: '3282',
    itemName: 'Specialist Chip Pack',
    itemNameRu: 'Набор фишек Специалиста',
    tier: 4,
    stages: [{ stageCode: 'PR-D-2', apCost: 36, dropRate: 50.0, sanityPerItem: 72.0, tag: 'Best Sanity', tagRu: 'Рейд фишек (Вт, Сб, Вс)' }],
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
        stageId: 'wk_armor_6',
        apCost: 36,
        dropRate: 100.0,
        sanityPerItem: 0.0036, // 10,000 LMD per 36 Sanity = 277.7 LMD/Sanity
        tag: 'Best Sanity',
        tagRu: 'Золотой стандарт (CE-6)',
        notes: '10,000 LMD за 36 Sanity (277.8 LMD / 1 ⚡). Вт, Чт, Сб, Вс',
      },
      {
        stageCode: 'CE-5',
        stageId: 'wk_armor_5',
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
        stageId: 'wk_melee_6',
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
        stageId: 'wk_melee_6',
        apCost: 36,
        dropRate: 100.0,
        sanityPerItem: 18.0,
        tag: 'Best Sanity',
        tagRu: 'Высший уровень (LS-6)',
        notes: 'Дропается вместе с T4 записями на LS-6',
      },
      {
        stageCode: 'LS-5',
        stageId: 'wk_melee_5',
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
        stageId: 'wk_melee_5',
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
        stageId: 'wk_melee_4',
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
