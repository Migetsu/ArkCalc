import { describe, it, expect } from 'vitest'
import {
  calculateTimeRemaining,
  calculateGachaIncome,
  calculatePullsBreakdown,
  type GachaResources,
} from '~/utils/gachaCalculator'

describe('Gacha Pull Savings Formula', () => {
  describe('calculateTimeRemaining', () => {
    it('returns zero days when target date equals current date', () => {
      const now = new Date('2026-10-10T00:00:00Z')
      const target = new Date('2026-10-10T00:00:00Z')
      const result = calculateTimeRemaining(target, now)

      expect(result.days).toBe(0)
      expect(result.weeks).toBe(0)
    })

    it('calculates days and fractional weeks/months accurately', () => {
      const from = new Date('2026-10-10T00:00:00Z')
      const target = new Date('2026-10-24T00:00:00Z') // Exactly 14 days later
      const result = calculateTimeRemaining(target, from)

      expect(result.days).toBe(14)
      expect(result.weeks).toBe(2)
      expect(result.months).toBeCloseTo(14 / 30.4375, 2)
    })

    it('returns zero if target date is in the past', () => {
      const from = new Date('2026-10-10T00:00:00Z')
      const past = new Date('2026-10-01T00:00:00Z')
      const result = calculateTimeRemaining(past, from)

      expect(result.days).toBe(0)
    })
  })

  describe('calculateGachaIncome', () => {
    it('calculates standard F2P income for 30 days without Monthly Card', () => {
      const income = calculateGachaIncome(30, {
        hasMonthlyCard: false,
        doAnnihilation: true,
        buyGreenCertShop: true,
        freeEventPulls: 0,
      })

      // Daily: 30 * 100 = 3000
      expect(income.dailyMissions).toBe(3000)
      expect(income.monthlyCard).toBe(0)

      // Weekly: floor((30/7) * 500) = floor(4.2857 * 500) = 2142
      expect(income.weeklyMissions).toBe(2142)

      // Annihilation: floor((30/7) * 1800) = floor(4.2857 * 1800) = 7714
      expect(income.annihilation).toBe(7714)

      // Green cert shop: floor((30/30.4375) * 600) = floor(0.9856 * 600) = 591
      expect(income.greenCertOrundum).toBe(591)

      // Green cert permits: floor((30/30.4375) * 4) = 3
      expect(income.greenCertPermits).toBe(3)

      expect(income.totalFarmedOrundum).toBe(
        3000 + 0 + 2142 + 7714 + 591
      )
      expect(income.totalFarmedPermits).toBe(3)
    })

    it('adds +200 Orundum per day when Monthly Card is active', () => {
      const f2p = calculateGachaIncome(30, { hasMonthlyCard: false })
      const monthly = calculateGachaIncome(30, { hasMonthlyCard: true })

      expect(monthly.monthlyCard).toBe(30 * 200) // 6000
      expect(monthly.totalFarmedOrundum - f2p.totalFarmedOrundum).toBe(6000)
    })

    it('respects annihilation and green cert shop toggle options', () => {
      const income = calculateGachaIncome(14, {
        hasMonthlyCard: false,
        doAnnihilation: false,
        buyGreenCertShop: false,
      })

      expect(income.annihilation).toBe(0)
      expect(income.greenCertOrundum).toBe(0)
      expect(income.greenCertPermits).toBe(0)
    })

    it('includes free event pulls from celebration or collaboration events', () => {
      const income = calculateGachaIncome(14, {
        freeEventPulls: 24, // Standard 24 free limited pulls (10-roll + 14 daily)
      })

      expect(income.freeEventPulls).toBe(24)
    })
  })

  describe('calculatePullsBreakdown', () => {
    it('converts current inventory items into correct pull counts', () => {
      const resources: GachaResources = {
        orundum: 6000,          // 6000 / 600 = 10 pulls
        originitePrime: 10,     // 10 * 180 = 1800 / 600 = 3 pulls
        singlePermits: 4,       // 4 pulls
        tenPermits: 2,          // 20 pulls
      }

      const emptyIncome = calculateGachaIncome(0)
      const breakdown = calculatePullsBreakdown(resources, emptyIncome, {
        convertOP: true,
        targetSpark: 300,
      })

      expect(breakdown.pullsFromOrundum).toBe(10)
      expect(breakdown.pullsFromOP).toBe(3)
      expect(breakdown.pullsFromPermits).toBe(24)
      expect(breakdown.totalCurrentPulls).toBe(10 + 3 + 24) // 37 pulls
      expect(breakdown.grandTotalPulls).toBe(37)
      expect(breakdown.sparkDeficit).toBe(300 - 37) // 263
      expect(breakdown.sparkProgressPercent).toBe(Math.floor((37 / 300) * 100))
      expect(breakdown.isGuaranteed).toBe(false)
    })

    it('omits OP when convertOP option is false (saving for skins)', () => {
      const resources: GachaResources = {
        orundum: 6000,
        originitePrime: 100, // 30 pulls worth of OP
        singlePermits: 0,
        tenPermits: 0,
      }

      const breakdown = calculatePullsBreakdown(resources, calculateGachaIncome(0), {
        convertOP: false,
      })

      expect(breakdown.pullsFromOP).toBe(0)
      expect(breakdown.totalCurrentPulls).toBe(10)
    })

    it('identifies guaranteed spark when total pulls exceed or match spark threshold', () => {
      const resources: GachaResources = {
        orundum: 180000, // 300 pulls
        originitePrime: 0,
        singlePermits: 0,
        tenPermits: 0,
      }

      const breakdown = calculatePullsBreakdown(resources, calculateGachaIncome(0), {
        targetSpark: 300,
      })

      expect(breakdown.grandTotalPulls).toBe(300)
      expect(breakdown.sparkProgressPercent).toBe(100)
      expect(breakdown.sparkDeficit).toBe(0)
      expect(breakdown.isGuaranteed).toBe(true)
    })

    it('supports custom spark thresholds like 120 pulls for Collab banners', () => {
      const resources: GachaResources = {
        orundum: 60000, // 100 pulls
        originitePrime: 0,
        singlePermits: 10,
        tenPermits: 1, // 10 pulls -> total 120
      }

      const breakdown = calculatePullsBreakdown(resources, calculateGachaIncome(0), {
        targetSpark: 120,
      })

      expect(breakdown.grandTotalPulls).toBe(120)
      expect(breakdown.sparkProgressPercent).toBe(100)
      expect(breakdown.sparkDeficit).toBe(0)
      expect(breakdown.isGuaranteed).toBe(true)
    })
  })
})
