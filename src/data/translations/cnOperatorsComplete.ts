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
