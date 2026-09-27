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
};

// ==================== 3. POST-TRANSLATION CORRECTIONS ====================

/**
 * Regex patterns to fix common bad automated translations produced by Google Translate
 */
const POST_TRANSLATION_RULES: [RegExp, string][] = [
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
