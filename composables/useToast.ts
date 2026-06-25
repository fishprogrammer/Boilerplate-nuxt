import { readonly, ref } from 'vue'
import { NETWORK_ERROR_MESSAGE } from '~/utils/api-error'

export type ToastVariant = 'error' | 'success' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

const DEFAULT_DURATION_MS = 4000

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

export function showToast(options: {
  message: string
  variant?: ToastVariant
  duration?: number
}) {
  if (options.message === NETWORK_ERROR_MESSAGE) return

  const id = ++nextId
  const item: ToastItem = {
    id,
    message: options.message,
    variant: options.variant ?? 'info',
  }
  toasts.value = [...toasts.value, item]

  const duration = options.duration ?? DEFAULT_DURATION_MS
  window.setTimeout(() => dismissToast(id), duration)
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    showToast,
    dismissToast,
  }
}

