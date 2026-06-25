<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-4 z-10000 flex flex-col items-center gap-2 px-4"
      dir="rtl"
      aria-live="polite"
    >
      <TransitionGroup name="toast">
        <div
          v-for="item in toasts"
          :key="item.id"
          role="alert"
          class="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg"
          :class="variantClass(item.variant)"
        >
          <svg
            v-if="item.variant === 'error'"
            class="mt-0.5 size-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01"
            />
          </svg>
          <p class="flex-1 leading-relaxed">{{ item.message }}</p>
          <button
            type="button"
            class="shrink-0 cursor-pointer rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
            aria-label="بستن"
            @click="dismissToast(item.id)"
          >
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ToastVariant } from '~/composables/useToast'
import { dismissToast, useToast } from '~/composables/useToast'

const { toasts } = useToast()

function variantClass(variant: ToastVariant): string {
  switch (variant) {
    case 'error':
      return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-200'
    case 'success':
      return 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/60 dark:bg-green-950/90 dark:text-green-200'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/90 dark:text-amber-200'
    default:
      return 'border-border bg-surface text-text-primary shadow-md'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

