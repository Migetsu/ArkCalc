/**
 * IndexedDB Cache Utility for ArkCalc
 * Provides robust client-side storage for large datasets (Penguin Stats drop matrices, operator database)
 * to avoid localStorage 5MB quota limits and eliminate redundant network calls on page reload.
 */

export interface CacheRecord<T = any> {
  key: string
  data: T
  updatedAt: number
  expiresAt: number
  meta?: Record<string, any>
}

export type ArkCalcStoreName = 'penguin_store' | 'operator_store'

const DB_NAME = 'arkcalc_cache_db'
const DB_VERSION = 1
const STORES: ArkCalcStoreName[] = ['penguin_store', 'operator_store']

let dbInstance: IDBDatabase | null = null
let dbOpenPromise: Promise<IDBDatabase | null> | null = null

/**
 * Checks whether IndexedDB is available in the current environment
 */
export function isIndexedDbAvailable(): boolean {
  if (typeof window === 'undefined') return false
  if (!('indexedDB' in window)) return false
  return true
}

/**
 * Opens or retrieves a cached singleton instance of the ArkCalc IndexedDB
 */
export function openCacheDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbAvailable()) {
    return Promise.resolve(null)
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  if (dbOpenPromise) {
    return dbOpenPromise
  }

  dbOpenPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result
        for (const storeName of STORES) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'key' })
          }
        }
      }

      request.onsuccess = (event: Event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result

        dbInstance.onclose = () => {
          dbInstance = null
          dbOpenPromise = null
        }

        dbInstance.onerror = (err) => {
          console.warn('[IndexedDB] Database error:', err)
        }

        resolve(dbInstance)
      }

      request.onerror = (err) => {
        console.warn('[IndexedDB] Failed to open database:', err)
        dbInstance = null
        dbOpenPromise = null
        resolve(null)
      }

      request.onblocked = () => {
        console.warn('[IndexedDB] Database open blocked by another tab')
      }
    } catch (e) {
      console.warn('[IndexedDB] Unexpected error during open:', e)
      resolve(null)
    }
  })

  return dbOpenPromise
}

/**
 * Retrieves cached data by key if present and not expired
 */
export async function getCacheItem<T = any>(
  storeName: ArkCalcStoreName,
  key: string
): Promise<T | null> {
  const record = await getCacheRecord<T>(storeName, key)
  if (!record) return null

  // Check TTL expiration
  if (record.expiresAt && Date.now() > record.expiresAt) {
    // Stale item: clean it up asynchronously
    deleteCacheItem(storeName, key).catch(() => {})
    return null
  }

  return record.data
}

/**
 * Retrieves the full cache record including timestamp and metadata
 */
export async function getCacheRecord<T = any>(
  storeName: ArkCalcStoreName,
  key: string
): Promise<CacheRecord<T> | null> {
  const db = await openCacheDb()
  if (!db) return null

  return new Promise<CacheRecord<T> | null>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        const res = request.result as CacheRecord<T> | undefined
        resolve(res || null)
      }

      request.onerror = () => {
        resolve(null)
      }
    } catch (e) {
      console.warn(`[IndexedDB] Error reading key "${key}" from ${storeName}:`, e)
      resolve(null)
    }
  })
}

function toSerializable<T>(data: T): T {
  if (data === null || data === undefined) return data
  try {
    return JSON.parse(JSON.stringify(data))
  } catch {
    return data
  }
}

/**
 * Stores data with a specified TTL (in milliseconds) and optional metadata
 */
export async function setCacheItem<T = any>(
  storeName: ArkCalcStoreName,
  key: string,
  data: T,
  ttlMs: number,
  meta?: Record<string, any>
): Promise<boolean> {
  const db = await openCacheDb()
  if (!db) return false

  return new Promise<boolean>((resolve) => {
    try {
      const now = Date.now()
      const record: CacheRecord<T> = {
        key,
        data: toSerializable(data),
        updatedAt: now,
        expiresAt: now + ttlMs,
        meta: meta ? toSerializable(meta) : undefined,
      }

      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      store.put(record)

      tx.oncomplete = () => resolve(true)
      tx.onerror = (e) => {
        console.warn(`[IndexedDB] Transaction error writing "${key}" to ${storeName}:`, e)
        resolve(false)
      }
      tx.onabort = (e) => {
        console.warn(`[IndexedDB] Transaction aborted writing "${key}" to ${storeName}:`, e)
        resolve(false)
      }
    } catch (e) {
      console.warn(`[IndexedDB] Transaction error saving to ${storeName}:`, e)
      resolve(false)
    }
  })
}

/**
 * Deletes a single item by key from a store
 */
export async function deleteCacheItem(
  storeName: ArkCalcStoreName,
  key: string
): Promise<boolean> {
  const db = await openCacheDb()
  if (!db) return false

  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

/**
 * Clears all entries in a specific object store
 */
export async function clearStore(storeName: ArkCalcStoreName): Promise<boolean> {
  const db = await openCacheDb()
  if (!db) return false

  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

/**
 * Counts the number of items stored in an object store
 */
export async function getStoreCount(storeName: ArkCalcStoreName): Promise<number> {
  const db = await openCacheDb()
  if (!db) return 0

  return new Promise<number>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result || 0)
      request.onerror = () => resolve(0)
    } catch {
      resolve(0)
    }
  })
}

/**
 * Returns all keys and summary info for an object store
 */
export async function getStoreRecordsMeta(
  storeName: ArkCalcStoreName
): Promise<Array<{ key: string; updatedAt: number; expiresAt: number; count?: number }>> {
  const db = await openCacheDb()
  if (!db) return []

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const records = (request.result as CacheRecord[]) || []
        const list = records.map((r) => ({
          key: r.key,
          updatedAt: r.updatedAt,
          expiresAt: r.expiresAt,
          count: Array.isArray(r.data) ? r.data.length : undefined,
        }))
        resolve(list)
      }

      request.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

/**
 * Clears all ArkCalc cached stores in IndexedDB
 */
export async function clearAllArkCalcCache(): Promise<boolean> {
  const db = await openCacheDb()
  if (!db) return false

  try {
    await Promise.all(STORES.map((s) => clearStore(s)))
    return true
  } catch (err) {
    console.warn('[IndexedDB] Failed to clear all cache stores:', err)
    return false
  }
}
