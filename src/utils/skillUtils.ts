/**
 * Utility functions for parsing and displaying Arknights operator skills
 */

/**
 * Formats an Arknights skill description by injecting blackboard numeric parameters
 * and cleaning up in-game markup tags.
 */
export function formatSkillDescription(desc: string, blackboard?: any[]): string {
  if (!desc) return '';
  const bb: Record<string, number | string> = {};

  if (blackboard && Array.isArray(blackboard)) {
    for (const item of blackboard) {
      if (item && item.key) {
        bb[item.key.toLowerCase()] = item.value ?? item.valueStr ?? 0;
      }
    }
  }

  // Replace placeholders like {key}, {key:0%}, {key:0.0%}, {-key:0%}, {attack@max_target}, {agoat2_s_2[shield].atk_scale:0%}
  let res = desc.replace(
    /\{(-?)([^}:]+)(?::([^}]+))?\}/g,
    (match, sign, key, format) => {
      const val = bb[key.trim().toLowerCase()];
      if (val === undefined || val === null) return match;
      let num = Number(val);
      if (isNaN(num)) return String(val);
      if (sign === '-') num = -num;

      if (!format) {
        return String(Math.round(num * 100) / 100);
      }

      if (format === '0%') {
        return Math.round(num * 100) + '%';
      } else if (format === '0.0%') {
        return (num * 100).toFixed(1).replace(/\.0%$/, '%') + '%';
      } else if (format.includes('%')) {
        const precision = (format.match(/\.(0+)/) || [])[1]?.length || 0;
        return (num * 100).toFixed(precision) + '%';
      } else if (format.startsWith('0.')) {
        const precision = format.split('.')[1].length;
        return num.toFixed(precision);
      }
      return String(num);
    }
  );

  // Strip Arknights XML/BBCode tags: <@ba.vup>, </>, <$ba.stun>, etc.
  res = res
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[/g, '')
    .replace(/\]\]/g, '')
    .trim();

  return res;
}

/**
 * Human-readable SP recovery type
 */
export function getSpTypeName(spType: string, lang: 'ru' | 'en' | string = 'en'): string {
  const isRu = lang === 'ru';
  switch (spType) {
    case 'INCREASE_WITH_TIME':
      return isRu ? 'Авто-зарядка' : 'Auto Recovery';
    case 'INCREASE_WHEN_ATTACK':
      return isRu ? 'При атаке' : 'Offensive';
    case 'INCREASE_WHEN_TAKEN_DAMAGE':
      return isRu ? 'При получении урона' : 'Defensive';
    case 'NONE':
    case '8':
      return isRu ? 'Пассивный' : 'Passive';
    default:
      return spType;
  }
}

/**
 * Human-readable skill activation/trigger type
 */
export function getSkillTypeName(skillType: string, lang: 'ru' | 'en' | string = 'en'): string {
  const isRu = lang === 'ru';
  switch (skillType) {
    case 'MANUAL':
      return isRu ? 'Ручная активация' : 'Manual Trigger';
    case 'AUTO':
      return isRu ? 'Авто-активация' : 'Auto Trigger';
    case 'PASSIVE':
      return isRu ? 'Пассивный' : 'Passive';
    default:
      return skillType;
  }
}

/**
 * Human-readable skill rank/mastery label
 */
export function getSkillRankLabel(level: number, lang: 'ru' | 'en' | string = 'en'): string {
  if (level <= 7) {
    return lang === 'ru' ? `Ранг ${level}` : `Rank ${level}`;
  }
  const m = level - 7;
  return `M${m}`;
}

/**
 * Human-readable skill duration properly distinguishing instant, timed, infinite, and passive skills
 */
export function formatSkillDuration(
  duration: number,
  skillType?: string,
  desc?: string,
  isInfinite?: boolean,
  lang: 'ru' | 'en' | string = 'en'
): string {
  if (skillType === 'PASSIVE') {
    return lang === 'ru' ? 'Пассивно' : 'Passive';
  }

  // Check if skill text explicitly denotes unlimited / infinite duration
  const descLower = (desc || '').toLowerCase();
  const textIndicatesInfinite =
    descLower.includes('持续时间无限') ||
    descLower.includes('无限持续时间') ||
    descLower.includes('持续时间变为无限') ||
    descLower.includes('unlimited duration') ||
    descLower.includes('duration becomes infinite') ||
    descLower.includes('infinite duration') ||
    descLower.includes('неограниченн') ||
    descLower.includes('бесконечн');

  if (isInfinite || textIndicatesInfinite) {
    return lang === 'ru' ? 'Бесконечно' : 'Infinite';
  }

  if (duration > 0) {
    return lang === 'ru' ? `${duration}с` : `${duration}s`;
  }

  return lang === 'ru' ? 'Мгновенно' : 'Instant';
}

