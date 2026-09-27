export interface MaterialTranslation {
  en: string;
  ru: string;
}

export const MATERIAL_TRANSLATIONS: Record<string, MaterialTranslation> = {
  // LMD & EXP
  '4001': { en: 'LMD', ru: 'LMD (Юани)' },
  '2001': { en: 'Drill Battle Record', ru: 'Учебная запись боя (EXP 200)' },
  '2002': { en: 'Frontline Battle Record', ru: 'Фронтовая запись боя (EXP 400)' },
  '2003': { en: 'Tactical Battle Record', ru: 'Тактическая запись боя (EXP 1000)' },
  '2004': { en: 'Strategic Battle Record', ru: 'Стратегическая запись боя (EXP 2000)' },

  // Skill Summaries
  '3301': { en: 'Skill Summary - 1', ru: 'Сводка навыков · Том 1' },
  '3302': { en: 'Skill Summary - 2', ru: 'Сводка навыков · Том 2' },
  '3303': { en: 'Skill Summary - 3', ru: 'Сводка навыков · Том 3' },

  // Module Tokens
  mod_unlock_token: { en: 'Module Data Block', ru: 'Блок данных модуля' },
  mod_update_token_1: { en: 'Data Supplement Stick', ru: 'Стержень усиления данных' },
  mod_update_token_2: { en: 'Data Supplement Instrument', ru: 'Инструмент усиления данных' },

  // Chip Catalyst
  '32001': { en: 'Chip Catalyst', ru: 'Катализатор фишек' },

  // Class Chips (T1, T2 Chip Pack, T3 Dual Chip)
  '3211': { en: 'Vanguard Chip', ru: 'Фишка Авангарда' },
  '3212': { en: 'Vanguard Chip Pack', ru: 'Набор фишек Авангарда' },
  '3213': { en: 'Vanguard Dualchip', ru: 'Двойная фишка Авангарда' },

  '3221': { en: 'Guard Chip', ru: 'Фишка Гвардейца' },
  '3222': { en: 'Guard Chip Pack', ru: 'Набор фишек Гвардейца' },
  '3223': { en: 'Guard Dualchip', ru: 'Двойная фишка Гвардейца' },

  '3231': { en: 'Defender Chip', ru: 'Фишка Защитника' },
  '3232': { en: 'Defender Chip Pack', ru: 'Набор фишек Защитника' },
  '3233': { en: 'Defender Dualchip', ru: 'Двойная фишка Защитника' },

  '3241': { en: 'Sniper Chip', ru: 'Фишка Снайпера' },
  '3242': { en: 'Sniper Chip Pack', ru: 'Набор фишек Снайпера' },
  '3243': { en: 'Sniper Dualchip', ru: 'Двойная фишка Снайпера' },

  '3251': { en: 'Caster Chip', ru: 'Фишка Кастера' },
  '3252': { en: 'Caster Chip Pack', ru: 'Набор фишек Кастера' },
  '3253': { en: 'Caster Dualchip', ru: 'Двойная фишка Кастера' },

  '3261': { en: 'Medic Chip', ru: 'Фишка Медика' },
  '3262': { en: 'Medic Chip Pack', ru: 'Набор фишек Медика' },
  '3263': { en: 'Medic Dualchip', ru: 'Двойная фишка Медика' },

  '3271': { en: 'Supporter Chip', ru: 'Фишка Саппорта' },
  '3272': { en: 'Supporter Chip Pack', ru: 'Набор фишек Саппорта' },
  '3273': { en: 'Supporter Dualchip', ru: 'Двойная фишка Саппорта' },

  '3281': { en: 'Specialist Chip', ru: 'Фишка Специалиста' },
  '3282': { en: 'Specialist Chip Pack', ru: 'Набор фишек Специалиста' },
  '3283': { en: 'Specialist Dualchip', ru: 'Двойная фишка Специалиста' },

  // Tier 1 - 5 Materials
  // Orirock
  '30011': { en: 'Orirock', ru: 'Орирок' },
  '30012': { en: 'Orirock Cube', ru: 'Кубик орирока' },
  '30013': { en: 'Orirock Cluster', ru: 'Группа орирока' },
  '30014': { en: 'Orirock Concentration', ru: 'Очищенный орирок' },
  '30115': { en: 'Polymerization Preparation', ru: 'Полимеризат' },

  // Sugar
  '30021': { en: 'Sugar Substitute', ru: 'Сахарозаменитель' },
  '30022': { en: 'Sugar', ru: 'Сахар' },
  '30023': { en: 'Sugar Pack', ru: 'Пачка сахара' },
  '30024': { en: 'Sugar Lump', ru: 'Сахарный брусок' },

  // Ester / Polyester
  '30031': { en: 'Ester', ru: 'Сырой эфир' },
  '30032': { en: 'Polyester', ru: 'Полиэстер' },
  '30033': { en: 'Polyester Pack', ru: 'Пачка полиэстера' },
  '30034': { en: 'Polyester Lump', ru: 'Блок полиэстера' },

  // Oriron
  '30041': { en: 'Oriron Shard', ru: 'Осколок орижелеза' },
  '30042': { en: 'Oriron', ru: 'Орижелезо' },
  '30043': { en: 'Oriron Cluster', ru: 'Группа орижелеза' },
  '30044': { en: 'Oriron Block', ru: 'Блок орижелеза' },
  '30125': { en: 'Bipolar Nanoflake', ru: 'Биполярные нанопластины' },

  // Keton
  '30051': { en: 'Diketon', ru: 'Дикетон' },
  '30052': { en: 'Polyketon', ru: 'Поликетон' },
  '30053': { en: 'Aketon', ru: 'Акетон' },
  '30054': { en: 'Keton Colloid', ru: 'Коллоид кетона' },

  // Device
  '30061': { en: 'Damaged Device', ru: 'Сломанный прибор' },
  '30062': { en: 'Device', ru: 'Прибор' },
  '30063': { en: 'Integrated Device', ru: 'Интегральный прибор' },
  '30064': { en: 'Optimized Device', ru: 'Улучшенный прибор' },
  '30135': { en: 'D32 Steel', ru: 'Сталь D32' },

  // Kohl
  '30073': { en: 'Loxic Kohl', ru: 'Локсический уголь' },
  '30074': { en: 'White Horse Kohl', ru: 'Белогривый уголь' },

  // Manganese
  '30083': { en: 'Manganese Ore', ru: 'Марганцевая руда' },
  '30084': { en: 'Manganese Trihydrate', ru: 'Тригидрат марганца' },

  // Grindstone
  '30093': { en: 'Grindstone', ru: 'Точильный камень' },
  '30094': { en: 'Grindstone Pentahydrate', ru: 'Пентагидрат точильного камня' },

  // RMA70
  '30103': { en: 'RMA70-12', ru: 'RMA70-12' },
  '30104': { en: 'RMA70-24', ru: 'RMA70-24' },

  // T5 Synthetics
  '30145': { en: 'Crystalline Electronic Unit', ru: 'Кристаллический электронный блок' },
  '30155': { en: 'Nucleic Crystal Sinter', ru: 'Спекшийся нуклеарный кристалл' },
  '30165': { en: 'Rephasic Enantiomer', ru: 'Рефазный энантиомер' },

  // Gel
  '31013': { en: 'Coagulating Gel', ru: 'Коагулирующий гель' },
  '31014': { en: 'Polymerized Gel', ru: 'Полимеризованный гель' },

  // Alloy
  '31023': { en: 'Incandescent Alloy', ru: 'Накальный сплав' },
  '31024': { en: 'Incandescent Alloy Block', ru: 'Блок накального сплава' },

  // Crystalline
  '31033': { en: 'Crystalline Component', ru: 'Кристаллический компонент' },
  '31034': { en: 'Crystalline Circuit', ru: 'Кристаллическая схема' },

  // Solvent
  '31043': { en: 'Semi-Synthetic Solvent', ru: 'Полусинтетический растворитель' },
  '31044': { en: 'Refined Solvent', ru: 'Очищенный растворитель' },

  // Cutting Fluid
  '31053': { en: 'Compound Cutting Fluid', ru: 'Составная СОЖ' },
  '31054': { en: 'Cutting Fluid Solution', ru: 'Раствор СОЖ' },

  // Salt
  '31063': { en: 'Transmuted Salt', ru: 'Трансмутированная соль' },
  '31064': { en: 'Transmuted Salt Agglomerate', ru: 'Агломерат соли' },

  // Fiber
  '31073': { en: 'Fuscous Fiber', ru: 'Бурое волокно' },
  '31074': { en: 'Solidified Fiber Board', ru: 'Панель из волокна' },

  // Cyclicene
  '31083': { en: 'Aggregate Cyclicene', ru: 'Циклицен' },
  '31084': { en: 'Cyclicene Prefab', ru: 'Заготовка из циклицена' },

  // Nodule / Refractor
  '31093': { en: 'Coagulative Nodule', ru: 'Коагуляционный узелок' },
  '31094': { en: 'Chiral Refractor', ru: 'Хиральный рефрактор' },

  // Gas / Ether
  '31103': { en: 'Liquefied High-Energy Gas', ru: 'Сжиженный высокоэнергетический газ' },
  '31104': { en: 'Liquefied Ether Sorbate', ru: 'Сжиженный эфирный сорбат' },

  // Electrode / Dynamic Unit
  '31113': { en: 'Electrode Unit', ru: 'Электродный блок' },
  '31114': { en: 'Energy Dynamic Unit', ru: 'Энергетический силовой блок' },
};

export function getLocalizedItemName(itemId: string, lang: 'ru' | 'en' = 'ru'): string | null {
  const item = MATERIAL_TRANSLATIONS[itemId];
  if (!item) return null;
  return lang === 'ru' ? item.ru : item.en;
}

export const POPULAR_OPERATOR_RU_ALIASES: Record<string, string[]> = {
  char_1035_wisdel: ['вишадель', 'вишдель', 'виш'],
  char_4133_logos: ['логос'],
  char_4145_ulpia: ['ульпиан', 'ульпиус'],
  char_2025_shu: ['шу'],
  char_003_kalts: ['кальцит', 'калцит'],
  char_1028_texas2: ['тексас', 'техас'],
  char_1033_swire2: ['свайр', 'свайер'],
  char_377_gdglow: ['голденглоу', 'гг'],
  char_2012_typhon: ['тифон'],
  char_172_svrash: ['сильвераш', 'серебро'],
  char_1034_jesca2: ['джессика'],
  char_180_amnn: ['амия', 'эмия'],
  char_2023_ling: ['линг'],
  char_1023_mlynar: ['млынар'],
  char_4009_irene: ['айрин', 'ирен'],
  char_293_thorns: ['торнс', 'тернс'],
  char_350_surtr: ['суртр'],
  char_1026_gvial2: ['гавиаль', 'гавиал'],
  char_2014_nian: ['ниан'],
  char_2015_dusk: ['даск'],
  char_1029_yato2: ['ято'],
  char_1030_noire2: ['нуар'],
  char_4146_nymph: ['нимфа'],
};

export function normalizeSearchString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics: š -> s
    .toLowerCase()
    .trim();
}

/**
 * Validates if an item is a genuine upgrade/craft material
 * Excludes operator potentials, duplicate tokens, vouchers, furniture, etc.
 */
export function isCraftResource(itemId: string): boolean {
  if (!itemId) return false;
  // Explicitly defined materials
  if (MATERIAL_TRANSLATIONS[itemId]) return true;

  // LMD
  if (itemId === '4001') return true;

  // Battle Records
  if (['2001', '2002', '2003', '2004'].includes(itemId)) return true;

  // Module Tokens
  if (itemId.startsWith('mod_') && itemId.includes('token')) return true;

  // Chips & Chip Catalyst
  if (itemId === '32001') return true;
  if (itemId.startsWith('32') && itemId.length === 4) return true;

  // Skill Summaries
  if (itemId.startsWith('33') && itemId.length === 4) return true;

  // Tier 1 - 5 Materials (30xxx, 31xxx)
  if ((itemId.startsWith('30') || itemId.startsWith('31')) && itemId.length === 5) return true;

  return false;
}
