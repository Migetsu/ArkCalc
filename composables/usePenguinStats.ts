import type {
  PenguinItem,
  PenguinStage,
  PenguinMatrixItem,
  PenguinMatrixResponse,
  PenguinServer,
  FarmStageEfficiency,
} from '~/types'

const PENGUIN_API_BASE = 'https://penguin-stats.io/PenguinStats/api/v2'

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

/**
 * Composable for interacting with Penguin Statistics API (v2)
 * Caches items, stages, and drop matrices in Nuxt useState for SSR and cross-component sharing.
 */
export const usePenguinStats = () => {
  // Shared reactive state across components
  const items = useState<PenguinItem[]>('penguin_items', () => [])
  const stages = useState<PenguinStage[]>('penguin_stages', () => [])
  const matrix = useState<PenguinMatrixItem[]>('penguin_matrix', () => [])
  const currentServer = useState<PenguinServer>('penguin_server', () => 'US')
  const isLoading = useState<boolean>('penguin_loading', () => false)
  const error = useState<string | null>('penguin_error', () => null)
  const lastFetchedAt = useState<number | null>('penguin_last_fetched', () => null)

  // Fast lookups
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

  /**
   * Fetch all game items from Penguin Stats
   */
  const fetchItems = async (server?: string, force = false): Promise<PenguinItem[]> => {
    const targetServer = normalizePenguinServer(server || currentServer.value)

    if (!force && items.value.length > 0 && currentServer.value === targetServer) {
      return items.value
    }

    try {
      error.value = null
      const data = await $fetch<PenguinItem[]>(`${PENGUIN_API_BASE}/items`, {
        query: { server: targetServer },
      })
      items.value = data || []
      currentServer.value = targetServer
      return items.value
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch items from Penguin Stats: ${msg}`
      throw err
    }
  }

  /**
   * Fetch all stages from Penguin Stats
   */
  const fetchStages = async (server?: string, force = false): Promise<PenguinStage[]> => {
    const targetServer = normalizePenguinServer(server || currentServer.value)

    if (!force && stages.value.length > 0 && currentServer.value === targetServer) {
      return stages.value
    }

    try {
      error.value = null
      const data = await $fetch<PenguinStage[]>(`${PENGUIN_API_BASE}/stages`, {
        query: { server: targetServer },
      })
      stages.value = data || []
      return stages.value
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch stages from Penguin Stats: ${msg}`
      throw err
    }
  }

  /**
   * Fetch drop matrix from Penguin Stats with fallback to local proxy
   */
  const fetchMatrix = async (
    server?: string,
    isPersonal = false,
    force = false,
    itemFilter?: string[]
  ): Promise<PenguinMatrixItem[]> => {
    const targetServer = normalizePenguinServer(server || currentServer.value)

    if (!force && matrix.value.length > 0 && currentServer.value === targetServer && !itemFilter) {
      return matrix.value
    }

    try {
      error.value = null
      let response: any

      const itemFilterParam = itemFilter && itemFilter.length > 0 ? itemFilter.join(',') : undefined

      // Attempt 1: Fetch through local Nitro server proxy (/api/penguin/matrix) to avoid CORS & benefit from caching
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
        // Attempt 2: Direct query to Penguin API
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
        // Merge item-filtered drops into existing matrix
        const itemSet = new Set(itemFilter)
        matrix.value = [
          ...matrix.value.filter((m) => !itemSet.has(m.itemId)),
          ...newItems,
        ]
      } else {
        matrix.value = newItems
      }

      return matrix.value
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch matrix from Penguin Stats: ${msg}`
      throw err
    }
  }

  /**
   * Concurrently fetch items, stages, and drop matrix
   */
  const fetchAll = async (server?: string, force = false) => {
    isLoading.value = true
    error.value = null

    try {
      const targetServer = normalizePenguinServer(server || currentServer.value)
      currentServer.value = targetServer

      await Promise.all([
        fetchItems(targetServer, force),
        fetchStages(targetServer, force),
        fetchMatrix(targetServer, false, force),
      ])

      lastFetchedAt.value = Date.now()
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
   * @param minSamples Minimum sample runs on Penguin Stats to filter out noise (default: 50)
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

  return {
    // Reactive State (useState)
    items,
    stages,
    matrix,
    currentServer,
    isLoading,
    error,
    lastFetchedAt,

    // Computed
    itemsMap,
    stagesMap,
    materials,

    // Fetch Methods
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
  }
}
