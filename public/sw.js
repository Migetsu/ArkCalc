// ArkCalc PRTS High-Performance Image Cache Service Worker
const CACHE_NAME = 'arkcalc-image-cache-v1'

const IMAGE_PATTERNS = [
  /\/images\//,
  /cdn\.jsdelivr\.net\/gh\/PuppiizSunniiz\/Arknight-Images/,
  /arknights\.wiki\.gg/,
  /\.(png|jpg|jpeg|webp|svg|gif)($|\?)/i,
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('arkcalc-image-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = event.request.url

  // Check if request is an image or matches operator avatar CDN
  const isImageRequest =
    event.request.destination === 'image' ||
    IMAGE_PATTERNS.some((pattern) => pattern.test(url))

  if (isImageRequest && event.request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // Cache-First strategy: return cached version immediately if available
        const cachedResponse = await cache.match(event.request)
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise fetch from network and cache for next time
        try {
          const networkResponse = await fetch(event.request, {
            mode: 'cors',
            credentials: 'omit',
          })
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone())
          }
          return networkResponse
        } catch (error) {
          // If offline or network error, return cached or fallback
          return cachedResponse || Response.error()
        }
      })
    )
  }
})
