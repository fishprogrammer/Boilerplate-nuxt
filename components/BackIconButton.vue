<template>
  <span v-tooltip="title ?? label" class="back-icon-button inline-flex shrink-0">
    <button
      type="button"
      :class="resolvedClass"
      :aria-label="label"
      @click="onClick"
    >
      <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouterBack } from '~/composables/useRouterBack'

const props = withDefaults(
  defineProps<{
    label?: string
    title?: string
    buttonClass?: string
  }>(),
  {
    label: 'بازگشت',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { goBack } = useRouterBack()

const defaultClass =
  'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30'

const resolvedClass = computed(() => props.buttonClass || defaultClass)

function onClick(event: MouseEvent) {
  emit('click', event)
  if (!event.defaultPrevented) {
    goBack(event)
  }
}
</script>
