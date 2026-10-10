import { describe, it, expect } from 'vitest'
import fallbackEvents from '~/assets/data/events.json'
import { calculateMaterialDeltas } from '~/utils/materialCalculator'
import type { ArknightsEvent } from '~/types'

describe('Event Shop & Reward Intelligence', () => {
  it('validates offline fallback events data schema and rewards presence', () => {
    expect(fallbackEvents.length).toBeGreaterThan(0)
    for (const ev of fallbackEvents as ArknightsEvent[]) {
      expect(ev.id).toBeTruthy()
      expect(ev.name).toBeTruthy()
      expect(ev.wikiUrl).toMatch(/^https:\/\/arknights\.wiki\.gg/)
      expect(Array.isArray(ev.rewards)).toBe(true)
      expect(ev.rewards.length).toBeGreaterThan(0)
      for (const r of ev.rewards) {
        expect(r.itemId).toBeTruthy()
        expect(r.name).toBeTruthy()
        expect(r.count).toBeGreaterThan(0)
        expect(r.tier).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('correctly parses store multipliers (5K -> 5,000, 2 -> 2)', () => {
    function parseQuantityText(qtyStr: string): number {
      if (!qtyStr) return 1
      const clean = qtyStr.trim().toUpperCase()
      if (clean.endsWith('K')) {
        const num = parseFloat(clean.replace('K', ''))
        return Math.round(num * 1000)
      }
      if (clean.endsWith('M')) {
        const num = parseFloat(clean.replace('M', ''))
        return Math.round(num * 1000000)
      }
      const parsed = parseInt(clean.replace(/,/g, ''), 10)
      return Number.isNaN(parsed) ? 1 : parsed
    }

    expect(parseQuantityText('5K')).toBe(5000)
    expect(parseQuantityText('10k')).toBe(10000)
    expect(parseQuantityText('1.5M')).toBe(1500000)
    expect(parseQuantityText('2')).toBe(2)
    expect(parseQuantityText('100')).toBe(100)
    expect(parseQuantityText('')).toBe(1)
  })

  it('accurately discounts free event store items from player farming deficit', () => {
    const babelEvent = fallbackEvents.find((e) => e.id === 'babel_event')!
    expect(babelEvent).toBeDefined()

    // Doctor needs 8 D32 Steel (30115) and 15 Cyclicene Prefab (31074)
    const aggregated = {
      lmd: 0,
      exp: 0,
      materials: {
        '30115': 8,
        '31074': 15,
      },
    }

    // Player inventory: 1 D32, 2 Cyclicene
    const inventory = {
      '30115': 1,
      '31074': 2,
    }

    // Babel store rewards map: 5x D32 Steel, 10x Cyclicene Prefab
    const eventRewardsMap: Record<string, number> = {}
    for (const r of babelEvent.rewards) {
      eventRewardsMap[r.itemId] = (eventRewardsMap[r.itemId] || 0) + r.count
    }

    const catalog = [
      { id: '30115', name: 'D32 Steel', tier: 5, category: 'material' },
      { id: '31074', name: 'Cyclicene Prefab', tier: 4, category: 'material' },
    ]

    const deltas = calculateMaterialDeltas(aggregated, inventory, catalog, eventRewardsMap)

    const steel = deltas.find((d) => d.itemId === '30115')!
    // Need: 8. Owned: 1. Event: 5. Effective: 6. Delta: 2.
    expect(steel.required).toBe(8)
    expect(steel.owned).toBe(1)
    expect(steel.eventRewards).toBe(5)
    expect(steel.delta).toBe(2)
    expect(steel.isSufficient).toBe(false)

    const prefab = deltas.find((d) => d.itemId === '31074')!
    // Need: 15. Owned: 2. Event: 10. Effective: 12. Delta: 3.
    expect(prefab.required).toBe(15)
    expect(prefab.owned).toBe(2)
    expect(prefab.eventRewards).toBe(10)
    expect(prefab.delta).toBe(3)
    expect(prefab.isSufficient).toBe(false)
  })
})
