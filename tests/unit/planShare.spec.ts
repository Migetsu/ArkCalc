import { describe, it, expect } from 'vitest'
import {
  encodeBase64Url,
  decodeBase64Url,
  serializeToCompact,
  deserializeFromCompact,
  encodePlanToQueryString,
  decodePlanFromQueryString,
  exportPlanToJsonString,
  parseImportedPlanJson,
} from '~/utils/planShare'
import type { TargetPlanItem, OperatorData } from '~/types'

describe('Plan Sharing & Serialization Utilities', () => {
  const mockOperator: OperatorData = {
    id: 'char_4025_aprot',
    name: 'Młynar',
    rarity: 6,
    profession: 'Guard',
    avatar: 'https://example.com/mlynar.png',
    eliteCosts: {},
  }

  const sampleTargets: TargetPlanItem[] = [
    {
      operatorId: 'char_4025_aprot',
      operator: mockOperator,
      currentElite: 1,
      targetElite: 2,
      currentLevel: 40,
      targetLevel: 90,
      selectedSkillIndex: 2,
      currentMastery: 0,
      targetMastery: 3,
      selectedModuleId: 'uniequip_002_aprot',
      currentModule: 0,
      targetModule: 3,
    },
  ]

  it('correctly encodes and decodes Unicode strings with Base64URL', () => {
    const original = 'Доктор // PRTS Rhodes Island 12345!'
    const encoded = encodeBase64Url(original)
    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
    expect(encoded).not.toContain('=')

    const decoded = decodeBase64Url(encoded)
    expect(decoded).toBe(original)
  })

  it('serializes TargetPlanItem to compact format and deserializes back', () => {
    const compact = serializeToCompact(sampleTargets)
    expect(compact).toHaveLength(1)
    expect(compact[0]?.id).toBe('char_4025_aprot')
    expect(compact[0]?.ce).toBe(1)
    expect(compact[0]?.te).toBe(2)
    expect(compact[0]?.tl).toBe(90)
    expect(compact[0]?.tm).toBe(3)

    const rehydrated = deserializeFromCompact(compact, [mockOperator])
    expect(rehydrated).toHaveLength(1)
    expect(rehydrated[0]?.operatorId).toBe('char_4025_aprot')
    expect(rehydrated[0]?.operator.name).toBe('Młynar')
    expect(rehydrated[0]?.targetLevel).toBe(90)
    expect(rehydrated[0]?.targetMastery).toBe(3)
  })

  it('encodes plan to URL query parameter and decodes it without data loss', () => {
    const queryParam = encodePlanToQueryString(sampleTargets)
    expect(typeof queryParam).toBe('string')
    expect(queryParam.length).toBeGreaterThan(10)

    const restored = decodePlanFromQueryString(queryParam, [mockOperator])
    expect(restored).toHaveLength(1)
    expect(restored[0]?.operatorId).toBe('char_4025_aprot')
    expect(restored[0]?.targetMastery).toBe(3)
    expect(restored[0]?.selectedModuleId).toBe('uniequip_002_aprot')
  })

  it('exports structured JSON and re-imports it correctly', () => {
    const jsonStr = exportPlanToJsonString(sampleTargets, 'Doctor Alpha Plan')
    expect(jsonStr).toContain('"app": "ArkCalc"')
    expect(jsonStr).toContain('Doctor Alpha Plan')
    expect(jsonStr).toContain('char_4025_aprot')

    const parsed = parseImportedPlanJson(jsonStr, [mockOperator])
    expect(parsed).toHaveLength(1)
    expect(parsed[0]?.operatorId).toBe('char_4025_aprot')
    expect(parsed[0]?.targetLevel).toBe(90)
  })

  it('safely handles corrupted query strings by returning empty array', () => {
    const invalid = '!!!not-a-valid-base64-json???'
    const result = decodePlanFromQueryString(invalid, [mockOperator])
    expect(result).toEqual([])
  })
})
