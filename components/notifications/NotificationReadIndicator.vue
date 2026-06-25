<template>
  <span
    class="inline-flex shrink-0 items-center"
    :class="isRead ? 'text-teal-600 dark:text-teal-400' : 'text-secondary'"
    :title="isRead ? 'خوانده‌شده' : 'خوانده‌نشده'"
    :aria-label="isRead ? 'خوانده‌شده' : 'خوانده‌نشده'"
  >
    <svg class="size-[1.125rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.25"
        :d="isRead ? 'M4.5 12.5L8 16l11.5-11.5' : 'M5 13l4 4L19 7'"
      />
      <path
        v-if="isRead"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.25"
        d="M9 12.5L12.5 16l11.5-11.5"
      />
    </svg>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  isRead: boolean
}>()
</script>

