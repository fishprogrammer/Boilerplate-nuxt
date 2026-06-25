<template>
  <div class="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
    <SkeletonBlock :block-class="labelClass" />
    <SkeletonBlock block-class="size-4 shrink-0 rounded" />
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    labelClass?: string
  }>(),
  {
    labelClass: 'h-4 w-24',
  },
)
</script>

