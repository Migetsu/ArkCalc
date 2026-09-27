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

export const OPERATOR_CANONICAL_EN_NAMES: Record<string, string> = {
  char_197_poca: 'Rosa',
  char_4055_bgsnow: 'Pozëmka',
  char_4226_veen: 'Vii',
  char_196_sunbr: 'Gummy',
  char_115_headbr: 'Zima',
  char_195_glassb: 'Istina',
  char_194_leto: 'Leto',
  char_4208_wintim: 'Snegurochka',
  char_4224_turdus: 'Ukusik',
  char_4207_branch: 'Vetochki',
  char_4223_botany: 'Botani',
  char_4000_jnight: 'Justice Knight',
  char_616_pithst: 'Pith',
  char_617_sharp2: 'Sharp',
  char_1052_kalts2: "Kal'tsit the Esperanta",
};

export const POPULAR_OPERATOR_RU_ALIASES: Record<string, string[]> = {
  char_197_poca: ['роса', 'пока', 'роза'],
  char_4055_bgsnow: ['поземка', 'позёмка', 'позема', 'поземыч'],
  char_4226_veen: ['вий'],
  char_196_sunbr: ['гумми', 'гум'],
  char_115_headbr: ['зима'],
  char_195_glassb: ['истина'],
  char_194_leto: ['лето'],
  char_4208_wintim: ['снегурочка'],
  char_4224_turdus: ['укусик'],
  char_4207_branch: ['веточки'],
  char_4223_botany: ['ботани'],
  char_1035_wisdel: ['вишадель', 'вишдель', 'виш', 'вися'],
  char_4133_logos: ['логос'],
  char_4145_ulpia: ['ульпиан', 'ульпиус'],
  char_2025_shu: ['шу'],
  char_003_kalts: ['кальцит', 'калцит'],
  char_1028_texas2: ['тексас', 'техас', 'омертоза'],
  char_1033_swire2: ['свайр', 'свайер'],
  char_377_gdglow: ['голденглоу', 'гг', 'розовая собака'],
  char_2012_typhon: ['тифон'],
  char_172_svrash: ['сильвераш', 'серебро'],
  char_1034_jesca2: ['джессика'],
  char_180_amnn: ['амия', 'эмия'],
  char_2023_ling: ['линг'],
  char_1023_mlynar: ['млынар', 'дядя'],
  char_4009_irene: ['айрин', 'ирен'],
  char_293_thorns: ['торнс', 'тернс'],
  char_350_surtr: ['суртр', 'сурт'],
  char_1026_gvial2: ['гавиаль', 'гавиал'],
  char_2014_nian: ['ниан'],
  char_2015_dusk: ['даск'],
  char_1029_yato2: ['ято'],
  char_1030_noire2: ['нуар'],
  char_4146_nymph: ['нимфа'],
};

export function transliterateRuToEn(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return text
    .toLowerCase()
    .split('')
    .map((c) => (map[c] !== undefined ? map[c] : c))
    .join('');
}

export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics: š -> s, ë -> e
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/['"’`]/g, '') // remove apostrophes: Kal'tsit -> Kaltsit, Wiš'adel -> Wisadel
    .toLowerCase()
    .trim();
}

export function stripArknightsTags(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, ' ')
    .trim();
}

export interface ArchetypeDetail {
  en: string;
  ru: string;
  traitRu: string;
}

export const ARCHETYPE_DETAILS: Record<string, ArchetypeDetail> = {
  pioneer: {
    en: 'Pioneer',
    ru: 'Первопроходец',
    traitRu: 'Блокирует 2 врагов.',
  },
  bearer: {
    en: 'Standard Bearer',
    ru: 'Знаменосец',
    traitRu: 'Во время действия навыка блокирует 0 врагов и не атакует, ускоренно генерируя очки развертывания (DP).',
  },
  charger: {
    en: 'Charger',
    ru: 'Атакующий',
    traitRu: 'Убийство врага даёт 1 DP; при отступлении возвращает полную начальную стоимость высадки.',
  },
  tactician: {
    en: 'Tactician',
    ru: 'Тактик',
    traitRu: 'Может призывать тактического миньона в радиусе атаки; атаки по заблокированным им врагам наносят 150% урона.',
  },
  agent: {
    en: 'Agent',
    ru: 'Агент',
    traitRu: 'Имеет уменьшенное время передислокации; атаки по врагам восстанавливают DP.',
  },
  lord: {
    en: 'Lord',
    ru: 'Повелитель клинков',
    traitRu: 'Способен атаковать воздушные и наземные цели на дистанции (дистанционные атаки наносят 80% урона).',
  },
  sword: {
    en: 'Swordmaster',
    ru: 'Мастер меча',
    traitRu: 'Обычные атаки наносят двойной удар.',
  },
  swordm: {
    en: 'Swordmaster',
    ru: 'Мастер меча',
    traitRu: 'Обычные атаки наносят двойной удар.',
  },
  executor: {
    en: 'Executor',
    ru: 'Палач (Быстрый откат)',
    traitRu: 'Значительно сниженное время передислокации (быстрый откат).',
  },
  musha: {
    en: 'Musha',
    ru: 'Муша',
    traitRu: 'Не может быть исцелен союзниками; восстанавливает здоровье с каждой атакой по врагу.',
  },
  centurion: {
    en: 'Centurion',
    ru: 'Центурион',
    traitRu: 'Блокирует несколько врагов и атакует одновременно всех заблокированных целей.',
  },
  fighter: {
    en: 'Fighter',
    ru: 'Боец',
    traitRu: 'Блокирует 1 врага, обладает очень высокой скоростью атаки.',
  },
  artsfghter: {
    en: 'Arts Fighter',
    ru: 'Магический боец',
    traitRu: 'Обычные атаки наносят магический урон (Arts).',
  },
  fearless: {
    en: 'Dreadnought',
    ru: 'Дредноут',
    traitRu: 'Блокирует 1 врага, обладает высокими показателями атаки и здоровья.',
  },
  reaper: {
    en: 'Reaper',
    ru: 'Жнец',
    traitRu: 'Не может быть исцелен союзниками; атаки поражают всех врагов в секторе и восстанавливают здоровье за каждого пораженного врага.',
  },
  reaperrange: {
    en: 'Harvester',
    ru: 'Сборщик',
    traitRu: 'Не может быть исцелен союзниками; атаки поражают всех врагов в секторе и восстанавливают здоровье.',
  },
  crusher: {
    en: 'Crusher',
    ru: 'Сокрушитель',
    traitRu: 'Блокирует 2 врагов, наносит колоссальный физический урон, но имеет 0 защиты.',
  },
  librator: {
    en: 'Liberator',
    ru: 'Освободитель',
    traitRu: 'Обычно не атакует и блокирует 0 врагов, накапливая бонус к ATK; во время навыка блокирует 3 врагов с мощнейшим уроном.',
  },
  liberator: {
    en: 'Liberator',
    ru: 'Освободитель',
    traitRu: 'Обычно не атакует и блокирует 0 врагов, накапливая бонус к ATK; во время навыка блокирует 3 врагов с мощнейшим уроном.',
  },
  instructor: {
    en: 'Instructor',
    ru: 'Инструктор',
    traitRu: 'Может атаковать врагов на расстоянии 2 клеток; при атаке не заблокированных врагов наносит 120% урона.',
  },
  hammer: {
    en: 'Earthshaker',
    ru: 'Землетряс',
    traitRu: 'Атаки наносят физический урон по площади вокруг цели.',
  },
  primguard: {
    en: 'Primal Guard',
    ru: 'Первобытный гвардеец',
    traitRu: 'Атаки наносят элементальный урон.',
  },
  slower: {
    en: 'Decel Binder',
    ru: 'Замедлитель',
    traitRu: 'Атаки наносят магический урон и кратковременно замедляют врагов.',
  },
  fastslow: {
    en: 'Decel Binder',
    ru: 'Замедлитель',
    traitRu: 'Атаки наносят магический урон и кратковременно замедляют врагов.',
  },
  underminer: {
    en: 'Hexer',
    ru: 'Проклинатель',
    traitRu: 'Атаки наносят магический урон и накладывают ослабления на противников.',
  },
  bard: {
    en: 'Bard',
    ru: 'Бард',
    traitRu: 'Не атакует; непрерывно восстанавливает здоровье всем союзникам в радиусе и дает баффы к характеристикам.',
  },
  blessing: {
    en: 'Abjurer',
    ru: 'Оберегатель',
    traitRu: 'Атаки наносят магический урон; при активных навыках исцеляет союзников вместо атак.',
  },
  summoner: {
    en: 'Summoner',
    ru: 'Призыватель',
    traitRu: 'Атаки наносят магический урон; может использовать мощных боевых миньонов.',
  },
  craftsman: {
    en: 'Artificer',
    ru: 'Изобретатель',
    traitRu: 'Блокирует 2 врагов; может размещать портативные механизмы поддержки на поле боя.',
  },
  ritualist: {
    en: 'Ritualist',
    ru: 'Ритуалист',
    traitRu: 'Атаки наносят элементальный урон и ослабляют защиту врагов.',
  },
  alchemist: {
    en: 'Alchemist',
    ru: 'Алхимик',
    traitRu: 'Использует алхимические смеси для поддержки союзников и ослабления врагов.',
  },
  stalker: {
    en: 'Ambusher',
    ru: 'Засадник',
    traitRu: 'Атакует всех врагов в радиусе действия; имеет 50% шанс уклонения от физических и магических атак, снижен приоритет выбора целью врагами.',
  },
  traper: {
    en: 'Trapmaster',
    ru: 'Ловушечник',
    traitRu: 'Дистанционные атаки; может размещать разнообразные скрытые ловушки на доступных клетках поля боя.',
  },
  hookmaster: {
    en: 'Hookmaster',
    ru: 'Крюкач',
    traitRu: 'Может притягивать врагов гарпуном; может размещаться как на ближних, так и на возвышенных позициях.',
  },
  pusher: {
    en: 'Push Stroker',
    ru: 'Толкатель',
    traitRu: 'Атакует всех заблокированных врагов; навыки способны отталкивать противников в стороны или в пропасти.',
  },
  pushstroke: {
    en: 'Push Stroker',
    ru: 'Толкатель',
    traitRu: 'Атакует всех заблокированных врагов; навыки способны отталкивать противников в стороны или в пропасти.',
  },
  merchant: {
    en: 'Merchant',
    ru: 'Торговец',
    traitRu: 'Сниженное время передислокации; потребляет 3 DP каждые 3 секунды нахождения на поле боя.',
  },
  dollkeeper: {
    en: 'Dollkeeper',
    ru: 'Кукольник',
    traitRu: 'Не умирает при обнулении HP, а временно призывает марионетку на замену, после чего возвращается в строй.',
  },
  geek: {
    en: 'Geek',
    ru: 'Гик',
    traitRu: 'Постоянно теряет здоровье; обладает эксцентричными, крайне мощными боевыми механиками.',
  },
  fastshot: {
    en: 'Marksman',
    ru: 'Снайпер-стрелок',
    traitRu: 'Атакует в первую очередь воздушные цели.',
  },
  siegesniper: {
    en: 'Besieger',
    ru: 'Осадный снайпер',
    traitRu: 'Атакует в первую очередь самого тяжелого (наибольший вес) врага в радиусе действия.',
  },
  heavyshooter: {
    en: 'Besieger',
    ru: 'Осадный снайпер',
    traitRu: 'Атакует в первую очередь самого тяжелого (наибольший вес) врага в радиусе действия.',
  },
  aoesniper: {
    en: 'Artilleryman',
    ru: 'Артиллерист',
    traitRu: 'Атаки наносят физический урон по площади.',
  },
  bombarder: {
    en: 'Artilleryman',
    ru: 'Артиллерист',
    traitRu: 'Атаки наносят физический урон по площади.',
  },
  closerange: {
    en: 'Spreadshooter',
    ru: 'Дробовик',
    traitRu: 'Атакует всех врагов в конусном секторе перед собой; по целям прямо перед собой наносит 150% урона.',
  },
  longrange: {
    en: 'Flinger',
    ru: 'Метатель',
    traitRu: 'Атаки наносят физический урон по площади с дополнительной вторичной ударной волной.',
  },
  hunter: {
    en: 'Hunter',
    ru: 'Охотник',
    traitRu: 'Имеет ограниченный боезапас обоймы, перезаряжает патроны при отсутствии стрельбы.',
  },
  loopshooter: {
    en: 'Loopshooter',
    ru: 'Бумеранг',
    traitRu: 'Снаряд возвращается обратно, нанося урон на пути туда и обратно.',
  },
  deadeye: {
    en: 'Deadeye',
    ru: 'Дальнобойный снайпер',
    traitRu: 'Атакует в первую очередь врагов с наименьшей защитой в очень большом радиусе действия.',
  },
  skywalker: {
    en: 'Skyranger',
    ru: 'Воздушный стрелок',
    traitRu: 'Атакует врагов с высоты, игнорируя препятствия.',
  },
  corecaster: {
    en: 'Core Caster',
    ru: 'Базовый маг',
    traitRu: 'Обычные атаки наносят концентрированный магический урон (Arts).',
  },
  splashcaster: {
    en: 'Splash Caster',
    ru: 'Маг урона по площади',
    traitRu: 'Атаки наносят магический урон по площади.',
  },
  funnel: {
    en: 'Mech-accord Caster',
    ru: 'Дрон-маг',
    traitRu: 'Управляет парящим дроном, непрерывно атакующим цель с нарастающим уроном.',
  },
  phalanx: {
    en: 'Phalanx Caster',
    ru: 'Маг фаланги',
    traitRu: 'Не атакует и получает +200% защиты и +20 сопротивления; при активации навыка атакует всех врагов в радиусе по площади.',
  },
  mystic: {
    en: 'Mystic Caster',
    ru: 'Мистический маг',
    traitRu: 'Накапливает до 3 зарядов магической энергии, когда нет целей, и выпускает их одновременно в одного врага.',
  },
  blastcaster: {
    en: 'Blast Caster',
    ru: 'Линейный маг',
    traitRu: 'Атакует по прямой линии, нанося магический урон всем врагам на траектории луча.',
  },
  chain: {
    en: 'Chain Caster',
    ru: 'Цепной маг',
    traitRu: 'Магическая молния перескакивает между несколькими врагами и кратковременно замедляет их.',
  },
  primcaster: {
    en: 'Primal Caster',
    ru: 'Первобытный маг',
    traitRu: 'Наносит магический урон и накапливает элементальный урон по врагам.',
  },
  soulcaster: {
    en: 'Soul Caster',
    ru: 'Маг душ',
    traitRu: 'Атаки поражают души врагов, нанося сквозной урон.',
  },
  physician: {
    en: 'Medic',
    ru: 'Одиночный медик',
    traitRu: 'Восстанавливает здоровье одного союзника.',
  },
  ringhealer: {
    en: 'Multi-target Medic',
    ru: 'Групповой медик',
    traitRu: 'Восстанавливает здоровье до 3 союзников одновременно.',
  },
  healer: {
    en: 'Therapist',
    ru: 'Терапевт',
    traitRu: 'Большой радиус исцеления; снимает или сокращает длительность оглушения и заморозки у союзников.',
  },
  wandermedic: {
    en: 'Wandering Medic',
    ru: 'Странствующий медик',
    traitRu: 'Восстанавливает здоровье и очищает союзников от накопленного элементального урона.',
  },
  incantationmedic: {
    en: 'Incantation Medic',
    ru: 'Боевой медик',
    traitRu: 'Атакует врагов магическим уроном и одновременно исцеляет союзника на определенный процент от нанесенного урона.',
  },
  chainhealer: {
    en: 'Chain Medic',
    ru: 'Цепной медик',
    traitRu: 'Исцеляющий луч перескакивает на соседних союзников с постепенным снижением силы лечения.',
  },
  protector: {
    en: 'Protector',
    ru: 'Тяжелый защитник',
    traitRu: 'Блокирует 3 врагов, обладает высочайшими показателями физической брони.',
  },
  guardian: {
    en: 'Guardian',
    ru: 'Лечащий защитник',
    traitRu: 'Блокирует 3 врагов; может применять навыки для восстановления здоровья союзников.',
  },
  unyield: {
    en: 'Juggernaut',
    ru: 'Джаггернаут',
    traitRu: 'Не может быть исцелен союзниками; обладает колоссальным здоровьем и защитой.',
  },
  artsprotector: {
    en: 'Arts Protector',
    ru: 'Магический защитник',
    traitRu: 'Блокирует 3 врагов; во время навыков обычные атаки наносят магический урон.',
  },
  duelist: {
    en: 'Duelist',
    ru: 'Дуэлянт',
    traitRu: 'Блокирует 1 врага; восстанавливает SP только во время блокирования вражеской цели.',
  },
  fortress: {
    en: 'Fortress',
    ru: 'Крепость',
    traitRu: 'Блокирует 3 врагов; на дистанции выпускает дальнобойные артиллерийские снаряды по площади.',
  },
  shotprotector: {
    en: 'Sentinel Protector',
    ru: 'Дозорный защитник',
    traitRu: 'Блокирует 3 врагов; способен атаковать врагов на дистанции 2 клеток.',
  },
  primprotector: {
    en: 'Primal Protector',
    ru: 'Первобытный защитник',
    traitRu: 'Блокирует 3 врагов; накапливает элементальный урон и щиты.',
  },
};

export const ARCHETYPE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(ARCHETYPE_DETAILS).map(([k, v]) => [k, v.en])
);

export function getArchetypeName(subProfId: string, lang: 'ru' | 'en' = 'en'): string {
  if (!subProfId) return '';
  const detail = ARCHETYPE_DETAILS[subProfId.toLowerCase()];
  if (detail) {
    return lang === 'ru' ? detail.ru : detail.en;
  }
  return subProfId.toUpperCase();
}

export function getArchetypeTraitRu(subProfId: string): string {
  if (!subProfId) return '';
  return ARCHETYPE_DETAILS[subProfId.toLowerCase()]?.traitRu || '';
}

export const PROFESSION_NAMES: Record<string, { en: string; ru: string }> = {
  PIONEER: { en: 'Vanguard', ru: 'Авангард' },
  WARRIOR: { en: 'Guard', ru: 'Гвардеец' },
  TANK: { en: 'Defender', ru: 'Защитник' },
  SNIPER: { en: 'Sniper', ru: 'Снайпер' },
  CASTER: { en: 'Caster', ru: 'Заклинатель' },
  MEDIC: { en: 'Medic', ru: 'Медик' },
  SUPPORT: { en: 'Supporter', ru: 'Поддержка' },
  SPECIAL: { en: 'Specialist', ru: 'Специалист' },
};

export function getProfessionName(profession: string, lang: 'ru' | 'en' = 'en'): string {
  const p = PROFESSION_NAMES[profession];
  if (!p) return profession;
  return lang === 'ru' ? p.ru : p.en;
}

export const TAG_TRANSLATIONS: Record<string, { en: string; ru: string }> = {
  DPS: { en: 'DPS', ru: 'Урон' },
  Survival: { en: 'Survival', ru: 'Выживание' },
  Healing: { en: 'Healing', ru: 'Лечение' },
  Support: { en: 'Support', ru: 'Поддержка' },
  'Crowd-Control': { en: 'Crowd-Control', ru: 'Контроль' },
  Defense: { en: 'Defense', ru: 'Защита' },
  'Fast-Redeploy': { en: 'Fast-Redeploy', ru: 'Быстрый откат' },
  'DP-Recovery': { en: 'DP-Recovery', ru: 'Генерация DP' },
  Nuker: { en: 'Nuker', ru: 'Взрывной урон' },
  Summoner: { en: 'Summoner', ru: 'Призыв' },
  Debuff: { en: 'Debuff', ru: 'Ослабление' },
  Shift: { en: 'Shift', ru: 'Смещение' },
  AoE: { en: 'AoE', ru: 'Урон по площади' },
  Slow: { en: 'Slow', ru: 'Замедление' },
  Starter: { en: 'Starter', ru: 'Новичок' },
  'Senior Operator': { en: 'Senior Operator', ru: 'Старший оперативник' },
  'Top Operator': { en: 'Top Operator', ru: 'Топ оперативник' },
  Robot: { en: 'Robot', ru: 'Робот' },
  Melee: { en: 'Melee', ru: 'Ближний бой' },
  Ranged: { en: 'Ranged', ru: 'Дальний бой' },
};

export const CN_TO_EN_TAGS: Record<string, string> = {
  输出: 'DPS',
  防护: 'Defense',
  生存: 'Survival',
  治疗: 'Healing',
  支援: 'Support',
  控场: 'Crowd-Control',
  快速复活: 'Fast-Redeploy',
  费用回复: 'DP-Recovery',
  爆发: 'Nuker',
  召唤: 'Summoner',
  削弱: 'Debuff',
  位移: 'Shift',
  群攻: 'AoE',
  减速: 'Slow',
  新手: 'Starter',
  资深干员: 'Senior Operator',
  高级资深干员: 'Top Operator',
  支援机械: 'Robot',
  近战位: 'Melee',
  远程位: 'Ranged',
  元素: 'Elemental',
  高空: 'High Altitude',
};

export function translateTagToEn(tag: string): string {
  return CN_TO_EN_TAGS[tag] || tag;
}

export const ARCHETYPE_TRAITS_EN: Record<string, string> = {
  pioneer: 'Blocks 2 enemies.',
  bearer: 'Cannot block enemies during the skill; Recovers DP rapidly.',
  charger: 'Obtains 1 DP after defeating an enemy; Refunds the full original DP cost when retreated.',
  tactician: 'Can summon a Tactical Reinforcement within attack range; Deals 150% damage when attacking enemies blocked by Reinforcement.',
  agent: 'Has reduced redeployment time; Attacks restore DP.',
  lord: 'Can launch Ranged Attacks that deal 80% of normal ATK.',
  sword: 'Normal attacks deal damage twice.',
  swordm: 'Normal attacks deal damage twice.',
  executor: 'Significantly reduced redeployment time.',
  musha: 'Cannot be healed by allies; Recovers HP for each enemy hit during attacks.',
  centurion: 'Attacks all blocked enemies.',
  fighter: 'Blocks 1 enemy; Very high attack speed.',
  artsfghter: 'Deals Arts damage.',
  fearless: 'Blocks 1 enemy; High ATK and HP.',
  reaper: 'Cannot be healed by allies; Attacks deal AOE damage to all enemies in range and recovers HP per enemy hit.',
  reaperrange: 'Cannot be healed by allies; Attacks deal AOE damage to all enemies in range and recovers HP per enemy hit.',
  crusher: 'Blocks 2 enemies; Extremely high Physical ATK but 0 DEF.',
  librator: 'Normally does not attack and blocks 0 enemies, gradually increasing ATK; When skill is active, blocks 3 enemies with massive ATK.',
  liberator: 'Normally does not attack and blocks 0 enemies, gradually increasing ATK; When skill is active, blocks 3 enemies with massive ATK.',
  instructor: 'Can attack enemies from 2 tiles away; Deals 120% damage when attacking unblocked enemies.',
  hammer: 'Attacks deal AOE Physical damage around the target.',
  primguard: 'Attacks deal Elemental Damage.',
  slower: 'Deals Arts damage and briefly Slows enemies.',
  fastslow: 'Deals Arts damage and briefly Slows enemies.',
  underminer: 'Deals Arts damage and inflicts various debuffs on enemies.',
  bard: 'Does not attack; Continuously restores HP to all allies within range and increases their stats.',
  blessing: 'Deals Arts damage; Heals allies instead of attacking when skills are active.',
  summoner: 'Deals Arts damage; Can summon combat minions.',
  craftsman: 'Blocks 2 enemies; Can deploy Support Devices on the battlefield.',
  ritualist: 'Attacks deal Elemental Damage and weaken enemies.',
  alchemist: 'Throws potions to support allies and hinder enemies.',
  stalker: 'Deals damage to all targets in range; Has 50% Physical and Arts Dodge, and reduced aggro.',
  traper: 'Ranged attacks; Can place tactical traps on deployable tiles.',
  hookmaster: 'Can pull enemies with a hook; Can be deployed on ranged or melee tiles.',
  pusher: 'Attacks all blocked enemies; Skills can push enemies.',
  pushstroke: 'Attacks all blocked enemies; Skills can push enemies.',
  merchant: 'Reduced redeployment time; Consumes 3 DP every 3 seconds while deployed.',
  dollkeeper: 'Does not retreat when defeated, instead swaps to a Substitute before returning.',
  geek: 'Continuously loses HP over time; Possesses specialized combat mechanics.',
  fastshot: 'Attacks aerial enemies first.',
  siegesniper: 'Attacks the heaviest enemy in range first.',
  heavyshooter: 'Attacks the heaviest enemy in range first.',
  aoesniper: 'Attacks deal AOE Physical damage.',
  bombarder: 'Attacks deal AOE Physical damage.',
  closerange: 'Attacks all enemies in a cone ahead; Deals 150% damage to enemies directly ahead.',
  longrange: 'Attacks deal AOE Physical damage with a secondary shockwave.',
  hunter: 'Has limited ammo capacity; Reloads ammo when not attacking.',
  loopshooter: 'Boomerang returns to operator, dealing damage on outbound and return paths.',
  deadeye: 'Attacks the enemy with the lowest DEF in range first.',
  skywalker: 'Attacks enemies from high altitude, ignoring terrain obstacles.',
  corecaster: 'Deals concentrated Arts damage.',
  splashcaster: 'Deals AOE Arts damage.',
  funnel: 'Controls a Drone that attacks targets with increasing damage.',
  phalanx: 'Normally does not attack; Gains +200% DEF and +20 RES; Attacks all enemies in range when skills are active.',
  mystic: 'Attacks deal Arts damage; Charges up to 3 energy spheres when no targets are in range.',
  blastcaster: 'Attacks along a straight line, dealing Arts damage to all enemies in the beam.',
  chain: 'Attacks deal Arts damage and bounce to adjacent enemies, briefly Slowing them.',
  primcaster: 'Attacks deal Arts damage and inflict Elemental Damage.',
  soulcaster: 'Attacks deal Arts damage piercing through enemy souls.',
  physician: 'Restores the HP of a single ally.',
  ringhealer: 'Restores the HP of up to 3 allies simultaneously.',
  healer: 'Has a wide range; Can heal and remove/reduce Stun and Freeze duration on allies.',
  wandermedic: 'Restores HP and recovers Elemental Damage on allies.',
  incantationmedic: 'Attacks deal Arts damage to enemies and heals an ally for a percentage of damage dealt.',
  chainhealer: 'Heals bounce between nearby allies.',
  protector: 'Blocks 3 enemies; Very high Physical DEF.',
  guardian: 'Blocks 3 enemies; Skills can heal allies.',
  unyield: 'Cannot be healed by allies; Immense HP and DEF.',
  artsprotector: 'Blocks 3 enemies; Normal attacks deal Arts damage during skills.',
  duelist: 'Blocks 1 enemy; Recovers SP only while blocking enemies.',
  fortress: 'Blocks 3 enemies; Launches long-range AOE artillery shells at distance.',
  shotprotector: 'Blocks 3 enemies; Can attack enemies 2 tiles ahead.',
  primprotector: 'Blocks 3 enemies; Accumulates Elemental Damage and shields.',
};

export function getArchetypeTraitEn(subProfId: string): string {
  if (!subProfId) return '';
  return ARCHETYPE_TRAITS_EN[subProfId.toLowerCase()] || '';
}

export function getOperatorTag(tag: string, lang: 'ru' | 'en' = 'en'): string {
  const enTag = translateTagToEn(tag);
  const t = TAG_TRANSLATIONS[enTag] || TAG_TRANSLATIONS[tag];
  if (!t) return enTag;
  return lang === 'ru' ? t.ru : t.en;
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
