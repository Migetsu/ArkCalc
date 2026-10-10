import { describe, it, expect } from 'vitest'
import {
  aggregateMaterialRequirements,
  calculateMaterialDeltas,
  filterMaterialDeltas,
  type MaterialMetadata,
} from '~/utils/materialCalculator'
import type { TargetPlanItem, OperatorData } from '~/types'

describe('Material Delta Calculator', () => {
  const mockOperator: OperatorData = {
    id: 'char_4025_aprot',
    name: 'Młynar',
    rarity: 6,
    profession: 'Guard',
    avatar: 'https://example.com/mlynar.png',
    eliteCosts: {
      e1: {
        lmd: 30000,
        exp: 50000,
        materials: [
          { id: '30013', count: 5 }, // Guard Chip
          { id: '30073', count: 4 }, // Poly
        ],
      },
      e2: {
        lmd: 180000,
        exp: 200000,
        materials: [
          { id: '32004', count: 4 }, // Dualchip
          { id: '30115', count: 4 }, // D32 Steel
        ],
      },
    },
    skillMasteryCosts: {
      s3: [
        { m: 1, materials: [{ id: '30073', count: 3 }] },
        { m: 2, materials: [{ id: '30084', count: 2 }] },
        { m: 3, materials: [{ id: '30115', count: 6 }] },
      ],
    },
    moduleCosts: {
      stage1: {
        lmd: 40000,
        materials: [{ id: 'mod_block', count: 2 }],
      },
      stage2: {
        lmd: 60000,
        materials: [{ id: 'mod_block', count: 2 }],
      },
      stage3: {
        lmd: 80000,
        materials: [{ id: 'mod_block', count: 2 }],
      },
    },
  }

  const catalog: MaterialMetadata[] = [
    { id: '4001', name: 'Lungmen Dollars (LMD)', tier: 4, category: 'currency' },
    { id: '2004', name: 'Tactical Battle Record (EXP)', tier: 4, category: 'exp' },
    { id: '30013', name: 'Guard Chip', tier: 3, category: 'chip' },
    { id: '30073', name: 'Polyester Pack', tier: 3, category: 'material' },
    { id: '30084', name: 'Manganese Trioxide', tier: 4, category: 'material' },
    { id: '30115', name: 'D32 Steel', tier: 5, category: 'material' },
    { id: '32004', name: 'Guard Dualchip', tier: 5, category: 'chip' },
    { id: 'mod_block', name: 'Module Data Block', tier: 5, category: 'material' },
  ]

  describe('aggregateMaterialRequirements', () => {
    it('returns zeroes when targets list is empty', () => {
      const result = aggregateMaterialRequirements([])
      expect(result).toEqual({
        lmd: 0,
        exp: 0,
        materials: {},
      })
    })

    it('calculates E1 promotion costs correctly', () => {
      const target: TargetPlanItem = {
        operatorId: mockOperator.id,
        operator: mockOperator,
        currentElite: 0,
        targetElite: 1,
        currentLevel: 1,
        targetLevel: 1,
        currentMastery: 0,
        targetMastery: 0,
        currentModule: 0,
        targetModule: 0,
      }

      const result = aggregateMaterialRequirements([target])
      expect(result.lmd).toBe(30000)
      expect(result.exp).toBe(50000)
      expect(result.materials['30013']).toBe(5)
      expect(result.materials['30073']).toBe(4)
      expect(result.materials['30115']).toBeUndefined()
    })

    it('calculates full E0 -> E2, level 1 -> 90, M3, and Module Stage 3 costs', () => {
      const target: TargetPlanItem = {
        operatorId: mockOperator.id,
        operator: mockOperator,
        currentElite: 0,
        targetElite: 2,
        currentLevel: 1,
        targetLevel: 90,
        currentMastery: 0,
        targetMastery: 3,
        currentModule: 0,
        targetModule: 3,
      }

      const result = aggregateMaterialRequirements([target])

      // Elite LMD: 30000 (E1) + 180000 (E2) = 210000
      // Level LMD: (90 - 1) * 2500 = 89 * 2500 = 222500
      // Module LMD: 40000 + 60000 + 80000 = 180000
      // Total LMD = 210000 + 222500 + 180000 = 612500
      expect(result.lmd).toBe(612500)

      // Elite EXP: 50000 (E1) + 200000 (E2) = 250000
      // Level EXP: (90 - 1) * 4000 = 89 * 4000 = 356000
      // Total EXP = 250000 + 356000 = 606000
      expect(result.exp).toBe(606000)

      // Skill Mastery materials:
      // S3 M1: 3x 30073
      // S3 M2: 2x 30084
      // S3 M3: 6x 30115
      // Plus E1 (4x 30073), E2 (4x 30115)
      expect(result.materials['30073']).toBe(4 + 3) // 7
      expect(result.materials['30084']).toBe(2)
      expect(result.materials['30115']).toBe(4 + 6) // 10
      expect(result.materials['32004']).toBe(4)
      expect(result.materials['mod_block']).toBe(6) // 2 * 3 stages
    })

    it('does not re-add costs if operator has already achieved goals', () => {
      const target: TargetPlanItem = {
        operatorId: mockOperator.id,
        operator: mockOperator,
        currentElite: 2,
        targetElite: 2,
        currentLevel: 90,
        targetLevel: 90,
        currentMastery: 3,
        targetMastery: 3,
        currentModule: 3,
        targetModule: 3,
      }

      const result = aggregateMaterialRequirements([target])
      expect(result.lmd).toBe(0)
      expect(result.exp).toBe(0)
      expect(Object.keys(result.materials).length).toBe(0)
    })

    it('calculates mastery costs for a specific chosen skill (S1 vs S2)', () => {
      const multiSkillOp: OperatorData = {
        ...mockOperator,
        skills: [
          {
            skillId: 'sk_1',
            name: 'Skill One',
            masteries: [
              { m: 1, materials: [{ id: '30073', count: 2 }] },
              { m: 2, materials: [{ id: '30073', count: 4 }] },
              { m: 3, materials: [{ id: '30073', count: 6 }] },
            ],
          },
          {
            skillId: 'sk_2',
            name: 'Skill Two',
            masteries: [
              { m: 1, materials: [{ id: '30084', count: 3 }] },
              { m: 2, materials: [{ id: '30084', count: 5 }] },
              { m: 3, materials: [{ id: '30084', count: 7 }] },
            ],
          },
        ],
      }

      const s1Target: TargetPlanItem = {
        operatorId: multiSkillOp.id,
        operator: multiSkillOp,
        currentElite: 2,
        targetElite: 2,
        currentLevel: 90,
        targetLevel: 90,
        selectedSkillIndex: 0,
        currentMastery: 0,
        targetMastery: 3,
        currentModule: 0,
        targetModule: 0,
      }

      const s1Res = aggregateMaterialRequirements([s1Target])
      expect(s1Res.materials['30073']).toBe(12) // 2 + 4 + 6
      expect(s1Res.materials['30084']).toBeUndefined()

      const s2Target: TargetPlanItem = {
        operatorId: multiSkillOp.id,
        operator: multiSkillOp,
        currentElite: 2,
        targetElite: 2,
        currentLevel: 90,
        targetLevel: 90,
        selectedSkillIndex: 1,
        currentMastery: 0,
        targetMastery: 2,
        currentModule: 0,
        targetModule: 0,
      }

      const s2Res = aggregateMaterialRequirements([s2Target])
      expect(s2Res.materials['30084']).toBe(8) // 3 + 5
      expect(s2Res.materials['30073']).toBeUndefined()
    })

    it('calculates costs for a specific module and respects selectedModuleId: none', () => {
      const multiModOp: OperatorData = {
        ...mockOperator,
        modules: [
          {
            moduleId: 'mod_x',
            name: 'Module X',
            typeCode: 'X',
            typeName: 'MOD-X',
            stages: [
              { stage: 1, lmd: 40000, materials: [{ id: 'mod_block', count: 2 }] },
              { stage: 2, lmd: 60000, materials: [{ id: 'mod_block', count: 2 }] },
              { stage: 3, lmd: 80000, materials: [{ id: 'mod_block', count: 2 }] },
            ],
          },
          {
            moduleId: 'mod_y',
            name: 'Module Y',
            typeCode: 'Y',
            typeName: 'MOD-Y',
            stages: [
              { stage: 1, lmd: 50000, materials: [{ id: '30115', count: 4 }] },
              { stage: 2, lmd: 70000, materials: [{ id: '30115', count: 4 }] },
              { stage: 3, lmd: 90000, materials: [{ id: '30115', count: 4 }] },
            ],
          },
        ],
      }

      const modYTarget: TargetPlanItem = {
        operatorId: multiModOp.id,
        operator: multiModOp,
        currentElite: 2,
        targetElite: 2,
        currentLevel: 90,
        targetLevel: 90,
        currentMastery: 0,
        targetMastery: 0,
        selectedModuleId: 'mod_y',
        currentModule: 1,
        targetModule: 3,
      }

      const modYRes = aggregateMaterialRequirements([modYTarget])
      expect(modYRes.lmd).toBe(70000 + 90000) // stage 2 & 3
      expect(modYRes.materials['30115']).toBe(8) // stage 2 & 3
      expect(modYRes.materials['mod_block']).toBeUndefined()

      const noneTarget: TargetPlanItem = {
        ...modYTarget,
        selectedModuleId: 'none',
      }
      const noneRes = aggregateMaterialRequirements([noneTarget])
      expect(noneRes.lmd).toBe(0)
      expect(Object.keys(noneRes.materials).length).toBe(0)
    })
  })

  describe('calculateMaterialDeltas', () => {
    it('accurately computes deficits and readiness against depot inventory', () => {
      const aggregated = {
        lmd: 500000,
        exp: 300000,
        materials: {
          '30115': 10, // D32 Steel
          '30073': 5,  // Polyester Pack
        },
      }

      // User owns sufficient LMD and Poly, but lacks EXP and D32 Steel
      const inventory = {
        '4001': 1000000, // LMD (has 1M, needs 500k)
        '2004': 100000,  // EXP (has 100k, needs 300k -> deficit 200k)
        '30115': 2,      // D32 Steel (has 2, needs 10 -> deficit 8)
        '30073': 8,      // Poly (has 8, needs 5 -> deficit 0)
      }

      const deltas = calculateMaterialDeltas(aggregated, inventory, catalog)

      const expDelta = deltas.find((d) => d.itemId === '2004')
      expect(expDelta).toBeDefined()
      expect(expDelta?.required).toBe(300000)
      expect(expDelta?.owned).toBe(100000)
      expect(expDelta?.delta).toBe(200000)
      expect(expDelta?.isSufficient).toBe(false)

      const lmdDelta = deltas.find((d) => d.itemId === '4001')
      expect(lmdDelta).toBeDefined()
      expect(lmdDelta?.delta).toBe(0)
      expect(lmdDelta?.isSufficient).toBe(true)

      const steelDelta = deltas.find((d) => d.itemId === '30115')
      expect(steelDelta?.delta).toBe(8)
      expect(steelDelta?.isSufficient).toBe(false)

      const polyDelta = deltas.find((d) => d.itemId === '30073')
      expect(polyDelta?.delta).toBe(0)
      expect(polyDelta?.isSufficient).toBe(true)
    })

    it('places deficit items before sufficient items in the sorted result', () => {
      const aggregated = {
        lmd: 1000,
        exp: 1000,
        materials: {
          '30115': 5,
        },
      }
      const inventory = {
        '4001': 2000, // sufficient
        '2004': 500,  // deficit
        '30115': 0,   // deficit
      }

      const deltas = calculateMaterialDeltas(aggregated, inventory, catalog)
      const deficitCount = deltas.filter((d) => d.delta > 0).length
      expect(deficitCount).toBe(2)

      // Top elements must have delta > 0
      expect(deltas[0]?.delta).toBeGreaterThan(0)
      expect(deltas[1]?.delta).toBeGreaterThan(0)
      expect(deltas[2]?.delta).toBe(0)
    })

    it('deducts guaranteed event rewards from material, LMD, and EXP deficits', () => {
      const aggregated = {
        lmd: 500000,
        exp: 200000,
        materials: {
          '30115': 10, // D32 Steel
          '30084': 10, // Manganese
        },
      }

      // User owns 2 D32 and 0 Manganese, 100k LMD, 50k EXP
      const inventory = {
        '4001': 100000,
        '2004': 50000,
        '30115': 2,
        '30084': 0,
      }

      // Event gives 5 D32 Steel, 10 Manganese, 400k LMD, 150k EXP
      const eventRewards = {
        '4001': 400000,
        '2004': 150000,
        '30115': 5,
        '30084': 10,
      }

      const deltas = calculateMaterialDeltas(aggregated, inventory, catalog, eventRewards)

      // D32: Need 10, Owned 2, Event 5 -> Effective 7 -> Deficit 3
      const steelDelta = deltas.find((d) => d.itemId === '30115')
      expect(steelDelta?.required).toBe(10)
      expect(steelDelta?.owned).toBe(2)
      expect(steelDelta?.eventRewards).toBe(5)
      expect(steelDelta?.delta).toBe(3)
      expect(steelDelta?.isSufficient).toBe(false)

      // Manganese: Need 10, Owned 0, Event 10 -> Effective 10 -> Deficit 0
      const mangDelta = deltas.find((d) => d.itemId === '30084')
      expect(mangDelta?.required).toBe(10)
      expect(mangDelta?.owned).toBe(0)
      expect(mangDelta?.eventRewards).toBe(10)
      expect(mangDelta?.delta).toBe(0)
      expect(mangDelta?.isSufficient).toBe(true)

      // LMD: Need 500k, Owned 100k, Event 400k -> Effective 500k -> Deficit 0
      const lmdDelta = deltas.find((d) => d.itemId === '4001')
      expect(lmdDelta?.eventRewards).toBe(400000)
      expect(lmdDelta?.delta).toBe(0)
      expect(lmdDelta?.isSufficient).toBe(true)

      // EXP: Need 200k, Owned 50k, Event 150k -> Effective 200k -> Deficit 0
      const expDelta = deltas.find((d) => d.itemId === '2004')
      expect(expDelta?.eventRewards).toBe(150000)
      expect(expDelta?.delta).toBe(0)
      expect(expDelta?.isSufficient).toBe(true)
    })
  })

  describe('filterMaterialDeltas', () => {
    const sampleDeltas = [
      {
        itemId: '30115',
        name: 'D32 Steel',
        tier: 5,
        category: 'material',
        required: 10,
        owned: 2,
        delta: 8,
        isSufficient: false,
      },
      {
        itemId: '30084',
        name: 'Manganese Trioxide',
        tier: 4,
        category: 'material',
        required: 2,
        owned: 4,
        delta: 0,
        isSufficient: true,
      },
      {
        itemId: '30013',
        name: 'Guard Chip',
        tier: 3,
        category: 'chip',
        required: 5,
        owned: 0,
        delta: 5,
        isSufficient: false,
      },
    ]

    it('filters by deficit only', () => {
      const filtered = filterMaterialDeltas(sampleDeltas, 'deficit')
      expect(filtered.length).toBe(2)
      expect(filtered.every((d) => d.delta > 0)).toBe(true)
    })

    it('filters by chips category', () => {
      const filtered = filterMaterialDeltas(sampleDeltas, 'chips')
      expect(filtered.length).toBe(1)
      expect(filtered[0]?.itemId).toBe('30013')
    })

    it('filters by tier', () => {
      const tier5 = filterMaterialDeltas(sampleDeltas, 'tier5')
      expect(tier5.length).toBe(1)
      expect(tier5[0]?.itemId).toBe('30115')

      const tier4 = filterMaterialDeltas(sampleDeltas, 'tier4')
      expect(tier4.length).toBe(1)
      expect(tier4[0]?.itemId).toBe('30084')
    })
  })
})
