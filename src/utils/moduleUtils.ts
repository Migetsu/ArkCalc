/**
 * Utilities for formatting and localizing Arknights operator module data.
 */

export function formatModuleAttributeName(key: string, lang: 'ru' | 'en' | 'cn' = 'en'): string {
  if (lang === 'cn') {
    const cnMap: Record<string, string> = {
      max_hp: '最大生命',
      atk: '攻击力',
      def: '防御力',
      attack_speed: '攻击速度',
      magic_resistance: '法术抗性',
      cost: '部署费用',
      respawn_time: '再部署时间',
      block_cnt: '阻挡数',
    };
    return cnMap[key] || key.toUpperCase();
  }

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

export function formatModuleAttributeValue(key: string, value: number, lang: 'ru' | 'en' | 'cn' = 'en'): string {
  if (key === 'respawn_time') {
    const secSuffix = lang === 'ru' ? 'с' : (lang === 'cn' ? '秒' : 's');
    return value > 0 ? `+${value}${secSuffix}` : `${value}${secSuffix}`;
  }
  if (key === 'cost') {
    return value > 0 ? `+${value}` : `${value}`;
  }
  return value > 0 ? `+${value}` : `${value}`;
}

export function getModuleStageLabel(stage: number, lang: 'ru' | 'en' | 'cn' = 'en'): string {
  if (lang === 'cn') {
    return `阶段 ${stage}`;
  }
  if (lang === 'ru') {
    return `Уровень ${stage}`;
  }
  return `Stage ${stage}`;
}
