import { ref } from 'vue'
import type { OperatorSkinItem } from '~/types'
import { getCacheItem, setCacheItem } from '~/utils/indexedDb'

const CACHE_PREFIX = 'aceship_skins_'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useOperatorSkins() {
  const skins = ref<OperatorSkinItem[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchSkins = async (
    charId: string,
    force = false
  ): Promise<OperatorSkinItem[]> => {
    if (!charId) return []

    isLoading.value = true
    error.value = null

    try {
      const cacheKey = `${CACHE_PREFIX}${charId}`

      // 1. Check IndexedDB
      if (!force) {
        const cached = await getCacheItem<OperatorSkinItem[]>('operator_store', cacheKey)
        if (cached && Array.isArray(cached) && cached.length > 0) {
          skins.value = cached
          isLoading.value = false
          return cached
        }
      }

      // 2. Fetch from server endpoint
      const data = await $fetch<OperatorSkinItem[]>(`/api/aceship/skins/${charId}`)
      if (data && Array.isArray(data)) {
        skins.value = data
        // 3. Save to IndexedDB
        await setCacheItem('operator_store', cacheKey, data, CACHE_TTL_MS)
      }

      return skins.value
    } catch (err: any) {
      console.warn('[useOperatorSkins] Fetch failed:', err)
      error.value = err.message || 'Failed to load operator skins'
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    skins,
    isLoading,
    error,
    fetchSkins,
  }
}
