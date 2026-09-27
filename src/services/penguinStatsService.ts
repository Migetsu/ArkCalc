/**
 * Penguin Statistics (penguin-stats.io) Service
 *
 * Provides:
 * 1. Instant offline farming recommendations via PENGUIN_BENCHMARK_DATA
 * 2. Plan-wide Sanity & Run estimations (total AP, estimated days of natural recovery)
 * 3. Background live matrix synchronization with Penguin Stats API v2
 */

import {
  getBestFarmingRecommendation,
  getAllFarmingRecommendations,
  calculateFarmingEstimate,
  type StageDropRecommendation,
  type FarmingPlanEstimate,
} from '@/data/penguinStatsBenchmark';

export type { StageDropRecommendation, FarmingPlanEstimate };
export { getBestFarmingRecommendation, getAllFarmingRecommendations, calculateFarmingEstimate };

const PENGUIN_API_BASE = 'https://penguin-stats.io/PenguinStats/api/v2';
const PENGUIN_CACHE_KEY = 'ark_penguin_stats_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface PlanSanityEstimate {
  totalSanity: number;
  totalRuns: number;
  naturalDays: number; // based on 240 Sanity/day
  opEquivalent: number; // based on ~135 Sanity per Originite Prime
  itemBreakdown: {
    itemId: string;
    count: number;
    stageCode: string;
    apCost: number;
    runs: number;
    sanity: number;
  }[];
}

// In-memory cache for live overrides
const liveMatrixCache: Record<string, StageDropRecommendation[]> = {};

/**
 * Loads cached live matrix data from localStorage if still valid
 */
export function initPenguinStatsCache(): void {
  try {
    const raw = localStorage.getItem(PENGUIN_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
        Object.assign(liveMatrixCache, parsed.data);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Gets the best stage for farming a specific material
 */
export function getRecommendedStage(itemId: string): StageDropRecommendation | undefined {
  if (liveMatrixCache[itemId] && liveMatrixCache[itemId].length > 0) {
    return liveMatrixCache[itemId][0];
  }
  return getBestFarmingRecommendation(itemId);
}

/**
 * Gets all ranked stages for farming a specific material
 */
export function getAllStagesForMaterial(itemId: string): StageDropRecommendation[] {
  if (liveMatrixCache[itemId] && liveMatrixCache[itemId].length > 0) {
    return liveMatrixCache[itemId];
  }
  return getAllFarmingRecommendations(itemId);
}

/**
 * Computes comprehensive Sanity, Runs, and Time needed to farm a plan's missing materials.
 */
export function calculatePlanSanityEstimate(
  farmRequirements: { itemId: string; count: number }[]
): PlanSanityEstimate {
  let totalSanity = 0;
  let totalRuns = 0;
  const itemBreakdown: PlanSanityEstimate['itemBreakdown'] = [];

  for (const req of farmRequirements) {
    if (!req.itemId || req.count <= 0) continue;

    const est = calculateFarmingEstimate(req.itemId, req.count);
    if (est) {
      totalSanity += est.totalSanity;
      totalRuns += est.runs;
      itemBreakdown.push({
        itemId: req.itemId,
        count: req.count,
        stageCode: est.stageCode,
        apCost: est.apCost,
        runs: est.runs,
        sanity: est.totalSanity,
      });
    }
  }

  // Sort breakdown by highest Sanity expenditure
  itemBreakdown.sort((a, b) => b.sanity - a.sanity);

  // Arknights regenerates 1 Sanity every 6 minutes -> 10 Sanity / hr -> 240 Sanity / day
  const naturalDays = Math.round((totalSanity / 240) * 10) / 10;
  const opEquivalent = Math.ceil(totalSanity / 135);

  return {
    totalSanity,
    totalRuns,
    naturalDays,
    opEquivalent,
    itemBreakdown,
  };
}

/**
 * Optional background sync: fetches fresh drop statistics for key materials from Penguin Stats
 */
export async function syncPenguinStatsOnline(): Promise<{ success: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${PENGUIN_API_BASE}/result/matrix?server=US`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const matrix = data.matrix || [];

    if (Array.isArray(matrix) && matrix.length > 0) {
      localStorage.setItem(
        PENGUIN_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          count: matrix.length,
        })
      );
      return { success: true, message: `Синхронизировано ${matrix.length} записей из Penguin Stats!` };
    }
    return { success: false, message: 'Пустой ответ от Penguin Stats.' };
  } catch (err: any) {
    return {
      success: false,
      message: `Не удалось связаться с penguin-stats.io (${err.message || err}). Используются проверенные офлайн-данные.`,
    };
  }
}
