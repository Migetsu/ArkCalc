import { describe, it, expect } from 'vitest'
import {
  getSubsets,
  filterOperatorsForCombination,
  calculateRecruitmentCombinations,
  filterCombinations,
} from '~/utils/recruitmentCalculator'
import type { RecruitOperator } from '~/types'

describe('Recruitment Calculator Engine', () => {
  const pool: RecruitOperator[] = [
    {
      id: 'char_102_texas',
      name: 'Texas',
      rarity: 5,
      profession: 'Vanguard',
      position: 'Melee',
      tags: ['Senior Operator', 'Melee', 'Vanguard', 'DP-Recovery', 'Crowd Control'],
      avatar: 'https://example.com/texas.png',
    },
    {
      id: 'char_010_chen',
      name: 'Ch\'en',
      rarity: 6,
      profession: 'Guard',
      position: 'Melee',
      tags: ['Top Operator', 'Melee', 'Guard', 'DPS', 'Nuker'],
      avatar: 'https://example.com/chen.png',
    },
    {
      id: 'char_017_huang',
      name: 'Blaze',
      rarity: 6,
      profession: 'Guard',
      position: 'Melee',
      tags: ['Top Operator', 'Melee', 'Guard', 'DPS', 'Survival'],
      avatar: 'https://example.com/blaze.png',
    },
    {
      id: 'char_237_gravel',
      name: 'Gravel',
      rarity: 4,
      profession: 'Specialist',
      position: 'Melee',
      tags: ['Melee', 'Specialist', 'Fast-Redeploy', 'Defense'],
      avatar: 'https://example.com/gravel.png',
    },
    {
      id: 'char_208_melan',
      name: 'Melantha',
      rarity: 3,
      profession: 'Guard',
      position: 'Melee',
      tags: ['Melee', 'Guard', 'DPS', 'Survival'],
      avatar: 'https://example.com/melantha.png',
    },
    {
      id: 'char_285_medic2',
      name: 'Lancet-2',
      rarity: 1,
      profession: 'Medic',
      position: 'Ranged',
      tags: ['Robot', 'Ranged', 'Medic', 'Healing'],
      avatar: 'https://example.com/lancet2.png',
    },
    {
      id: 'char_286_cast3',
      name: 'Castle-3',
      rarity: 1,
      profession: 'Guard',
      position: 'Melee',
      tags: ['Robot', 'Melee', 'Guard', 'Support'],
      avatar: 'https://example.com/castle3.png',
    },
    {
      id: 'char_500_noirc',
      name: 'Noir Corne',
      rarity: 2,
      profession: 'Defender',
      position: 'Melee',
      tags: ['Starter', 'Melee', 'Defender'],
      avatar: 'https://example.com/noir.png',
    },
  ]

  describe('getSubsets', () => {
    it('returns 1 subset for 1 tag', () => {
      const subsets = getSubsets(['Guard'])
      expect(subsets).toEqual([['Guard']])
    })

    it('returns 3 subsets (two 1-tag, one 2-tag) for 2 tags', () => {
      const subsets = getSubsets(['Guard', 'DPS'])
      expect(subsets.length).toBe(3)
      expect(subsets).toContainEqual(['Guard'])
      expect(subsets).toContainEqual(['DPS'])
      expect(subsets).toContainEqual(['Guard', 'DPS'])
    })

    it('returns 7 subsets for 3 tags', () => {
      const subsets = getSubsets(['Guard', 'DPS', 'Melee'])
      expect(subsets.length).toBe(7) // 3 (1-tag) + 3 (2-tag) + 1 (3-tag)
    })

    it('limits combination length to at most 3 tags for recruitment slots', () => {
      const subsets = getSubsets(['A', 'B', 'C', 'D', 'E'])
      // C(5, 1) + C(5, 2) + C(5, 3) = 5 + 10 + 10 = 25
      expect(subsets.length).toBe(25)
      expect(subsets.every((combo) => combo.length >= 1 && combo.length <= 3)).toBe(true)
    })
  })

  describe('filterOperatorsForCombination', () => {
    it('matches operators containing all tags in the combination', () => {
      const result = filterOperatorsForCombination(['Melee', 'Specialist'], pool)
      expect(result.map((op) => op.name)).toEqual(['Gravel'])
    })

    it('strictly forbids 6★ operators from appearing unless "Top Operator" is in combination', () => {
      // Guard + DPS: matches Ch'en (6★), Blaze (6★), and Melantha (3★)
      // BUT without "Top Operator", 6★ MUST be excluded
      const result = filterOperatorsForCombination(['Guard', 'DPS'], pool)
      expect(result.some((op) => op.rarity === 6)).toBe(false)
      expect(result.map((op) => op.name)).toEqual(['Melantha'])
    })

    it('strictly includes 6★ operators when "Top Operator" is included', () => {
      const result = filterOperatorsForCombination(['Top Operator', 'Guard'], pool)
      expect(result.length).toBe(2)
      expect(result.every((op) => op.rarity === 6)).toBe(true)
      expect(result.map((op) => op.name)).toContain("Ch'en")
      expect(result.map((op) => op.name)).toContain('Blaze')
    })

    it('strictly forces 5★ operators when "Senior Operator" tag is chosen', () => {
      const result = filterOperatorsForCombination(['Senior Operator', 'Vanguard'], pool)
      expect(result.length).toBe(1)
      expect(result[0]?.name).toBe('Texas')
      expect(result[0]?.rarity).toBe(5)
    })

    it('strictly requires "Robot" tag for 1★ operators', () => {
      // Castle-3 has Melee, Guard, Support
      // Without Robot tag, Castle-3 must not appear
      const withoutRobot = filterOperatorsForCombination(['Guard', 'Support'], pool)
      expect(withoutRobot.some((op) => op.rarity === 1)).toBe(false)

      // With Robot tag, Castle-3 must appear
      const withRobot = filterOperatorsForCombination(['Robot', 'Guard'], pool)
      expect(withRobot.map((op) => op.name)).toEqual(['Castle-3'])
    })

    it('strictly requires "Starter" tag for 2★ operators', () => {
      const withoutStarter = filterOperatorsForCombination(['Melee', 'Defender'], pool)
      expect(withoutStarter.some((op) => op.rarity === 2)).toBe(false)

      const withStarter = filterOperatorsForCombination(['Starter'], pool)
      expect(withStarter.map((op) => op.name)).toEqual(['Noir Corne'])
    })
  })

  describe('calculateRecruitmentCombinations', () => {
    it('returns empty array when no tags are selected', () => {
      const result = calculateRecruitmentCombinations([], pool)
      expect(result).toEqual([])
    })

    it('correctly calculates guaranteed 4★ combinations', () => {
      // Fast-Redeploy alone guarantees 4★ Gravel
      const combos = calculateRecruitmentCombinations(['Fast-Redeploy'], pool)
      const fastRedeploy = combos.find((c) => c.tags.includes('Fast-Redeploy'))

      expect(fastRedeploy).toBeDefined()
      expect(fastRedeploy?.minRarity).toBe(4)
      expect(fastRedeploy?.hasGuaranteed4Star).toBe(true)
      expect(fastRedeploy?.hasGuaranteed5Star).toBe(false)
      expect(fastRedeploy?.hasGuaranteed6Star).toBe(false)
    })

    it('correctly calculates guaranteed 5★ combinations', () => {
      // Crowd Control matches only Texas (5★) in our pool
      const combos = calculateRecruitmentCombinations(['Crowd Control'], pool)
      const cc = combos.find((c) => c.tags.includes('Crowd Control'))

      expect(cc).toBeDefined()
      expect(cc?.minRarity).toBe(5)
      expect(cc?.hasGuaranteed5Star).toBe(true)
      expect(cc?.hasGuaranteed6Star).toBe(false)
    })

    it('correctly calculates guaranteed 6★ combinations', () => {
      const combos = calculateRecruitmentCombinations(['Top Operator', 'Guard'], pool)
      const topGuard = combos.find(
        (c) => c.tags.includes('Top Operator') && c.tags.includes('Guard')
      )

      expect(topGuard).toBeDefined()
      expect(topGuard?.minRarity).toBe(6)
      expect(topGuard?.hasGuaranteed6Star).toBe(true)
    })

    it('sorts higher guarantee tiers before lower tiers (6★ > 5★ > 4★ > Robot > 3★)', () => {
      const selected = ['Top Operator', 'Senior Operator', 'Fast-Redeploy', 'Guard', 'Robot']
      const combos = calculateRecruitmentCombinations(selected, pool)

      expect(combos.length).toBeGreaterThan(0)
      // Top combination should be guaranteed 6-star
      expect(combos[0]?.hasGuaranteed6Star).toBe(true)

      // Next should be guaranteed 5-star
      const fiveStarIndex = combos.findIndex((c) => c.hasGuaranteed5Star)
      expect(fiveStarIndex).toBeGreaterThan(0)

      // Four star should be after five star
      const fourStarIndex = combos.findIndex((c) => c.hasGuaranteed4Star)
      expect(fourStarIndex).toBeGreaterThan(fiveStarIndex)
    })
  })

  describe('filterCombinations', () => {
    it('filters combinations by guarantee status', () => {
      const all = calculateRecruitmentCombinations(
        ['Top Operator', 'Crowd Control', 'Fast-Redeploy', 'Guard'],
        pool
      )

      const only6 = filterCombinations(all, { guarantee: '6star' })
      expect(only6.every((c) => c.hasGuaranteed6Star)).toBe(true)

      const only5Plus = filterCombinations(all, { guarantee: '5plus' })
      expect(only5Plus.every((c) => c.minRarity >= 5)).toBe(true)

      const only4Plus = filterCombinations(all, { guarantee: '4plus' })
      expect(only4Plus.every((c) => c.minRarity >= 4)).toBe(true)
    })

    it('filters combinations by profession class', () => {
      const all = calculateRecruitmentCombinations(['Top Operator', 'Guard', 'Fast-Redeploy'], pool)
      const guardCombos = filterCombinations(all, { profession: 'Guard' })

      expect(guardCombos.length).toBeGreaterThan(0)
      expect(
        guardCombos.every((c) => c.operators.some((op) => op.profession === 'Guard'))
      ).toBe(true)
    })

    it('filters combinations by search query', () => {
      const all = calculateRecruitmentCombinations(['Top Operator', 'Guard', 'Fast-Redeploy'], pool)
      const searched = filterCombinations(all, { searchQuery: 'Gravel' })

      expect(searched.length).toBeGreaterThan(0)
      expect(
        searched.every((c) => c.operators.some((op) => op.name === 'Gravel'))
      ).toBe(true)
    })
  })
})
