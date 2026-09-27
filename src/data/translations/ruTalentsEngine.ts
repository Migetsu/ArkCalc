/**
 * Arknights Russian Talent Description Translation Engine
 * Translates Arknights talent descriptions into fluent, canonical Russian
 * completely offline with zero network requests and zero rate limits.
 */

import { cleanArknightsTalentTextRu, applyArknightsGlossary } from '../arknightsGlossary';

// Dictionary of status effects and game terms inside tags <$ba.xxx>...</>
const TAG_TERMS_RU: Record<string, string> = {
  Invisible: 'Невидимость',
  invisible: 'невидимость',
  Camouflage: 'Маскировка',
  camouflage: 'маскировка',
  Stun: 'Оглушение',
  stun: 'оглушение',
  Stunned: 'Оглушён',
  Bind: 'Обездвиживание',
  bind: 'обездвиживание',
  Bound: 'Обездвижен',
  Silence: 'Немота',
  silence: 'немота',
  Silenced: 'Безмолвие',
  Sleep: 'Сон',
  sleep: 'сон',
  Frozen: 'Заморозка',
  frozen: 'заморозка',
  Freeze: 'Заморозка',
  Cold: 'Озноб',
  cold: 'озноб',
  Sanctuary: 'Укрытие',
  sanctuary: 'укрытие',
  'status resistance': 'сопротивление эффектам',
  'Status Resistance': 'Сопротивление эффектам',
  'Burn damage': 'Урон от ожога',
  'Necrosis damage': 'Некротический урон',
  'Elemental Injury': 'Элементальный урон',
  Levitate: 'Левитация',
  Levitation: 'Левитация',
  Weightless: 'Невесомость',
  Shield: 'Щит',
  Barrier: 'Барьер',
  Reshelving: 'Перескладирование',
  Fragile: 'Хрупкость',
  Sluggish: 'Замедление',
  Slow: 'Замедление',
  Taunt: 'Провокация',
  Resilience: 'Стойкость',

  // Chinese status tags
  起飞: 'Левитация',
  失重: 'Невесомость',
  隐匿: 'Невидимость',
  迷彩: 'Маскировка',
  晕眩: 'Оглушение',
  束缚: 'Обездвиживание',
  沉默: 'Немота',
  睡眠: 'Сон',
  冻结: 'Заморозка',
  寒冷: 'Озноб',
  庇护: 'Укрытие',
  灼燃损伤: 'Урон от ожога',
  凋亡损伤: 'Некротический урон',
  侵蚀损伤: 'Эрозийный урон',
};

// Class name mapping for "[Caster] Operators" etc.
const CLASS_NAMES_RU: Record<string, string> = {
  Vanguard: 'Авангард',
  Guard: 'Гвардеец',
  Sniper: 'Снайпер',
  Caster: 'Заклинатель',
  Defender: 'Защитник',
  Medic: 'Медик',
  Supporter: 'Поддержка',
  Specialist: 'Специалист',
};

/**
 * Translates an English or Chinese talent description into Russian offline
 */
export function translateTalentDescriptionRu(rawDesc: string): string {
  if (!rawDesc) return '';
  let s = rawDesc.trim();

  // 1. Extract and preserve Arknights tags (<@ba.talpu>...</>, <$ba.xxx>...</>)
  const tags: string[] = [];
  s = s.replace(/<([@$]?[a-zA-Z0-9_.]+)>(.*?)<\/>/g, (_, tag, inner) => {
    let translatedInner = inner;
    const trimmedInner = inner.trim();
    if (TAG_TERMS_RU[trimmedInner]) {
      translatedInner = TAG_TERMS_RU[trimmedInner];
    }
    tags.push(`<${tag}>${translatedInner}</>`);
    return `___TAG_${tags.length - 1}___`;
  });

  // 2. High-priority structured sentence patterns
  const sentencePatterns: [RegExp, string | ((...args: any[]) => string)][] = [
    // Angelina Alter CN description patterns
    [
      /予愿安洁莉娜攻击额外造成相当于攻击力(\d+%?)(?:<@ba\.talpu>（\+?(\d+%?)）<\/>)?的法术伤害，攻击重量较轻（小于等于(\d+)）的敌人时则额外造成相当于攻击力(\d+%?)(?:<@ba\.talpu>（\+?(\d+%?)）<\/>)?的法术伤害[；;]处于(?:___TAG_(\d+)___|起飞)状态时使攻击范围内的敌人(?:___TAG_(\d+)___|失重)/gi,
      (_, p1, b1, w, p2, b2, t1, t2) => {
        const buff1 = b1 ? ` <@ba.talpu>(+${b1})</>` : '';
        const buff2 = b2 ? ` <@ba.talpu>(+${b2})</>` : '';
        const tag1 = t1 !== undefined ? `___TAG_${t1}___` : 'Левитации';
        const tag2 = t2 !== undefined ? `___TAG_${t2}___` : 'Невесомости';
        return `Атаки наносят дополнительный магический урон в размере ${p1}${buff1} от силы атаки, увеличиваясь до ${p2}${buff2} против врагов с низким весом (вес ≤ ${w}); в состоянии ${tag1} враги в радиусе атаки получают статус ${tag2}`;
      },
    ],
    [
      /在场时，所有处于(?:___TAG_(\d+)___|起飞)状态的友方干员攻击力\+(\d+%?)(?:<@ba\.talpu>（\+?(\d+%?)）<\/>)?且阻挡时每秒回复(\d+%?)(?:<@ba\.talpu>（\+?(\d+%?)）<\/>)?的最大生命值/gi,
      (_, t1, atk, bAtk, hp, bHp) => {
        const buffAtk = bAtk ? ` <@ba.talpu>(+${bAtk})</>` : '';
        const buffHp = bHp ? ` <@ba.talpu>(+${bHp})</>` : '';
        const tag1 = t1 !== undefined ? `___TAG_${t1}___` : 'Левитации';
        return `Пока находится на поле боя, все союзники в состоянии ${tag1} получают +${atk}${buffAtk} к силе атаки и при блокировании восстанавливают ${hp}${buffHp} от Макс. HP каждую секунду`;
      },
    ],
    // Class buffs
    [
      /All \[([A-Za-z]+)\] Operators'\s+ATK\s+([+-]?\d+%?)\s+when\s+([A-Za-z' ]+)\s+is deployed/gi,
      (_, cls, buff, op) => {
        const clsRu = CLASS_NAMES_RU[cls] || cls;
        return `СИЛ АТК всех оперативников класса [${clsRu}] ${buff}, пока ${op} на поле боя`;
      },
    ],
    [
      /All \[([A-Za-z]+)\] Operators'\s+DP Cost\s+([+-]?\d+)\s+when\s+([A-Za-z' ]+)\s+is in the squad/gi,
      (_, cls, buff, op) => {
        const clsRu = CLASS_NAMES_RU[cls] || cls;
        return `Стоимость DP всех оперативников класса [${clsRu}] ${buff}, когда ${op} в отряде`;
      },
    ],
    [
      /All \[([A-Za-z]+)\] Operators'\s+ASPD\s+([+-]?\d+)\s+when\s+([A-Za-z' ]+)\s+is deployed/gi,
      (_, cls, buff, op) => {
        const clsRu = CLASS_NAMES_RU[cls] || cls;
        return `СКОР АТК всех оперативников класса [${clsRu}] ${buff}, пока ${op} на поле боя`;
      },
    ],
    [
      /All \[([A-Za-z]+)\] Operators'\s+DEF\s+([+-]?\d+%?)\s+when\s+([A-Za-z' ]+)\s+is deployed/gi,
      (_, cls, buff, op) => {
        const clsRu = CLASS_NAMES_RU[cls] || cls;
        return `Защита всех оперативников класса [${clsRu}] ${buff}, пока ${op} на поле боя`;
      },
    ],

    // Deployment and squad effects
    [
      /The same buff is given to a random ally when ([A-Za-z' ]+) is deployed/gi,
      'Тот же бафф получает случайный союзник при развёртывании $1',
    ],
    [
      /Immediately obtains a (small|large) random number of Skill Points after deployment/gi,
      (_, size) =>
        `Сразу после развёртывания получает ${size === 'large' ? 'большое' : 'небольшое'} случайное количество SP`,
    ],
    [
      /When deployed,\s+all blocked enemies take\s+([+-]?\d+%?)\s+Physical damage/gi,
      'При развёртывании все заблокированные враги получают $1 физического урона',
    ],
    [
      /all allied units' Redeployment Time\s+([+-]?\d+%?)\s+when this unit is in the squad/gi,
      'время передислокации всех союзников $1, когда этот оперативник находится в отряде',
    ],
    [
      /When this unit is in the squad,\s*all allied units'\s*Redeployment Time\s*([+-]?\d+%?)/gi,
      'Когда этот оперативник находится в отряде, время передислокации всех союзников $1',
    ],
    [
      /When this unit is in the squad,\s*all \[([A-Za-z]+)\] Operators gain\s*([+-]?\d+)\s*Initial SP/gi,
      (_, cls, val) => {
        const clsRu = CLASS_NAMES_RU[cls] || cls;
        return `Когда этот оперативник находится в отряде, все оперативники [${clsRu}] получают +${val} начальных SP`;
      },
    ],

    // Stacking and time effects
    [
      /For every (\d+) seconds ([A-Za-z' ]+) is deployed,\s*ATK\s*([+-]?\d+%?)\s*and\s*DEF\s*([+-]?\d+%?),\s*stacking up to (\d+) times/gi,
      'Каждые $1 сек. нахождения $2 на поле боя: СИЛ АТК $3 и Защита $4 (суммируется до $5 раз)',
    ],
    [
      /Every (\d+)s on the field,\s*Drones gain one of the following effects in order/gi,
      'Каждые $1 сек. на поле боя дроны получают поочередно один из эффектов',
    ],
    [
      /If this unit hasn't attacked for (\d+(?:\.\d+)?) seconds?,\s*restores (\d+(?:\.\d+)?%?) of Max HP every second/gi,
      'Если не атакует в течение $1 сек., восстанавливает $2 от Макс. HP каждую секунду',
    ],
    [
      /When this unit's HP falls beneath (\d+%),\s*restores (\d+%) HP \(one time only\) and prevents HP from falling under (\d+%) for (\d+) seconds/gi,
      'Когда HP падает ниже $1, восстанавливает $2 HP (один раз за бой) и предотвращает падение HP ниже $3 на $4 сек.',
    ],
    [
      /After receiving fatal damage,\s*continuously prevent HP from falling below 1\.\s*Retreat from the battlefield (\d+) seconds later/gi,
      'После получения смертельного урона не дает HP опуститься ниже 1. Отступает с поля боя через $1 сек.',
    ],
    [
      /Gains\s+___TAG_(\d+)___\s+after being deployed for (\d+) seconds/gi,
      'Получает ___TAG_$1___ через $2 сек. после развёртывания',
    ],

    // Attacks, damage, status
    [
      /Poisons the targets when attacking,\s*dealing (\d+) Arts damage to them per second,\s*lasting (\d+) seconds\s*\(damage is doubled against Ranged enemies\)/gi,
      'При атаке отравляет цели, нанося им $1 магического урона в секунду в течение $2 сек. (урон удваивается по дальнобойным врагам)',
    ],
    [
      /Attacks ignore (\d+) RES/gi,
      'Атаки игнорируют $1 сопротивления магии',
    ],
    [
      /Attacks ignore (\d+) DEF/gi,
      'Атаки игнорируют $1 защиты',
    ],
    [
      /Has a (\d+%?) chance to ignore the target's Defense when attacking/gi,
      'При атаке имеет шанс $1 проигнорировать защиту цели',
    ],
    [
      /Reveals\s+___TAG_(\d+)___\s+enemies within range/gi,
      'Раскрывает ___TAG_$1___ врагов в радиусе атаки',
    ],
    [
      /Restores 1 Skill Point to this Operator and a random ally in the surrounding tiles when attacked/gi,
      'При получении атаки восстанавливает 1 SP себе и случайному союзнику на соседних клетках',
    ],
    [
      /When ([A-Za-z' ]+) restores an ally's HP,\s*she also restores (\d+) extra Skill Points? to them/gi,
      'Когда $1 восстанавливает HP союзнику, она также восстанавливает ему $2 дополнительное SP',
    ],
    [
      /When blocking enemies,\s*gains (\d+%?)/gi,
      'При блокировании врагов получает $1',
    ],
    [
      /blocked enemies receive (\d+%?) ATK as Arts damage/gi,
      'заблокированные враги получают $1 от СИЛ АТК в виде магического урона',
    ],
    [
      /SP recovery rate\s*([+-]?\d+(?:\.\d+)?)\/sec\s*after deployment and before 2nd skill use/gi,
      'Скорость восстановления SP $1/сек после развёртывания и до 2-го применения навыка',
    ],
    [
      /ASPD\s*([+-]?\d+)\s*after defeating an enemy\s*\(stacks up to (\d+) times\)/gi,
      'СКОР АТК $1 после победы над врагом (суммируется до $2 раз)',
    ],
    [
      /Can carry (\d+) <Support Devices>\s*\(deploy up to (\d+)\),\s*with different effects depending on Skill/gi,
      'Может нести $1 устройства поддержки (разместить до $2), эффект зависит от навыка',
    ],
    [
      /Can summon a clone with the same abilities as ([A-Za-z' ]+),\s*but has its own redeployment time/gi,
      'Может призвать двойника со способностями $1, но с собственным временем передислокации',
    ],
    [
      /Can summon a stronger clone with the same abilities as ([A-Za-z' ]+),\s*but has its own redeployment time/gi,
      'Может призвать усиленного двойника со способностями $1, но с собственным временем передислокации',
    ],
    [
      /Redeployment time of clone is reduced by (\d+) seconds/gi,
      'Время передислокации двойника сокращается на $1 сек.',
    ],
    [
      /Can summon a 'Typewriter' for (\d+)s;\s*the 'Typewriter' has the same skill as this unit,\s*and has its own Redeployment Time/gi,
      'Может призвать «Печатную машинку» на $1 сек.; машинка копирует навык оперативника и имеет собственное время отката',
    ],
    [
      /Attacks from the 'Typewriter' reduce the target's DEF by (\d+%?)\s*for (\d+) seconds;\s*if the 'Typewriter' is placed within the (\d+) tiles adjacent to ([A-Za-z' ]+),\s*this effect increases to (\d+%?)/gi,
      'Атаки «Печатной машинки» снижают защиту цели на $1 на $2 сек.; если машинка установлена на $3 соседних клетках с $4, эффект усиливается до $5',
    ],
  ];

  for (const [pattern, replacement] of sentencePatterns) {
    if (typeof replacement === 'function') {
      s = s.replace(pattern, replacement as any);
    } else {
      s = s.replace(pattern, replacement);
    }
  }

  // 3. Clause & phrase replacements
  const phrases: [RegExp, string][] = [
    [/\bWhen deployed\b/gi, 'При развёртывании'],
    [/\bafter deployment\b/gi, 'после развёртывания'],
    [/\bAfter deployment\b/gi, 'После развёртывания'],
    [/\bwhen this unit is in the squad\b/gi, 'когда этот оперативник находится в отряде'],
    [/\bwhen in the squad\b/gi, 'находясь в отряде'],
    [/\bWhen attacking aerial enemies\b/gi, 'При атаке воздушных врагов'],
    [/\bWhen attacking enemies with less than\b/gi, 'При атаке врагов с менее чем'],
    [/\bWhen attacking\b/gi, 'При атаке'],
    [/\bwhen attacking\b/gi, 'при атаке'],
    [/\bWhen attacked\b/gi, 'При получении атаки'],
    [/\bwhen attacked\b/gi, 'при получении атаки'],
    [/\bWhen blocking enemies\b/gi, 'При блокировании врагов'],
    [/\bwhen blocking enemies\b/gi, 'при блокировании врагов'],
    [/\bWhen blocking\b/gi, 'При блокировании'],
    [/\bAfter defeating an enemy\b/gi, 'После победы над врагом'],
    [/\bafter defeating an enemy\b/gi, 'после победы над врагом'],
    [/\bWhen this unit's HP falls beneath\b/gi, 'Когда HP падает ниже'],
    [/\bWhen HP falls beneath\b/gi, 'Когда HP падает ниже'],
    [/\bIf this unit hasn't attacked for\b/gi, 'Если оперативник не атакует в течение'],
    [/\bFor every (\d+) seconds\b/gi, 'Каждые $1 сек.'],
    [/\bfor every (\d+) seconds\b/gi, 'каждые $1 сек.'],
    [/\bwithin normal Attack Range\b/gi, 'в пределах стандартного радиуса атаки'],
    [/\boutside this unit's normal Attack Range\b/gi, 'вне стандартного радиуса атаки'],
    [/\bwithin Attack Range\b/gi, 'в радиусе атаки'],
    [/\bwithin range\b/gi, 'в радиусе атаки'],
    [/\bIn the surrounding 4 tiles\b/gi, 'На соседних 4 клетках'],
    [/\bin the surrounding 4 tiles\b/gi, 'на соседних 4 клетках'],
    [/\bIn the surrounding 8 tiles\b/gi, 'На соседних 8 клетках'],
    [/\bin the surrounding 8 tiles\b/gi, 'на соседних 8 клетках'],
    [/\bin the surrounding tiles\b/gi, 'на соседних клетках'],
    [/\bto this unit and a random ally\b/gi, 'этому оперативнику и случайному союзнику'],
    [/\bto a random ally\b/gi, 'случайному союзнику'],
    [/\bdeals (\d+%?) Arts damage\b/gi, 'наносит $1 магического урона'],
    [/\bdeals (\d+%?) Physical damage\b/gi, 'наносит $1 физического урона'],
    [/\bdeals (\d+%?) True damage\b/gi, 'наносит $1 чистого урона'],
    [/\bdeals (\d+%?) ATK as Arts damage\b/gi, 'наносит магический урон в размере $1 от СИЛ АТК'],
    [/\bdeals (\d+%?) ATK as Physical damage\b/gi, 'наносит физический урон в размере $1 от СИЛ АТК'],
    [/\bdeals (\d+%?) ATK as True damage\b/gi, 'наносит чистый урон в размере $1 от СИЛ АТК'],
    [/\bhas a (\d+%?) chance to\b/gi, 'с шансом $1'],
    [/\bHas a (\d+%?) chance to\b/gi, 'С шансом $1'],
    [/\bchance to\b/gi, 'шанс'],
    [/\bfor (\d+) seconds\b/gi, 'на $1 сек.'],
    [/\bfor (\d+) second\b/gi, 'на $1 сек.'],
    [/\blast lasting (\d+) seconds\b/gi, 'длительностью $1 сек.'],
    [/\blasting (\d+) seconds\b/gi, 'в течение $1 сек.'],
    [/\blasting (\d+) second\b/gi, 'в течение $1 сек.'],
    [/\bper second\b/gi, 'в секунду'],
    [/\bevery second\b/gi, 'каждую секунду'],
    [/\bEvery second\b/gi, 'Каждую секунду'],
    [/\bstacking up to (\d+) times\b/gi, 'суммируется до $1 раз'],
    [/\bstacks up to (\d+) times\b/gi, 'суммируется до $1 раз'],
    [/\bCan summon\b/gi, 'Может призвать'],
    [/\bcan summon\b/gi, 'может призвать'],
    [/\ball allied units\b/gi, 'все союзники'],
    [/\ball allies\b/gi, 'все союзники'],
    [/\ball blocked enemies\b/gi, 'все заблокированные враги'],
    [/\bblocked enemies\b/gi, 'заблокированные враги'],
    [/\bRedeployment Time\b/gi, 'Время передислокации'],
    [/\bredeployment time\b/gi, 'время передислокации'],
    [/\bSP recovery rate\b/gi, 'Скорость восстановления SP'],
    [/\bInitial SP\b/gi, 'Начальные SP'],
    [/\bSkill Points?\b/gi, 'SP'],
    [/\bSkill Point\b/gi, 'SP'],
    [/\bAttack Range\b/gi, 'Радиус атаки'],
    [/\bMax HP\b/gi, 'Макс. HP'],
    [/\bmax HP\b/gi, 'макс. HP'],
    [/\bASPD\b/gi, 'СКОР АТК'],
    [/\bATK\b/gi, 'СИЛ АТК'],
    [/\bDEF\b/gi, 'Защита'],
    [/\bRES\b/gi, 'Сопротивление магии'],
    [/\bDP Cost\b/gi, 'Стоимость DP'],
    [/\bPhysical damage\b/gi, 'физический урон'],
    [/\bArts damage\b/gi, 'магический урон'],
    [/\bTrue damage\b/gi, 'чистый урон'],
    [/\bArts\b/gi, 'Магия'],
    [/\bPhysical\b/gi, 'Физический'],
    [/\bAerial enemies\b/gi, 'Воздушные враги'],
    [/\baerial enemies\b/gi, 'воздушные враги'],
    [/\bRanged enemies\b/gi, 'Дальнобойные враги'],
    [/\branged enemies\b/gi, 'дальнобойные враги'],
    [/\bMelee enemies\b/gi, 'Враги ближнего боя'],
    [/\bmelee enemies\b/gi, 'враги ближнего боя'],
    [/\bdamage is doubled\b/gi, 'урон удваивается'],
    [/\bone time only\b/gi, 'единоразово'],
  ];

  for (const [re, rep] of phrases) {
    s = s.replace(re, rep);
  }

  // 4. Restore tags
  tags.forEach((tag, idx) => {
    s = s.replace(`___TAG_${idx}___`, tag);
  });

  // 5. Apply Russian glossary & grammar cleaners
  s = applyArknightsGlossary(s);
  s = cleanArknightsTalentTextRu(s);

  return s;
}
