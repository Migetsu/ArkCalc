/**
 * Pre-compiled Static Russian Translations for Arknights
 *
 * Provides offline-first instant lookup for:
 * - Skill names and descriptions (especially for new CN operators and meta 6-stars)
 * - Operator talents
 * - Common status terms and traits
 *
 * This runs completely offline with 0 network latency and 0 rate limits.
 */

export interface StaticOperatorSkill {
  name: string;
  description?: string;
}

export interface StaticOperatorEntry {
  skills?: Record<string, StaticOperatorSkill>; // skillId -> { name, description }
  talents?: { name: string; description: string }[];
  quote?: string;
}

export const STATIC_TRANSLATIONS_RU: Record<string, string> = {
  // Common game mechanics & UI
  'Auto Recovery': 'Авто-зарядка',
  'Offensive Recovery': 'При атаке',
  'Defensive Recovery': 'При получении урона',
  'Passive': 'Пассивный',
  'Manual Trigger': 'Ручная активация',
  'Auto Trigger': 'Авто-активация',
  'Instant': 'Мгновенно',
  'Infinite': 'Бесконечно',
  'Unlimited duration': 'Бесконечная длительность',
  'Physical Damage': 'Физический урон',
  'Arts Damage': 'Магический урон',
  'True Damage': 'Чистый урон',
  'Elemental Damage': 'Элементальный урон',
  'Max HP': 'Макс. HP',
  'ATK': 'СИЛ АТК',
  'DEF': 'ЗАЩ',
  'RES': 'СОПР',
  'Attack Speed': 'СКОР АТК',
  'Block': 'Блокирование',
  'Redeployment': 'Передислокация',
  'DP Cost': 'Стоимость DP',
  'Initial SP': 'Начальный SP',
  'SP Cost': 'Стоимость SP',
  'Duration': 'Длительность',

  // Status effects
  'Stun': 'Оглушение',
  'Silence': 'Немота',
  'Freeze': 'Заморозка',
  'Cold': 'Озноб',
  'Bind': 'Обездвиживание',
  'Sleep': 'Сон',
  'Levitate': 'Левитация',
  'Slow': 'Замедление',
  'Sluggish': 'Замедление',
  'Camouflage': 'Маскировка',
  'Invisibility': 'Невидимость',
  'Shelter': 'Укрытие',
  'Fragile': 'Хрупкость',
  'Sanity': 'Рассудок',

  // Curated skills & names
  'Hot Spring Healing': 'Целебный горячий источник',
  'Pure White Veil': 'Белоснежная вуаль',
  'Silent Blessing': 'Безмолвное благословение',
  'Destreza': 'Дестреза',
  'True Silver Slash': 'Истинный удар серебра',
  'Twilight': 'Сумерки',
  'Volcano': 'Вулкан',
  'Tears of Cleansing': 'Слёзы очищения',
  'Fleeting Rainbow': 'Мимолётная радуга',
  'Corrosive Breath': 'Едкое дыхание',
  'Wolf Pack': 'Волчья стая',
  'Overload': 'Перегрузка',
  'Calcification': 'Кальцификация',
  'Chivalric Commandment': 'Рыцарская заповедь',
  'Midnight Tide': 'Полуночный прилив',
  'Anchor Drop': 'Бросок якоря',
  'Echo of the Deep': 'Эхо глубин',
  'Splitting the Waves': 'Рассекающий волны',
  'Explosive Revelry': 'Взрывное веселье',
  'Wandering Spirits': 'Блуждающие духи',
  'Symphony of Ruin': 'Симфония гибели',
};

/**
 * Curated per-operator offline translations (skills, talents, quotes)
 */
export const STATIC_OPERATOR_DATA_RU: Record<string, StaticOperatorEntry> = {
  // Eyjafjalla the Hvít Aska
  char_2023_aska: {
    skills: {
      skchr_aska_1: {
        name: 'Безмолвное благословение',
        description: 'Радиус атаки увеличивается. Атаки лечат 2 союзников одновременно на {ep_heal_ratio:0%} от силы атаки оперативника. Бесконечная длительность.',
      },
      skchr_aska_2: {
        name: 'Белоснежная вуаль',
        description: 'Мгновенно накладывает на всех союзников в радиусе барьер прочностью в {shield.atk_scale:0%} от силы атаки, поглощающий элементальный урон.',
      },
      skchr_aska_3: {
        name: 'Целебный горячий источник',
        description: 'Радиус атаки расширяется на всё поле боя. Атаки лечат до 5 союзников одновременно, снижают получаемый ими элементальный урон и усиливают их Макс. HP.',
      },
    },
    talents: [
      {
        name: 'Пепел и снег',
        description: 'Союзники в радиусе действия получают эффект Укрытия (получают на 12% меньше урона) и восстанавливают элементальное здоровье.',
      },
      {
        name: 'Неугасающее тепло',
        description: 'Все медики на поле боя получают +10% к силе атаки.',
      },
    ],
    quote: 'Даже среди пепла и холода жизнь обязательно найдет дорогу к теплу.',
  },

  // Wis'adel (Walter)
  char_1044_walter: {
    skills: {
      skchr_walter_1: {
        name: 'Громовой салют',
        description: 'Следующая атака выпускает усиленный снаряд, наносящий {atk_scale:0%} физического урона всем врагам в зоне взрыва и призывающий призрачный отголосок.',
      },
      skchr_walter_2: {
        name: 'Тени прошлого',
        description: 'Интервал атак увеличивается, сила атаки возрастает до {atk_scale:0%}. Снаряды оставляют на земле призрачные мины, взрывающиеся при контакте с врагом.',
      },
      skchr_walter_3: {
        name: 'Реквием по Казделю',
        description: 'Призывает мощных духов предков. Сила атаки увеличивается до {atk_scale:0%}, атаки наносят колоссальный урон по огромной площади и оглушают цели.',
      },
    },
    talents: [
      {
        name: 'Завещание Сарказа',
        description: 'Призывает на поле боя призрачных миньонов, которые перехватывают атаки врагов и наносят ответный урон.',
      },
      {
        name: 'Пляска теней',
        description: 'Получает эффект Маскировки, пока рядом находятся призванные духи.',
      },
    ],
    quote: 'Мы танцуем на руинах старого мира, чтобы построить новый.',
  },

  // Ulpianus
  char_1038_ulpian: {
    skills: {
      skchr_ulpian_1: {
        name: 'Разрез глубин',
        description: 'Следующая атака наносит {atk_scale:0%} физического урона и притягивает врага к себе.',
      },
      skchr_ulpian_2: {
        name: 'Несокрушимый якорь',
        description: 'Вонзает якорь в землю, получая постоянный бонус к силе атаки и защите. Бесконечная длительность.',
      },
      skchr_ulpian_3: {
        name: 'Штормовой шквал',
        description: 'Бросает тяжелый якорь в целевую область, перемещается к нему и наносит сокрушительный круговой урон по волнам врагов.',
      },
    },
    talents: [
      {
        name: 'Бурлящий прилив',
        description: 'Все Абиссальные охотники получают +18% к Макс. HP и +20% к СИЛ АТК. Урон от Сиборнов снижается на 30%.',
      },
      {
        name: 'Якорь бездны',
        description: 'Атаки игнорируют 250 защиты цели. Уничтожение врага восстанавливает 2 SP и 10% Макс. HP.',
      },
    ],
    quote: 'Даже в самой глубокой океанической впадине огонь разума никогда не угаснет.',
  },

  // Logos
  char_1045_logos: {
    skills: {
      skchr_logos_1: {
        name: 'Слово очищения',
        description: 'Атаки мгновенно уничтожают врагов с уровнем здоровья ниже определенного порога, восстанавливая SP.',
      },
      skchr_logos_2: {
        name: 'Печать вечности',
        description: 'Замедляет всех врагов в радиусе и наносит периодический магический урон, увеличивающийся со временем.',
      },
      skchr_logos_3: {
        name: 'Закон древних рун',
        description: 'Радиус атаки увеличивается, атакует до 3 целей одновременно с огромным бонусом к силе атаки и замедляет полет вражеских снарядов.',
      },
    },
    talents: [
      {
        name: 'Костяная табличка',
        description: 'Атаки накладывают на цели рунический эффект, усиливающий входящий магический урон.',
      },
      {
        name: 'Лексикон предков',
        description: 'Снижает сопротивление магии врагов вокруг оперативника на 10 единиц.',
      },
    ],
    quote: 'Руны не лгут. Слова определяют законы бытия.',
  },

  // Pepe
  char_1037_pepe: {
    skills: {
      skchr_pepe_1: {
        name: 'Золотой ритм',
        description: 'Следующая атака наносит {atk_scale:0%} урона и оглушает цель.',
      },
      skchr_pepe_2: {
        name: 'Песчаная буря',
        description: 'Увеличивает радиус атаки и наносит серию мощных дробящих ударов по нескольким целям.',
      },
      skchr_pepe_3: {
        name: 'Танец золотого молота',
        description: 'Сила атаки значительно возрастает, атаки наносят урон по площади вокруг оперативника и опрокидывают врагов.',
      },
    },
    talents: [
      {
        name: 'Пляшущий молот',
        description: 'При атаке с вероятностью 25% наносит 180% урона и оглушает цель на 1.5 секунды.',
      },
      {
        name: 'Золотой скипетр',
        description: 'Получает +15% СИЛ АТК и +15 СКОР АТК при блокировании врагов. Получает на 15% меньше физического урона.',
      },
    ],
    quote: 'Золотые пески помнят каждый удар радости и отваги.',
  },

  // Thorns
  char_293_thorns: {
    skills: {
      skchr_thorns_3: {
        name: 'Дестреза',
        description: 'Радиус атаки увеличивается, сила атаки +{atk:0%}, скорость атаки +{attack_speed}. При втором использовании навыка бонусы удваиваются, а длительность становится бесконечной.',
      },
    },
  },

  // SilverAsh
  char_010_chen: {
    skills: {
      skchr_chen_3: {
        name: 'Теневой клинок',
        description: 'Проводит серию из 10 сокрушительных ударов по случайным врагам в радиусе, нанося колоссальный физический урон.',
      },
    },
  },

  // Surtr
  char_350_surtr: {
    skills: {
      skchr_surtr_3: {
        name: 'Сумерки',
        description: 'Мгновенно восстанавливает всё HP. Сила атаки +{atk:0%}, радиус атаки +{range}, атакует до {max_target} целей одновременно. HP постепенно теряется до нуля.',
      },
    },
  },

  // Młynar
  char_4016_mlynar: {
    skills: {
      skchr_mlynar_3: {
        name: 'Сияние клинка',
        description: 'Радиус атаки увеличивается, наносит 180% урона до 5 врагам одновременно и наносит чистый урон при атаках врагов по союзникам Казимежа.',
      },
    },
  },

  // Angelina the Mellow Wish
  char_1047_halo2: {
    talents: [
      {
        name: 'Парящая над землёй',
        description: 'Атаки наносят дополнительный магический урон в размере 30% (+5%) от силы атаки, увеличиваясь до 45% (+10%) против врагов с низким весом (вес ≤ 3). В состоянии Левитации враги в радиусе атаки получают статус Невесомости (их вес снижается на 1).',
      },
      {
        name: 'Танец в небесах',
        description: 'Пока находится на поле боя, все союзники в состоянии Левитации получают +18% (+5%) к силе атаки и при блокировании восстанавливают 10% (+2%) от своего максимального HP в секунду.',
      },
    ],
    quote: 'Когда ты позовёшь её, она непременно оседлает ветер и вернётся к тебе.',
  },
  char_1038_angel2: {
    talents: [
      {
        name: 'Парящая над землёй',
        description: 'Атаки наносят дополнительный магический урон в размере 30% (+5%) от силы атаки, увеличиваясь до 45% (+10%) против врагов с низким весом (вес ≤ 3). В состоянии Левитации враги в радиусе атаки получают статус Невесомости (их вес снижается на 1).',
      },
      {
        name: 'Танец в небесах',
        description: 'Пока находится на поле боя, все союзники в состоянии Левитации получают +18% (+5%) к силе атаки и при блокировании восстанавливают 10% (+2%) от своего максимального HP в секунду.',
      },
    ],
    quote: 'Когда ты позовёшь её, она непременно оседлает ветер и вернётся к тебе.',
  },

  // Angelina (Original)
  char_291_aglina: {
    talents: [
      {
        name: 'Ускорение частиц',
        description: 'Пока навыки не активны, постепенно восстанавливает SP всем союзникам (+0.25 SP в секунду).',
      },
      {
        name: 'Поле невесомости',
        description: 'Пока находится на поле боя, увеличивает скорость атаки всех союзников на +7 (+8).',
      },
    ],
    quote: 'Доставка посылок Родос Айленда! Где бы ты ни был, я обязательно найду тебя.',
  },
};

/**
 * Checks if static translation exists for a skill
 */
export function getStaticSkillTranslation(
  charId: string,
  skillId: string
): StaticOperatorSkill | undefined {
  return STATIC_OPERATOR_DATA_RU[charId]?.skills?.[skillId];
}

/**
 * Checks if static text exists for a generic string
 */
export function getStaticTextTranslation(text: string): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  return STATIC_TRANSLATIONS_RU[trimmed] || STATIC_TRANSLATIONS_RU[trimmed.toLowerCase()];
}
