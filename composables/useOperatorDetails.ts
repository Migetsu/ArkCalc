import { ref, computed } from 'vue'
import type { OperatorDetailedData, OperatorAttributes } from '~/types'
import { getCacheItem, setCacheItem } from '~/utils/indexedDb'

const CACHE_PREFIX = 'aceship_detail_'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useOperatorDetails() {
  const operator = ref<OperatorDetailedData | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchOperator = async (id: string, force = false): Promise<OperatorDetailedData | null> => {
    if (!id) return null

    isLoading.value = true
    error.value = null

    try {
      const cacheKey = `${CACHE_PREFIX}${id}`

      // 1. Check client-side IndexedDB
      if (!force) {
        const cached = await getCacheItem<OperatorDetailedData>('operator_store', cacheKey)
        if (cached && cached.id) {
          operator.value = cached
          isLoading.value = false
          return cached
        }
      }

      // 2. Fetch from server endpoint
      const data = await $fetch<OperatorDetailedData>(`/api/aceship/operator/${id}`)
      if (data) {
        operator.value = data
        // 3. Save to IndexedDB
        await setCacheItem('operator_store', cacheKey, data, CACHE_TTL_MS)
      }

      return operator.value
    } catch (err: any) {
      console.warn('[useOperatorDetails] Fetch failed:', err)
      error.value = err.message || 'Failed to load operator details'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Linear interpolation for stats between level 1 and maxLevel
   */
  const interpolateStat = (
    minVal: number,
    maxVal: number,
    currentLevel: number,
    maxLevel: number
  ): number => {
    if (maxLevel <= 1 || currentLevel <= 1) return minVal
    if (currentLevel >= maxLevel) return maxVal
    return Math.round(minVal + ((maxVal - minVal) * (currentLevel - 1)) / (maxLevel - 1))
  }

  const getAttributesAt = (
    phaseIdx: number,
    level: number
  ): OperatorAttributes | null => {
    if (!operator.value || !operator.value.phases[phaseIdx]) return null
    const phase = operator.value.phases[phaseIdx]!
    const minAttr = phase.minAttributes
    const maxAttr = phase.maxAttributes
    const maxLvl = phase.maxLevel

    return {
      maxHp: interpolateStat(minAttr.maxHp, maxAttr.maxHp, level, maxLvl),
      atk: interpolateStat(minAttr.atk, maxAttr.atk, level, maxLvl),
      def: interpolateStat(minAttr.def, maxAttr.def, level, maxLvl),
      magicResistance: interpolateStat(
        minAttr.magicResistance,
        maxAttr.magicResistance,
        level,
        maxLvl
      ),
      cost: interpolateStat(minAttr.cost, maxAttr.cost, level, maxLvl),
      blockCnt: minAttr.blockCnt,
      attackSpeed: minAttr.attackSpeed,
      baseAttackTime: minAttr.baseAttackTime,
      respawnTime: minAttr.respawnTime,
    }
  }

  return {
    operator,
    isLoading,
    error,
    fetchOperator,
    interpolateStat,
    getAttributesAt,
  }
}
