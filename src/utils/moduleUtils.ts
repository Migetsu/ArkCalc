/**
 * Utilities for formatting and localizing Arknights operator module data.
 */

export function formatModuleAttributeName(key: string, lang: 'ru' | 'en' | string = 'en'): string {
  const ruMap: Record<string, string> = {
    max_hp: 'Макс. HP',
    atk: 'Сила атаки (ATK)',
    def: 'Защита (DEF)',
    attack_speed: 'Скор. атаки (ASPD)',
    magic_resistance: 'Сопротивление (RES)',
    cost: 'Стоимость (DP)',
    respawn_time: 'Время возрождения',
    block_cnt: 'Блок',
  };

  const enMap: Record<string, string> = {
    max_hp: 'Max HP',
    atk: 'ATK',
    def: 'DEF',
    attack_speed: 'ASPD',
    magic_resistance: 'RES',
    cost: 'DP Cost',
    respawn_time: 'Respawn Time',
    block_cnt: 'Block Count',
  };

  if (lang === 'ru') {
    return ruMap[key] || key.toUpperCase();
  }
  return enMap[key] || key.toUpperCase();
}

export function formatModuleAttributeValue(key: string, value: number, lang: 'ru' | 'en' | string = 'en'): string {
  if (key === 'respawn_time') {
    const secSuffix = lang === 'ru' ? 'с' : 's';
    return value > 0 ? `+${value}${secSuffix}` : `${value}${secSuffix}`;
  }
  if (key === 'cost') {
    return value > 0 ? `+${value}` : `${value}`;
  }
  return value > 0 ? `+${value}` : `${value}`;
}

export function getModuleStageLabel(stage: number, lang: 'ru' | 'en' | string = 'en'): string {
  if (lang === 'ru') {
    return `Уровень ${stage}`;
  }
  return `Stage ${stage}`;
}
