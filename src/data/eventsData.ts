// src/data/eventsData.ts
export interface EventShopItem {
  itemId: string;
  nameEn: string;
  nameRu: string;
  nameCn: string;
  count: number;
  costPerItem: number;
  tokenType: string;
}

export interface EventFarmingStage {
  stageCode: string;
  itemId: string;
  itemNameEn: string;
  itemNameRu: string;
  dropRatePercent: number;
  apCost: number;
  sanityPerItem: number;
}

export interface ArknightsEvent {
  id: string;
  nameEn: string;
  nameRu: string;
  nameCn: string;
  type: 'side_story' | 'story_collection' | 'intermezzi' | 'rerun' | 'cc' | 'trials' | 'celebration';
  status: 'cn_active' | 'upcoming_global' | 'global_active' | 'past_cn_6m';
  cnStartDate: string;
  cnEndDate: string;
  globalStartDate?: string;
  globalEndDate?: string;
  globalEstimatedArrival?: string;
  bannerNameEn?: string;
  bannerNameRu?: string;
  featuredOperators: Array<{
    name: string;
    charId?: string;
    rarity: number;
    role: 'limited' | 'standard' | 'welfare';
  }>;
  shopItems: EventShopItem[];
  farmingStages: EventFarmingStage[];
  summaryEn: string;
  summaryRu: string;
  summaryCn: string;
}

export const ARKNIGHTS_EVENTS: ArknightsEvent[] = [
  {
    id: 'act38side_lappland',
    nameEn: 'I Portatori dei Velluti (Bearers of the Velvet)',
    nameRu: 'I Portatori dei Velluti (Носители бархата)',
    nameCn: '引路者与背誓之人',
    type: 'celebration',
    status: 'cn_active',
    cnStartDate: '2026-09-25',
    cnEndDate: '2026-10-16',
    globalEstimatedArrival: '2027-03 (Spring)',
    bannerNameEn: 'Symphony of the Decadent',
    bannerNameRu: 'Симфония упадка',
    featuredOperators: [
      { name: 'Lappland the Decadenza', charId: 'char_1037_lappld', rarity: 6, role: 'limited' },
      { name: 'Vincenzo', charId: 'char_4140_vincen', rarity: 6, role: 'standard' },
      { name: 'Crownslayer', charId: 'char_4141_crnslr', rarity: 6, role: 'welfare' },
    ],
    shopItems: [
      { itemId: '4001', nameEn: 'LMD', nameRu: 'LMD (Юани)', nameCn: '龙门币', count: 500000, costPerItem: 1, tokenType: 'velvet_token' },
      { itemId: '2004', nameEn: 'Strategic Battle Record', nameRu: 'Стратегическая запись боя (T4)', nameCn: '高级作战记录', count: 120, costPerItem: 5, tokenType: 'velvet_token' },
      { itemId: '2003', nameEn: 'Tactical Battle Record', nameRu: 'Тактическая запись боя (T3)', nameCn: '中级作战记录', count: 200, costPerItem: 3, tokenType: 'velvet_token' },
      { itemId: 'mod_unlock_token', nameEn: 'Module Data Block', nameRu: 'Блок данных модуля', nameCn: '模组数据块', count: 4, costPerItem: 120, tokenType: 'velvet_token' },
      { itemId: 'mod_update_token_1', nameEn: 'Data Supplement Stick', nameRu: 'Стержень данных (T1)', nameCn: '数据增补条', count: 60, costPerItem: 10, tokenType: 'velvet_token' },
      { itemId: 'mod_update_token_2', nameEn: 'Data Supplement Instrument', nameRu: 'Инструмент данных (T2)', nameCn: '数据增补仪', count: 20, costPerItem: 20, tokenType: 'velvet_token' },
      { itemId: '30014', nameEn: 'Orirock Concentration', nameRu: 'Очищенный орирок (T4)', nameCn: '提纯源岩', count: 10, costPerItem: 35, tokenType: 'velvet_token' },
      { itemId: '30044', nameEn: 'Oriron Block', nameRu: 'Блок орижелеза (T4)', nameCn: '异铁块', count: 10, costPerItem: 45, tokenType: 'velvet_token' },
      { itemId: '30034', nameEn: 'Polyester Lump', nameRu: 'Блок полиэстера (T4)', nameCn: '聚酸酯块', count: 10, costPerItem: 40, tokenType: 'velvet_token' },
      { itemId: '31014', nameEn: 'Refined Solvent', nameRu: 'Очищенный растворитель (T4)', nameCn: '精炼溶剂', count: 10, costPerItem: 40, tokenType: 'velvet_token' },
      { itemId: '31034', nameEn: 'Salt Agglomerate', nameRu: 'Соляной агломерат (T4)', nameCn: '转质盐聚块', count: 10, costPerItem: 45, tokenType: 'velvet_token' },
    ],
    farmingStages: [
      { stageCode: 'PV-7', itemId: '30013', itemNameEn: 'Orirock Cluster', itemNameRu: 'Группа орирока (T3)', dropRatePercent: 78.5, apCost: 18, sanityPerItem: 22.9 },
      { stageCode: 'PV-8', itemId: '30043', itemNameEn: 'Oriron Cluster', itemNameRu: 'Группа орижелеза (T3)', dropRatePercent: 68.2, apCost: 21, sanityPerItem: 30.8 },
      { stageCode: 'PV-9', itemId: '31013', itemNameEn: 'Semi-Synthetic Solvent', itemNameRu: 'Полусинтетический растворитель (T3)', dropRatePercent: 65.4, apCost: 21, sanityPerItem: 32.1 },
    ],
    summaryEn: 'Celebration Side Story in Siracusa following the revival of the Bellone family and the ascendance of Lappland the Decadenza. Features welfare 6-star Specialist Crownslayer and top tier Oriron & Solvent farming.',
    summaryRu: 'Праздничный Side Story в Сиракузах, посвященный возрождению семьи Беллоне и явлению Лаппланд (Decadenza). Включает бесплатного 6★ Специалиста Crownslayer и топовый фарм орижелеза и растворителя.',
    summaryCn: '叙拉古庆典SideStory，讲述贝隆家族复兴与落魄之狼拉普兰德的重生。提供免费六星特种干员弑君者及优质异铁、溶剂掉落关卡。',
  },
  {
    id: 'act37side_sunken_waves',
    nameEn: 'Sunken Waves, Rising Stars (Summer 2026)',
    nameRu: 'Sunken Waves, Rising Stars (Летний ивент)',
    nameCn: '太阳落下的地方',
    type: 'side_story',
    status: 'upcoming_global',
    cnStartDate: '2026-08-01',
    cnEndDate: '2026-08-22',
    globalEstimatedArrival: '2027-01 (Winter)',
    bannerNameEn: 'Desert Horizons',
    bannerNameRu: 'Пустынные горизонты',
    featuredOperators: [
      { name: 'Pepe', charId: 'char_4138_pepe', rarity: 6, role: 'limited' },
      { name: 'Narantuya', charId: 'char_4139_narant', rarity: 6, role: 'standard' },
      { name: 'Sand Reckoner', charId: 'char_4142_sandr', rarity: 5, role: 'welfare' },
    ],
    shopItems: [
      { itemId: '4001', nameEn: 'LMD', nameRu: 'LMD (Юани)', nameCn: '龙门币', count: 500000, costPerItem: 1, tokenType: 'oasis_token' },
      { itemId: '2004', nameEn: 'Strategic Battle Record', nameRu: 'Стратегическая запись боя (T4)', nameCn: '高级作战记录', count: 100, costPerItem: 5, tokenType: 'oasis_token' },
      { itemId: 'mod_unlock_token', nameEn: 'Module Data Block', nameRu: 'Блок данных модуля', nameCn: '模组数据块', count: 4, costPerItem: 120, tokenType: 'oasis_token' },
      { itemId: '30064', nameEn: 'Optimized Device', nameRu: 'Улучшенный прибор (T4)', nameCn: '改量装置', count: 10, costPerItem: 45, tokenType: 'oasis_token' },
      { itemId: '30054', nameEn: 'Keton Colloid', nameRu: 'Коллоид кетона (T4)', nameCn: '酮阵列', count: 10, costPerItem: 40, tokenType: 'oasis_token' },
      { itemId: '31024', nameEn: 'Compound Cutting Fluid', nameRu: 'Смазочно-охлаждающая жидкость (T4)', nameCn: '切削原液', count: 10, costPerItem: 40, tokenType: 'oasis_token' },
    ],
    farmingStages: [
      { stageCode: 'SW-7', itemId: '30063', itemNameEn: 'Integrated Device', itemNameRu: 'Интегральный прибор (T3)', dropRatePercent: 72.1, apCost: 18, sanityPerItem: 25.0 },
      { stageCode: 'SW-8', itemId: '30053', itemNameEn: 'Aketon', itemNameRu: 'Акетон (T3)', dropRatePercent: 67.8, apCost: 21, sanityPerItem: 31.0 },
      { stageCode: 'SW-9', itemId: '31023', itemNameEn: 'Cutting Fluid Solution', itemNameRu: 'Раствор СОЖ (T3)', dropRatePercent: 63.9, apCost: 21, sanityPerItem: 32.8 },
    ],
    summaryEn: 'Sargon summer festival following Pepe and archaeological expeditions into deep ruins. Excellent device and aketon farming rates.',
    summaryRu: 'Летний фестиваль в Саргоне с участием Пепе и археологических экспедиций в древние руины. Исключительный фарм приборов и акетона.',
    summaryCn: '萨尔贡夏日探险，佩佩与考古队的古老遗迹之旅。极佳的改量装置与酮类掉落关卡。',
  },
  {
    id: 'act36side_babel',
    nameEn: 'Babel',
    nameRu: 'Babel (Вавилон)',
    nameCn: '巴别塔',
    type: 'side_story',
    status: 'upcoming_global',
    cnStartDate: '2026-04-11',
    cnEndDate: '2026-05-02',
    globalEstimatedArrival: '2026-10 (Coming next!)',
    bannerNameEn: 'Where the Fire Shines',
    bannerNameRu: 'Там где светит пламя',
    featuredOperators: [
      { name: 'Ascalon', charId: 'char_4130_ascaln', rarity: 6, role: 'standard' },
      { name: 'Aroma', charId: 'char_4131_aroma', rarity: 5, role: 'standard' },
      { name: 'Odda', charId: 'char_4132_odda', rarity: 5, role: 'welfare' },
    ],
    shopItems: [
      { itemId: '4001', nameEn: 'LMD', nameRu: 'LMD (Юани)', nameCn: '龙门币', count: 500000, costPerItem: 1, tokenType: 'babel_coin' },
      { itemId: '2004', nameEn: 'Strategic Battle Record', nameRu: 'Стратегическая запись боя (T4)', nameCn: '高级作战记录', count: 100, costPerItem: 5, tokenType: 'babel_coin' },
      { itemId: 'mod_unlock_token', nameEn: 'Module Data Block', nameRu: 'Блок данных модуля', nameCn: '模组数据块', count: 4, costPerItem: 120, tokenType: 'babel_coin' },
      { itemId: '30084', nameEn: 'Manganese Trioxide', nameRu: 'Оксид марганца (T4)', nameCn: '三水锰矿', count: 10, costPerItem: 40, tokenType: 'babel_coin' },
      { itemId: '30074', nameEn: 'White Horse Kohl', nameRu: 'Коль «Белый конь» (T4)', nameCn: '白马醇', count: 10, costPerItem: 40, tokenType: 'babel_coin' },
      { itemId: '31044', nameEn: 'Nucleic Crystal Sinter', nameRu: 'Ядерный кристаллоплав (T4)', nameCn: '晶体电子单元', count: 10, costPerItem: 45, tokenType: 'babel_coin' },
    ],
    farmingStages: [
      { stageCode: 'BB-6', itemId: '30083', itemNameEn: 'Manganese Ore', itemNameRu: 'Марганцевая руда (T3)', dropRatePercent: 74.0, apCost: 18, sanityPerItem: 24.3 },
      { stageCode: 'BB-7', itemId: '30073', itemNameEn: 'Loxic Kohl', itemNameRu: 'Локсический коль (T3)', dropRatePercent: 71.5, apCost: 18, sanityPerItem: 25.2 },
      { stageCode: 'BB-8', itemId: '31043', itemNameEn: 'Transmuted Salt', itemNameRu: 'Трансмутационная соль (T3)', dropRatePercent: 64.0, apCost: 21, sanityPerItem: 32.8 },
    ],
    summaryEn: 'The origins of Rhodes Island and the legendary organization Babel. Introduces top-tier Ambush Specialist Ascalon. Prime Manganese and Kohl farming stages.',
    summaryRu: 'История происхождения Острова Родос и легендарной организации Вавилон. Дебют сильнейшего 6★ Специалиста-засадника Ascalon. Лучший фарм марганца и коля.',
    summaryCn: '巴别塔前史揭秘，罗德岛建立的源头。顶级地刺干员阿斯卡纶实装。高效三水锰矿与白马醇农场。',
  },
  {
    id: 'act35side_wisadel_5th',
    nameEn: 'In Krätzeschall (5th Anniversary Celebration)',
    nameRu: 'In Krätzeschall (5-я Годовщина)',
    nameCn: '在喧嚣中',
    type: 'celebration',
    status: 'upcoming_global',
    cnStartDate: '2026-05-01',
    cnEndDate: '2026-05-22',
    globalEstimatedArrival: '2026-11 (Global 5th Anniv)',
    bannerNameEn: 'Remnant of the Victorious',
    bannerNameRu: 'Остаток победителя',
    featuredOperators: [
      { name: "Wis'adel", charId: 'char_1033_wisa', rarity: 6, role: 'limited' },
      { name: 'Logos', charId: 'char_4133_logos', rarity: 6, role: 'standard' },
      { name: 'Civilight Eterna', charId: 'char_4134_cve', rarity: 6, role: 'welfare' },
    ],
    shopItems: [
      { itemId: '4001', nameEn: 'LMD', nameRu: 'LMD (Юани)', nameCn: '龙门币', count: 600000, costPerItem: 1, tokenType: 'anniv_token' },
      { itemId: '2004', nameEn: 'Strategic Battle Record', nameRu: 'Стратегическая запись боя (T4)', nameCn: '高级作战记录', count: 150, costPerItem: 5, tokenType: 'anniv_token' },
      { itemId: 'mod_unlock_token', nameEn: 'Module Data Block', nameRu: 'Блок данных модуля', nameCn: '模组数据块', count: 6, costPerItem: 120, tokenType: 'anniv_token' },
      { itemId: '30014', nameEn: 'Orirock Concentration', nameRu: 'Очищенный орирок (T4)', nameCn: '提纯源岩', count: 15, costPerItem: 35, tokenType: 'anniv_token' },
      { itemId: '30024', nameEn: 'Sugar Lump', nameRu: 'Сахарный брусок (T4)', nameCn: '糖聚块', count: 15, costPerItem: 35, tokenType: 'anniv_token' },
      { itemId: '30115', nameEn: 'Polymerization Preparation', nameRu: 'Полимеризат (T5)', nameCn: '聚合剂', count: 3, costPerItem: 150, tokenType: 'anniv_token' },
      { itemId: '30125', nameEn: 'Bipolar Nanoflake', nameRu: 'Биполярные нанопластины (T5)', nameCn: '双极纳米片', count: 3, costPerItem: 150, tokenType: 'anniv_token' },
      { itemId: '30135', nameEn: 'D32 Steel', nameRu: 'Сталь D32 (T5)', nameCn: 'D32钢', count: 3, costPerItem: 150, tokenType: 'anniv_token' },
    ],
    farmingStages: [
      { stageCode: '14-11', itemId: '30013', itemNameEn: 'Orirock Cluster', itemNameRu: 'Группа орирока (T3)', dropRatePercent: 82.0, apCost: 18, sanityPerItem: 22.0 },
      { stageCode: '14-17', itemId: '30023', itemNameEn: 'Sugar Pack', itemNameRu: 'Пачка сахара (T3)', dropRatePercent: 73.0, apCost: 18, sanityPerItem: 24.6 },
      { stageCode: '14-20', itemId: '30033', itemNameEn: 'Polyester Pack', itemNameRu: 'Пачка полиэстера (T3)', dropRatePercent: 70.0, apCost: 21, sanityPerItem: 30.0 },
    ],
    summaryEn: 'Massive 5th Anniversary event. Introducing game-breaking limited Sniper Wisadel (W Alter) and Primal Caster Logos, along with free 6-star Supporter Civilight Eterna (Theresa). Highest tier event shop rewards of the year.',
    summaryRu: 'Масштабная 5-я годовщина Arknights. Дебют сильнейшего лимитированного Снайпера Wisadel (W Alter), Кастера Logos и бесплатного 6★ Саппорта Civilight Eterna (Тереза). Богатейший ивентовый магазин года.',
    summaryCn: '五周年重磅庆典。超神限定狙击干员维什戴尔（异格W）与本源术师逻各斯，及免费六星辅助干员魔王（特蕾西娅）。全年最丰厚商店奖励。',
  },
  {
    id: 'act34side_here_a_people_sows',
    nameEn: 'Here A People Sows (Spring Festival 2026)',
    nameRu: 'Here A People Sows (Новогодний фестиваль)',
    nameCn: '怀黍离',
    type: 'celebration',
    status: 'past_cn_6m',
    cnStartDate: '2026-02-01',
    cnEndDate: '2026-02-22',
    globalStartDate: '2026-07-30',
    globalEndDate: '2026-08-20',
    bannerNameEn: 'Abundance in the Grain',
    bannerNameRu: 'Изобилие в зерне',
    featuredOperators: [
      { name: 'Shu', charId: 'char_4135_shu', rarity: 6, role: 'limited' },
      { name: 'Zuo Le', charId: 'char_4136_zuole', rarity: 6, role: 'standard' },
      { name: 'Wanqing', charId: 'char_4137_wanq', rarity: 5, role: 'welfare' },
    ],
    shopItems: [
      { itemId: '4001', nameEn: 'LMD', nameRu: 'LMD (Юани)', nameCn: '龙门币', count: 500000, costPerItem: 1, tokenType: 'grain_token' },
      { itemId: '2004', nameEn: 'Strategic Battle Record', nameRu: 'Стратегическая запись боя (T4)', nameCn: '高级作战记录', count: 100, costPerItem: 5, tokenType: 'grain_token' },
      { itemId: 'mod_unlock_token', nameEn: 'Module Data Block', nameRu: 'Блок данных модуля', nameCn: '模组数据块', count: 4, costPerItem: 120, tokenType: 'grain_token' },
      { itemId: '30044', nameEn: 'Oriron Block', nameRu: 'Блок орижелеза (T4)', nameCn: '异铁块', count: 10, costPerItem: 45, tokenType: 'grain_token' },
      { itemId: '30064', nameEn: 'Optimized Device', nameRu: 'Улучшенный прибор (T4)', nameCn: '改量装置', count: 10, costPerItem: 45, tokenType: 'grain_token' },
    ],
    farmingStages: [
      { stageCode: 'HS-7', itemId: '30043', itemNameEn: 'Oriron Cluster', itemNameRu: 'Группа орижелеза (T3)', dropRatePercent: 70.2, apCost: 18, sanityPerItem: 25.6 },
      { stageCode: 'HS-8', itemId: '30063', itemNameEn: 'Integrated Device', itemNameRu: 'Интегральный прибор (T3)', dropRatePercent: 71.8, apCost: 18, sanityPerItem: 25.1 },
      { stageCode: 'HS-9', itemId: '31033', itemNameEn: 'Compound Salt', itemNameRu: 'Комплексная соль (T3)', dropRatePercent: 66.0, apCost: 21, sanityPerItem: 31.8 },
    ],
    summaryEn: 'Sui sibling agricultural festival in Yan, featuring limited Defender Shu and Liberator Guard Zuo Le. Outstanding Device and Oriron farming.',
    summaryRu: 'Фестиваль земледелия братьев и сестер Суй в Яне. Лимитированный Защитник Shu и Гвардеец Zuo Le. Прекрасный фарм железа и приборов.',
    summaryCn: '岁兽农业新春盛典，限定重装舒与近卫左乐。优秀异铁与装置掉落关卡。',
  },
  {
    id: 'act33side_zwillingsturme_rerun',
    nameEn: 'Zwillingstürme im Herbst (Rerun)',
    nameRu: 'Zwillingstürme im Herbst (Реран)',
    nameCn: '秋日双塔（复刻）',
    type: 'rerun',
    status: 'past_cn_6m',
    cnStartDate: '2026-03-05',
    cnEndDate: '2026-03-19',
    globalEstimatedArrival: '2026-09 (Completed)',
    bannerNameEn: 'Sunset of Leithanien',
    bannerNameRu: 'Закат Лейтании',
    featuredOperators: [
      { name: 'Arturia (Virtuosa)', charId: 'char_1032_virtua', rarity: 6, role: 'limited' },
      { name: 'Viviana', charId: 'char_4130_vivian', rarity: 6, role: 'standard' },
      { name: 'Lessing', charId: 'char_4131_lessing', rarity: 6, role: 'welfare' },
    ],
    shopItems: [
      { itemId: '4001', nameEn: 'LMD', nameRu: 'LMD (Юани)', nameCn: '龙门币', count: 300000, costPerItem: 1, tokenType: 'leith_token' },
      { itemId: '2004', nameEn: 'Strategic Battle Record', nameRu: 'Стратегическая запись боя (T4)', nameCn: '高级作战记录', count: 80, costPerItem: 5, tokenType: 'leith_token' },
      { itemId: '30054', nameEn: 'Keton Colloid', nameRu: 'Коллоид кетона (T4)', nameCn: '酮阵列', count: 8, costPerItem: 40, tokenType: 'leith_token' },
      { itemId: '30034', nameEn: 'Polyester Lump', nameRu: 'Блок полиэстера (T4)', nameCn: '聚酸酯块', count: 8, costPerItem: 40, tokenType: 'leith_token' },
    ],
    farmingStages: [
      { stageCode: 'ZT-7', itemId: '30053', itemNameEn: 'Aketon', itemNameRu: 'Акетон (T3)', dropRatePercent: 71.0, apCost: 18, sanityPerItem: 25.3 },
      { stageCode: 'ZT-8', itemId: '30033', itemNameEn: 'Polyester Pack', itemNameRu: 'Пачка полиэстера (T3)', dropRatePercent: 68.0, apCost: 18, sanityPerItem: 26.5 },
      { stageCode: 'ZT-9', itemId: '31013', itemNameEn: 'Semi-Synthetic Solvent', itemNameRu: 'Полусинтетический растворитель (T3)', dropRatePercent: 64.0, apCost: 21, sanityPerItem: 32.8 },
    ],
    summaryEn: 'Leithanien musical catastrophe rerun. Fast shop exchange rates with strong farming for Aketon and Polyester.',
    summaryRu: 'Реран музыкальной трагедии Лейтании. Ускоренный обмен магазина и эффективный фарм акетона и полиэстера.',
    summaryCn: '莱塔尼亚音乐盛典复刻。紧凑商店与高效率酮化剂、聚酸酯刷取。',
  },
];
