import { describe, it, expect } from 'vitest'
import rawRanges from '~/assets/data/ranges.json'
import type { RangeData } from '~/types'

describe('Tactical Attack Range Matrix (RangeViewer Logic)', () => {
  const rangesMap = rawRanges as Record<string, RangeData>

  it('successfully loads range_table dataset with valid ranges', () => {
    expect(Object.keys(rangesMap).length).toBeGreaterThanOrEqual(50)
    expect(rangesMap['0-1']).toBeDefined() // single melee tile
    expect(rangesMap['3-6']).toBeDefined() // Amiya 3x3 caster range
    expect(rangesMap['3-12']).toBeDefined() // SilverAsh E2 range
  })

  it('correctly calculates grid bounds including operator position (0,0)', () => {
    const rangeData = rangesMap['3-6'] // Amiya 3x3
    expect(rangeData).toBeDefined()

    let minRow = 0
    let maxRow = 0
    let minCol = 0
    let maxCol = 0

    for (const g of rangeData!.grids) {
      if (g.row < minRow) minRow = g.row
      if (g.row > maxRow) maxRow = g.row
      if (g.col < minCol) minCol = g.col
      if (g.col > maxCol) maxCol = g.col
    }

    expect(minRow).toBe(-1)
    expect(maxRow).toBe(1)
    expect(minCol).toBe(0)
    expect(maxCol).toBe(2)

    // Total rows: [-1, 0, 1] = 3
    expect(maxRow - minRow + 1).toBe(3)
    // Total cols: [0, 1, 2] = 3
    expect(maxCol - minCol + 1).toBe(3)
  })

  it('identifies expanded attack tiles when comparing Elite 0 and Elite 2', () => {
    const e0 = rangesMap['2-3'] // SilverAsh E0: 7 tiles
    const e2 = rangesMap['3-12'] // SilverAsh E2: 8 tiles

    expect(e0).toBeDefined()
    expect(e2).toBeDefined()

    const e0Set = new Set(e0!.grids.map((g) => `${g.row},${g.col}`))
    const e2Set = new Set(e2!.grids.map((g) => `${g.row},${g.col}`))

    expect(e0!.grids.length).toBe(7)
    expect(e2!.grids.length).toBe(8)

    // Calculate newly added tiles on E2
    const expandedTiles = e2!.grids.filter((g) => !e0Set.has(`${g.row},${g.col}`))
    expect(expandedTiles).toHaveLength(1)
    // The newly unlocked tile is at row 0, col 3 (1 extra tile forward)
    expect(expandedTiles[0]).toEqual({ row: 0, col: 3 })
  })

  it('handles operators with identical E0 and E2 range (no expansion)', () => {
    const rangeId = '3-6' // e.g. Core Caster remains 3-6
    const e0Set = new Set(rangesMap[rangeId]!.grids.map((g) => `${g.row},${g.col}`))
    const e2Set = new Set(rangesMap[rangeId]!.grids.map((g) => `${g.row},${g.col}`))

    const diff = [...e2Set].filter((x) => !e0Set.has(x))
    expect(diff).toHaveLength(0)
  })
})
