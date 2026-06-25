<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1"
    :class="chipClass"
  >
    <span
      class="inline-flex size-5 shrink-0 items-center justify-center rounded-md"
      :class="iconWrapClass"
      aria-hidden="true"
    >
      <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="iconPath"
        />
      </svg>
    </span>
    <span class="flex items-center gap-1 text-[0.6875rem] leading-none">
      <span class="text-text-muted">{{ fieldLabel }}</span>
      <span class="font-semibold">{{ displayValue }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  formatNotificationPriority,
  formatNotificationType,
  getNotificationPriorityClass,
  getNotificationTypeClass,
} from '~/utils/inbox'

const props = defineProps<{
  kind: 'type' | 'priority'
  value: string
  label?: string
}>()

const fieldLabel = computed(() => (props.kind === 'type' ? 'نوع' : 'اولویت'))

const displayValue = computed(() =>
  props.kind === 'type'
    ? formatNotificationType(props.value, props.label)
    : formatNotificationPriority(props.value, props.label),
)

const chipClass = computed(() =>
  props.kind === 'type'
    ? getNotificationTypeClass(props.value)
    : getNotificationPriorityClass(props.value),
)

const iconWrapClass = computed(() =>
  props.kind === 'type' ? 'bg-surface/80' : 'bg-surface/80',
)

const TYPE_ICON_PATHS: Record<string, string> = {
  system: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  alert: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  promotion: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
}

const PRIORITY_ICON_PATHS: Record<string, string> = {
  low: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  medium: 'M5 12h14',
  high: 'M5 10l7-7m0 0l7 7m-7-7v18',
  critical: 'M13 10V3L4 14h7v7l9-11h-7z',
}

const iconPath = computed(() => {
  if (props.kind === 'type') {
    return TYPE_ICON_PATHS[props.value] || TYPE_ICON_PATHS.info
  }
  return PRIORITY_ICON_PATHS[props.value] || PRIORITY_ICON_PATHS.medium
})
</script>

