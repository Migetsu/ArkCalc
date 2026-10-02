import { defineStore } from 'pinia';
import { ref } from 'vue';
import { registerSW } from 'virtual:pwa-register';

export const usePwaStore = defineStore('pwa', () => {
  const isOnline = ref<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const needRefresh = ref<boolean>(false);
  const offlineReady = ref<boolean>(false);

  let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

  function initPwa() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        isOnline.value = true;
      });
      window.addEventListener('offline', () => {
        isOnline.value = false;
      });

      updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          needRefresh.value = true;
          console.log('[PRTS PWA] New version ready for installation.');
        },
        onOfflineReady() {
          offlineReady.value = true;
          console.log('[PRTS PWA] App cached and ready for offline use.');
        },
      });
    }
  }

  async function updateApp() {
    if (updateSW) {
      await updateSW(true);
    } else {
      window.location.reload();
    }
  }

  function dismissRefresh() {
    needRefresh.value = false;
  }

  return {
    isOnline,
    needRefresh,
    offlineReady,
    initPwa,
    updateApp,
    dismissRefresh,
  };
});
