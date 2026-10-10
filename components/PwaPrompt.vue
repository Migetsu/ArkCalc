<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const nuxtApp = useNuxtApp()
const pwa = computed(() => (nuxtApp as any).$pwa)

const isOffline = ref(false)
const isDismissed = ref(false)

const updateOnlineStatus = () => {
  if (typeof navigator !== 'undefined') {
    isOffline.value = !navigator.onLine
  }
}

onMounted(() => {
  updateOnlineStatus()
  if (typeof window !== 'undefined') {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  }
})

const handleUpdate = () => {
  if (pwa.value?.updateServiceWorker) {
    pwa.value.updateServiceWorker()
  }
}

const handleInstall = async () => {
  if (pwa.value?.install) {
    await pwa.value.install()
  }
}

const dismissBanner = () => {
  isDismissed.value = true
  if (pwa.value?.cancelPrompt) {
    pwa.value.cancelPrompt()
  }
}
</script>

<template>
  <ClientOnly>
    <!-- 1. Offline Mode Indicator Pill -->
    <Transition name="fade">
      <div v-if="isOffline" class="ak-offline-indicator" role="status">
        <span class="ak-offline-indicator__pulse" />
        <span class="ak-offline-indicator__text">
          PRTS // OFFLINE MODE: Operating on cached depot, planner & matrix data
        </span>
      </div>
    </Transition>

    <!-- 2. System Update or PWA Install Prompt Banner -->
    <Transition name="slide-up">
      <div
        v-if="!isDismissed && (pwa?.needRefresh || pwa?.showInstallPrompt)"
        class="ak-pwa-prompt"
        role="dialog"
        aria-label="PWA Prompt"
      >
        <div class="ak-pwa-prompt__content">
          <div class="ak-pwa-prompt__visual">
            <svg viewBox="0 0 24 24" fill="currentColor" class="ak-pwa-prompt__icon">
              <path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11.5h-13L12 6.5z" />
            </svg>
          </div>

          <div class="ak-pwa-prompt__info">
            <template v-if="pwa?.needRefresh">
              <span class="ak-pwa-prompt__tag">PRTS FIRMWARE UPDATE</span>
              <h4 class="ak-pwa-prompt__title">New Terminal Version Ready</h4>
              <p class="ak-pwa-prompt__desc">
                An updated version of the Arknights PRTS Terminal is available. Reload to activate newest assets and data.
              </p>
            </template>
            <template v-else-if="pwa?.showInstallPrompt">
              <span class="ak-pwa-prompt__tag">PRTS // DESKTOP & MOBILE APP</span>
              <h4 class="ak-pwa-prompt__title">Install ArkCalc as PWA</h4>
              <p class="ak-pwa-prompt__desc">
                Install for quick launch, full-screen tactical view and offline calculation support.
              </p>
            </template>
          </div>

          <div class="ak-pwa-prompt__actions">
            <button
              v-if="pwa?.needRefresh"
              type="button"
              class="ak-btn-pwa ak-btn-pwa--primary"
              @click="handleUpdate"
            >
              ↻ UPDATE NOW
            </button>
            <button
              v-else-if="pwa?.showInstallPrompt"
              type="button"
              class="ak-btn-pwa ak-btn-pwa--primary"
              @click="handleInstall"
            >
              📥 INSTALL APP
            </button>
            <button
              type="button"
              class="ak-btn-pwa ak-btn-pwa--ghost"
              @click="dismissBanner"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>

<style lang="scss" scoped>
// Offline notification floating top pill
.ak-offline-indicator {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 1rem;
  background: rgba(180, 83, 9, 0.95);
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  font-family: monospace;
  font-size: 0.75rem;
  color: #fff;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  clip-path: polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px);

  &__pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fef08a;
    box-shadow: 0 0 8px #fef08a;
    animation: offlinePulse 1.5s infinite ease-in-out;
  }
}

@keyframes offlinePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

// PWA bottom banner
.ak-pwa-prompt {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 9990;
  max-width: 440px;
  width: calc(100vw - 2.5rem);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-left: 3px solid #00e5ff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  padding: 1rem;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);

  &__content {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    flex-wrap: wrap;
  }

  &__visual {
    width: 36px;
    height: 36px;
    background: rgba(0, 229, 255, 0.12);
    border: 1px solid rgba(0, 229, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__icon {
    width: 20px;
    height: 20px;
    color: #00e5ff;
  }

  &__info {
    flex: 1;
    min-width: 200px;
  }

  &__tag {
    font-family: monospace;
    font-size: 0.65rem;
    color: #00e5ff;
    letter-spacing: 1.5px;
    font-weight: 700;
  }

  &__title {
    margin: 0.15rem 0;
    font-size: 0.92rem;
    font-weight: 800;
    color: #f8fafc;
    letter-spacing: 0.5px;
  }

  &__desc {
    margin: 0;
    font-size: 0.78rem;
    color: #94a3b8;
    line-height: 1.35;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.65rem;
    justify-content: flex-end;
  }
}

.ak-btn-pwa {
  padding: 0.4rem 0.85rem;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease;

  &--primary {
    background: #00e5ff;
    color: #000;
    border: 1px solid #00e5ff;

    &:hover {
      background: #38bdf8;
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
    }
  }

  &--ghost {
    background: transparent;
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.12);

    &:hover {
      color: #fff;
      border-color: rgba(255, 255, 255, 0.3);
    }
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
