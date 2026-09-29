/**
 * Arknights Public Recruitment Offline Database
 * Built exclusively from official CN game data (the most up-to-date and complete source),
 * with complete English and Russian localization.
 * 100% offline, zero network requests.
 */

export interface RecruitableOperator {
  id: string;
  nameEn: string;
  nameRu: string;
  nameCn: string;
  rarity: number; // 1 to 6
  profession: string;
  position: 'MELEE' | 'RANGED' | 'NONE';
  tags: string[];
}

export type TagCategory = 'rarity' | 'position' | 'class' | 'affix';

export interface RecruitTagDefinition {
  id: string;
  nameEn: string;
  nameRu: string;
  category: TagCategory;
  colorClass: string;
}

export const RECRUIT_TAG_DEFINITIONS: RecruitTagDefinition[] = [
  // Qualification / Rarity
  { id: 'Top Operator', nameEn: 'Top Operator', nameRu: 'Топ оперативник', category: 'rarity', colorClass: 'border-amber-500/60 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' },
  { id: 'Senior Operator', nameEn: 'Senior Operator', nameRu: 'Старший оперативник', category: 'rarity', colorClass: 'border-purple-500/60 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20' },
  { id: 'Starter', nameEn: 'Starter', nameRu: 'Новичок', category: 'rarity', colorClass: 'border-slate-500/60 text-slate-300 bg-slate-500/10 hover:bg-slate-500/20' },
  { id: 'Robot', nameEn: 'Robot', nameRu: 'Робот', category: 'rarity', colorClass: 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' },

  // Position
  { id: 'Melee', nameEn: 'Melee', nameRu: 'Ближний бой', category: 'position', colorClass: 'border-rose-500/60 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20' },
  { id: 'Ranged', nameEn: 'Ranged', nameRu: 'Дальний бой', category: 'position', colorClass: 'border-sky-500/60 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20' },

  // Profession / Class
  { id: 'Guard', nameEn: 'Guard', nameRu: 'Гвардеец', category: 'class', colorClass: 'border-orange-500/60 text-orange-300 bg-orange-500/10 hover:bg-orange-500/20' },
  { id: 'Sniper', nameEn: 'Sniper', nameRu: 'Снайпер', category: 'class', colorClass: 'border-blue-500/60 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20' },
  { id: 'Defender', nameEn: 'Defender', nameRu: 'Защитник', category: 'class', colorClass: 'border-yellow-500/60 text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20' },
  { id: 'Medic', nameEn: 'Medic', nameRu: 'Медик', category: 'class', colorClass: 'border-emerald-500/60 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20' },
  { id: 'Supporter', nameEn: 'Supporter', nameRu: 'Поддержка', category: 'class', colorClass: 'border-teal-500/60 text-teal-300 bg-teal-500/10 hover:bg-teal-500/20' },
  { id: 'Caster', nameEn: 'Caster', nameRu: 'Заклинатель', category: 'class', colorClass: 'border-indigo-500/60 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20' },
  { id: 'Specialist', nameEn: 'Specialist', nameRu: 'Специалист', category: 'class', colorClass: 'border-fuchsia-500/60 text-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/20' },
  { id: 'Vanguard', nameEn: 'Vanguard', nameRu: 'Авангард', category: 'class', colorClass: 'border-lime-500/60 text-lime-300 bg-lime-500/10 hover:bg-lime-500/20' },

  // Affixes / Functions
  { id: 'DPS', nameEn: 'DPS', nameRu: 'Урон', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Survival', nameEn: 'Survival', nameRu: 'Выживание', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Healing', nameEn: 'Healing', nameRu: 'Лечение', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Support', nameEn: 'Support', nameRu: 'Поддержка (аффикс)', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Defense', nameEn: 'Defense', nameRu: 'Защита', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'AoE', nameEn: 'AoE', nameRu: 'Урон по площади', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Slow', nameEn: 'Slow', nameRu: 'Замедление', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Debuff', nameEn: 'Debuff', nameRu: 'Ослабление', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Fast-Redeploy', nameEn: 'Fast-Redeploy', nameRu: 'Быстрый откат', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Crowd-Control', nameEn: 'Crowd-Control', nameRu: 'Контроль', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Nuker', nameEn: 'Nuker', nameRu: 'Взрывной урон', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Summon', nameEn: 'Summon', nameRu: 'Призыв', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'Shift', nameEn: 'Shift', nameRu: 'Смещение', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
  { id: 'DP-Recovery', nameEn: 'DP-Recovery', nameRu: 'Генерация DP', category: 'affix', colorClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20' },
];

export const RECRUIT_OPERATORS: RecruitableOperator[] = [
  {
    "id": "char_225_haak",
    "nameEn": "Aak",
    "nameRu": "Аак",
    "nameCn": "阿",
    "rarity": 6,
    "profession": "SPECIAL",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Specialist",
      "Support",
      "DPS"
    ]
  },
  {
    "id": "char_332_archet",
    "nameEn": "Archetto",
    "nameRu": "Аркетто",
    "nameCn": "空弦",
    "rarity": 6,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_222_bpipe",
    "nameEn": "Bagpipe",
    "nameRu": "Бэгпайп",
    "nameCn": "风笛",
    "rarity": 6,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "DPS"
    ]
  },
  {
    "id": "char_017_huang",
    "nameEn": "Blaze",
    "nameRu": "Блейз",
    "nameCn": "煌",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_423_blemsh",
    "nameEn": "Blemishine",
    "nameRu": "Блемишайн",
    "nameCn": "瑕光",
    "rarity": 6,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Defender",
      "Defense",
      "Healing",
      "DPS"
    ]
  },
  {
    "id": "char_426_billro",
    "nameEn": "Carnelian",
    "nameRu": "Карнелиан",
    "nameCn": "卡涅利安",
    "rarity": 6,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Caster",
      "AoE",
      "Defense"
    ]
  },
  {
    "id": "char_2013_cerber",
    "nameEn": "Ceobe",
    "nameRu": "Кеобе",
    "nameCn": "刻俄柏",
    "rarity": 6,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Caster",
      "DPS",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_010_chen",
    "nameEn": "Chen",
    "nameRu": "Chen",
    "nameCn": "陈",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "Nuker",
      "DPS"
    ]
  },
  {
    "id": "trap_466_tzumama",
    "nameEn": "Eunectes",
    "nameRu": "Эунектес",
    "nameCn": "森蚺",
    "rarity": 6,
    "profession": "TRAP",
    "position": "NONE",
    "tags": [
      "Top Operator"
    ]
  },
  {
    "id": "char_103_angel",
    "nameEn": "Exusiai",
    "nameRu": "Эксузиай",
    "nameCn": "能天使",
    "rarity": 6,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_188_helage",
    "nameEn": "Hellagur",
    "nameRu": "Хеллагур",
    "nameCn": "赫拉格",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_136_hsguma",
    "nameEn": "Hoshiguma",
    "nameRu": "Хошигума",
    "nameCn": "星熊",
    "rarity": 6,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Defender",
      "Defense",
      "DPS"
    ]
  },
  {
    "id": "char_134_ifrit",
    "nameEn": "Ifrit",
    "nameRu": "Ифрит",
    "nameCn": "伊芙利特",
    "rarity": 6,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Caster",
      "AoE",
      "Debuff"
    ]
  },
  {
    "id": "char_003_kalts",
    "nameEn": "Kaltsit",
    "nameRu": "Kaltsit",
    "nameCn": "凯尔希",
    "rarity": 6,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Medic",
      "Summon",
      "Healing"
    ]
  },
  {
    "id": "char_248_mgllan",
    "nameEn": "Magallan",
    "nameRu": "Магеллан",
    "nameCn": "麦哲伦",
    "rarity": 6,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Supporter",
      "Support",
      "Slow",
      "DPS"
    ]
  },
  {
    "id": "char_437_mizuki",
    "nameEn": "Mizuki",
    "nameRu": "Мидзуки",
    "nameCn": "水月",
    "rarity": 6,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Specialist",
      "DPS",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_213_mostma",
    "nameEn": "Mostima",
    "nameRu": "Мостима",
    "nameCn": "莫斯提马",
    "rarity": 6,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Caster",
      "AoE",
      "Support",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_264_f12yin",
    "nameEn": "Mountain",
    "nameRu": "Маунтин",
    "nameCn": "山",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_311_mudrok",
    "nameEn": "Mudrock",
    "nameRu": "Мадрок",
    "nameCn": "泥岩",
    "rarity": 6,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Defender",
      "Survival",
      "Defense",
      "DPS"
    ]
  },
  {
    "id": "char_179_cgbird",
    "nameEn": "Nightingale",
    "nameRu": "Найтингейл",
    "nameCn": "夜莺",
    "rarity": 6,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Medic",
      "Healing",
      "Support"
    ]
  },
  {
    "id": "char_485_pallas",
    "nameEn": "Pallas",
    "nameRu": "Паллас",
    "nameCn": "帕拉斯",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS",
      "Support"
    ]
  },
  {
    "id": "trap_469_tpasngr",
    "nameEn": "Passenger",
    "nameRu": "Пассажир",
    "nameCn": "异客",
    "rarity": 6,
    "profession": "TRAP",
    "position": "NONE",
    "tags": [
      "Top Operator"
    ]
  },
  {
    "id": "char_250_phatom",
    "nameEn": "Phantom",
    "nameRu": "Фантом",
    "nameCn": "傀影",
    "rarity": 6,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Specialist",
      "Fast-Redeploy",
      "Crowd-Control",
      "DPS"
    ]
  },
  {
    "id": "char_197_poca",
    "nameEn": "Rosa",
    "nameRu": "Роса",
    "nameCn": "早露",
    "rarity": 6,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Sniper",
      "DPS",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_362_saga",
    "nameEn": "Saga",
    "nameRu": "Сага",
    "nameCn": "嵯峨",
    "rarity": 6,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "DPS"
    ]
  },
  {
    "id": "char_202_demkni",
    "nameEn": "Saria",
    "nameRu": "Сария",
    "nameCn": "塞雷娅",
    "rarity": 6,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Defender",
      "Defense",
      "Healing",
      "Support"
    ]
  },
  {
    "id": "char_340_shwaz",
    "nameEn": "Schwarz",
    "nameRu": "Шварц",
    "nameCn": "黑",
    "rarity": 6,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_147_shining",
    "nameEn": "Shining",
    "nameRu": "Шайнинг",
    "nameCn": "闪灵",
    "rarity": 6,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Medic",
      "Healing",
      "Support"
    ]
  },
  {
    "id": "char_112_siege",
    "nameEn": "Siege",
    "nameRu": "Сидж",
    "nameCn": "推进之王",
    "rarity": 6,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "DPS"
    ]
  },
  {
    "id": "char_172_svrash",
    "nameEn": "SilverAsh",
    "nameRu": "СильверЭш",
    "nameCn": "银灰",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS",
      "Support"
    ]
  },
  {
    "id": "char_263_skadi",
    "nameEn": "Skadi",
    "nameRu": "Скади",
    "nameCn": "斯卡蒂",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_350_surtr",
    "nameEn": "Surtr",
    "nameRu": "Суртр",
    "nameCn": "史尔特尔",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_358_lisa",
    "nameEn": "Suzuran",
    "nameRu": "Судзуран",
    "nameCn": "铃兰",
    "rarity": 6,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Top Operator",
      "Ranged",
      "Supporter",
      "Slow",
      "Support",
      "DPS"
    ]
  },
  {
    "id": "char_293_thorns",
    "nameEn": "Thorns",
    "nameRu": "Торнс",
    "nameCn": "棘刺",
    "rarity": 6,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Guard",
      "DPS",
      "Defense"
    ]
  },
  {
    "id": "char_400_weedy",
    "nameEn": "Weedy",
    "nameRu": "Види",
    "nameCn": "温蒂",
    "rarity": 6,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Top Operator",
      "Melee",
      "Specialist",
      "Shift",
      "DPS",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_475_akafyu",
    "nameEn": "Akafuyu",
    "nameRu": "Акафую",
    "nameCn": "赤冬",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "Survival",
      "DPS"
    ]
  },
  {
    "id": "char_218_cuttle",
    "nameEn": "Andreana",
    "nameRu": "Андреана",
    "nameCn": "安哲拉",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS",
      "Slow"
    ]
  },
  {
    "id": "char_346_aosta",
    "nameEn": "Aosta",
    "nameRu": "Аоста",
    "nameCn": "奥斯塔",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "AoE"
    ]
  },
  {
    "id": "char_365_aprl",
    "nameEn": "April",
    "nameRu": "Эйприл",
    "nameCn": "四月",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_378_asbest",
    "nameEn": "Asbestos",
    "nameRu": "Асбест",
    "nameCn": "石棉",
    "rarity": 5,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Defender",
      "Defense",
      "DPS"
    ]
  },
  {
    "id": "char_274_astesi",
    "nameEn": "Astesia",
    "nameRu": "Астезия",
    "nameCn": "星极",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "DPS",
      "Defense"
    ]
  },
  {
    "id": "char_294_ayer",
    "nameEn": "Ayerscarpe",
    "nameRu": "Айерскарп",
    "nameCn": "断崖",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "DPS",
      "AoE"
    ]
  },
  {
    "id": "char_344_beewax",
    "nameEn": "Beeswax",
    "nameRu": "Бисвакс",
    "nameCn": "蜜蜡",
    "rarity": 5,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Caster",
      "AoE",
      "Defense"
    ]
  },
  {
    "id": "char_129_bluep",
    "nameEn": "Blue Poison",
    "nameRu": "Блу Пойзон",
    "nameCn": "蓝毒",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_356_broca",
    "nameEn": "Broca",
    "nameRu": "Брока",
    "nameCn": "布洛卡",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "AoE",
      "Survival"
    ]
  },
  {
    "id": "char_349_chiave",
    "nameEn": "Chiave",
    "nameRu": "Кьяве",
    "nameCn": "贾维",
    "rarity": 5,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "DPS"
    ]
  },
  {
    "id": "char_173_slchan",
    "nameEn": "Cliffheart",
    "nameRu": "Клиффхарт",
    "nameCn": "崖心",
    "rarity": 5,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Specialist",
      "Shift",
      "DPS"
    ]
  },
  {
    "id": "char_201_moeshd",
    "nameEn": "Croissant",
    "nameRu": "Круассан",
    "nameCn": "可颂",
    "rarity": 5,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Defender",
      "Defense",
      "Shift"
    ]
  },
  {
    "id": "char_401_elysm",
    "nameEn": "Elysium",
    "nameRu": "Элизиум",
    "nameCn": "极境",
    "rarity": 5,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "Support"
    ]
  },
  {
    "id": "char_279_excu",
    "nameEn": "Executor",
    "nameRu": "Экзекутор",
    "nameCn": "送葬人",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "AoE"
    ]
  },
  {
    "id": "char_241_panda",
    "nameEn": "FEater",
    "nameRu": "ФИтер",
    "nameCn": "食铁兽",
    "rarity": 5,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Specialist",
      "Shift",
      "Slow"
    ]
  },
  {
    "id": "char_158_milu",
    "nameEn": "Firewatch",
    "nameRu": "Файрвотч",
    "nameCn": "守林人",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS",
      "Nuker"
    ]
  },
  {
    "id": "char_415_flint",
    "nameEn": "Flint",
    "nameRu": "Флинт",
    "nameCn": "燧石",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_326_glacus",
    "nameEn": "Glaucus",
    "nameRu": "Глаукус",
    "nameCn": "格劳克斯",
    "rarity": 5,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Supporter",
      "Slow",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_367_swllow",
    "nameEn": "GreyThroat",
    "nameRu": "ГрейТроут",
    "nameCn": "灰喉",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_226_hmau",
    "nameEn": "Hung",
    "nameRu": "Хун",
    "nameCn": "吽",
    "rarity": 5,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Defender",
      "Defense",
      "Healing"
    ]
  },
  {
    "id": "char_155_tiger",
    "nameEn": "Indra",
    "nameRu": "Индра",
    "nameCn": "因陀罗",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_338_iris",
    "nameEn": "Iris",
    "nameRu": "Айрис",
    "nameCn": "爱丽丝",
    "rarity": 5,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Caster",
      "DPS"
    ]
  },
  {
    "id": "char_195_glassb",
    "nameEn": "Istina",
    "nameRu": "Истина",
    "nameCn": "真理",
    "rarity": 5,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Supporter",
      "Slow",
      "DPS"
    ]
  },
  {
    "id": "char_214_kafka",
    "nameEn": "Kafka",
    "nameRu": "Кафка",
    "nameCn": "卡夫卡",
    "rarity": 5,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Specialist",
      "Fast-Redeploy",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_478_kirara",
    "nameEn": "Kirara",
    "nameRu": "Кирара",
    "nameCn": "绮良",
    "rarity": 5,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Specialist",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_421_crow",
    "nameEn": "La Pluma",
    "nameRu": "Ла Плюма",
    "nameCn": "羽毛笔",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_306_leizi",
    "nameEn": "Leizi",
    "nameRu": "Лэйцзы",
    "nameCn": "惊蛰",
    "rarity": 5,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Caster",
      "DPS"
    ]
  },
  {
    "id": "char_373_lionhd",
    "nameEn": "Leonhardt",
    "nameRu": "Леонхардт",
    "nameCn": "莱恩哈特",
    "rarity": 5,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Caster",
      "AoE",
      "Nuker"
    ]
  },
  {
    "id": "char_107_liskam",
    "nameEn": "Liskarm",
    "nameRu": "Лискарм",
    "nameCn": "雷蛇",
    "rarity": 5,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Defender",
      "Defense",
      "DPS"
    ]
  },
  {
    "id": "trap_470_tmantic",
    "nameEn": "Manticore",
    "nameRu": "Мантикора",
    "nameCn": "狮蝎",
    "rarity": 5,
    "profession": "TRAP",
    "position": "NONE",
    "tags": [
      "Senior Operator"
    ]
  },
  {
    "id": "char_242_otter",
    "nameEn": "Mayer",
    "nameRu": "Майер",
    "nameCn": "梅尔",
    "rarity": 5,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Supporter",
      "Summon",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_219_meteo",
    "nameEn": "Meteorite",
    "nameRu": "Метеорит",
    "nameCn": "陨星",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "AoE",
      "Debuff"
    ]
  },
  {
    "id": "char_455_nothin",
    "nameEn": "Mr. Nothing",
    "nameRu": "Мистер Ничто",
    "nameCn": "乌有",
    "rarity": 5,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Specialist",
      "Fast-Redeploy",
      "DPS"
    ]
  },
  {
    "id": "char_148_nearl",
    "nameEn": "Nearl",
    "nameRu": "Нирл",
    "nameCn": "临光",
    "rarity": 5,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Defender",
      "Defense",
      "Healing"
    ]
  },
  {
    "id": "char_164_nightm",
    "nameEn": "Nightmare",
    "nameRu": "Найтмер",
    "nameCn": "夜魔",
    "rarity": 5,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Caster",
      "DPS",
      "Healing",
      "Slow"
    ]
  },
  {
    "id": "char_204_platnm",
    "nameEn": "Platinum",
    "nameRu": "Платинум",
    "nameCn": "白金",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_174_slbell",
    "nameEn": "Pramanix",
    "nameRu": "Праманикс",
    "nameCn": "初雪",
    "rarity": 5,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Supporter",
      "Debuff"
    ]
  },
  {
    "id": "char_144_red",
    "nameEn": "Projekt Red",
    "nameRu": "Проект Ред",
    "nameCn": "红",
    "rarity": 5,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Specialist",
      "Fast-Redeploy",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_145_prove",
    "nameEn": "Provence",
    "nameRu": "Прованс",
    "nameCn": "普罗旺斯",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_128_plosis",
    "nameEn": "Ptilopsis",
    "nameRu": "Птилопсис",
    "nameCn": "白面鸮",
    "rarity": 5,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Medic",
      "Healing",
      "Support"
    ]
  },
  {
    "id": "char_261_sddrag",
    "nameEn": "Reed",
    "nameRu": "Рид",
    "nameCn": "苇草",
    "rarity": 5,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "DPS"
    ]
  },
  {
    "id": "char_379_sesa",
    "nameEn": "Sesa",
    "nameRu": "Сеса",
    "nameCn": "慑砂",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "AoE",
      "Debuff"
    ]
  },
  {
    "id": "char_254_vodfox",
    "nameEn": "Shamare",
    "nameRu": "Шамаре",
    "nameCn": "巫恋",
    "rarity": 5,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Supporter",
      "Debuff"
    ]
  },
  {
    "id": "char_108_silent",
    "nameEn": "Silence",
    "nameRu": "Сайленс",
    "nameCn": "赫默",
    "rarity": 5,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_143_ghost",
    "nameEn": "Specter",
    "nameRu": "Спектер",
    "nameCn": "幽灵鲨",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "AoE",
      "Survival"
    ]
  },
  {
    "id": "char_308_swire",
    "nameEn": "Swire",
    "nameRu": "Свайр",
    "nameCn": "诗怀雅",
    "rarity": 5,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Guard",
      "DPS",
      "Support"
    ]
  },
  {
    "id": "char_102_texas",
    "nameEn": "Texas",
    "nameRu": "Техас",
    "nameCn": "德克萨斯",
    "rarity": 5,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_363_toddi",
    "nameEn": "Toddifons",
    "nameRu": "Тоддифонс",
    "nameCn": "熔泉",
    "rarity": 5,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_343_tknogi",
    "nameEn": "Tsukinogi",
    "nameRu": "Цукиноги",
    "nameCn": "月禾",
    "rarity": 5,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Supporter",
      "Support",
      "Survival"
    ]
  },
  {
    "id": "char_163_hpsts",
    "nameEn": "Vulcan",
    "nameRu": "Вулкан",
    "nameCn": "火神",
    "rarity": 5,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Defender",
      "Survival",
      "Defense",
      "DPS"
    ]
  },
  {
    "id": "char_243_waaifu",
    "nameEn": "Waai Fu",
    "nameRu": "Вай Фу",
    "nameCn": "槐琥",
    "rarity": 5,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Specialist",
      "Fast-Redeploy",
      "Debuff"
    ]
  },
  {
    "id": "char_171_bldsk",
    "nameEn": "Warfarin",
    "nameRu": "Варфарин",
    "nameCn": "华法琳",
    "rarity": 5,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Medic",
      "Healing",
      "Support"
    ]
  },
  {
    "id": "char_436_whispr",
    "nameEn": "Whisperain",
    "nameRu": "Висперейн",
    "nameCn": "絮雨",
    "rarity": 5,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Senior Operator",
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_115_headbr",
    "nameEn": "Zima",
    "nameRu": "Зима",
    "nameCn": "凛冬",
    "rarity": 5,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Senior Operator",
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "Support"
    ]
  },
  {
    "id": "char_366_acdrop",
    "nameEn": "Aciddrop",
    "nameRu": "Эйсиддроп",
    "nameCn": "酸糖",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_302_glaze",
    "nameEn": "Ambriel",
    "nameRu": "Амбриэль",
    "nameCn": "安比尔",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS",
      "Slow"
    ]
  },
  {
    "id": "char_271_spikes",
    "nameEn": "Arene",
    "nameRu": "Арен",
    "nameCn": "芳汀",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_452_bstalk",
    "nameEn": "Beanstalk",
    "nameRu": "Бинсталк",
    "nameCn": "豆苗",
    "rarity": 4,
    "profession": "PIONEER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Vanguard",
      "DP-Recovery",
      "Summon"
    ]
  },
  {
    "id": "char_137_brownb",
    "nameEn": "Beehunter",
    "nameRu": "Бихантер",
    "nameCn": "猎蜂",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_381_bubble",
    "nameEn": "Bubble",
    "nameRu": "Баббл",
    "nameCn": "泡泡",
    "rarity": 4,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Defender",
      "Defense"
    ]
  },
  {
    "id": "char_328_cammou",
    "nameEn": "Click",
    "nameRu": "Клик",
    "nameCn": "卡达",
    "rarity": 4,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Caster",
      "DPS",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_150_snakek",
    "nameEn": "Cuora",
    "nameRu": "Куора",
    "nameCn": "蛇屠箱",
    "rarity": 4,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Defender",
      "Defense"
    ]
  },
  {
    "id": "char_301_cutter",
    "nameEn": "Cutter",
    "nameRu": "Каттер",
    "nameCn": "刻刀",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "Nuker",
      "DPS"
    ]
  },
  {
    "id": "char_130_doberm",
    "nameEn": "Dobermann",
    "nameRu": "Доберманн",
    "nameCn": "杜宾",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS",
      "Support"
    ]
  },
  {
    "id": "char_183_skgoat",
    "nameEn": "Earthspirit",
    "nameRu": "Эрспирит",
    "nameCn": "地灵",
    "rarity": 4,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Supporter",
      "Slow"
    ]
  },
  {
    "id": "char_127_estell",
    "nameEn": "Estelle",
    "nameRu": "Эстель",
    "nameCn": "艾丝黛尔",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "AoE",
      "Survival"
    ]
  },
  {
    "id": "char_193_frostl",
    "nameEn": "Frostleaf",
    "nameRu": "Фростлиф",
    "nameCn": "霜叶",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "Slow",
      "DPS"
    ]
  },
  {
    "id": "char_109_fmout",
    "nameEn": "Gitano",
    "nameRu": "Гитано",
    "nameCn": "远山",
    "rarity": 4,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Caster",
      "AoE"
    ]
  },
  {
    "id": "char_237_gravel",
    "nameEn": "Gravel",
    "nameRu": "Гравел",
    "nameCn": "砾",
    "rarity": 4,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Specialist",
      "Fast-Redeploy",
      "Defense"
    ]
  },
  {
    "id": "char_253_greyy",
    "nameEn": "Greyy",
    "nameRu": "Грей",
    "nameCn": "格雷伊",
    "rarity": 4,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Caster",
      "AoE",
      "Slow"
    ]
  },
  {
    "id": "char_196_sunbr",
    "nameEn": "Gummy",
    "nameRu": "Гумми",
    "nameCn": "古米",
    "rarity": 4,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Defender",
      "Defense",
      "Healing"
    ]
  },
  {
    "id": "char_141_nights",
    "nameEn": "Haze",
    "nameRu": "Хейз",
    "nameCn": "夜烟",
    "rarity": 4,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Caster",
      "DPS",
      "Debuff"
    ]
  },
  {
    "id": "char_469_indigo",
    "nameEn": "Indigo",
    "nameRu": "Индиго",
    "nameCn": "深靛",
    "rarity": 4,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Caster",
      "DPS",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_347_jaksel",
    "nameEn": "Jackie",
    "nameRu": "Джеки",
    "nameCn": "杰克",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_272_strong",
    "nameEn": "Jaye",
    "nameRu": "Джей",
    "nameCn": "孑",
    "rarity": 4,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Specialist",
      "Fast-Redeploy",
      "DPS"
    ]
  },
  {
    "id": "char_235_jesica",
    "nameEn": "Jessica",
    "nameRu": "Джессика",
    "nameCn": "杰西卡",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_289_gyuki",
    "nameEn": "Matoimaru",
    "nameRu": "Матоймару",
    "nameCn": "缠丸",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "Survival",
      "DPS"
    ]
  },
  {
    "id": "char_199_yak",
    "nameEn": "Matterhorn",
    "nameRu": "Маттерхорн",
    "nameCn": "角峰",
    "rarity": 4,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Defender",
      "Defense"
    ]
  },
  {
    "id": "char_133_mm",
    "nameEn": "May",
    "nameRu": "Мэй",
    "nameCn": "梅",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS",
      "Slow"
    ]
  },
  {
    "id": "char_126_shotst",
    "nameEn": "Meteor",
    "nameRu": "Метеор",
    "nameCn": "流星",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS",
      "Debuff"
    ]
  },
  {
    "id": "char_185_frncat",
    "nameEn": "Mousse",
    "nameRu": "Мусс",
    "nameCn": "慕斯",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_117_myrrh",
    "nameEn": "Myrrh",
    "nameRu": "Мирра",
    "nameCn": "末药",
    "rarity": 4,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_151_myrtle",
    "nameEn": "Myrtle",
    "nameRu": "Миртл",
    "nameCn": "桃金娘",
    "rarity": 4,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "Healing"
    ]
  },
  {
    "id": "char_181_flower",
    "nameEn": "Perfumer",
    "nameRu": "Парфюмер",
    "nameCn": "调香师",
    "rarity": 4,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_440_pinecn",
    "nameEn": "Pinecone",
    "nameRu": "Пайнкон",
    "nameCn": "松果",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "AoE",
      "DPS"
    ]
  },
  {
    "id": "char_258_podego",
    "nameEn": "Podenco",
    "nameRu": "Поденко",
    "nameCn": "波登可",
    "rarity": 4,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Supporter",
      "Slow",
      "Healing"
    ]
  },
  {
    "id": "char_385_finlpp",
    "nameEn": "Purestream",
    "nameRu": "Пьюрстрим",
    "nameCn": "清流",
    "rarity": 4,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Medic",
      "Healing",
      "Support"
    ]
  },
  {
    "id": "char_236_rope",
    "nameEn": "Rope",
    "nameRu": "Роуп",
    "nameCn": "暗索",
    "rarity": 4,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Specialist",
      "Shift"
    ]
  },
  {
    "id": "char_149_scave",
    "nameEn": "Scavenger",
    "nameRu": "Скевенджер",
    "nameCn": "清道夫",
    "rarity": 4,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Vanguard",
      "DP-Recovery",
      "DPS"
    ]
  },
  {
    "id": "char_277_sqrrel",
    "nameEn": "Shaw",
    "nameRu": "Шоу",
    "nameCn": "阿消",
    "rarity": 4,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Specialist",
      "Shift"
    ]
  },
  {
    "id": "char_118_yuki",
    "nameEn": "Shirayuki",
    "nameRu": "Шираюки",
    "nameCn": "白雪",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "AoE",
      "Slow"
    ]
  },
  {
    "id": "char_298_susuro",
    "nameEn": "Sussurro",
    "nameRu": "Суссурро",
    "nameCn": "苏苏洛",
    "rarity": 4,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_337_utage",
    "nameEn": "Utage",
    "nameRu": "Утагэ",
    "nameCn": "宴",
    "rarity": 4,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_190_clour",
    "nameEn": "Vermeil",
    "nameRu": "Вермей",
    "nameCn": "红云",
    "rarity": 4,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_290_vigna",
    "nameEn": "Vigna",
    "nameRu": "Вайгна",
    "nameCn": "红豆",
    "rarity": 4,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Vanguard",
      "DPS",
      "DP-Recovery"
    ]
  },
  {
    "id": "char_211_adnach",
    "nameEn": "Adnachiel",
    "nameRu": "Аднахиэль",
    "nameCn": "安德切尔",
    "rarity": 3,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_212_ansel",
    "nameEn": "Ansel",
    "nameRu": "Ансель",
    "nameCn": "安赛尔",
    "rarity": 3,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_122_beagle",
    "nameEn": "Beagle",
    "nameRu": "Бигль",
    "nameCn": "米格鲁",
    "rarity": 3,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Defender",
      "Defense"
    ]
  },
  {
    "id": "char_282_catap",
    "nameEn": "Catapult",
    "nameRu": "Катапульта",
    "nameCn": "空爆",
    "rarity": 3,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "AoE"
    ]
  },
  {
    "id": "char_123_fang",
    "nameEn": "Fang",
    "nameRu": "Фэнг",
    "nameCn": "芬",
    "rarity": 3,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Vanguard",
      "DP-Recovery"
    ]
  },
  {
    "id": "char_120_hibisc",
    "nameEn": "Hibiscus",
    "nameRu": "Гибискус",
    "nameCn": "芙蓉",
    "rarity": 3,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_124_kroos",
    "nameEn": "Kroos",
    "nameRu": "Крус",
    "nameCn": "克洛丝",
    "rarity": 3,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Sniper",
      "DPS"
    ]
  },
  {
    "id": "char_121_lava",
    "nameEn": "Lava",
    "nameRu": "Лава",
    "nameCn": "炎熔",
    "rarity": 3,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Caster",
      "AoE"
    ]
  },
  {
    "id": "char_208_melan",
    "nameEn": "Melantha",
    "nameRu": "Меланта",
    "nameCn": "玫兰莎",
    "rarity": 3,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS",
      "Survival"
    ]
  },
  {
    "id": "char_283_midn",
    "nameEn": "Midnight",
    "nameRu": "Миднайт",
    "nameCn": "月见夜",
    "rarity": 3,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "DPS"
    ]
  },
  {
    "id": "char_278_orchid",
    "nameEn": "Orchid",
    "nameRu": "Орхидея",
    "nameCn": "梓兰",
    "rarity": 3,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Supporter",
      "Slow"
    ]
  },
  {
    "id": "char_192_falco",
    "nameEn": "Plume",
    "nameRu": "Плюм",
    "nameCn": "翎羽",
    "rarity": 3,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Vanguard",
      "DPS",
      "DP-Recovery"
    ]
  },
  {
    "id": "char_281_popka",
    "nameEn": "Popukar",
    "nameRu": "Попукар",
    "nameCn": "泡普卡",
    "rarity": 3,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Guard",
      "AoE",
      "Survival"
    ]
  },
  {
    "id": "char_284_spot",
    "nameEn": "Spot",
    "nameRu": "Спот",
    "nameCn": "斑点",
    "rarity": 3,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Defender",
      "Defense",
      "Healing"
    ]
  },
  {
    "id": "char_210_stward",
    "nameEn": "Steward",
    "nameRu": "Стюард",
    "nameCn": "史都华德",
    "rarity": 3,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Ranged",
      "Caster",
      "DPS"
    ]
  },
  {
    "id": "char_240_wyvern",
    "nameEn": "Vanilla",
    "nameRu": "Ванилла",
    "nameCn": "香草",
    "rarity": 3,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Melee",
      "Vanguard",
      "DP-Recovery"
    ]
  },
  {
    "id": "char_009_12fce",
    "nameEn": "12F",
    "nameRu": "12F",
    "nameCn": "12F",
    "rarity": 2,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Starter",
      "Ranged",
      "Caster"
    ]
  },
  {
    "id": "char_501_durin",
    "nameEn": "Durin",
    "nameRu": "Дурин",
    "nameCn": "杜林",
    "rarity": 2,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Starter",
      "Ranged",
      "Caster"
    ]
  },
  {
    "id": "char_500_noirc",
    "nameEn": "Noir Corne",
    "nameRu": "Нуар Корн",
    "nameCn": "黑角",
    "rarity": 2,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Starter",
      "Melee",
      "Defender"
    ]
  },
  {
    "id": "char_503_rang",
    "nameEn": "Rangers",
    "nameRu": "Рейнджерс",
    "nameCn": "巡林者",
    "rarity": 2,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Starter",
      "Ranged",
      "Sniper"
    ]
  },
  {
    "id": "char_502_nblade",
    "nameEn": "Yato",
    "nameRu": "Ято",
    "nameCn": "夜刀",
    "rarity": 2,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Starter",
      "Melee",
      "Vanguard"
    ]
  },
  {
    "id": "char_286_cast3",
    "nameEn": "Castle-3",
    "nameRu": "Касл-3",
    "nameCn": "Castle-3",
    "rarity": 1,
    "profession": "WARRIOR",
    "position": "MELEE",
    "tags": [
      "Robot",
      "Melee",
      "Guard",
      "Support"
    ]
  },
  {
    "id": "char_4188_confes",
    "nameEn": "CONFESS-47",
    "nameRu": "CONFESS-47",
    "nameCn": "CONFESS-47",
    "rarity": 1,
    "profession": "PIONEER",
    "position": "MELEE",
    "tags": [
      "Robot",
      "Melee",
      "Vanguard",
      "Crowd-Control"
    ]
  },
  {
    "id": "char_4093_frston",
    "nameEn": "Friston-3",
    "nameRu": "Фристон-3",
    "nameCn": "Friston-3",
    "rarity": 1,
    "profession": "TANK",
    "position": "MELEE",
    "tags": [
      "Robot",
      "Melee",
      "Defender",
      "Defense"
    ]
  },
  {
    "id": "char_4227_gallus",
    "nameEn": "GALLUS²",
    "nameRu": "GALLUS²",
    "nameCn": "GALLUS²",
    "rarity": 1,
    "profession": "CASTER",
    "position": "RANGED",
    "tags": [
      "Robot",
      "Ranged",
      "Caster",
      "Debuff"
    ]
  },
  {
    "id": "char_4000_jnight",
    "nameEn": "Justice Knight",
    "nameRu": "Джастис Найт",
    "nameCn": "正义骑士号",
    "rarity": 1,
    "profession": "SNIPER",
    "position": "RANGED",
    "tags": [
      "Robot",
      "Ranged",
      "Sniper",
      "Support"
    ]
  },
  {
    "id": "char_285_medic2",
    "nameEn": "Lancet-2",
    "nameRu": "Ланцет-2",
    "nameCn": "Lancet-2",
    "rarity": 1,
    "profession": "MEDIC",
    "position": "RANGED",
    "tags": [
      "Robot",
      "Ranged",
      "Medic",
      "Healing"
    ]
  },
  {
    "id": "char_4136_phonor",
    "nameEn": "PhonoR-0",
    "nameRu": "ФоноР-0",
    "nameCn": "PhonoR-0",
    "rarity": 1,
    "profession": "SUPPORT",
    "position": "RANGED",
    "tags": [
      "Robot",
      "Ranged",
      "Supporter"
    ]
  },
  {
    "id": "char_376_therex",
    "nameEn": "THRM-EX",
    "nameRu": "THRM-EX",
    "nameCn": "THRM-EX",
    "rarity": 1,
    "profession": "SPECIAL",
    "position": "MELEE",
    "tags": [
      "Robot",
      "Melee",
      "Specialist",
      "Nuker"
    ]
  }
];
