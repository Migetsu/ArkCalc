import type { RecruitOperator, TagCombination } from '~/types'

/**
 * Generates all subsets of size 1, 2, and 3 from an array of tags.
 */
export function getSubsets(arr: string[]): string[][] {
  const result: string[][] = []
  const n = arr.length

  // Subsets of length 1
  for (let i = 0; i < n; i++) {
    result.push([arr[i]!])
  }

  // Subsets of length 2
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      result.push([arr[i]!, arr[j]!])
    }
  }

  // Subsets of length 3
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        result.push([arr[i]!, arr[j]!, arr[k]!])
      }
    }
  }

  return result
}

/**
 * Filters a pool of recruitment operators matching a specific tag combination
 * respecting official Arknights recruitment tag priority rules.
 */
export function filterOperatorsForCombination(
  combo: string[],
  operators: RecruitOperator[]
): RecruitOperator[] {
  return operators.filter((op) => {
    // 1. Must match ALL tags in the combination
    const hasAll = combo.every((t) => op.tags.includes(t))
    if (!hasAll) return false

    // 2. 6-star operators strictly require 'Top Operator' in the chosen combination
    if (op.rarity === 6 && !combo.includes('Top Operator')) {
      return false
    }

    // 3. 'Top Operator' selected strictly yields 6-star operators
    if (combo.includes('Top Operator') && op.rarity !== 6) {
      return false
    }

    // 4. 'Senior Operator' tag strictly yields 5-star operators
    if (combo.includes('Senior Operator') && op.rarity !== 5) {
      return false
    }

    // 5. 1-star Robot operators strictly require 'Robot' tag
    if (op.rarity === 1 && !combo.includes('Robot')) {
      return false
    }

    // 6. If 'Robot' tag is chosen, only 1-star robots are recruited
    if (combo.includes('Robot') && op.rarity !== 1) {
      return false
    }

    // 7. 2-star Starter operators strictly require 'Starter' tag
    if (op.rarity === 2 && !combo.includes('Starter')) {
      return false
    }

    // 8. If 'Starter' tag is chosen, only 1-star or 2-star operators appear
    if (combo.includes('Starter') && op.rarity > 2) {
      return false
    }

    return true
  })
}

/**
 * Evaluates all valid 1, 2, 3-tag combinations from the user's selected tags,
 * computes min/max rarities and guarantee guarantees, and sorts them by tactical priority.
 */
export function calculateRecruitmentCombinations(
  selectedTags: string[],
  operators: RecruitOperator[]
): TagCombination[] {
  if (!selectedTags || selectedTags.length === 0) return []

  const subsets = getSubsets(selectedTags)
  const results: TagCombination[] = []

  for (const combo of subsets) {
    const matchedOps = filterOperatorsForCombination(combo, operators)
    if (matchedOps.length === 0) continue

    const rarities = matchedOps.map((op) => op.rarity)
    const minRarity = Math.min(...rarities)
    const maxRarity = Math.max(...rarities)

    results.push({
      tags: combo,
      operators: [...matchedOps].sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name)),
      minRarity,
      maxRarity,
      hasGuaranteed6Star: minRarity === 6,
      hasGuaranteed5Star: minRarity === 5,
      hasGuaranteed4Star: minRarity === 4,
      hasRobot: combo.includes('Robot') || minRarity === 1,
    })
  }

  // Sort combinations:
  // 1. Guaranteed 6★ (Score 600)
  // 2. Guaranteed 5★ (Score 500)
  // 3. Guaranteed 4★ (Score 400)
  // 4. Robot tag (Score 350)
  // 5. Min rarity 3★ (Score 300)
  // Tiebreak: fewer tags, then fewer candidates
  return results.sort((a, b) => {
    const getScore = (c: TagCombination) => {
      if (c.hasGuaranteed6Star) return 600
      if (c.hasGuaranteed5Star) return 500
      if (c.hasGuaranteed4Star) return 400
      if (c.hasRobot) return 350
      return 300
    }

    const scoreA = getScore(a)
    const scoreB = getScore(b)
    if (scoreA !== scoreB) return scoreB - scoreA

    if (a.tags.length !== b.tags.length) return a.tags.length - b.tags.length
    return a.operators.length - b.operators.length
  })
}

/**
 * Filters combinations by guarantee level, profession class, or search query.
 */
export function filterCombinations(
  combinations: TagCombination[],
  options: {
    guarantee?: 'all' | '4plus' | '5plus' | '6star' | 'robot'
    profession?: string
    searchQuery?: string
  } = {}
): TagCombination[] {
  const { guarantee = 'all', profession = 'all', searchQuery = '' } = options
  const normalizedQuery = searchQuery.trim().toLowerCase()

  return combinations.filter((combo) => {
    // 1. Guarantee filter
    if (guarantee === '6star' && !combo.hasGuaranteed6Star) return false
    if (guarantee === '5plus' && combo.minRarity < 5) return false
    if (guarantee === '4plus' && combo.minRarity < 4) return false
    if (guarantee === 'robot' && !combo.hasRobot) return false

    // 2. Profession filter
    if (profession && profession !== 'all') {
      const hasClass = combo.operators.some(
        (op) => op.profession.toLowerCase() === profession.toLowerCase()
      )
      if (!hasClass) return false
    }

    // 3. Operator or tag search query
    if (normalizedQuery) {
      const matchesTag = combo.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
      const matchesOp = combo.operators.some((op) =>
        op.name.toLowerCase().includes(normalizedQuery)
      )
      if (!matchesTag && !matchesOp) return false
    }

    return true
  })
}
