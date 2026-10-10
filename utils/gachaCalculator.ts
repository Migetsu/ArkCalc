export interface GachaResources {
  orundum: number
  originitePrime: number
  singlePermits: number
  tenPermits: number
}

export interface GachaIncomePreferences {
  hasMonthlyCard?: boolean
  doAnnihilation?: boolean
  buyGreenCertShop?: boolean
  freeEventPulls?: number
}

export interface GachaIncomeResult {
  daysRemaining: number
  weeksRemaining: number
  monthsRemaining: number
  dailyMissions: number
  monthlyCard: number
  weeklyMissions: number
  annihilation: number
  greenCertOrundum: number
  greenCertPermits: number
  freeEventPulls: number
  totalFarmedOrundum: number
  totalFarmedPermits: number
}

export interface PullsBreakdown {
  pullsFromOrundum: number
  pullsFromOP: number
  pullsFromPermits: number
  totalCurrentPulls: number
  projectedPullsFromOrundum: number
  projectedPullsFromPermits: number
  freeEventPulls: number
  totalProjectedPulls: number
  grandTotalPulls: number
  targetSpark: number
  sparkProgressPercent: number
  sparkDeficit: number
  isGuaranteed: boolean
}

/**
 * Calculates days, fractional weeks, and fractional months between two dates.
 */
export function calculateTimeRemaining(
  targetDateInput: string | Date,
  fromDateInput: string | Date = new Date()
): { days: number; weeks: number; months: number } {
  const from = new Date(fromDateInput)
  from.setHours(0, 0, 0, 0)
  const target = new Date(targetDateInput)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - from.getTime()
  const days = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  const weeks = days / 7
  const months = days / 30.4375

  return { days, weeks, months }
}

/**
 * Calculates projected gacha currency income across days.
 */
export function calculateGachaIncome(
  daysRemaining: number,
  prefs: GachaIncomePreferences = {}
): GachaIncomeResult {
  const days = Math.max(0, daysRemaining)
  const weeks = days / 7
  const months = days / 30.4375

  const dailyMissions = days * 100
  const monthlyCard = prefs.hasMonthlyCard ? days * 200 : 0
  const weeklyMissions = Math.floor(weeks * 500)
  const annihilation = prefs.doAnnihilation !== false ? Math.floor(weeks * 1800) : 0
  const greenCertOrundum = prefs.buyGreenCertShop !== false ? Math.floor(months * 600) : 0
  const greenCertPermits = prefs.buyGreenCertShop !== false ? Math.floor(months * 4) : 0
  const freeEventPulls = prefs.freeEventPulls || 0

  const totalFarmedOrundum =
    dailyMissions + monthlyCard + weeklyMissions + annihilation + greenCertOrundum

  return {
    daysRemaining: days,
    weeksRemaining: weeks,
    monthsRemaining: months,
    dailyMissions,
    monthlyCard,
    weeklyMissions,
    annihilation,
    greenCertOrundum,
    greenCertPermits,
    freeEventPulls,
    totalFarmedOrundum,
    totalFarmedPermits: greenCertPermits,
  }
}

/**
 * Converts resources and projected income into pull counts and spark statistics.
 */
export function calculatePullsBreakdown(
  resources: GachaResources,
  income: GachaIncomeResult,
  options: { convertOP?: boolean; targetSpark?: number } = {}
): PullsBreakdown {
  const convertOP = options.convertOP !== false
  const targetSpark = options.targetSpark ?? 300

  // 1. Current available pulls
  const pullsFromOrundum = Math.floor(Math.max(0, resources.orundum) / 600)
  const pullsFromOP = convertOP
    ? Math.floor((Math.max(0, resources.originitePrime) * 180) / 600)
    : 0
  const pullsFromPermits =
    Math.max(0, resources.singlePermits) + Math.max(0, resources.tenPermits) * 10
  const totalCurrentPulls = pullsFromOrundum + pullsFromOP + pullsFromPermits

  // 2. Projected incoming pulls
  const projectedPullsFromOrundum = Math.floor(income.totalFarmedOrundum / 600)
  const projectedPullsFromPermits = income.totalFarmedPermits
  const freeEventPulls = income.freeEventPulls
  const totalProjectedPulls =
    projectedPullsFromOrundum + projectedPullsFromPermits + freeEventPulls

  // 3. Grand totals
  const grandTotalPulls = totalCurrentPulls + totalProjectedPulls
  const sparkProgressPercent =
    targetSpark <= 0 ? 100 : Math.min(100, Math.floor((grandTotalPulls / targetSpark) * 100))
  const sparkDeficit = Math.max(0, targetSpark - grandTotalPulls)
  const isGuaranteed = grandTotalPulls >= targetSpark

  return {
    pullsFromOrundum,
    pullsFromOP,
    pullsFromPermits,
    totalCurrentPulls,
    projectedPullsFromOrundum,
    projectedPullsFromPermits,
    freeEventPulls,
    totalProjectedPulls,
    grandTotalPulls,
    targetSpark,
    sparkProgressPercent,
    sparkDeficit,
    isGuaranteed,
  }
}
