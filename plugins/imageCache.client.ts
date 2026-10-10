export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PRTS // Cache] Image Cache Service Worker registered successfully:', reg.scope)
        })
        .catch((err) => {
          console.warn('[PRTS // Cache] Service Worker registration warning:', err)
        })
    })
  }
})
