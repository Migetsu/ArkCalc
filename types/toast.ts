export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  title?: string
  tag?: string
  duration?: number // Duration in milliseconds. Set to 0 for persistent toasts.
  action?: ToastAction
}

export interface ToastItem extends ToastOptions {
  id: string
  type: ToastType
  message: string
  createdAt: number
  remainingMs: number
  isPaused?: boolean
}
