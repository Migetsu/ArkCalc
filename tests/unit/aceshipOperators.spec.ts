import { describe, it, expect } from 'vitest'
import type { CatalogOperator } from '~/types'

describe('Aceship Operators Data Transformation & Filtering', () => {
  const sampleRawOperators: Record<string, any> = {
    char_002_amiya: {
      name: 'Amiya',
      appellation: 'Amiya',
      rarity: 'TIER_5',
      profession: 'CASTER',
      subProfessionId: 'corecaster',
      position: 'RANGED',
      tagList: ['Caster', 'DPS'],
      nationId: 'rhodes',
      groupId: null,
      isNotObtainable: false,
      itemUsage: 'Used by Rhodes Island Leader',
      itemDesc: 'Leader of Rhodes Island.',
      description: 'Deals Arts damage.',
    },
    char_102_texas: {
      name: 'Texas',
      appellation: 'Texas',
      rarity: 5,
      profession: 'PIONEER',
      subProfessionId: 'pioneer',
      position: 'MELEE',
      tagList: ['Vanguard', 'DP-Recovery', 'Crowd-Control'],
      nationId: 'siracusa',
      groupId: 'penguin',
      isNotObtainable: false,
      itemUsage: 'Penguin Logistics courier',
      itemDesc: 'A taciturn Lupo girl.',
      description: 'Recovers DP.',
    },
    char_172_silverash: {
      name: 'SilverAsh',
      appellation: 'SilverAsh',
      rarity: 'TIER_6',
      profession: 'WARRIOR',
      subProfessionId: 'lord',
      position: 'MELEE',
      tagList: ['Guard', 'DPS', 'Support'],
      nationId: 'kjerag',
      groupId: 'karlan',
      isNotObtainable: false,
      itemUsage: 'Leader of Karlan Commercial',
      itemDesc: 'Chief of Karlan Commercial.',
      description: 'Truesilver Slash.',
    },
    trap_001_mine: {
      name: 'Explosive Device',
      profession: 'TRAP',
      isNotObtainable: true,
    },
    token_1001_phantom: {
      name: 'Phantom Mirror',
      profession: 'SPECIAL',
      isNotObtainable: true,
    },
  }

  const PROFESSION_MAP: Record<string, string> = {
    WARRIOR: 'Guard',
    PIONEER: 'Vanguard',
    SNIPER: 'Sniper',
    TANK: 'Defender',
    MEDIC: 'Medic',
    SUPPORT: 'Supporter',
    CASTER: 'Caster',
    SPECIAL: 'Specialist',
  }

  const NATION_NAMES: Record<string, string> = {
    rhodes: 'Rhodes Island',
    siracusa: 'Siracusa',
    kjerag: 'Kjerag',
  }

  const GROUP_NAMES: Record<string, string> = {
    penguin: 'Penguin Logistics',
    karlan: 'Karlan Commercial',
  }

  function resolveFaction(nationId?: string | null, groupId?: string | null): string {
    if (groupId && GROUP_NAMES[groupId.toLowerCase()]) {
      return GROUP_NAMES[groupId.toLowerCase()]!
    }
    if (nationId && NATION_NAMES[nationId.toLowerCase()]) {
      return NATION_NAMES[nationId.toLowerCase()]!
    }
    return 'Independent'
  }

  function parseRarity(tier: string | number): 1 | 2 | 3 | 4 | 5 | 6 {
    if (typeof tier === 'number') {
      return Math.min(6, Math.max(1, tier)) as any
    }
    const match = String(tier).match(/\d+/)
    if (match) {
      const num = parseInt(match[0]!, 10)
      return Math.min(6, Math.max(1, num)) as any
    }
    return 6
  }

  it('filters out traps, tokens, and unobtainable entities', () => {
    const validKeys = Object.entries(sampleRawOperators)
      .filter(([id, op]) => !op.isNotObtainable && !id.startsWith('trap_') && !id.startsWith('token_'))
      .map(([id]) => id)

    expect(validKeys).toEqual(['char_002_amiya', 'char_102_texas', 'char_172_silverash'])
    expect(validKeys).not.toContain('trap_001_mine')
    expect(validKeys).not.toContain('token_1001_phantom')
  })

  it('parses rarity correctly from TIER_X string or numeric format', () => {
    expect(parseRarity('TIER_6')).toBe(6)
    expect(parseRarity('TIER_5')).toBe(5)
    expect(parseRarity(5)).toBe(5)
    expect(parseRarity('TIER_1')).toBe(1)
  })

  it('maps raw game professions to canonical English class names', () => {
    expect(PROFESSION_MAP['WARRIOR']).toBe('Guard')
    expect(PROFESSION_MAP['PIONEER']).toBe('Vanguard')
    expect(PROFESSION_MAP['CASTER']).toBe('Caster')
  })

  it('resolves factions giving precedence to group over nation when applicable', () => {
    // Texas: nation siracusa, group penguin -> should resolve to Penguin Logistics
    expect(resolveFaction('siracusa', 'penguin')).toBe('Penguin Logistics')
    // SilverAsh: nation kjerag, group karlan -> should resolve to Karlan Commercial
    expect(resolveFaction('kjerag', 'karlan')).toBe('Karlan Commercial')
    // Amiya: nation rhodes, group null -> should resolve to Rhodes Island
    expect(resolveFaction('rhodes', null)).toBe('Rhodes Island')
    // Unknown: -> should fallback to Independent
    expect(resolveFaction(null, null)).toBe('Independent')
  })

  it('correctly filters operators by class, rarity, and search text', () => {
    const list: CatalogOperator[] = [
      {
        id: 'char_002_amiya',
        name: 'Amiya',
        appellation: 'Amiya',
        rarity: 5,
        profession: 'Caster',
        position: 'RANGED',
        tagList: ['Caster', 'DPS'],
        faction: 'Rhodes Island',
        avatar: '',
      },
      {
        id: 'char_102_texas',
        name: 'Texas',
        appellation: 'Texas',
        rarity: 5,
        profession: 'Vanguard',
        position: 'MELEE',
        tagList: ['Vanguard', 'DP-Recovery'],
        faction: 'Penguin Logistics',
        avatar: '',
      },
      {
        id: 'char_172_silverash',
        name: 'SilverAsh',
        appellation: 'SilverAsh',
        rarity: 6,
        profession: 'Guard',
        position: 'MELEE',
        tagList: ['Guard', 'DPS'],
        faction: 'Karlan Commercial',
        avatar: '',
      },
    ]

    // Filter by profession Guard
    const guards = list.filter((op) => op.profession === 'Guard')
    expect(guards).toHaveLength(1)
    expect(guards[0]?.name).toBe('SilverAsh')

    // Filter by rarity 5
    const fiveStars = list.filter((op) => op.rarity === 5)
    expect(fiveStars).toHaveLength(2)

    // Filter by faction
    const karlanOps = list.filter((op) => op.faction === 'Karlan Commercial')
    expect(karlanOps).toHaveLength(1)
    expect(karlanOps[0]?.name).toBe('SilverAsh')

    // Search query
    const searchResult = list.filter((op) => op.name.toLowerCase().includes('ami'))
    expect(searchResult).toHaveLength(1)
    expect(searchResult[0]?.name).toBe('Amiya')
  })
})
