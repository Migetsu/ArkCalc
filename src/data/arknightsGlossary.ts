/**
 * Arknights Terminology Glossary & Text Protection Utility
 *
 * Provides:
 * 1. Tag & blackboard placeholder masking before sending to translation services (so tags like <@ba.kw> and {atk_scale:0%} are never mangled or translated).
 * 2. Canon Arknights Russian terminology glossary (Arts -> Магический урон, True -> Чистый урон, etc.).
 * 3. Post-processing normalization of machine translation quirks.
 */

// ==================== 1. TAG & PLACEHOLDER PROTECTION ====================

export interface MaskedTextResult {
  maskedText: string;
  tokens: string[];
}

/**
 * Masks XML-like tags (<@ba.kw>...</>, <color=...>) and blackboard expressions ({...})
 * with safe index tokens like "[[0]]", "[[1]]" that translation engines leave intact.
 */
export function maskTextForTranslation(text: string): MaskedTextResult {
  if (!text) return { maskedText: '', tokens: [] };

  const tokens: string[] = [];

  // Match:
  // 1. Arknights tags: <@ba.kw>, </>, <$ba.vup>, <color=#...>, </color>, <b>, </b>, etc.
  // 2. Blackboard placeholders: {atk_scale:0%}, {-duration}, {agoat2_s_1[aura].ep_heal_ratio:0%}, etc.
  const regex = /(<[^>]+>|\{[^}]+\})/g;

  const maskedText = text.replace(regex, (match) => {
    const idx = tokens.length;
    tokens.push(match);
    return `[[${idx}]]`;
  });

  return { maskedText, tokens };
}

/**
 * Restores original tags and placeholders from saved token array.
 * Handles cases where translation engines inserted extra spaces like "[[ 0 ]]".
 */
export function unmaskTextAfterTranslation(translatedText: string, tokens: string[]): string {
  if (!translatedText || tokens.length === 0) return translatedText;

  return translatedText.replace(/\[\[\s*(\d+)\s*\]\]/g, (match, idxStr) => {
    const idx = parseInt(idxStr, 10);
    if (!isNaN(idx) && idx >= 0 && idx < tokens.length) {
      return tokens[idx];
    }
    return match;
  });
}

// ==================== 2. CANON ARKNIGHTS GLOSSARY (RU) ====================

/**
 * Dictionary of Arknights terms mapped to community-accepted Russian terms
 */
export const ARKNIGHTS_TERM_GLOSSARY: Record<string, string> = {
  // Damage Types
  'arts damage': 'магический урон',
  'arts dmg': 'магический урон',
  'physical damage': 'физический урон',
  'physical dmg': 'физический урон',
  'true damage': 'чистый урон',
  'true dmg': 'чистый урон',
  'elemental damage': 'элементальный урон',
  'necrosis damage': 'урон некроза',
  'nervous impairment': 'нервное истощение',
  'burn damage': 'урон ожога',
  'corrosion damage': 'урон коррозии',

  // Core Attributes
  'max hp': 'Макс. HP',
  'maximum hp': 'Макс. HP',
  'atk': 'СИЛ АТК',
  'attack power': 'СИЛ АТК',
  'def': 'ЗАЩ',
  'defense': 'ЗАЩ',
  'res': 'СОПР',
  'arts resistance': 'СОПР магии',
  'aspd': 'СКОР АТК',
  'attack speed': 'скорость атаки',
  'block count': 'блокирование',
  'block': 'блок',
  'redeployment time': 'время передислокации',
  'deployment cost': 'стоимость DP',
  'dp cost': 'стоимость DP',
  'sp cost': 'стоимость SP',
  'initial sp': 'начальный SP',
  'attack range': 'радиус атаки',

  // Status Effects & Crowd Control
  'stun': 'оглушение',
  'stunned': 'оглушен(а)',
  'silence': 'немота',
  'silenced': 'под действием немоты',
  'sleep': 'сон',
  'asleep': 'усыплен(а)',
  'freeze': 'заморозка',
  'frozen': 'заморожен(а)',
  'cold': 'озноб',
  'bind': 'обездвиживание',
  'bound': 'обездвижен(а)',
  'levitate': 'левитация',
  'levitated': 'парит в воздухе',
  'sluggish': 'замедление',
  'slow': 'замедление',
  'slowed': 'замедлен(а)',
  'tremble': 'дрожь',
  'fear': 'страх',
  'camouflage': 'маскировка',
  'invisibility': 'невидимость',
  'invisible': 'невидимый',
  'invulnerable': 'неуязвимость',
  'status resistance': 'сопротивление эффектам',
  'shelter': 'укрытие',
  'fragile': 'хрупкость',
  'taunt': 'провокация',
  'barrier': 'барьер',
  'shield': 'щит',
  'overdrive': 'перегрузка',
  'weightless': 'невесомость',

  // Currencies & Lore
  'sanity': 'Рассудок',
  'originite prime': 'Ориджинит Прайм',
  'orundum': 'Орундум',
  'lmd': 'LMD',
  'rhodes island': 'Родос Айленд',
  'operator': 'оперативник',
  'operators': 'оперативники',
  'abyssal hunters': 'Абиссальные охотники',
  'abyssal hunter': 'Абиссальный охотник',
  // Status & Mechanics
  'weightlessness': 'Невесомость',
  'airborne': 'в состоянии Левитации',
  'in the air': 'в воздухе',
  'when deployed': 'пока находится на поле боя',
  'when present': 'пока находится на поле боя',
};

// ==================== 3. POST-TRANSLATION CORRECTIONS ====================

/**
 * Regex patterns to fix common bad automated translations produced by Google Translate
 */
const POST_TRANSLATION_RULES: [RegExp, string][] = [
  // Bad "Wish / Hope" literal talent translations (安洁莉娜·愿景 / 愿... 的攻击)
  [/\bжелаю,\s*чтобы\s*(?:атаки|атака)?\b/gi, 'Атаки'],
  [/\bжелание,\s*чтобы\s*(?:атаки|атака)?\b/gi, 'Атаки'],
  [/\bпусть\s+атаки\b/gi, 'Атаки'],

  // Bad "When deployed / present" (当在场时 / 当其在场时 / When deployed / When present)
  [/\bкогда\s+(?:он|она|оно)\s+присутствует\b/gi, 'Пока находится на поле боя'],
  [/\bкогда\s+присутствует\b/gi, 'Пока находится на поле боя'],
  [/\bпри\s+присутствии\b/gi, 'Пока находится на поле боя'],
  [/\bпри\s+развертывании\s+на\s+поле\b/gi, 'Пока находится на поле боя'],

  // Airborne / Flying / Levitate translations
  [/\bв\s+состоянии\s+взлета\b/gi, 'в состоянии Левитации'],
  [/\bв\s+состоянии\s+полета\b/gi, 'в состоянии Левитации'],
  [/\bлетающие\s+союзные\s+операторы\b/gi, 'союзники в состоянии Левитации'],
  [/\bлетающие\s+союзники\b/gi, 'союзники в состоянии Левитации'],
  [/\bпарящие\s+союзники\b/gi, 'союзники в состоянии Левитации'],
  [/\bпарящие\s+в\s+воздухе\b/gi, 'в состоянии Левитации'],

  // Weightless translations
  [/\bвраги\s+будут\s+невесомыми\b/gi, 'враги получают статус Невесомости (вес снижается на 1)'],
  [/\bвраги\s+становятся\s+невесомыми\b/gi, 'враги получают статус Невесомости (вес снижается на 1)'],
  [/\bсчитаются\s+невесомыми\b/gi, 'получают статус Невесомости (вес снижается на 1)'],
  [/\bстановится\s+невесомым\b/gi, 'получает статус Невесомости (вес снижается на 1)'],
  [/\bбудут\s+невесомыми\b/gi, 'получают статус Невесомости (вес снижается на 1)'],

  // Bad talent name verbs (lowercase infinitive -> capitalized noun phrase)
  [/^танцевать\s+в\s+небе(?:сах)?/gi, 'Танец в небесах'],
  [/^танец\s+в\s+небе$/gi, 'Танец в небесах'],
  [/^плавать\s+над\s+землей/gi, 'Парящая над землёй'],
  [/^парить\s+над\s+землей/gi, 'Парящая над землёй'],

  // Operator terminology corrections
  [/\bсоюзные\s+операторы\b/gi, 'союзные оперативники'],
  [/\bсоюзных\s+операторов\b/gi, 'союзных оперативников'],
  [/\bсоюзным\s+операторам\b/gi, 'союзным оперативникам'],
  [/\bвражеские\s+цели\b/gi, 'враги'],

  // Bad "Arts Damage" translations
  [/\bурон[а-я]* от искусств[а-я]*/gi, 'магический урон'],
  [/\bповреждени[а-я]* от искусств[а-я]*/gi, 'магический урон'],
  [/\bискусств[а-я]* урон[а-я]*/gi, 'магический урон'],
  [/\bмагическ[а-я]* повреждени[а-я]*/gi, 'магический урон'],

  // Bad "True Damage" translations
  [/\bистинн[а-я]* урон[а-я]*/gi, 'чистый урон'],
  [/\bнастоящ[а-я]* урон[а-я]*/gi, 'чистый урон'],
  [/\bреальн[а-я]* урон[а-я]*/gi, 'чистый урон'],

  // Bad "Physical Damage" translations
  [/\bфизическ[а-я]* повреждени[а-я]*/gi, 'физический урон'],

  // Bad "Sanity" translations
  [/\bздравомысли[а-я]*/gi, 'рассудок'],

  // Bad "DP" (Deployment Points) translations
  [/\bочк[а-я]* развертывания\b/gi, 'DP'],
  [/\bстоимост[а-я]* развертывания\b/gi, 'стоимость DP'],
  [/\bзатрат[а-я]* на развертывание\b/gi, 'стоимость DP'],

  // Bad "SP" translations
  [/\bочк[а-я]* навыка\b/gi, 'SP'],
  [/\bтехническ[а-я]* сил[а-я]*\b/gi, 'SP'],

  // Bad Duration translations
  [/\bнеограниченн[а-я]* продолжит[а-я]*\b/gi, 'бесконечная длительность'],
  [/\bбесконечн[а-я]* продолжит[а-я]*\b/gi, 'бесконечная длительность'],

  // Clean double spaces and punctuation issues
  [/\s{2,}/g, ' '],
  [/\s+([.,!?;:])/g, '$1'],
];

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeText(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Normalizes talent names in Russian:
 * Capitalizes first letter, replaces known bad verb translations with canonical titles.
 */
export function cleanArknightsTalentNameRu(name: string): string {
  if (!name) return '';
  let result = name.trim();

  // Known replacements
  if (/^(?:танцевать\s+в\s+небе|танец\s+в\s+небе)/i.test(result)) {
    return 'Танец в небесах';
  }
  if (/^(?:плавать\s+над\s+землей|парить\s+над\s+землей|floating\s+above\s+the\s+earth)/i.test(result)) {
    return 'Парящая над землёй';
  }
  if (/^dance\s+in\s+the\s+heavens/i.test(result)) {
    return 'Танец в небесах';
  }

  // Strip trailing period if machine translation added it
  result = result.replace(/\.+$/, '');

  return capitalizeText(result);
}

/**
 * Applies Arknights glossary and fixes known bad machine translations on Russian talent descriptions.
 */
export function cleanArknightsTalentTextRu(text: string): string {
  if (!text) return '';
  let result = applyArknightsGlossary(text);

  // Capitalize sentence start
  return capitalizeText(result);
}

/**
 * Applies Arknights glossary and fixes known bad machine translations on Russian text.
 */
export function applyArknightsGlossary(text: string): string {
  if (!text) return '';

  let result = text;

  // Apply post-translation regex replacement rules
  for (const [pattern, replacement] of POST_TRANSLATION_RULES) {
    result = result.replace(pattern, replacement);
  }

  return result.trim();
}
