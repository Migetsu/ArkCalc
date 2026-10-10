import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PenguinItem,
  PenguinStage,
  PenguinMatrixItem,
  PenguinMatrixResponse,
  PenguinServer,
  FarmStageEfficiency,
} from '~/types'
import {
  getCacheItem,
  getCacheRecord,
  setCacheItem,
  clearStore,
} from '~/utils/indexedDb'

const PENGUIN_API_BASE = 'https://penguin-stats.io/PenguinStats/api/v2'

// Cache TTL policies
const MATRIX_CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours
const ITEMS_STAGES_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Normalizes user-facing server code ('EN', 'CN', 'JP', 'KR')
 * to Penguin Stats API server format ('US', 'CN', 'JP', 'KR')
 */
export function normalizePenguinServer(server?: string): PenguinServer {
  if (!server) return 'US'
  const upper = server.toUpperCase()
  if (upper === 'EN' || upper === 'GLOBAL' || upper === 'US') return 'US'
  if (upper === 'CN') return 'CN'
  if (upper === 'JP') return 'JP'
  if (upper === 'KR') return 'KR'
  return 'US'
}

export const usePenguinStore = defineStore('penguin', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const items = ref<PenguinItem[]>([])
  const stages = ref<PenguinStage[]>([])
  const matrix = ref<PenguinMatrixItem[]>([])
  const currentServer = ref<PenguinServer>('US')
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<number | null>(null)
  const cacheSource = ref<'none' | 'indexeddb' | 'network'>('none')
  const isInitialized = ref<boolean>(false)

  // ---------------------------------------------------------------------------
  // Getters & Lookups
  // ---------------------------------------------------------------------------
  const itemsMap = computed<Record<string, PenguinItem>>(() => {
    const map: Record<string, PenguinItem> = {}
    for (const item of items.value) {
      map[item.itemId] = item
    }
    return map
  })

  const stagesMap = computed<Record<string, PenguinStage>>(() => {
    const map: Record<string, PenguinStage> = {}
    for (const stage of stages.value) {
      map[stage.stageId] = stage
    }
    return map
  })

  // Filter materials only (excluding tokens, furniture, event currencies)
  const materials = computed<PenguinItem[]>(() => {
    return items.value.filter((item) => item.itemType === 'MATERIAL')
  })

  const matrixCount = computed(() => matrix.value.length)
  const itemsCount = computed(() => items.value.length)
  const stagesCount = computed(() => stages.value.length)

  // ---------------------------------------------------------------------------
  // Actions: Fetchers with IndexedDB Caching
  // ---------------------------------------------------------------------------

  /**
   * Fetch game items from IndexedDB cache or network
   */
  const fetchItems = async (server?: string, force = false): Promise<PenguinItem[]> => {
    const targetServer = normalizePenguinServer(server || currentServer.value)
    const cacheKey = `items_${targetServer}`

    // 1. In-memory check
    if (!force && items.value.length > 0 && currentServer.value === targetServer) {
      return items.value
    }

    // 2. IndexedDB cache check
    if (!force) {
      const cached = await getCacheItem<PenguinItem[]>('penguin_store', cacheKey)
      if (cached && cached.length > 0) {
        items.value = cached
        currentServer.value = targetServer
        return items.value
      }
    }

    // 3. Network fetch
    try {
      error.value = null
      const data = await $fetch<PenguinItem[]>(`${PENGUIN_API_BASE}/items`, {
        query: { server: targetServer },
      })
      items.value = data || []
      currentServer.value = targetServer

      // Save to IndexedDB
      await setCacheItem('penguin_store', cacheKey, items.value, ITEMS_STAGES_CACHE_TTL)

      return items.value
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch items from Penguin Stats: ${msg}`
      throw err
    }
  }

  /**
   * Fetch stages from IndexedDB cache or network
   */
  const fetchStages = async (server?: string, force = false): Promise<PenguinStage[]> => {
    const targetServer = normalizePenguinServer(server || currentServer.value)
    const cacheKey = `stages_${targetServer}`

    // 1. In-memory check
    if (!force && stages.value.length > 0 && currentServer.value === targetServer) {
      return stages.value
    }

    // 2. IndexedDB cache check
    if (!force) {
      const cached = await getCacheItem<PenguinStage[]>('penguin_store', cacheKey)
      if (cached && cached.length > 0) {
        stages.value = cached
        return stages.value
      }
    }

    // 3. Network fetch
    try {
      error.value = null
      const data = await $fetch<PenguinStage[]>(`${PENGUIN_API_BASE}/stages`, {
        query: { server: targetServer },
      })
      stages.value = data || []

      // Save to IndexedDB
      await setCacheItem('penguin_store', cacheKey, stages.value, ITEMS_STAGES_CACHE_TTL)

      return stages.value
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch stages from Penguin Stats: ${msg}`
      throw err
    }
  }

  /**
   * Fetch drop matrix from IndexedDB cache or network
   */
  const fetchMatrix = async (
    server?: string,
    isPersonal = false,
    force = false,
    itemFilter?: string[]
  ): Promise<PenguinMatrixItem[]> => {
    const targetServer = normalizePenguinServer(server || currentServer.value)
    const cacheKey = `matrix_${targetServer}`

    // 1. In-memory check
    if (!force && matrix.value.length > 0 && currentServer.value === targetServer && !itemFilter) {
      return matrix.value
    }

    // 2. IndexedDB cache check (full matrix only, not item-filtered)
    if (!force && !itemFilter) {
      const cached = await getCacheItem<PenguinMatrixItem[]>('penguin_store', cacheKey)
      if (cached && cached.length > 0) {
        matrix.value = cached
        return matrix.value
      }
    }

    // 3. Network fetch with proxy & direct fallback
    try {
      error.value = null
      let response: any
      const itemFilterParam = itemFilter && itemFilter.length > 0 ? itemFilter.join(',') : undefined

      try {
        response = await $fetch<PenguinMatrixResponse | PenguinMatrixItem[]>(
          '/api/penguin/matrix',
          {
            query: {
              server: targetServer,
              itemFilter: itemFilterParam,
            },
          }
        )
      } catch {
        response = await $fetch<PenguinMatrixResponse | PenguinMatrixItem[]>(
          `${PENGUIN_API_BASE}/result/matrix`,
          {
            query: {
              server: targetServer,
              is_personal: isPersonal,
              itemFilter: itemFilterParam,
            },
          }
        )
      }

      let newItems: PenguinMatrixItem[] = []
      if (Array.isArray(response)) {
        newItems = response
      } else if (response && Array.isArray(response.matrix)) {
        newItems = response.matrix
      }

      if (itemFilterParam) {
        const itemSet = new Set(itemFilter)
        matrix.value = [
          ...matrix.value.filter((m) => !itemSet.has(m.itemId)),
          ...newItems,
        ]
      } else {
        matrix.value = newItems
        // Save complete matrix to IndexedDB
        await setCacheItem('penguin_store', cacheKey, matrix.value, MATRIX_CACHE_TTL, {
          server: targetServer,
          count: matrix.value.length,
        })
      }

      return matrix.value
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch matrix from Penguin Stats: ${msg}`
      throw err
    }
  }

  /**
   * Concurrently loads items, stages, and drop matrix.
   * If available in IndexedDB, restores complete state in milliseconds without network calls!
   */
  const fetchAll = async (server?: string, force = false) => {
    isLoading.value = true
    error.value = null

    try {
      const targetServer = normalizePenguinServer(server || currentServer.value)
      currentServer.value = targetServer

      const matrixKey = `matrix_${targetServer}`
      const itemsKey = `items_${targetServer}`
      const stagesKey = `stages_${targetServer}`

      // 1. In-memory check
      if (
        !force &&
        items.value.length > 0 &&
        stages.value.length > 0 &&
        matrix.value.length > 0 &&
        currentServer.value === targetServer
      ) {
        isInitialized.value = true
        return {
          items: items.value,
          stages: stages.value,
          matrix: matrix.value,
        }
      }

      // 2. Try IndexedDB cache restoration
      if (!force) {
        const [cachedMatrix, cachedItems, cachedStages, metaRecord] = await Promise.all([
          getCacheItem<PenguinMatrixItem[]>('penguin_store', matrixKey),
          getCacheItem<PenguinItem[]>('penguin_store', itemsKey),
          getCacheItem<PenguinStage[]>('penguin_store', stagesKey),
          getCacheRecord<PenguinMatrixItem[]>('penguin_store', matrixKey),
        ])

        if (
          cachedMatrix &&
          cachedMatrix.length > 0 &&
          cachedItems &&
          cachedItems.length > 0 &&
          cachedStages &&
          cachedStages.length > 0
        ) {
          matrix.value = cachedMatrix
          items.value = cachedItems
          stages.value = cachedStages
          cacheSource.value = 'indexeddb'
          lastFetchedAt.value = metaRecord?.updatedAt || Date.now()
          isInitialized.value = true

          return {
            items: items.value,
            stages: stages.value,
            matrix: matrix.value,
          }
        }
      }

      // 3. Network fetch (when cache is missing, expired, or forced)
      await Promise.all([
        fetchItems(targetServer, force),
        fetchStages(targetServer, force),
        fetchMatrix(targetServer, false, force),
      ])

      cacheSource.value = 'network'
      lastFetchedAt.value = Date.now()
      isInitialized.value = true

      return {
        items: items.value,
        stages: stages.value,
        matrix: matrix.value,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = msg
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Helper: Get item by ID
   */
  const getItem = (itemId: string): PenguinItem | undefined => {
    return itemsMap.value[itemId]
  }

  /**
   * Helper: Get localized item name
   */
  const getItemName = (itemId: string, locale = 'en'): string => {
    const item = getItem(itemId)
    if (!item) return itemId
    return (
      item.name_i18n?.[locale] ||
      item.name_i18n?.['en'] ||
      item.name ||
      itemId
    )
  }

  /**
   * Helper: Get stage by ID
   */
  const getStage = (stageId: string): PenguinStage | undefined => {
    return stagesMap.value[stageId]
  }

  /**
   * Helper: Get drop entries for a specific item
   */
  const getMatrixByItem = (itemId: string): PenguinMatrixItem[] => {
    return matrix.value.filter((entry) => entry.itemId === itemId)
  }

  /**
   * Helper: Get drop entries for a specific stage
   */
  const getMatrixByStage = (stageId: string): PenguinMatrixItem[] => {
    return matrix.value.filter((entry) => entry.stageId === stageId)
  }

  /**
   * Calculate best farming stages for an item, sorted by Sanity (AP) efficiency.
   * Lower apPerDrop = more sanity efficient!
   *
   * @param itemId ID of the item to farm
   * @param minSamples Minimum sample runs on Penguin Stats to filter out noise (default: 40)
   */
  const getBestStagesForItem = (
    itemId: string,
    minSamples = 40
  ): FarmStageEfficiency[] => {
    const drops = getMatrixByItem(itemId)
    const result: FarmStageEfficiency[] = []

    for (const drop of drops) {
      if (drop.times < minSamples || drop.quantity <= 0) continue

      const stage = getStage(drop.stageId)
      if (!stage || !stage.apCost || stage.apCost <= 0) continue

      const dropRate = drop.quantity / drop.times
      const apPerDrop = (stage.apCost * drop.times) / drop.quantity

      result.push({
        stageId: drop.stageId,
        stageCode: stage.code,
        apCost: stage.apCost,
        quantity: drop.quantity,
        times: drop.times,
        dropRate,
        apPerDrop,
      })
    }

    // Sort ascending by AP spent per drop (best efficiency first)
    return result.sort((a, b) => a.apPerDrop - b.apPerDrop)
  }

  /**
   * Clears Penguin Stats caches in IndexedDB and in-memory Pinia state
   */
  const clearCache = async (): Promise<void> => {
    await clearStore('penguin_store')
    items.value = []
    stages.value = []
    matrix.value = []
    lastFetchedAt.value = null
    cacheSource.value = 'none'
    isInitialized.value = false
  }

  return {
    // State
    items,
    stages,
    matrix,
    currentServer,
    isLoading,
    error,
    lastFetchedAt,
    cacheSource,
    isInitialized,

    // Lookups & Getters
    itemsMap,
    stagesMap,
    materials,
    matrixCount,
    itemsCount,
    stagesCount,

    // Fetch methods
    fetchItems,
    fetchStages,
    fetchMatrix,
    fetchAll,

    // Query & Efficiency Helpers
    getItem,
    getItemName,
    getStage,
    getMatrixByItem,
    getMatrixByStage,
    getBestStagesForItem,
    clearCache,
  }
})
