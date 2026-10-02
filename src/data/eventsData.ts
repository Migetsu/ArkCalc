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

export interface EventOperatorAvatar {
  charId: string;
  name: string;
  rarity: 5 | 6;
  role?: 'limited' | 'standard' | 'welfare';
}

export interface ArknightsEvent {
  id: string;
  nameEn: string;
  nameRu: string;
  nameCn: string;
  headerTagEn: string;
  headerTagRu: string;
  headerTagCn: string;
  type: 'side_story' | 'story_collection' | 'intermezzi' | 'rerun' | 'cc' | 'trials' | 'celebration' | 'headhunting';
  status: 'cn_active' | 'upcoming_global' | 'global_active' | 'past_cn_6m';
  bannerPosterUrl: string;
  cnStartDate: string;
  cnEndDate: string;
  globalStartDate?: string;
  globalEndDate?: string;
  globalEstimatedArrival?: string;
  prompt6En?: string;
  prompt6Ru?: string;
  prompt6Cn?: string;
  sixStarOps: EventOperatorAvatar[];
  prompt5En?: string;
  prompt5Ru?: string;
  prompt5Cn?: string;
  fiveStarOps: EventOperatorAvatar[];
  shopItems: EventShopItem[];
  farmingStages: EventFarmingStage[];
  summaryEn: string;
  summaryRu: string;
  summaryCn: string;
}

export const ARKNIGHTS_EVENTS: ArknightsEvent[] = [
  {
    id: 'act38_orienteering_8',
    nameEn: 'Orienteering #8 (Directional Selection)',
    nameRu: 'Orienteering #8 (Выборочный хедхантинг)',
    nameCn: '定向甄选 #8',
    headerTagEn: '[Standard Headhunting] Orienteering #8',
    headerTagRu: '[Стандартный Хедхантинг] Orienteering #8',
    headerTagCn: '[常驻定向甄选] 第八期',
    type: 'headhunting',
    status: 'cn_active',
    bannerPosterUrl: '/banners/banner_orienteering_8.png',
    cnStartDate: '2026/09/29',
    cnEndDate: '2026/10/13',
    globalEstimatedArrival: '2027/03',
    prompt6En: 'Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.',
    prompt6Ru: 'Выберите трёх из следующих 6★ Оперативников: только они будут выпадать среди 6★ в данном баннере.',
    prompt6Cn: '可选定3名六星干员概率提升；此卡池仅会出现选定的六星干员。',
    sixStarOps: [
      { charId: 'char_4087_ines', name: 'Ines', rarity: 6, role: 'standard' },
      { charId: 'char_4088_hodrer', name: 'Hoederer', rarity: 6, role: 'standard' },
      { charId: 'char_2012_typhon', name: 'Typhon', rarity: 6, role: 'standard' },
      { charId: 'char_1032_excu2', name: 'Executor the Ex Foedere', rarity: 6, role: 'standard' },
      { charId: 'char_4098_vvana', name: 'Viviana', rarity: 6, role: 'standard' },
      { charId: 'char_4116_blkkgt', name: 'Degenbrecher', rarity: 6, role: 'standard' },
    ],
    prompt5En: 'Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.',
    prompt5Ru: 'Выберите трёх из следующих 5★ Оперативников: у них будет 60% шанс выпадения среди 5★.',
    prompt5Cn: '可选定3名五星干员概率提升；在抽到五星干员时有60%概率为选定干员。',
    fiveStarOps: [
      { charId: 'char_4015_spuria', name: 'Spuria', rarity: 5, role: 'standard' },
      { charId: 'char_4105_almond', name: 'Almond', rarity: 5, role: 'standard' },
      { charId: 'char_4102_threye', name: 'Valarqvin', rarity: 5, role: 'standard' },
      { charId: 'char_494_vendla', name: 'Vendela', rarity: 5, role: 'standard' },
      { charId: 'char_464_cement', name: 'Cement', rarity: 5, role: 'standard' },
      { charId: 'char_4109_baslin', name: 'Bassline', rarity: 5, role: 'standard' },
    ],
    shopItems: [
      { itemId: '4001', nameEn: 'LMD', nameRu: 'LMD (Юани)', nameCn: '龙门币', count: 300000, costPerItem: 1, tokenType: 'headhunt_token' },
      { itemId: '2004', nameEn: 'Strategic Battle Record', nameRu: 'Стратегическая запись боя (T4)', nameCn: '高级作战记录', count: 80, costPerItem: 5, tokenType: 'headhunt_token' },
      { itemId: 'mod_unlock_token', nameEn: 'Module Data Block', nameRu: 'Блок данных модуля', nameCn: '模组数据块', count: 2, costPerItem: 120, tokenType: 'headhunt_token' },
      { itemId: '30064', nameEn: 'Optimized Device', nameRu: 'Улучшенный прибор (T4)', nameCn: '改量装置', count: 5, costPerItem: 45, tokenType: 'headhunt_token' },
      { itemId: '30014', nameEn: 'Orirock Concentration', nameRu: 'Очищенный орирок (T4)', nameCn: '提纯源岩', count: 5, costPerItem: 35, tokenType: 'headhunt_token' },
    ],
    farmingStages: [
      { stageCode: '1-7', itemId: '30012', itemNameEn: 'Orirock Cube', itemNameRu: 'Куб орирока (T2)', dropRatePercent: 125.0, apCost: 6, sanityPerItem: 4.8 },
      { stageCode: 'S4-1', itemId: '30042', itemNameEn: 'Oriron', itemNameRu: 'Орижелезо (T2)', dropRatePercent: 82.0, apCost: 15, sanityPerItem: 18.2 },
    ],
    summaryEn: 'Special targeted headhunting banner where players customize their rate-up pool by selecting 3 out of 6 elite 6-star operators and 3 out of 6 5-star operators.',
    summaryRu: 'Особый баннер направленного поиска оперативников (Orienteering #8). Позволяет выбрать 3 из 6 представленных 6★ оперативников и 3 из 6 представленных 5★ для персонального повышенного шанса.',
    summaryCn: '定向甄选特别寻访活动，玩家可从6位六星干员中任选3位、6位五星干员中任选3位定制专属UP卡池。',
  },
  {
    id: 'act38side_lappland',
    nameEn: 'I Portatori dei Velluti (Bearers of the Velvet)',
    nameRu: 'I Portatori dei Velluti (Носители бархата)',
    nameCn: '引路者与背誓之人',
    headerTagEn: '[Celebration] I Portatori dei Velluti',
    headerTagRu: '[Празднование] I Portatori dei Velluti',
    headerTagCn: '[叙拉古感谢庆典] 引路者与背誓之人',
    type: 'celebration',
    status: 'cn_active',
    bannerPosterUrl: '/banners/banner_act38side_lappland.png',
    cnStartDate: '2026/09/25',
    cnEndDate: '2026/10/16',
    globalEstimatedArrival: '2027/03 (Spring)',
    prompt6En: 'Featured 6★ Operators in Siracusa Celebration banner:',
    prompt6Ru: 'Ключевые 6★ Оперативники праздничного баннера в Сиракузах:',
    prompt6Cn: '叙拉古庆典限定卡池六星干员：',
    sixStarOps: [
      { charId: 'char_1041_lappd2', name: 'Lappland the Decadenza', rarity: 6, role: 'limited' },
      { charId: 'char_4226_veen', name: 'Vincenzo', rarity: 6, role: 'standard' },
      { charId: 'char_4228_closur', name: 'Crownslayer', rarity: 6, role: 'welfare' },
    ],
    prompt5En: 'Featured 5★ Operators and Event Welfare:',
    prompt5Ru: 'Ключевые 5★ Оперативники и бесплатные персонажи ивента:',
    prompt5Cn: '庆典卡池五星干员及活动赠送：',
    fiveStarOps: [
      { charId: 'char_4142_sandr', name: 'Sand Reckoner', rarity: 5, role: 'welfare' },
      { charId: 'char_4105_almond', name: 'Almond', rarity: 5, role: 'standard' },
      { charId: 'char_4122_grabds', name: 'Grain Buds', rarity: 5, role: 'standard' },
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
    nameEn: 'Adventure That Cannot Wait for the Sun',
    nameRu: 'Adventure That Cannot Wait for the Sun (Летний ивент)',
    nameCn: '太阳落下的地方',
    headerTagEn: '[Summer Event] Adventure That Cannot Wait for the Sun',
    headerTagRu: '[Летнее Событие] Приключение, не ждущее рассвета',
    headerTagCn: '[夏日嘉年华] 太阳落下的地方',
    type: 'side_story',
    status: 'upcoming_global',
    bannerPosterUrl: '/banners/banner_act37side_sunken_waves.png',
    cnStartDate: '2026/08/01',
    cnEndDate: '2026/08/22',
    globalEstimatedArrival: '2027/01 (Winter)',
    prompt6En: 'Featured 6★ Operators in Summer Carnival:',
    prompt6Ru: 'Ключевые 6★ Оперативники летнего карнавала:',
    prompt6Cn: '夏日嘉年华六星限定与标准干员：',
    sixStarOps: [
      { charId: 'char_1037_pepe', name: 'Pepe', rarity: 6, role: 'limited' },
      { charId: 'char_1033_narant', name: 'Narantuya', rarity: 6, role: 'standard' },
    ],
    prompt5En: 'Featured 5★ Operators:',
    prompt5Ru: 'Ключевые 5★ Оперативники события:',
    prompt5Cn: '五星干员：',
    fiveStarOps: [
      { charId: 'char_4142_sandr', name: 'Sand Reckoner', rarity: 5, role: 'welfare' },
      { charId: 'char_4079_haini', name: 'Lucilla', rarity: 5, role: 'standard' },
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
    headerTagEn: '[Side Story] Babel',
    headerTagRu: '[Сюжетное Событие] Вавилон',
    headerTagCn: '[SideStory] 巴别塔',
    type: 'side_story',
    status: 'upcoming_global',
    bannerPosterUrl: '/banners/banner_act36side_babel.png',
    cnStartDate: '2026/04/11',
    cnEndDate: '2026/05/02',
    globalEstimatedArrival: '2026/10 (Coming next!)',
    prompt6En: 'Featured 6★ Operator in Babel banner:',
    prompt6Ru: 'Ключевой 6★ Оперативник баннера Вавилона:',
    prompt6Cn: '巴别塔专属卡池六星干员：',
    sixStarOps: [
      { charId: 'char_2023_aska', name: 'Ascalon', rarity: 6, role: 'standard' },
    ],
    prompt5En: 'Featured 5★ Operators:',
    prompt5Ru: 'Ключевые 5★ Оперативники:',
    prompt5Cn: '五星干员：',
    fiveStarOps: [
      { charId: 'char_4110_delphn', name: 'Delphine', rarity: 5, role: 'standard' },
      { charId: 'char_498_inside', name: 'Insider', rarity: 5, role: 'welfare' },
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
    nameEn: 'In Krätzeschall (Episode 14 - 5th Anniversary)',
    nameRu: 'In Krätzeschall (Эпизод 14 - 5-я Годовщина)',
    nameCn: '慈悲灯塔（五周年庆典）',
    headerTagEn: '[Celebration] In Krätzeschall (5th Anniversary)',
    headerTagRu: '[5-я Годовщина] In Krätzeschall (Маяк милосердия)',
    headerTagCn: '[五周年特别感谢] 慈悲灯塔',
    type: 'celebration',
    status: 'upcoming_global',
    bannerPosterUrl: '/banners/banner_act35side_wisadel.png',
    cnStartDate: '2026/05/01',
    cnEndDate: '2026/05/22',
    globalEstimatedArrival: '2026/11 (Global 5th Anniv)',
    prompt6En: 'Featured 6★ Operators in 5th Anniversary banner:',
    prompt6Ru: 'Ключевые 6★ Оперативники баннера 5-й Годовщины:',
    prompt6Cn: '五周年重磅卡池六星干员：',
    sixStarOps: [
      { charId: 'char_1035_wisdel', name: "Wis'adel", rarity: 6, role: 'limited' },
      { charId: 'char_1036_logos', name: 'Logos', rarity: 6, role: 'standard' },
      { charId: 'char_4134_cve', name: 'Civilight Eterna', rarity: 6, role: 'welfare' },
    ],
    prompt5En: 'Featured 5★ Operators:',
    prompt5Ru: 'Ключевые 5★ Оперативники:',
    prompt5Cn: '五星干员：',
    fiveStarOps: [
      { charId: 'char_4015_spuria', name: 'Spuria', rarity: 5, role: 'standard' },
      { charId: 'char_4079_haini', name: 'Lucilla', rarity: 5, role: 'standard' },
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
    summaryEn: 'Massive 5th Anniversary celebration event. Introducing game-breaking limited Sniper Wisadel (W Alter) and Primal Caster Logos, along with free 6-star Supporter Civilight Eterna (Theresa). Highest tier event shop rewards of the year.',
    summaryRu: 'Масштабная 5-я годовщина Arknights. Дебют сильнейшего лимитированного Снайпера Wisadel (W Alter), Кастера Logos и бесплатного 6★ Саппорта Civilight Eterna (Тереза). Богатейший ивентовый магазин года.',
    summaryCn: '五周年重磅庆典。超神限定狙击干员维什戴尔（异格W）与本源术师逻各斯，及免费六星辅助干员魔王（特蕾西娅）。全年最丰厚商店奖励。',
  },
  {
    id: 'act34side_here_a_people_sows',
    nameEn: 'Here A People Sows (Spring Festival 2026)',
    nameRu: 'Here A People Sows (Новогодний фестиваль)',
    nameCn: '怀黍离',
    headerTagEn: '[Celebration] Here A People Sows',
    headerTagRu: '[Новогодний Фестиваль] Here A People Sows',
    headerTagCn: '[春节庆典] 怀黍离',
    type: 'celebration',
    status: 'past_cn_6m',
    bannerPosterUrl: '/banners/banner_act34side_shu.png',
    cnStartDate: '2026/02/01',
    cnEndDate: '2026/02/22',
    globalStartDate: '2026/07/30',
    globalEndDate: '2026/08/20',
    prompt6En: 'Featured 6★ Operators in Spring Festival banner:',
    prompt6Ru: 'Ключевые 6★ Оперативники новогоднего баннера Суй:',
    prompt6Cn: '岁兽新春限定卡池六星干员：',
    sixStarOps: [
      { charId: 'char_4135_shu', name: 'Shu', rarity: 6, role: 'limited' },
      { charId: 'char_4136_zuole', name: 'Zuo Le', rarity: 6, role: 'standard' },
    ],
    prompt5En: 'Featured 5★ Operators:',
    prompt5Ru: 'Ключевые 5★ Оперативники события:',
    prompt5Cn: '五星干员：',
    fiveStarOps: [
      { charId: 'char_4137_wanq', name: 'Wanqing', rarity: 5, role: 'welfare' },
      { charId: 'char_4122_grabds', name: 'Grain Buds', rarity: 5, role: 'standard' },
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
    nameCn: '崔林特尔梅之秋（复刻）',
    headerTagEn: '[Rerun] Zwillingstürme im Herbst',
    headerTagRu: '[Реран] Осенние башни-близнецы',
    headerTagCn: '[复刻] 崔林特尔梅之秋',
    type: 'rerun',
    status: 'past_cn_6m',
    bannerPosterUrl: '/banners/banner_act33side_arturia_rerun.png',
    cnStartDate: '2026/03/05',
    cnEndDate: '2026/03/19',
    globalEstimatedArrival: '2026/09 (Completed)',
    prompt6En: 'Featured 6★ Operators in Leithanien Rerun:',
    prompt6Ru: 'Ключевые 6★ Оперативники рерана Лейтании:',
    prompt6Cn: '莱塔尼亚复刻卡池六星干员：',
    sixStarOps: [
      { charId: 'char_1032_virtua', name: 'Arturia (Virtuosa)', rarity: 6, role: 'limited' },
      { charId: 'char_4098_vvana', name: 'Viviana', rarity: 6, role: 'standard' },
      { charId: 'char_4131_lessing', name: 'Lessing', rarity: 6, role: 'welfare' },
    ],
    prompt5En: 'Featured 5★ Operators:',
    prompt5Ru: 'Ключевые 5★ Оперативники:',
    prompt5Cn: '五星干员：',
    fiveStarOps: [
      { charId: 'char_4109_baslin', name: 'Bassline', rarity: 5, role: 'welfare' },
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
