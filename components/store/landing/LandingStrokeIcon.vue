<template>
  <div
    class="flex shrink-0 items-center justify-center"
    :class="[containerClass, iconBg]"
  >
    <svg
      :class="[svgClass, iconColor]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        :d="path"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  path: string
  iconBg: string
  iconColor: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const containerClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'size-8 rounded-lg md:size-9'
    case 'lg':
      return 'size-12 rounded-2xl lg:size-16 lg:rounded-3xl'
    default:
      return 'size-16 rounded-2xl lg:size-20 lg:rounded-3xl'
  }
})

const svgClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'size-4'
    case 'lg':
      return 'size-6 lg:size-8'
    default:
      return 'size-7 lg:size-9'
  }
})
</script>
