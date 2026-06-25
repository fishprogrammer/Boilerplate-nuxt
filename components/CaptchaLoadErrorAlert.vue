<template>
  <p v-if="message" :class="wrapperClass">
    <span class="flex-1">{{ message }}</span>
    <button
      v-if="showRetry"
      type="button"
      class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-1.5 disabled:cursor-not-allowed disabled:opacity-60"
      :class="buttonClass"
      :disabled="loading"
      aria-label="بارگذاری مجدد کپچا"
      title="بارگذاری مجدد کپچا"
      @click="emit('retry')"
    >
      <svg
        :class="{ 'animate-spin': loading }"
        class="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    message?: string | null
    showRetry?: boolean
    loading?: boolean
    variant?: 'banner' | 'compact' | 'muted'
  }>(),
  {
    message: null,
    showRetry: false,
    loading: false,
    variant: 'banner',
  },
)

const emit = defineEmits<{
  retry: []
}>()

const wrapperClass = computed(() => {
  if (props.variant === 'compact') {
    return 'flex items-center gap-2 text-sm text-red-600 dark:text-red-400'
  }
  if (props.variant === 'muted') {
    return 'flex items-center justify-center gap-3 py-4 text-sm text-text-muted'
  }
  return 'mb-4 flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300'
})

const buttonClass = computed(() => {
  if (props.variant === 'muted') {
    return 'text-secondary hover:bg-surface-muted'
  }
  if (props.variant === 'compact') {
    return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
  }
  return 'text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40'
})
</script>

