import {
  RECRUIT_OPERATORS,
  RECRUIT_TAG_DEFINITIONS,
  type RecruitableOperator,
  type RecruitTagDefinition,
} from '@/data/recruitmentData';

export {
  RECRUIT_OPERATORS,
  RECRUIT_TAG_DEFINITIONS,
  type RecruitableOperator,
  type RecruitTagDefinition,
};

export interface ComboResult {
  combo: string[];
  minRarity: number;
  maxRarity: number;
  guaranteedType: '6star' | '5star' | '4star_plus' | 'robot' | 'normal';
  recommendedTime: string;
  operators: RecruitableOperator[];
}

/**
 * Generate all combinations of length 1, 2, and 3 from an array of tags.
 */
export function generateTagCombos(tags: string[]): string[][] {
  const combos: string[][] = [];
  const n = tags.length;
  if (n === 0) return combos;

  // 1-tag
  for (let i = 0; i < n; i++) {
    combos.push([tags[i]]);
  }

  // 2-tag
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      combos.push([tags[i], tags[j]]);
    }
  }

  // 3-tag
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        combos.push([tags[i], tags[j], tags[k]]);
      }
    }
  }

  return combos;
}

/**
 * Solve recruitment combinations for selected tags.
 */
export function solveRecruitment(selectedTags: string[]): ComboResult[] {
  if (!selectedTags || selectedTags.length === 0) return [];

  const pool = RECRUIT_OPERATORS;
  const combos = generateTagCombos(selectedTags);
  const results: ComboResult[] = [];

  for (const combo of combos) {
    const hasTopOp = combo.includes('Top Operator');
    const hasSeniorOp = combo.includes('Senior Operator');
    const hasRobot = combo.includes('Robot');
    const hasStarter = combo.includes('Starter');

    // Matching operators in pool:
    const matched = pool.filter((op) => {
      // 6★ rule: never appears in recruitment unless Top Operator is explicitly chosen!
      if (op.rarity === 6 && !hasTopOp) return false;

      // When Top Operator is selected, non-6★ can match ONLY if they share the other tags,
      // but in Arknights choosing Top Operator at 9h guarantees 6★.
      // If combo has Top Operator:
      if (hasTopOp && op.rarity !== 6) {
        // If combo only contains Top Operator, only 6★ can drop
        if (combo.length === 1) return false;
      }

      // Senior Operator guarantees 5★ at 9h:
      if (hasSeniorOp && op.rarity !== 5) {
        if (combo.length === 1) return false;
      }

      // Check if operator has ALL tags in combo
      return combo.every((t) => op.tags.includes(t));
    });

    if (matched.length === 0) continue;

    // In Arknights, setting the recruitment timer to 9:00 hours removes 1★ and 2★ from the pool
    // unless 'Robot' or 'Starter' tag is in the combination.
    // Therefore, for non-Robot/non-Starter combinations, players set 9:00, so minRarity is computed
    // excluding 1★ and 2★ (unless they were specifically targeted).
    let effectiveMatched = matched;
    let recommendedTime = '9:00';

    if (hasRobot) {
      recommendedTime = '3:50';
      // At 3:50, 1★ operators have high chance, 4★/5★ might still appear or drop
    } else if (hasStarter) {
      recommendedTime = '7:40';
    } else {
      // Normal 9:00 recruitment: 1★ and 2★ cannot be recruited at 9 hours!
      effectiveMatched = matched.filter((o) => o.rarity >= 3);
    }

    if (effectiveMatched.length === 0) {
      effectiveMatched = matched;
    }

    const minRarity = Math.min(...effectiveMatched.map((o) => o.rarity));
    const maxRarity = Math.max(...effectiveMatched.map((o) => o.rarity));

    let guaranteedType: ComboResult['guaranteedType'] = 'normal';
    if (hasTopOp || minRarity === 6) {
      guaranteedType = '6star';
    } else if (hasSeniorOp || minRarity === 5) {
      guaranteedType = '5star';
    } else if (minRarity === 4) {
      guaranteedType = '4star_plus';
    } else if (hasRobot || minRarity === 1) {
      guaranteedType = 'robot';
    }

    results.push({
      combo,
      minRarity,
      maxRarity,
      guaranteedType,
      recommendedTime,
      operators: [...effectiveMatched].sort((a, b) => {
        if (b.rarity !== a.rarity) return b.rarity - a.rarity;
        return a.nameEn.localeCompare(b.nameEn);
      }),
    });
  }

  // Sorting priorities:
  // 1. 6-star guarantee
  // 2. 5-star guarantee
  // 3. 4-star+ guarantee
  // 4. Robot guarantee (1-star)
  // 5. Normal combinations: sort by maxRarity desc, then minRarity desc, then combo length asc
  const typeWeight: Record<ComboResult['guaranteedType'], number> = {
    '6star': 500,
    '5star': 400,
    '4star_plus': 300,
    'robot': 200,
    'normal': 100,
  };

  results.sort((a, b) => {
    const wDiff = typeWeight[b.guaranteedType] - typeWeight[a.guaranteedType];
    if (wDiff !== 0) return wDiff;

    if (b.minRarity !== a.minRarity) return b.minRarity - a.minRarity;
    if (b.maxRarity !== a.maxRarity) return b.maxRarity - a.maxRarity;

    // Prefer fewer tags (easier to select and lower tag drop chance)
    if (a.combo.length !== b.combo.length) return a.combo.length - b.combo.length;

    return b.operators.length - a.operators.length;
  });

  return results;
}

export function getTagDefinition(tagId: string): RecruitTagDefinition | undefined {
  return RECRUIT_TAG_DEFINITIONS.find((t: RecruitTagDefinition) => t.id === tagId);
}
