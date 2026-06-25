import { ref, readonly } from 'vue'

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

interface ConfirmState extends ConfirmOptions {
  resolve: (confirmed: boolean) => void
}

const isOpen = ref(false)
const isLoading = ref(false)
const state = ref<ConfirmState | null>(null)

/**
 * Programmatic confirm dialog backed by ConfirmModal.vue.
 *
 * Usage:
 *   const confirmed = await confirm({ title: 'حذف', message: 'آیا مطمئن هستید؟', variant: 'danger' })
 *   if (confirmed) { ... }
 *
 * Mount <ConfirmDialog /> once in App.vue or a layout to render the modal.
 */
export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = { ...options, resolve }
      isOpen.value = true
      isLoading.value = false
    })
  }

  const onConfirm = () => {
    state.value?.resolve(true)
    isOpen.value = false
    state.value = null
  }

  const onCancel = () => {
    state.value?.resolve(false)
    isOpen.value = false
    state.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  return {
    isOpen: readonly(isOpen),
    isLoading: readonly(isLoading),
    title: state.value?.title ?? '',
    message: state.value?.message ?? '',
    confirmLabel: state.value?.confirmLabel,
    cancelLabel: state.value?.cancelLabel,
    variant: state.value?.variant ?? 'default',
    state: readonly(state),
    confirm,
    onConfirm,
    onCancel,
    setLoading,
  }
}

