<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[2px] overlay-dismiss"
          aria-hidden="true"
          @click="onCancel"
        />

        <div
          class="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          dir="rtl"
        >
          <h2 :id="titleId" class="text-lg font-bold text-text-primary">
            {{ title }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-text-secondary">
            {{ message }}
          </p>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="btn-muted flex-1 rounded-xl py-2.5 font-semibold"
              :disabled="loading"
              @click="onCancel"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              :class="
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/40'
                  : 'btn-action flex-1 rounded-xl py-2.5 font-semibold'
              "
              :disabled="loading"
              @click="onConfirm"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
    variant?: 'default' | 'danger'
  }>(),
  {
    confirmLabel: 'تایید',
    cancelLabel: 'انصراف',
    loading: false,
    variant: 'default',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const titleId = useId()

const onCancel = () => {
  if (props.loading) return
  emit('update:modelValue', false)
  emit('cancel')
}

const onConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
  transform: scale(0.96);
  opacity: 0;
}
</style>

