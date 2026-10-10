<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import type { ToastType } from '~/types'

const { toasts, dismiss, pause, resume } = useToast()

const getIcon = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    case 'info':
    default:
      return 'ℹ'
  }
}
</script>

<template>
  <div class="ak-toast-container" aria-live="polite">
    <TransitionGroup name="ak-toast" tag="div" class="ak-toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="ak-toast"
        :class="`ak-toast--${toast.type}`"
        role="alert"
        @mouseenter="pause(toast.id)"
        @mouseleave="resume(toast.id)"
      >
        <!-- Left Type Accent Stripe -->
        <div class="ak-toast__stripe" />

        <div class="ak-toast__content">
          <!-- Toast Header -->
          <div class="ak-toast__header">
            <div class="ak-toast__meta">
              <span class="ak-toast__icon">{{ getIcon(toast.type) }}</span>
              <span class="ak-toast__tag">{{ toast.tag || 'PRTS // SYSTEM' }}</span>
              <strong v-if="toast.title" class="ak-toast__title">{{ toast.title }}</strong>
            </div>

            <button
              type="button"
              class="ak-toast__close"
              title="Dismiss notification"
              @click="dismiss(toast.id)"
            >
              ✕
            </button>
          </div>

          <!-- Toast Message -->
          <p class="ak-toast__message">{{ toast.message }}</p>

          <!-- Optional Action CTA -->
          <div v-if="toast.action" class="ak-toast__actions">
            <button
              type="button"
              class="ak-toast__action-btn"
              @click="toast.action.onClick(); dismiss(toast.id)"
            >
              {{ toast.action.label }}
            </button>
          </div>
        </div>

        <!-- Auto-dismiss Progress Bar -->
        <div
          v-if="toast.duration && toast.duration > 0"
          class="ak-toast__bar"
          :class="{ 'ak-toast__bar--paused': toast.isPaused }"
          :style="{ animationDuration: `${toast.duration}ms` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.ak-toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  max-width: 420px;
  width: calc(100vw - 2rem);

  @media (max-width: 640px) {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
  }
}

.ak-toast-list {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
}

.ak-toast {
  position: relative;
  background: rgba(18, 18, 22, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
  pointer-events: auto;
  overflow: hidden;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.85);
  }

  &__stripe {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
  }

  &__content {
    padding: 0.85rem 1rem 0.85rem 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: monospace;
    font-size: 0.72rem;
  }

  &__icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 0.7rem;
    border-radius: 2px;
  }

  &__tag {
    font-size: 0.62rem;
    letter-spacing: 1px;
    color: $ak-text-muted;
  }

  &__title {
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: $ak-text-primary;
    text-transform: uppercase;
  }

  &__close {
    background: transparent;
    border: none;
    color: $ak-text-muted;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0.1rem 0.3rem;
    line-height: 1;
    transition: color 0.2s ease;

    &:hover {
      color: $ak-text-primary;
    }
  }

  &__message {
    font-size: 0.82rem;
    color: $ak-text-secondary;
    line-height: 1.35;
    margin: 0;
    word-break: break-word;
  }

  &__actions {
    margin-top: 0.35rem;
  }

  &__action-btn {
    padding: 0.25rem 0.6rem;
    font-family: monospace;
    font-size: 0.68rem;
    font-weight: 800;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: $ak-text-primary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $ak-cyan;
      color: #000;
      border-color: $ak-cyan;
    }
  }

  // Bottom Progress Line
  &__bar {
    height: 2px;
    width: 100%;
    animation: ak-toast-shrink linear forwards;

    &--paused {
      animation-play-state: paused;
    }
  }

  // Type-specific modifiers
  &--success {
    border-color: rgba($ak-green, 0.35);

    .ak-toast__stripe,
    .ak-toast__bar {
      background: $ak-green;
    }

    .ak-toast__icon {
      background: rgba($ak-green, 0.2);
      color: $ak-green;
    }

    .ak-toast__title {
      color: $ak-green;
    }
  }

  &--error {
    border-color: rgba($ak-red, 0.4);

    .ak-toast__stripe,
    .ak-toast__bar {
      background: $ak-red;
    }

    .ak-toast__icon {
      background: rgba($ak-red, 0.2);
      color: $ak-red;
    }

    .ak-toast__title {
      color: $ak-red;
    }
  }

  &--warning {
    border-color: rgba($ak-amber, 0.35);

    .ak-toast__stripe,
    .ak-toast__bar {
      background: $ak-amber;
    }

    .ak-toast__icon {
      background: rgba($ak-amber, 0.2);
      color: $ak-amber;
    }

    .ak-toast__title {
      color: $ak-amber;
    }
  }

  &--info {
    border-color: rgba($ak-cyan, 0.35);

    .ak-toast__stripe,
    .ak-toast__bar {
      background: $ak-cyan;
    }

    .ak-toast__icon {
      background: rgba($ak-cyan, 0.2);
      color: $ak-cyan;
    }

    .ak-toast__title {
      color: $ak-cyan;
    }
  }
}

// Keyframes
@keyframes ak-toast-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

// Vue Transition Group Animations
.ak-toast-enter-active,
.ak-toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ak-toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.ak-toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.9);
}
</style>
