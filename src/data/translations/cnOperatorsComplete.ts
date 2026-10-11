/**
 * Complete English and Russian Offline Localization for all CN-exclusive operators
 * Covers all 55 CN operators and all their unique talents.
 */

export interface OperatorTalentLocalization {
  name: string;
  description: string;
}

export interface OperatorCompleteLocalization {
  nameEn: string;
  nameRu: string;
  quoteEn?: string;
  quoteRu?: string;
  traitEn?: string;
  traitRu?: string;
  talents: {
    nameEn: string;
    nameRu: string;
    descriptionEn: string;
    descriptionRu: string;
  }[];
}

export const CN_OPERATORS_LOCALIZATION: Record<string, OperatorCompleteLocalization> = {
  // Angelina the Mellow Wish
  char_1015_aglna2: {
    nameEn: 'Angelina the Mellow Wish',
    nameRu: 'Анджелина Меллоу Уиш',
    quoteEn: 'When you need her, she will surely ride the wind back to your side.',
    quoteRu: 'Когда ты позовёшь её, она непременно оседлает ветер и вернётся к тебе.',
    traitEn: 'Controls a floating Drone to attack enemies; Drone damage increases the longer it attacks the same target.',
    traitRu: 'Дрон-маг: управляет парящим дроном, непрерывно атакующим врага; урон дрона нарастает по мере атаки по одной цели.',
    talents: [
      {
        nameEn: 'Floating Above the Earth',
        nameRu: 'Парящая над землёй',
        descriptionEn:
          "Attacks deal additional Arts damage equal to 30% (+5%) of ATK, increased to 45% (+10%) against lighter enemies (weight ≤ 3); While airborne, causes enemies within attack range to become Weightless.",
        descriptionRu:
          'Атаки наносят дополнительный урон искусством в размере 30% (+5%) от силы атаки, увеличиваясь до 45% (+10%) против врагов с низким весом (вес ≤ 3). В состоянии Левитации враги в радиусе атаки получают статус Невесомости.',
      },
      {
        nameEn: 'Dance in the Heavens',
        nameRu: 'Танец в небесах',
        descriptionEn:
          'When deployed, all airborne allied operators gain +18% (+5%) ATK and restore 10% (+2%) max HP per second while blocking.',
        descriptionRu:
          'Пока находится на поле боя, все союзники в состоянии Левитации получают +18% (+5%) к силе атаки и при блокировании восстанавливают 10% (+2%) от своего максимального HP в секунду.',
      },
    ],
  },

  // SilverAsh the Reignfrost
  char_1045_svash2: {
    nameEn: 'SilverAsh the Reignfrost',
    nameRu: 'СильверЭш, Владыка Снегов',
    quoteEn: 'Karlan will never yield to the storm; we are the mountain itself.',
    quoteRu: 'Карлан никогда не уступит буре; мы и есть сама гора.',
    traitEn: 'Lord: Can execute ranged attacks that deal 80% ATK damage.',
    traitRu: 'Владыка: может наносить дальние атаки с 80% силы атаки.',
    talents: [
      {
        nameEn: 'Open Opening',
        nameRu: 'Открытый дебют',
        descriptionEn:
          'Reduces redeployment time of all allies by 12%. When deployed, reveals Invisible enemies in attack range.',
        descriptionRu:
          'Сокращает время передислокации всех союзников на 12%. При развёртывании раскрывает невидимых врагов в радиусе атаки.',
      },
      {
        nameEn: 'Snow Realm Pioneer',
        nameRu: 'Первопроходец снежного края',
        descriptionEn:
          'Karlan Commercial operators gain +15% ATK and +15% DEF. Frozen enemies take +20% Physical damage.',
        descriptionRu:
          'Оперативники Карлана получают +15% к силе атаки и +15% к защите. Замороженные враги получают на 20% больше физического урона.',
      },
    ],
  },

  // Closure
  char_4228_closur: {
    nameEn: 'Closure',
    nameRu: 'Кложур',
    quoteEn: 'Everything has a price, Doctor, but my help comes with a lifetime guarantee!',
    quoteRu: 'У всего есть своя цена, Доктор, но моя помощь идёт с пожизненной гарантией!',
    traitEn: 'Controls specialized technical drones to manipulate battlefield conditions.',
    traitRu: 'Специалист-инженер: использует тактических дронов для контроля поля боя.',
    talents: [
      {
        nameEn: 'Precision Deployment',
        nameRu: 'Точное развёртывание',
        descriptionEn: 'Can carry 3 Technical Drones with various deployment buffs.',
        descriptionRu: 'Может нести 3 технических дрона с различными бонусами для поля боя.',
      },
      {
        nameEn: 'Limit Dispatch',
        nameRu: 'Предельное управление',
        descriptionEn: 'When drones are destroyed or retrieved, grants +2 DP and restores 5% HP to allies.',
        descriptionRu: 'При уничтожении или отзыве дронов восстанавливает 2 DP и 5% HP союзникам.',
      },
    ],
  },

  // Ch'en the Dawnstreak
  char_1050_chen3: {
    nameEn: 'Ch\'en the Dawnstreak',
    nameRu: 'Чэнь, Рассветный Клинок',
    quoteEn: 'The blade knows no hesitation when morning pierces the dark.',
    quoteRu: 'Клинок не знает колебаний, когда утренний рассвет пронзает тьму.',
    traitEn: 'Swordmaster: Normal attacks deal damage twice.',
    traitRu: 'Мастер меча: обычные атаки наносят урон дважды.',
    talents: [
      {
        nameEn: 'Form & Will Illumination',
        nameRu: 'Озарение формы и воли',
        descriptionEn: 'Attacks deal additional Arts damage and ignore 15% DEF.',
        descriptionRu: 'Атаки наносят дополнительный урон искусством и игнорируют 15% защиты цели.',
      },
      {
        nameEn: 'Perception of Cold & Heat',
        nameRu: 'Ощущение холода и жары',
        descriptionEn: 'Gains 15% Sanctuary against Arts and Elemental damage.',
        descriptionRu: 'Получает 15% Укрытия от урона искусством и элементального урона.',
      },
    ],
  },

  // Zima the Raging Tide
  char_1051_headb2: {
    nameEn: 'Zima the Raging Tide',
    nameRu: 'Зима, Яростный Прилив',
    quoteEn: 'Get out of my way or get crushed under the tide!',
    quoteRu: 'Убирайся с дороги или тебя сомнет приливом!',
    traitEn: 'Vanguard: Blocks 2 enemies and generates DP.',
    traitRu: 'Авангард: блокирует 2 врагов, вырабатывает очки развёртывания (DP).',
    talents: [
      {
        nameEn: 'Raging Fury',
        nameRu: 'Бушующая ярость',
        descriptionEn: 'When attacking, has a 20% chance to deal 150% damage and Stun for 1s.',
        descriptionRu: 'При атаке имеет 20% шанс нанести 150% урона и оглушить цель на 1 сек.',
      },
      {
        nameEn: 'Tide of the Multitude',
        nameRu: 'Волна множества',
        descriptionEn: 'Ursus operators gain +10% ATK and +15% Max HP.',
        descriptionRu: 'Оперативники Урсуса получают +10% к силе атаки и +15% к Макс. HP.',
      },
    ],
  },

  // Kal'tsit the Esperanta
  char_1052_kalts2: {
    nameEn: 'Kal\'tsit the Esperanta',
    nameRu: 'Кельцит, Надежда Прошлого',
    quoteEn: 'Hope is not an illusion; it is the stubborn pulse of survival.',
    quoteRu: 'Надежда — это не иллюзия; это упрямый пульс выживания.',
    traitEn: 'Restores ally HP and commands Mon3tr in battle.',
    traitRu: 'Медик-командир: исцеляет союзников и призывает на поле боя Mon3tr.',
    talents: [
      {
        nameEn: 'Vigil of the Dust',
        nameRu: 'Дозор ушедшей пыли',
        descriptionEn: 'Mon3tr deals True damage and reflects 25% of damage received.',
        descriptionRu: 'Mon3tr наносит чистый урон и отражает 25% полученного урона.',
      },
      {
        nameEn: 'Monument of the Healer',
        nameRu: 'Монумент врачевателя',
        descriptionEn: 'Increases healing effectiveness by 20% for allies with low HP.',
        descriptionRu: 'Эффективность исцеления союзников с низким HP возрастает на 20%.',
      },
    ],
  },

  // Hoshiguma the Breacher
  char_1044_hsgma2: {
    nameEn: 'Hoshiguma the Breacher',
    nameRu: 'Хошигума, Сокрушительница',
    quoteEn: 'Stand behind me. Nothing gets past Hannya.',
    quoteRu: 'Встаньте за мной. Ничто не пройдет сквозь Хання.',
    traitEn: 'Juggernaut: Cannot be healed by allies; restores HP when attacking.',
    traitRu: 'Джаггернаут: не может быть исцелена союзниками; восстанавливает HP при атаках.',
    talents: [
      {
        nameEn: 'Karmic Fire',
        nameRu: 'Кармическое пламя',
        descriptionEn: 'When blocking enemies, reflects 30% of incoming physical damage as Arts damage.',
        descriptionRu: 'При блокировании врагов отражает 30% входящего физического урона в виде урона искусством.',
      },
      {
        nameEn: 'Stance of the Oni',
        nameRu: 'Стойка Они',
        descriptionEn: 'DEF +20% and gains 25% physical resistance.',
        descriptionRu: 'Защита +20%, получает 25% сопротивления физическому урону.',
      },
    ],
  },

  // Pramanix the Prerita
  char_1046_sbell2: {
    nameEn: 'Pramanix the Prerita',
    nameRu: 'Праманикс, Глашатай Священной Горы',
    quoteEn: 'Listen to the bells of Kjerag; their echoes cleanse all impurity.',
    quoteRu: 'Слушай колокола Кьерага; их эхо очищает от любой скверны.',
    traitEn: 'Decel Binder: Deals Arts damage and slows enemies.',
    traitRu: 'Замедлитель: наносит урон искусством и замедляет врагов.',
    talents: [
      {
        nameEn: 'Boundless Snowscape',
        nameRu: 'Бескрайний снежный пейзаж',
        descriptionEn: 'Enemies in attack range take +15% Arts damage and have -15% RES.',
        descriptionRu: 'Враги в радиусе атаки получают на 15% больше урона искусством и теряют 15% сопротивления искусствам.',
      },
      {
        nameEn: 'Blessing of the Holy Mountain',
        nameRu: 'Благословение священной горы',
        descriptionEn: 'All allies gain +10 RES and +10% status resistance.',
        descriptionRu: 'Все союзники получают +10 сопротивления искусствам и +10% сопротивления эффектам.',
      },
    ],
  },

  // Leizi the Thunderbringer
  char_1043_leizi2: {
    nameEn: 'Leizi the Thunderbringer',
    nameRu: 'Лейзи, Несущая Гром',
    quoteEn: 'The imperial law strikes swifter than lightning.',
    quoteRu: 'Имперский закон разит быстрее, чем молния.',
    traitEn: 'Chain Caster: Attacks jump between enemies, dealing Arts damage.',
    traitRu: 'Цепной кастер: атаки перескакивают между врагами, нанося урон искусством.',
    talents: [
      {
        nameEn: 'Lucid Judgment',
        nameRu: 'Ясное суждение',
        descriptionEn: 'Lightning jumps do not decay in damage when hitting slowed enemies.',
        descriptionRu: 'Урон от скачков молнии не снижается при попадании по замедленным врагам.',
      },
      {
        nameEn: 'Accountability',
        nameRu: 'Призыв к ответу',
        descriptionEn: 'Attacks inflict Paralyze for 1.5s after 4 consecutive hits on the same target.',
        descriptionRu: 'Атаки вызывают Паралич на 1.5 сек. после 4 последовательных попаданий по одной цели.',
      },
    ],
  },

  // Viy (Veen)
  char_4226_veen: {
    nameEn: 'Vii',
    nameRu: 'Вий',
    quoteEn: 'Raise my eyelids, and I will see their souls.',
    quoteRu: 'Поднимите мне веки, и я узрю их души.',
    traitEn: 'Reaper: Attacks hit all enemies in range.',
    traitRu: 'Жнец: атаки поражают всех врагов в радиусе действия.',
    talents: [
      {
        nameEn: '"Before Drawing the Blade"',
        nameRu: '«Прежде чем обнажить клинок»',
        descriptionEn: 'Increases ATK by +25% when attacking enemies with more than 50% HP.',
        descriptionRu: 'Сила атаки +25% при атаке врагов с запасом HP выше 50%.',
      },
      {
        nameEn: 'Art of War',
        nameRu: 'Искусство войны',
        descriptionEn: 'Gains 15 ASPD and recovers 80 HP for each enemy struck.',
        descriptionRu: 'Получает +15 к скорости атаки и восстанавливает 80 HP за каждого пораженного врага.',
      },
    ],
  },

  // Astgenne the Lightchaser
  char_1047_halo2: {
    nameEn: 'Astgenne the Lightchaser',
    nameRu: 'Астгенн, Преследующая Свет',
    quoteEn: 'Starlight is the ancient data left by time.',
    quoteRu: 'Звездный свет — это древние данные, оставленные временем.',
    traitEn: 'Chain Caster: Attacks bounce between enemies, dealing Arts damage.',
    traitRu: 'Цепной кастер: атаки рикошетят между врагами, нанося урон искусством.',
    talents: [
      {
        nameEn: 'Data Modeling',
        nameRu: 'Моделирование данных',
        descriptionEn: 'Attacks gain +3% ATK for each bounce, stacking up to 5 times.',
        descriptionRu: 'Сила атаки возрастает на 3% за каждый отскок снаряда (суммируется до 5 раз).',
      },
      {
        nameEn: 'Energy Analysis',
        nameRu: 'Анализ энергии',
        descriptionEn: 'When attacking an enemy for the first time, restores 1 SP.',
        descriptionRu: 'При первой атаке по новому врагу восстанавливает 1 SP.',
      },
    ],
  },

  // Snegurochka (Wintim)
  char_4208_wintim: {
    nameEn: 'Snegurochka',
    nameRu: 'Снегурочка',
    quoteEn: 'A breath of frost brings peace to weary souls.',
    quoteRu: 'Морозное дыхание приносит покой усталым душам.',
    traitEn: 'Core Caster: Deals Arts damage.',
    traitRu: 'Кастер: наносит урон искусством.',
    talents: [
      {
        nameEn: 'Swift Quill',
        nameRu: 'Быстрое перо',
        descriptionEn: 'Attacks inflict Cold status on targets for 2.5 seconds.',
        descriptionRu: 'Атаки накладывают эффект Озноба на цель на 2.5 сек.',
      },
    ],
  },

  // Makoto Yuki (P3 Collab)
  char_4217_makoto: {
    nameEn: 'Makoto Yuki',
    nameRu: 'Макото Юки',
    quoteEn: 'I will face the journey, wherever it leads.',
    quoteRu: 'Я приму этот путь, куда бы он ни вёл.',
    traitEn: 'Liberator: Does not attack or block when skill is inactive, charging ATK.',
    traitRu: 'Освободитель: не атакует и не блокирует, пока навык не активен, накапливая урон.',
    talents: [
      {
        nameEn: 'Wild Power',
        nameRu: 'Неукротимая сила',
        descriptionEn: 'Can switch Persona during combat to adapt attack type.',
        descriptionRu: 'Может менять Персону во время боя, адаптируя тип урона.',
      },
      {
        nameEn: 'S.E.E.S. Leader',
        nameRu: 'Лидер S.E.E.S.',
        descriptionEn: 'When deployed, SEES members gain +15% ATK and +10 Initial SP.',
        descriptionRu: 'При развёртывании члены отряда SEES получают +15% силы атаки и +10 начальных SP.',
      },
    ],
  },

  // Aegis (P3 Collab)
  char_4218_aigis: {
    nameEn: 'Aegis',
    nameRu: 'Эгида (Aegis)',
    quoteEn: 'I will protect you with all my mechanical firepower.',
    quoteRu: 'Я защищу вас всей своей механической огневой мощью.',
    traitEn: 'Defender: Blocks 3 enemies.',
    traitRu: 'Защитник: блокирует 3 врагов.',
    talents: [
      {
        nameEn: 'Anti-Shadow Suppression Gear',
        nameRu: 'Спецснаряжение подавления теней',
        descriptionEn: 'DEF +25%; reflects 20% Physical damage back to attacker.',
        descriptionRu: 'Защита +25%; отражает 20% физического урона обратно атакующему.',
      },
    ],
  },

  // Wang (Sui sibling)
  char_2027_wang: {
    nameEn: 'Wang',
    nameRu: 'Ван',
    quoteEn: 'The chessboard of the mortal realm is but a fleeting game.',
    quoteRu: 'Шахматная доска смертного мира — всего лишь мимолетная игра.',
    traitEn: 'Tactician: Deploys a summons within range to fight alongside.',
    traitRu: 'Тактик: призывает на поле боя помощника для совместной борьбы.',
    talents: [
      {
        nameEn: 'Forged Piece',
        nameRu: 'Выкованная фигура',
        descriptionEn: 'Can summon a stone pawn on the field that taunts enemies.',
        descriptionRu: 'Может призвать на поле каменную пешку, провоцирующую врагов.',
      },
      {
        nameEn: 'Anticipating the Foe',
        nameRu: 'Предугадывание врага',
        descriptionEn: 'Allies attacking enemies blocked by Wang or his summons gain +18% ATK.',
        descriptionRu: 'Союзники, атакующие заблокированных Ваном или его фигурой врагов, получают +18% к силе атаки.',
      },
    ],
  },

  // Koromaru (Auto-synced CN operator)
  char_4220_kormr: {
    nameEn: "Koromaru",
    nameRu: "Koromaru",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Attacks deal damage twice.",
    traitRu: "Мастер клинка: обычные атаки наносят урон дважды.",
    talents: [
      {
        nameEn: "黑色猎犬·VI",
        nameRu: "黑色猎犬·VI",
        descriptionEn: "部署后对周围一定范围内最近的1名敌人发动总计6次无视闪避的斩击，每次斩击造成相当于攻击力200%的法术伤害，最后一次斩击改为造成攻击力400%的法术伤害并使目标恐惧4秒",
        descriptionRu: "部署后对周围一定范围内最近的1名敌人发动总计6次无视闪避的斩击，每次斩击造成相当于攻击力200%的法术伤害，最后一次斩击改为造成攻击力400%的法术伤害并使目标恐惧4秒",
      },
    ],
  },

  // GALLUS² (Auto-synced CN operator)
  char_4227_gallus: {
    nameEn: "GALLUS²",
    nameRu: "GALLUS²",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Attacks deal Arts damage.",
    traitRu: "Боевой маг: обычные атаки наносят урон искусством.",
    talents: [
      {
        nameEn: "“来抓我啊”·VI",
        nameRu: "“来抓我啊”·VI",
        descriptionEn: "部署后20秒内，攻击使敌人法术抗性-25%（持续10秒），且优先攻击未获得此效果的敌人",
        descriptionRu: "部署后20秒内，攻击使敌人法术抗性-25%（持续10秒），且优先攻击未获得此效果的敌人",
      },
    ],
  },

  // Rhodes Island Recon (Auto-synced CN operator)
  char_4215_buddy: {
    nameEn: "Rhodes Island Recon",
    nameRu: "Rhodes Island Recon",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "猫式起爆龙弹·VI",
        nameRu: "猫式起爆龙弹·VI",
        descriptionEn: "对前三个敌人首次进行攻击时改为使用“猫式起爆龙弹”。来自我方其他单位的伤害会将其引爆，造成罗德岛隐秘队500%攻击力的伤害和3秒晕眩，并回复1点部署费用。“猫式起爆龙弹”在被引爆后或30秒后消失",
        descriptionRu: "对前三个敌人首次进行攻击时改为使用“猫式起爆龙弹”。来自我方其他单位的伤害会将其引爆，造成罗德岛隐秘队500%攻击力的伤害和3秒晕眩，并回复1点部署费用。“猫式起爆龙弹”在被引爆后或30秒后消失",
      },
    ],
  },

  // Akkord (Auto-synced CN operator)
  char_4051_akkord: {
    nameEn: "Akkord",
    nameRu: "Akkord",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "律脉同构",
        nameRu: "律脉同构",
        descriptionEn: "攻击范围内至少有1名其他友方干员时，攻击力+17%（+2%）",
        descriptionRu: "攻击范围内至少有1名其他友方干员时，攻击力+17%（+2%）",
      },
    ],
  },

  // Matsukiri (Auto-synced CN operator)
  char_4199_makiri: {
    nameEn: "Matsukiri",
    nameRu: "Matsukiri",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "慢手有筹",
        nameRu: "慢手有筹",
        descriptionEn: "在战场停留30秒后，仅一次使场上与待部署区的所有重装和辅助干员攻击力+12%（+2%）",
        descriptionRu: "在战场停留30秒后，仅一次使场上与待部署区的所有重装和辅助干员攻击力+12%（+2%）",
      },
    ],
  },

  // Jacinta (Auto-synced CN operator)
  char_4237_jcinta: {
    nameEn: "Jacinta",
    nameRu: "Jacinta",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "淑女风范",
        nameRu: "淑女风范",
        descriptionEn: "部署后，嘉辛塔自身与周围八格的友方单位获得15%（+2%）的对空庇护",
        descriptionRu: "部署后，嘉辛塔自身与周围八格的友方单位获得15%（+2%）的对空庇护",
      },
    ],
  },

  // Varkáris (Auto-synced CN operator)
  char_4166_varkis: {
    nameEn: "Varkáris",
    nameRu: "Varkáris",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Attacks all blocked enemies simultaneously.",
    traitRu: "Центурион: атакует всех заблокированных противников одновременно.",
    talents: [
      {
        nameEn: "永志不忘",
        nameRu: "永志不忘",
        descriptionEn: "在场时，所有【米诺斯】干员攻击生命比例不高于自身的敌人时攻击力提升至112%（+2%）",
        descriptionRu: "在场时，所有【米诺斯】干员攻击生命比例不高于自身的敌人时攻击力提升至112%（+2%）",
      },
    ],
  },

  // Yūtenji Nyamu (Auto-synced CN operator)
  char_4185_amoris: {
    nameEn: "Yūtenji Nyamu",
    nameRu: "Yūtenji Nyamu",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "双利手",
        nameRu: "双利手",
        descriptionEn: "祐天寺若麦可以进行持续攻击；攻击时10%概率使敌人获得8%脆弱，持续2秒",
        descriptionRu: "祐天寺若麦可以进行持续攻击；攻击时10%概率使敌人获得8%脆弱，持续2秒",
      },
      {
        nameEn: "毋畏爱意",
        nameRu: "毋畏爱意",
        descriptionEn: "在场时每秒使Fever+3；Ave Mujica成员的攻击力+9%（+1%）",
        descriptionRu: "在场时每秒使Fever+3；Ave Mujica成员的攻击力+9%（+1%）",
      },
    ],
  },

  // Hadiya (Auto-synced CN operator)
  char_394_hadiya: {
    nameEn: "Hadiya",
    nameRu: "Hadiya",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "荒野的后裔",
        nameRu: "荒野的后裔",
        descriptionEn: "通过部署、开启技能、使用装备应变消耗费用后，攻击力+5%（+1%），使攻击范围内的敌人晕眩2秒（攻击力最多提升5次）",
        descriptionRu: "通过部署、开启技能、使用装备应变消耗费用后，攻击力+5%（+1%），使攻击范围内的敌人晕眩2秒（攻击力最多提升5次）",
      },
    ],
  },

  // Zinogre S Catapult (Auto-synced CN operator)
  char_1049_catap2: {
    nameEn: "Zinogre S Catapult",
    nameRu: "Zinogre S Catapult",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "斧模式变形",
        nameRu: "斧模式变形",
        descriptionEn: "技能期间攻击距离延长。开启技能时施展变形斩造成伤害，同时消耗所有充能，每层使技能持续时间增加50%（+10%）",
        descriptionRu: "技能期间攻击距离延长。开启技能时施展变形斩造成伤害，同时消耗所有充能，每层使技能持续时间增加50%（+10%）",
      },
    ],
  },

  // Kichisei (Auto-synced CN operator)
  char_4203_kichi: {
    nameEn: "Kichisei",
    nameRu: "Kichisei",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "好运连击！",
        nameRu: "好运连击！",
        descriptionEn: "上场后每击倒过一种敌人，自身造成的伤害+7%（+1%），最多叠加3次",
        descriptionRu: "上场后每击倒过一种敌人，自身造成的伤害+7%（+1%），最多叠加3次",
      },
    ],
  },

  // Skybox (Auto-synced CN operator)
  char_4213_skybx: {
    nameEn: "Skybox",
    nameRu: "Skybox",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "开门！管理局",
        nameRu: "开门！管理局",
        descriptionEn: "对每个敌人首次造成伤害后，使目标的特殊能力失效，持续7秒",
        descriptionRu: "对每个敌人首次造成伤害后，使目标的特殊能力失效，持续7秒",
      },
    ],
  },

  // Ripresa (Auto-synced CN operator)
  char_4031_liesel: {
    nameEn: "Ripresa",
    nameRu: "Ripresa",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Attacks deal AoE Arts damage.",
    traitRu: "Маг площади: атаки наносят урон искусством по площади вокруг цели.",
    talents: [
      {
        nameEn: "执棒素养",
        nameRu: "执棒素养",
        descriptionEn: "攻击溅射范围内有大于或等于3个敌人时，使当次攻击造成的伤害提升至125%（+5%）",
        descriptionRu: "攻击溅射范围内有大于或等于3个敌人时，使当次攻击造成的伤害提升至125%（+5%）",
      },
    ],
  },

  // Timeslot (Auto-synced CN operator)
  char_4236_tmslot: {
    nameEn: "Timeslot",
    nameRu: "Timeslot",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "新产品测评",
        nameRu: "新产品测评",
        descriptionEn: "攻击力+11%（+3%），浮游单元攻击时有15%概率使目标停顿1.5秒",
        descriptionRu: "攻击力+11%（+3%），浮游单元攻击时有15%概率使目标停顿1.5秒",
      },
    ],
  },

  // Record Keeper (Auto-synced CN operator)
  char_4196_reckpr: {
    nameEn: "Record Keeper",
    nameRu: "Record Keeper",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "学成于聚",
        nameRu: "学成于聚",
        descriptionEn: "攻击范围内的干员开启技能时自身回复1点技力，且攻击速度+16，持续10（+2）秒",
        descriptionRu: "攻击范围内的干员开启技能时自身回复1点技力，且攻击速度+16，持续10（+2）秒",
      },
    ],
  },

  // Укусик (Auto-synced CN operator)
  char_4224_turdus: {
    nameEn: "Укусик",
    nameRu: "Укусик",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "久病良医",
        nameRu: "久病良医",
        descriptionEn: "受到自身的跳跃治疗时，治疗量提升至125%（+5%），并额外进行一次不衰减的治疗跳跃",
        descriptionRu: "受到自身的跳跃治疗时，治疗量提升至125%（+5%），并额外进行一次不衰减的治疗跳跃",
      },
    ],
  },

  // Taraxacum (Auto-synced CN operator)
  char_4222_taraxa: {
    nameEn: "Taraxacum",
    nameRu: "Taraxacum",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "定风絮",
        nameRu: "定风絮",
        descriptionEn: "攻击范围内飞行的友方单位获得12%（+2%）的庇护，阻挡数+1",
        descriptionRu: "攻击范围内飞行的友方单位获得12%（+2%）的庇护，阻挡数+1",
      },
    ],
  },

  // Веточки (Auto-synced CN operator)
  char_4207_branch: {
    nameEn: "Веточки",
    nameRu: "Веточки",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "简易包扎",
        nameRu: "简易包扎",
        descriptionEn: "技能结束时恢复自身60%（+10%）最大生命值",
        descriptionRu: "技能结束时恢复自身60%（+10%）最大生命值",
      },
    ],
  },

  // Crackborne (Auto-synced CN operator)
  char_4225_tanya: {
    nameEn: "Crackborne",
    nameRu: "Crackborne",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "劣质溶剂耐受",
        nameRu: "劣质溶剂耐受",
        descriptionEn: "自身受到的元素损伤-12%（+2%），受到的侵蚀损伤额外-12%（+2%）",
        descriptionRu: "自身受到的元素损伤-12%（+2%），受到的侵蚀损伤额外-12%（+2%）",
      },
    ],
  },

  // Ju (Auto-synced CN operator)
  char_4221_ju: {
    nameEn: "Ju",
    nameRu: "Ju",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "墨守",
        nameRu: "墨守",
        descriptionEn: "造成致命伤害时使敌人保留1点生命并使其重伤（击杀者技力+2）；矩不攻击重伤单位",
        descriptionRu: "造成致命伤害时使敌人保留1点生命并使其重伤（击杀者技力+2）；矩不攻击重伤单位",
      },
    ],
  },

  // Snow Hunter (Auto-synced CN operator)
  char_4211_snhunt: {
    nameEn: "Snow Hunter",
    nameRu: "Snow Hunter",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "裂云一击",
        nameRu: "裂云一击",
        descriptionEn: "开启技能时，派出裂云兽进行攻击，造成相当于攻击力185%（+5%）的物理伤害和3秒寒冷",
        descriptionRu: "开启技能时，派出裂云兽进行攻击，造成相当于攻击力185%（+5%）的物理伤害和3秒寒冷",
      },
    ],
  },

  // de Toledo (Auto-synced CN operator)
  char_393_toledo: {
    nameEn: "de Toledo",
    nameRu: "de Toledo",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "“贵族血统”",
        nameRu: "“贵族血统”",
        descriptionEn: "攻击范围内被阻挡的敌人获得18%（+2%）的脆弱效果",
        descriptionRu: "攻击范围内被阻挡的敌人获得18%（+2%）的脆弱效果",
      },
    ],
  },

  // Misumi Uika (Auto-synced CN operator)
  char_4184_dolris: {
    nameEn: "Misumi Uika",
    nameRu: "Misumi Uika",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "谎言的假面",
        nameRu: "谎言的假面",
        descriptionEn: "技能未开启时每4秒治疗攻击范围内生命最低的友方单位相当于攻击力35%(+5%)的生命；技能期间优先选择丰川祥子作为治疗目标",
        descriptionRu: "技能未开启时每4秒治疗攻击范围内生命最低的友方单位相当于攻击力35%(+5%)的生命；技能期间优先选择丰川祥子作为治疗目标",
      },
      {
        nameEn: "毋畏悲伤",
        nameRu: "毋畏悲伤",
        descriptionEn: "治疗Ave Mujica成员时使Fever+5；攻击范围内Ave Mujica成员攻击时，附带三角初华攻击力30%的法术伤害",
        descriptionRu: "治疗Ave Mujica成员时使Fever+5；攻击范围内Ave Mujica成员攻击时，附带三角初华攻击力30%的法术伤害",
      },
    ],
  },

  // Perfumer the Distilled (Auto-synced CN operator)
  char_1022_flwr2: {
    nameEn: "Perfumer the Distilled",
    nameRu: "Perfumer the Distilled",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "百里香",
        nameRu: "百里香",
        descriptionEn: "使攻击范围内除自身外当前生命比例小于等于自身的友军获得16%（+2%）的庇护",
        descriptionRu: "使攻击范围内除自身外当前生命比例小于等于自身的友军获得16%（+2%）的庇护",
      },
    ],
  },

  // Ботани (Auto-synced CN operator)
  char_4223_botany: {
    nameEn: "Ботани",
    nameRu: "Ботани",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "背弃沉默",
        nameRu: "背弃沉默",
        descriptionEn: "攻击范围内有敌人侵蚀损伤爆发时攻击速度+7（+1），最多可叠加3层",
        descriptionRu: "攻击范围内有敌人侵蚀损伤爆发时攻击速度+7（+1），最多可叠加3层",
      },
    ],
  },

  // Yukari Takeba (Auto-synced CN operator)
  char_4219_yukari: {
    nameEn: "Yukari Takeba",
    nameRu: "Yukari Takeba",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "治愈之风",
        nameRu: "治愈之风",
        descriptionEn: "技能结束后，治疗自身和攻击范围内最多3名干员相当于岳羽由加莉攻击力100%的生命值",
        descriptionRu: "技能结束后，治疗自身和攻击范围内最多3名干员相当于岳羽由加莉攻击力100%的生命值",
      },
    ],
  },

  // Pedro (Auto-synced CN operator)
  char_4234_pedro: {
    nameEn: "Pedro",
    nameRu: "Pedro",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "掩护战术",
        nameRu: "掩护战术",
        descriptionEn: "攻击范围内至少有2名其他干员时，自身攻击力+12%（+2%）",
        descriptionRu: "攻击范围内至少有2名其他干员时，自身攻击力+12%（+2%）",
      },
    ],
  },

  // Yahata Umiri (Auto-synced CN operator)
  char_4186_tmoris: {
    nameEn: "Yahata Umiri",
    nameRu: "Yahata Umiri",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Has 50% physical and Arts dodge; attacks all enemies within range simultaneously.",
    traitRu: "Сталкер: имеет 50% уклонение; атакует всех врагов в радиусе одновременно.",
    talents: [
      {
        nameEn: "应召而至",
        nameRu: "应召而至",
        descriptionEn: "被八幡海铃伤害的敌人有21%概率被停顿3秒；技能期间，八幡海铃的攻击范围扩大",
        descriptionRu: "被八幡海铃伤害的敌人有21%概率被停顿3秒；技能期间，八幡海铃的攻击范围扩大",
      },
      {
        nameEn: "毋畏恐惧",
        nameRu: "毋畏恐惧",
        descriptionEn: "造成停顿、恐惧时使Fever+2；\\n在场时，Ave Mujica成员对处于停顿、恐惧的敌人造成的伤害增加15%（+5%）",
        descriptionRu: "造成停顿、恐惧时使Fever+2；\\n在场时，Ave Mujica成员对处于停顿、恐惧的敌人造成的伤害增加15%（+5%）",
      },
    ],
  },

  // Wakaba Mutsumi (Auto-synced CN operator)
  char_4183_mortis: {
    nameEn: "Wakaba Mutsumi",
    nameRu: "Wakaba Mutsumi",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "另一个“她”",
        nameRu: "另一个“她”",
        descriptionEn: "若叶睦和受到物理和法术伤害的30%转化为一半的凋亡损伤；不攻击，防御力+24%（+4%），Ave Mujica成员攻击时有20%的概率使替身持续时间缩短1秒",
        descriptionRu: "若叶睦和受到物理和法术伤害的30%转化为一半的凋亡损伤；不攻击，防御力+24%（+4%），Ave Mujica成员攻击时有20%的概率使替身持续时间缩短1秒",
      },
      {
        nameEn: "毋畏死亡",
        nameRu: "毋畏死亡",
        descriptionEn: "自身受到一次伤害或损伤时使Fever+3，在场时Ave Mujica成员生命上限+10%",
        descriptionRu: "自身受到一次伤害或损伤时使Fever+3，在场时Ave Mujica成员生命上限+10%",
      },
    ],
  },

  // Homebound (Auto-synced CN operator)
  char_4232_hbound: {
    nameEn: "Homebound",
    nameRu: "Homebound",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "潜水作业",
        nameRu: "潜水作业",
        descriptionEn: "使自身炼金单元影响范围内地面敌人的物理和法术命中率-10%（-1%）；若敌人重量大于等于3，改为物理和法术命中率-15%（-2%）",
        descriptionRu: "使自身炼金单元影响范围内地面敌人的物理和法术命中率-10%（-1%）；若敌人重量大于等于3，改为物理和法术命中率-15%（-2%）",
      },
    ],
  },

  // Violet Mizutsune Orchid (Auto-synced CN operator)
  char_1048_orchd2: {
    nameEn: "Violet Mizutsune Orchid",
    nameRu: "Violet Mizutsune Orchid",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "强击瓶专家",
        nameRu: "强击瓶专家",
        descriptionEn: "部署后首次开启技能时，接下来50次攻击的攻击力提升至120%（+5%）",
        descriptionRu: "部署后首次开启技能时，接下来50次攻击的攻击力提升至120%（+5%）",
      },
      {
        nameEn: "翔虫机动",
        nameRu: "翔虫机动",
        descriptionEn: "再部署时间-15秒且不提高部署费用；部署至上次部署位置周围时，30秒内攻击力+15%并且可以部署在近战位",
        descriptionRu: "再部署时间-15秒且不提高部署费用；部署至上次部署位置周围时，30秒内攻击力+15%并且可以部署在近战位",
      },
    ],
  },

  // Aphrissa (Auto-synced CN operator)
  char_4229_aphris: {
    nameEn: "Aphrissa",
    nameRu: "Aphrissa",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "链路协议",
        nameRu: "链路协议",
        descriptionEn: "可以使用一个持续时间25秒的“中继器”，能改变自身的攻击方向，且使该次攻击距离+2；“中继器”在场时，自身攻击力+25%",
        descriptionRu: "可以使用一个持续时间25秒的“中继器”，能改变自身的攻击方向，且使该次攻击距离+2；“中继器”在场时，自身攻击力+25%",
      },
      {
        nameEn: "取样优化",
        nameRu: "取样优化",
        descriptionEn: "攻击范围内的友方干员攻击时无视敌方13（+3）点法术抗性",
        descriptionRu: "攻击范围内的友方干员攻击时无视敌方13（+3）点法术抗性",
      },
    ],
  },

  // Mantra (Auto-synced CN operator)
  char_4204_mantra: {
    nameEn: "Mantra",
    nameRu: "Mantra",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "噤声限域",
        nameRu: "噤声限域",
        descriptionEn: "场上敌人触发麻痹效果时立即受到相当于真言攻击力145%（+10%）的元素伤害，且触发麻痹时有13%（+3%）概率不消耗麻痹层数",
        descriptionRu: "场上敌人触发麻痹效果时立即受到相当于真言攻击力145%（+10%）的元素伤害，且触发麻痹时有13%（+3%）概率不消耗麻痹层数",
      },
      {
        nameEn: "全局洞悉",
        nameRu: "全局洞悉",
        descriptionEn: "距离真言最近的一个侵入点出场的敌人出现时立刻获得1层麻痹",
        descriptionRu: "距离真言最近的一个侵入点出场的敌人出现时立刻获得1层麻痹",
      },
    ],
  },

  // Raidian (Auto-synced CN operator)
  char_4195_radian: {
    nameEn: "Raidian",
    nameRu: "Raidian",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "卡带里的灵感",
        nameRu: "卡带里的灵感",
        descriptionEn: "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
        descriptionRu: "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
      },
      {
        nameEn: "加油~",
        nameRu: "加油~",
        descriptionEn: "电弧的召唤物获得相当于其自身15％(+3％)攻击力、防御力、生命值的鼓舞效果",
        descriptionRu: "电弧的召唤物获得相当于其自身15％(+3％)攻击力、防御力、生命值的鼓舞效果",
      },
    ],
  },

  // Haruka (Auto-synced CN operator)
  char_4202_haruka: {
    nameEn: "Haruka",
    nameRu: "Haruka",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "浮光泡影",
        nameRu: "浮光泡影",
        descriptionEn: "每过一个攻击间隔，使范围内一名友方单位获得30%庇护的浮泡，浮泡在受到敌方伤害的短暂延迟后破碎",
        descriptionRu: "每过一个攻击间隔，使范围内一名友方单位获得30%庇护的浮泡，浮泡在受到敌方伤害的短暂延迟后破碎",
      },
      {
        nameEn: "扶摇花火",
        nameRu: "扶摇花火",
        descriptionEn: "浮泡破碎时，为所在的单位治疗相当于遥攻击力28%（+3%）的生命值",
        descriptionRu: "浮泡破碎时，为所在的单位治疗相当于遥攻击力28%（+3%）的生命值",
      },
    ],
  },

  // Nasti (Auto-synced CN operator)
  char_4212_nasti: {
    nameEn: "Nasti",
    nameRu: "Nasti",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "前方施工",
        nameRu: "前方施工",
        descriptionEn: "可以携带3个(最多可部署2个)，效果根据技能改变而改变",
        descriptionRu: "可以携带3个(最多可部署2个)，效果根据技能改变而改变",
      },
      {
        nameEn: "注意安全",
        nameRu: "注意安全",
        descriptionEn: "获得12%（+2%）庇护；远程敌人出现后，改为使自身和场上的高台干员获得18%（+3%）庇护，且每6秒获得1点技力",
        descriptionRu: "获得12%（+2%）庇护；远程敌人出现后，改为使自身和场上的高台干员获得18%（+3%）庇护，且每6秒获得1点技力",
      },
    ],
  },

  // Titi (Auto-synced CN operator)
  char_4056_titi: {
    nameEn: "Titi",
    nameRu: "Titi",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "凝固的时光",
        nameRu: "凝固的时光",
        descriptionEn: "自身可以攻击沉睡的敌人，且攻击非移动敌人时对其额外造成相当于攻击力16%（+1%）的法术伤害，在场时沉睡中的敌人每秒受到缇缇攻击力32%（+2%）的法术伤害",
        descriptionRu: "自身可以攻击沉睡的敌人，且攻击非移动敌人时对其额外造成相当于攻击力16%（+1%）的法术伤害，在场时沉睡中的敌人每秒受到缇缇攻击力32%（+2%）的法术伤害",
      },
      {
        nameEn: "勇气的报偿",
        nameRu: "勇气的报偿",
        descriptionEn: "场上的【米诺斯】或【萨尔贡】干员生命值高于50%时，获得+22（+2）攻速的精力充沛",
        descriptionRu: "场上的【米诺斯】或【萨尔贡】干员生命值高于50%时，获得+22（+2）攻速的精力充沛",
      },
    ],
  },

  // Mechanist (Auto-synced CN operator)
  char_4230_mcnist: {
    nameEn: "Mechanist",
    nameRu: "Mechanist",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "结构性原理",
        nameRu: "结构性原理",
        descriptionEn: "可以使用一个持续30秒的结构性原理，拥有独立的再部署时间",
        descriptionRu: "可以使用一个持续30秒的结构性原理，拥有独立的再部署时间",
      },
      {
        nameEn: "生命方程",
        nameRu: "生命方程",
        descriptionEn: "自身和结构性原理部署时获得最大生命40%（+10%）的屏障；来自自身的屏障可以抵挡超额的伤害",
        descriptionRu: "自身和结构性原理部署时获得最大生命40%（+10%）的屏障；来自自身的屏障可以抵挡超额的伤害",
      },
    ],
  },

  // Thumpy (Auto-synced CN operator)
  char_4235_thumpy: {
    nameEn: "Thumpy",
    nameRu: "Thumpy",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "探险理论",
        nameRu: "探险理论",
        descriptionEn: "珊比受到的元素损伤降低20%（+5%）；珊比造成物理伤害时，附带攻击力12%（+2%）的侵蚀损伤，并使目标的侵蚀损伤冷却减少1.2（+0.2）秒",
        descriptionRu: "珊比受到的元素损伤降低20%（+5%）；珊比造成物理伤害时，附带攻击力12%（+2%）的侵蚀损伤，并使目标的侵蚀损伤冷却减少1.2（+0.2）秒",
      },
      {
        nameEn: "坚硬脚板",
        nameRu: "坚硬脚板",
        descriptionEn: "受到过来自珊比伤害的敌人侵蚀损伤爆发时，珊比获得11（+3）点防御力（最多叠加30层）和330（+80）点屏障（不超过最大生命值的300%）",
        descriptionRu: "受到过来自珊比伤害的敌人侵蚀损伤爆发时，珊比获得11（+3）点防御力（最多叠加30层）和330（+80）点屏障（不超过最大生命值的300%）",
      },
    ],
  },

  // Bellone (Auto-synced CN operator)
  char_4037_demetr: {
    nameEn: "Bellone",
    nameRu: "Bellone",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "家族手段",
        nameRu: "家族手段",
        descriptionEn: "攻击使目标在10秒内防御力降低7%（最多叠加5次），并且目标剩余生命值比例越低自身对其造成的伤害越高，在剩余20%以下生命值时伤害提高到最高136%（+8%）",
        descriptionRu: "攻击使目标在10秒内防御力降低7%（最多叠加5次），并且目标剩余生命值比例越低自身对其造成的伤害越高，在剩余20%以下生命值时伤害提高到最高136%（+8%）",
      },
      {
        nameEn: "街头直觉",
        nameRu: "街头直觉",
        descriptionEn: "获得40%的物理和法术闪避，部署后提高到80%并在20秒内逐渐衰减",
        descriptionRu: "获得40%的物理和法术闪避，部署后提高到80%并在20秒内逐渐衰减",
      },
    ],
  },

  // Togawa Sakiko (Auto-synced CN operator)
  char_4182_oblvns: {
    nameEn: "Togawa Sakiko",
    nameRu: "Togawa Sakiko",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Can launch ranged attacks dealing 80% damage.",
    traitRu: "Лорд: способен атаковать воздушные и наземные цели на дистанции (дистанционные атаки наносят 80% урона).",
    talents: [
      {
        nameEn: "颂乐音符",
        nameRu: "颂乐音符",
        descriptionEn: "丰川祥子可以持续攻击且攻击会演奏追踪敌人的音符，音符飘出攻击范围一段时间后消失。每存在一个音符，Ave Mujica成员无视敌人3%的防御力和2%法术抗性（最多叠加至10层）",
        descriptionRu: "丰川祥子可以持续攻击且攻击会演奏追踪敌人的音符，音符飘出攻击范围一段时间后消失。每存在一个音符，Ave Mujica成员无视敌人3%的防御力和2%法术抗性（最多叠加至10层）",
      },
      {
        nameEn: "毋畏遗忘",
        nameRu: "毋畏遗忘",
        descriptionEn: "对敌人造成伤害时使Fever+3；其他Ave Mujica成员的攻击范围若与自身原本攻击范围重合，则将其视作攻击范围的延伸；攻击范围内干员攻击速度+16（+4）",
        descriptionRu: "对敌人造成伤害时使Fever+3；其他Ave Mujica成员的攻击范围若与自身原本攻击范围重合，则将其视作攻击范围的延伸；攻击范围内干员攻击速度+16（+4）",
      },
    ],
  },

  // Clementia (Auto-synced CN operator)
  char_4231_clemnt: {
    nameEn: "Clementia",
    nameRu: "Clementia",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "生死定夺",
        nameRu: "生死定夺",
        descriptionEn: "造成物理伤害时有25%概率攻击力提升至150%（+15%），目标防御力低于初始值时概率提升至50%",
        descriptionRu: "造成物理伤害时有25%概率攻击力提升至150%（+15%），目标防御力低于初始值时概率提升至50%",
      },
      {
        nameEn: "习得性防御",
        nameRu: "习得性防御",
        descriptionEn: "受到来自自身前方单位造成的物理和法术伤害降低35%（+5%），若伤害来源为【海怪】，则降低55%（+5%）",
        descriptionRu: "受到来自自身前方单位造成的物理和法术伤害降低35%（+5%），若伤害来源为【海怪】，则降低55%（+5%）",
      },
    ],
  },

  // Cairn (Auto-synced CN operator)
  char_4214_cairn: {
    nameEn: "Cairn",
    nameRu: "Cairn",
    quoteEn: "Doctor, Rhodes Island is ready for deployment.",
    quoteRu: "Доктор, оперативник готов к боевому развертыванию.",
    traitEn: "Specialized tactical operative.",
    traitRu: "Специализированный тактический оперативник.",
    talents: [
      {
        nameEn: "过饱和讲解",
        nameRu: "过饱和讲解",
        descriptionEn: "对自身阻挡的敌人每秒造成相当于攻击力10%（+1%）的神经损伤",
        descriptionRu: "对自身阻挡的敌人每秒造成相当于攻击力10%（+1%）的神经损伤",
      },
    ],
  },

};

/**
 * Maps Chinese talent name to English and Russian
 */
export const CN_TALENT_NAMES_MAP: Record<string, { en: string; ru: string }> = {
  '飘浮大地之上': { en: 'Floating Above the Earth', ru: 'Парящая над землёй' },
  '天穹间的舞步': { en: 'Dance in the Heavens', ru: 'Танец в небесах' },
  '黑色猎犬·I': { en: 'Black Hound I', ru: 'Черная гончая I' },
  '黑色猎犬·II': { en: 'Black Hound II', ru: 'Черная гончая II' },
  '黑色猎犬·III': { en: 'Black Hound III', ru: 'Черная гончая III' },
  '黑色猎犬·IV': { en: 'Black Hound IV', ru: 'Черная гончая IV' },
  '黑色猎犬·V': { en: 'Black Hound V', ru: 'Черная гончая V' },
  '黑色猎犬·VI': { en: 'Black Hound VI', ru: 'Черная гончая VI' },
  '“来抓我啊”·I': { en: '"Catch Me If You Can" I', ru: '«Попробуй поймай» I' },
  '“来抓我啊”·II': { en: '"Catch Me If You Can" II', ru: '«Попробуй поймай» II' },
  '“来抓我啊”·III': { en: '"Catch Me If You Can" III', ru: '«Попробуй поймай» III' },
  '“来抓我啊”·IV': { en: '"Catch Me If You Can" IV', ru: '«Попробуй поймай» IV' },
  '“来抓我啊”·V': { en: '"Catch Me If You Can" V', ru: '«Попробуй поймай» V' },
  '“来抓我啊”·VI': { en: '"Catch Me If You Can" VI', ru: '«Попробуй поймай» VI' },
  '猫式起爆龙弹·I': { en: 'Felyne Wyvernblast I', ru: 'Кошачья драконья бомба I' },
  '猫式起爆龙弹·II': { en: 'Felyne Wyvernblast II', ru: 'Кошачья драконья бомба II' },
  '猫式起爆龙弹·III': { en: 'Felyne Wyvernblast III', ru: 'Кошачья драконья бомба III' },
  '猫式起爆龙弹·IV': { en: 'Felyne Wyvernblast IV', ru: 'Кошачья драконья бомба IV' },
  '猫式起爆龙弹·V': { en: 'Felyne Wyvernblast V', ru: 'Кошачья драконья бомба V' },
  '猫式起爆龙弹·VI': { en: 'Felyne Wyvernblast VI', ru: 'Кошачья драконья бомба VI' },
  '律脉同构': { en: 'Rhythmic Isomorphism', ru: 'Ритмический изоморфизм' },
  '疾笔撰录': { en: 'Swift Quill', ru: 'Быстрое перо' },
  '慢手有筹': { en: 'Deliberate Planning', ru: 'Взвешенный расчет' },
  '淑女风范': { en: "Lady's Demeanor", ru: 'Дамские манеры' },
  '永志不忘': { en: 'Never Forget', ru: 'Вечная память' },
  '双利手': { en: 'Ambidextrous', ru: 'Обеими руками' },
  '毋畏爱意': { en: 'Fear Not Love', ru: 'Не страшась любви' },
  '荒野的后裔': { en: 'Descendant of the Wilds', ru: 'Потомок диких земель' },
  '斧模式变形': { en: 'Axe Mode Switch', ru: 'Трансформация в топор' },
  '好运连击！': { en: 'Lucky Streak!', ru: 'Удачная серия!' },
  '开门！管理局': { en: 'Open Up! Bureau of Control', ru: 'Откройте! Бюро контроля' },
  '反暗影特殊压制兵装': { en: 'Anti-Shadow Suppression Gear', ru: 'Спецснаряжение подавления теней' },
  '执棒素养': { en: "Conductor's Poise", ru: 'Мастерство дирижера' },
  '新产品测评': { en: 'New Product Review', ru: 'Тестирование новинок' },
  '学成于聚': { en: 'Learned in Fellowship', ru: 'Ученость в сплочении' },
  '久病良医': { en: 'Long Illness Makes a Doctor', ru: 'Болеющий становится врачом' },
  '定风絮': { en: 'Wind-Settling Fluff', ru: 'Укрощение ветра' },
  '简易包扎': { en: 'Simple Bandage', ru: 'Простая перевязка' },
  '劣质溶剂耐受': { en: 'Tolerance to Low-Grade Solvents', ru: 'Стойкость к нечистым растворам' },
  '墨守': { en: 'Adherence to Principle', ru: 'Приверженность принципам' },
  '裂云一击': { en: 'Cloud-Splitting Strike', ru: 'Удар, рассекающий облака' },
  '谎言的假面': { en: 'Mask of Lies', ru: 'Маска лжи' },
  '毋畏悲伤': { en: 'Fear Not Sorrow', ru: 'Не страшась скорби' },
  '百里香': { en: 'Thyme', ru: 'Тимьян' },
  '背弃沉默': { en: 'Breaking the Silence', ru: 'Нарушая молчание' },
  '治愈之风': { en: 'Healing Breeze', ru: 'Исцеляющий бриз' },
  '掩护战术': { en: 'Cover Tactics', ru: 'Тактика прикрытия' },
  '应召而至': { en: 'Answering the Call', ru: 'Явившийся на зов' },
  '毋畏恐惧': { en: 'Fear Not Terror', ru: 'Не страшась страха' },
  '另一个“她”': { en: "The Other 'Her'", ru: 'Другая «она»' },
  '毋畏死亡': { en: 'Fear Not Death', ru: 'Не страшась смерти' },
  '强击瓶专家': { en: 'Power Coating Specialist', ru: 'Мастер силовых склянок' },
  '翔虫机动': { en: 'Wirebug Maneuver', ru: 'Маневр прутожука' },
  '精准投放': { en: 'Precision Deployment', ru: 'Точное развёртывание' },
  '极限调度': { en: 'Limit Dispatch', ru: 'Предельное управление' },
  '开放性开局': { en: 'Open Opening', ru: 'Открытый дебют' },
  '雪境先驱': { en: 'Snow Realm Pioneer', ru: 'Первопроходец снежного края' },
  '链路协议': { en: 'Link Protocol', ru: 'Протокол связи' },
  '取样优化': { en: 'Sampling Optimization', ru: 'Оптимизация выборки' },
  '无垠的雪景': { en: 'Boundless Snowscape', ru: 'Бескрайний снежный пейзаж' },
  '圣山的祝福': { en: 'Blessing of the Holy Mountain', ru: 'Благословение священной горы' },
  '“在挥刀之前”': { en: '"Before Drawing the Blade"', ru: '«Прежде чем обнажить клинок»' },
  '战争技艺': { en: 'Art of War', ru: 'Искусство войны' },
  '噤声限域': { en: 'Domain of Silence', ru: 'Предел безмолвия' },
  '全局洞悉': { en: 'Omniscient Insight', ru: 'Глобальное видение' },
  '数据建模': { en: 'Data Modeling', ru: 'Моделирование данных' },
  '能源解析': { en: 'Energy Analysis', ru: 'Анализ энергии' },
  '卡带里的灵感': { en: 'Inspiration in the Cassette', ru: 'Вдохновение на кассете' },
  '加油~': { en: 'Cheer Up~', ru: 'Вперед~' },
  '浮光泡影': { en: 'Fleeting Bubble', ru: 'Мимолетные пузыри' },
  '扶摇花火': { en: 'Soaring Fireworks', ru: 'Взмывающие фейерверки' },
  '前方施工': { en: 'Construction Ahead', ru: 'Впереди дорожные работы' },
  '注意安全': { en: 'Safety First', ru: 'Соблюдайте безопасность' },
  '不羁之力': { en: 'Wild Power', ru: 'Неукротимая сила' },
  'S.E.E.S.队长': { en: 'S.E.E.S. Leader', ru: 'Лидер S.E.E.S.' },
  '铸子': { en: 'Forged Piece', ru: 'Выкованная фигура' },
  '料敌机先': { en: 'Anticipating the Foe', ru: 'Предугадывание врага' },
  '凝固的时光': { en: 'Frozen Moments', ru: 'Застывшее время' },
  '勇气的报偿': { en: 'Reward of Valor', ru: 'Награда за храбрость' },
  '遗尘守望': { en: 'Vigil of the Dust', ru: 'Дозор ушедшей пыли' },
  '医者丰碑': { en: 'Monument of the Healer', ru: 'Монумент врачевателя' },
  '结构性原理': { en: 'Structural Principles', ru: 'Структурные принципы' },
  '生命方程': { en: 'Equation of Life', ru: 'Уравнение жизни' },
  '探险理论': { en: 'Exploration Theory', ru: 'Теория экспедиций' },
  '坚硬脚板': { en: 'Hardened Soles', ru: 'Крепкие подошвы' },
  '业火': { en: 'Karmic Fire', ru: 'Кармическое пламя' },
  '鬼之架势': { en: 'Stance of the Oni', ru: 'Стойка Они' },
  '家族手段': { en: 'Family Methods', ru: 'Семейные методы' },
  '街头直觉': { en: 'Street Instinct', ru: 'Уличное чутье' },
  '颂乐音符': { en: 'Ode Notes', ru: 'Октавы оды' },
  '毋畏遗忘': { en: 'Fear Not Oblivion', ru: 'Не страшась забвения' },
  '汹涌怒火': { en: 'Raging Fury', ru: 'Бушующая ярость' },
  '万众巨潮': { en: 'Tide of the Multitude', ru: 'Волна множества' },
  '形意洞照': { en: 'Form & Will Illumination', ru: 'Озарение формы и воли' },
  '寒暑觉知': { en: 'Perception of Cold & Heat', ru: 'Ощущение холода и жары' },
  '明断': { en: 'Lucid Judgment', ru: 'Ясное суждение' },
  '追责': { en: 'Accountability', ru: 'Призыв к ответу' },
  '过饱和讲解': { en: 'Hypersaturated Lecture', ru: 'Перенасыщенная лекция' },
};
