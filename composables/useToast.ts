import { ref, computed } from 'vue'
import type { ToastItem, ToastType, ToastOptions } from '~/types'

let counter = 0
const timers = new Map<string, ReturnType<typeof setTimeout>>()

export const useToast = () => {
  // Shared reactive toast list
  const toasts = useState<ToastItem[]>('arkcalc_global_toasts', () => [])

  /**
   * Adds a new toast notification
   */
  const add = (message: string, type: ToastType = 'info', options: ToastOptions = {}): string => {
    counter++
    const id = `toast-${Date.now()}-${counter}`
    const duration = options.duration !== undefined ? options.duration : 4000
    const now = Date.now()

    const item: ToastItem = {
      id,
      type,
      message,
      title: options.title,
      tag: options.tag,
      duration,
      action: options.action,
      createdAt: now,
      remainingMs: duration,
      isPaused: false,
    }

    // Limit maximum concurrent toasts to 5 (removes oldest if exceeded)
    if (toasts.value.length >= 5) {
      const oldest = toasts.value[0]
      if (oldest) dismiss(oldest.id)
    }

    toasts.value.push(item)

    // Setup auto-dismiss timer on client
    if (duration > 0 && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        dismiss(id)
      }, duration)
      timers.set(id, timer)
    }

    return id
  }

  /**
   * Dismisses a specific toast by its ID
   */
  const dismiss = (id: string) => {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  /**
   * Clears all active toasts
   */
  const clear = () => {
    for (const timer of timers.values()) {
      clearTimeout(timer)
    }
    timers.clear()
    toasts.value = []
  }

  /**
   * Pause auto-dismissal on mouse hover
   */
  const pause = (id: string) => {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    const target = toasts.value.find((t) => t.id === id)
    if (target) {
      target.isPaused = true
    }
  }

  /**
   * Resume auto-dismissal when mouse leaves
   */
  const resume = (id: string) => {
    const target = toasts.value.find((t) => t.id === id)
    if (target && target.duration && target.duration > 0 && typeof window !== 'undefined') {
      target.isPaused = false
      const timer = setTimeout(() => {
        dismiss(id)
      }, 2000) // Give 2 extra seconds after unhover
      timers.set(id, timer)
    }
  }

  // Convenient typed helpers
  const success = (message: string, options?: ToastOptions) => add(message, 'success', options)
  const error = (message: string, options?: ToastOptions) => add(message, 'error', options)
  const info = (message: string, options?: ToastOptions) => add(message, 'info', options)
  const warning = (message: string, options?: ToastOptions) => add(message, 'warning', options)

  return {
    toasts: computed(() => toasts.value),
    add,
    dismiss,
    clear,
    pause,
    resume,
    success,
    error,
    info,
    warning,
  }
}
