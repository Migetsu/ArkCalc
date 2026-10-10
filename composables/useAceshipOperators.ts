import { ref, computed } from 'vue'
import type { CatalogOperator, FactionInfo } from '~/types'
import { getCacheItem, setCacheItem } from '~/utils/indexedDb'

const CACHE_KEY = 'aceship_catalog_v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Singleton state across components
const operators = ref<CatalogOperator[]>([])
const isLoading = ref<boolean>(false)
const error = ref<string | null>(null)
const cacheSource = ref<'none' | 'indexeddb' | 'network' | 'bundle'>('none')
const isInitialized = ref<boolean>(false)

export function useAceshipOperators() {
  const fetchOperators = async (force = false): Promise<CatalogOperator[]> => {
    if (!force && isInitialized.value && operators.value.length > 0) {
      return operators.value
    }

    isLoading.value = true
    error.value = null

    try {
      // 1. Check IndexedDB cache (client-side only)
      if (!force) {
        const cached = await getCacheItem<CatalogOperator[]>('operator_store', CACHE_KEY)
        if (cached && Array.isArray(cached) && cached.length > 0) {
          operators.value = cached
          cacheSource.value = 'indexeddb'
          isInitialized.value = true
          return operators.value
        }
      }

      // 2. Fetch from server endpoint (/api/aceship/operators)
      let data: CatalogOperator[] | null = null
      let src: 'network' | 'bundle' = 'network'

      try {
        data = await $fetch<CatalogOperator[]>('/api/aceship/operators')
      } catch (err: any) {
        console.warn('[useAceshipOperators] Server API failed, loading fallback:', err)
        error.value = err.message || 'Network error'
        src = 'bundle'
      }

      if (data && Array.isArray(data) && data.length > 0) {
        operators.value = data
        cacheSource.value = src
        isInitialized.value = true

        // 3. Save to IndexedDB
        await setCacheItem('operator_store', CACHE_KEY, operators.value, CACHE_TTL_MS)
      }

      return operators.value
    } catch (e: any) {
      error.value = e.message || 'Failed to load operators catalog'
      console.error('[useAceshipOperators] Error loading operators:', e)
      return operators.value
    } finally {
      isLoading.value = false
    }
  }

  const totalCount = computed(() => operators.value.length)

  const operatorsMap = computed<Record<string, CatalogOperator>>(() => {
    const map: Record<string, CatalogOperator> = {}
    for (const op of operators.value) {
      map[op.id] = op
    }
    return map
  })

  const getOperatorById = (id: string): CatalogOperator | undefined => {
    return operatorsMap.value[id]
  }

  // List of all unique factions with operator counts, sorted descending by count
  const factionsList = computed<FactionInfo[]>(() => {
    const countMap: Record<string, number> = {}
    for (const op of operators.value) {
      const f = op.faction || 'Independent'
      countMap[f] = (countMap[f] || 0) + 1
    }

    return Object.entries(countMap)
      .map(([name, count]) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  })

  // List of standard professions
  const classesList = [
    'Guard',
    'Vanguard',
    'Sniper',
    'Defender',
    'Medic',
    'Supporter',
    'Caster',
    'Specialist',
  ] as const

  // Rarities list
  const raritiesList = [6, 5, 4, 3, 2, 1] as const

  return {
    operators,
    isLoading,
    error,
    cacheSource,
    isInitialized,
    totalCount,
    operatorsMap,
    factionsList,
    classesList,
    raritiesList,
    fetchOperators,
    getOperatorById,
  }
}
