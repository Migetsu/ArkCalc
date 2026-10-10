/**
 * Composable for interacting with Penguin Statistics API (v2)
 * Backed by Pinia (usePenguinStore) and client-side IndexedDB caching
 * to eliminate redundant network requests on page reloads.
 */
import { usePenguinStore } from '~/stores/penguinStore'

export const usePenguinStats = () => {
  return usePenguinStore()
}
