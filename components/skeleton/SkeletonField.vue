<template>
  <div :class="wrapperClass">
    <SkeletonBlock :block-class="labelClass" />
    <SkeletonBlock :block-class="inputClass" />
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    wrapperClass?: string
    labelClass?: string
    inputClass?: string
  }>(),
  {
    wrapperClass: '',
    labelClass: 'mb-1 h-3 w-16',
    inputClass: 'h-10 w-full rounded border border-border/40',
  },
)
</script>

