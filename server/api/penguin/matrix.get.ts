import { defineEventHandler, getQuery } from 'h3'

interface MatrixCacheItem {
  data: any
  timestamp: number
}

const cache: Record<string, MatrixCacheItem> = {}
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes in milliseconds

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const server = String(query.server || 'US').toUpperCase()
  const itemFilter = query.itemFilter ? String(query.itemFilter) : undefined
  const cacheKey = `${server}_${itemFilter || 'all'}`

  const now = Date.now()
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data
  }

  try {
    const url = new URL('https://penguin-stats.io/PenguinStats/api/v2/result/matrix')
    url.searchParams.set('server', server)
    if (itemFilter) {
      url.searchParams.set('itemFilter', itemFilter)
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ArkCalc/1.0 (+https://github.com/Migetsu/ArkCalc)',
      },
    })

    if (!res.ok) {
      throw new Error(`Penguin Stats responded with ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()
    cache[cacheKey] = {
      data,
      timestamp: now,
    }

    return data
  } catch (err: any) {
    console.warn(`[Penguin Matrix Proxy] Failed to fetch live matrix from Penguin Stats: ${err.message}`)
    // If cache has stale data, return it
    if (cache[cacheKey]) {
      return cache[cacheKey].data
    }
    // Return empty fallback matrix rather than crashing
    return { matrix: [] }
  }
})
