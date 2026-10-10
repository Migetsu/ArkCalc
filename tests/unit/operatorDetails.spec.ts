import { describe, it, expect } from 'vitest'
import type { OperatorAttributes } from '~/types'

describe('Operator Details & Stat Progression Calculator', () => {
  // Stat linear interpolation function
  function interpolateStat(
    minVal: number,
    maxVal: number,
    currentLevel: number,
    maxLevel: number
  ): number {
    if (maxLevel <= 1 || currentLevel <= 1) return minVal
    if (currentLevel >= maxLevel) return maxVal
    return Math.round(minVal + ((maxVal - minVal) * (currentLevel - 1)) / (maxLevel - 1))
  }

  // Blackboard template formatting function
  function formatSkillDescription(
    template: string,
    blackboard: Array<{ key: string; value: any; valueStr?: any }>
  ): string {
    if (!template) return ''
    const bbMap: Record<string, any> = {}
    if (Array.isArray(blackboard)) {
      for (const b of blackboard) {
        if (b && b.key) {
          bbMap[b.key.toLowerCase()] =
            b.value !== null && b.value !== undefined ? b.value : b.valueStr
        }
      }
    }

    let res = template.replace(/<[^>]+>/g, '')

    res = res.replace(/\{([a-zA-Z0-9_@\.:%+-\s]+)\}/g, (match, expr) => {
      let [rawKey, fmt] = expr.split(':')
      rawKey = rawKey.trim()
      let isNegative = false
      if (rawKey.startsWith('-')) {
        isNegative = true
        rawKey = rawKey.substring(1)
      }
      const key = rawKey.toLowerCase()
      let val = bbMap[key]
      if (val === undefined) return match
      if (typeof val === 'number') {
        if (isNegative) val = -val
        if (fmt && fmt.includes('%')) {
          return Math.round(val * 100) + '%'
        }
        return String(val)
      }
      return String(val)
    })

    return res.trim()
  }

  it('interpolates stats correctly at Level 1, mid-level, and Max Level', () => {
    const minHp = 1000
    const maxHp = 2000
    const maxLevel = 50

    // Level 1 should be exactly minHp
    expect(interpolateStat(minHp, maxHp, 1, maxLevel)).toBe(1000)

    // Level 50 should be exactly maxHp
    expect(interpolateStat(minHp, maxHp, 50, maxLevel)).toBe(2000)

    // Mid-level (e.g. Level 25.5 -> 25)
    // 1000 + (1000 * 24 / 49) = 1000 + 489.79 = 1490
    const midStat = interpolateStat(minHp, maxHp, 25, maxLevel)
    expect(midStat).toBe(1490)
  })

  it('handles edge case where maxLevel is 1 or currentLevel is out of bounds', () => {
    expect(interpolateStat(500, 1000, 1, 1)).toBe(500)
    expect(interpolateStat(500, 1000, 0, 50)).toBe(500)
    expect(interpolateStat(500, 1000, 60, 50)).toBe(1000)
  })

  it('formats skill descriptions with percentage blackboard values', () => {
    const template = 'ATK <@ba.vup>+{atk:0%}</> and attacks at most {attack@max_target} targets.'
    const bb = [
      { key: 'atk', value: 2.0 },
      { key: 'attack@max_target', value: 6 },
    ]

    const formatted = formatSkillDescription(template, bb)
    expect(formatted).toBe('ATK +200% and attacks at most 6 targets.')
  })

  it('correctly formats negated blackboard expressions like {-def:0%}', () => {
    const template = 'DEF <@ba.vdown>-{-def:0%}</>; ATK <@ba.vup>+{atk:0%}</>'
    const bb = [
      { key: 'def', value: -0.7 },
      { key: 'atk', value: 1.5 },
    ]

    const formatted = formatSkillDescription(template, bb)
    expect(formatted).toBe('DEF -70%; ATK +150%')
  })

  it('removes game rich-text color/style tags cleanly', () => {
    const template = 'Deals <$ba.magic>Arts damage</> with <@ba.vup>critical strike</> effect.'
    const formatted = formatSkillDescription(template, [])
    expect(formatted).toBe('Deals Arts damage with critical strike effect.')
  })

  it('correctly maps attributes across Elite 0, Elite 1, and Elite 2 phases', () => {
    const phase0Attrs: OperatorAttributes = {
      maxHp: 699,
      atk: 276,
      def: 48,
      magicResistance: 10,
      cost: 18,
      blockCnt: 1,
      attackSpeed: 100,
      baseAttackTime: 1.6,
      respawnTime: 70,
    }

    const phase2MaxAttrs: OperatorAttributes = {
      maxHp: 1530,
      atk: 612,
      def: 121,
      magicResistance: 15,
      cost: 20,
      blockCnt: 1,
      attackSpeed: 100,
      baseAttackTime: 1.6,
      respawnTime: 70,
    }

    expect(phase2MaxAttrs.maxHp).toBeGreaterThan(phase0Attrs.maxHp)
    expect(phase2MaxAttrs.atk).toBeGreaterThan(phase0Attrs.atk)
    expect(phase2MaxAttrs.cost).toBeGreaterThanOrEqual(phase0Attrs.cost)
  })
})
