import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import fallbackOperators from '~/assets/data/operators.json'
import type { OperatorData } from '~/types'
import {
  getCacheItem,
  getCacheRecord,
  setCacheItem,
  clearStore,
} from '~/utils/indexedDb'

const OPERATORS_CACHE_KEY = 'operators_catalog'
const OPERATORS_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export const useOperatorStore = defineStore('operators', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const operators = ref<OperatorData[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<number | null>(null)
  const cacheSource = ref<'none' | 'indexeddb' | 'network' | 'bundle'>('none')
  const isInitialized = ref<boolean>(false)

  // ---------------------------------------------------------------------------
  // Computed & Getters
  // ---------------------------------------------------------------------------
  const totalCount = computed(() => operators.value.length)

  const operatorsMap = computed<Record<string, OperatorData>>(() => {
    const map: Record<string, OperatorData> = {}
    for (const op of operators.value) {
      map[op.id] = op
    }
    return map
  })

  const getOperator = (operatorId: string): OperatorData | undefined => {
    return operatorsMap.value[operatorId]
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  /**
   * Loads operator database. First checks in-memory Pinia state,
   * then IndexedDB cache (instant 0ms network call), then server API / bundle fallback.
   */
  const loadOperators = async (force = false): Promise<OperatorData[]> => {
    // 1. In-memory check
    if (!force && operators.value.length > 0) {
      return operators.value
    }

    isLoading.value = true
    error.value = null

    try {
      // 2. IndexedDB cache check (client-side only)
      if (!force) {
        const cached = await getCacheItem<OperatorData[]>('operator_store', OPERATORS_CACHE_KEY)
        if (cached && Array.isArray(cached) && cached.length > 0) {
          const meta = await getCacheRecord<OperatorData[]>('operator_store', OPERATORS_CACHE_KEY)
          operators.value = cached
          lastFetchedAt.value = meta?.updatedAt || Date.now()
          cacheSource.value = 'indexeddb'
          isInitialized.value = true
          return operators.value
        }
      }

      // 3. Network fetch with fallback
      let data: OperatorData[] | null = null
      let source: 'network' | 'bundle' = 'network'

      try {
        data = await $fetch<OperatorData[]>('/api/operators')
      } catch (netErr) {
        console.warn('[OperatorStore] Network fetch failed, falling back to bundled data:', netErr)
        data = fallbackOperators as OperatorData[]
        source = 'bundle'
      }

      if (!data || data.length === 0) {
        data = fallbackOperators as OperatorData[]
        source = 'bundle'
      }

      operators.value = data
      lastFetchedAt.value = Date.now()
      cacheSource.value = source
      isInitialized.value = true

      // 4. Save to IndexedDB
      await setCacheItem(
        'operator_store',
        OPERATORS_CACHE_KEY,
        operators.value,
        OPERATORS_CACHE_TTL,
        { count: operators.value.length, source }
      )

      return operators.value
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = msg

      // Safety fallback to bundled data
      if (operators.value.length === 0) {
        operators.value = fallbackOperators as OperatorData[]
        cacheSource.value = 'bundle'
      }

      return operators.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clears the operator cache in IndexedDB and resets store
   */
  const clearCache = async (): Promise<void> => {
    await clearStore('operator_store')
    lastFetchedAt.value = null
    cacheSource.value = 'none'
    // Reload bundled data
    operators.value = fallbackOperators as OperatorData[]
  }

  return {
    // State
    operators,
    isLoading,
    error,
    lastFetchedAt,
    cacheSource,
    isInitialized,

    // Getters
    totalCount,
    operatorsMap,
    getOperator,

    // Actions
    loadOperators,
    clearCache,
  }
})
