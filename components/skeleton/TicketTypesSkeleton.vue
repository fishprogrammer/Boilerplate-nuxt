<template>
  <div
    class="grid grid-cols-1 gap-2 sm:grid-cols-2"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری موضوعات تیکت"
  >
    <article
      v-for="row in count"
      :key="row"
      class="flex items-start justify-between gap-2 rounded-xl border border-border bg-surface-muted/15 p-3"
    >
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <SkeletonBlock block-class="h-4 w-24" />
          <SkeletonBlock block-class="h-5 w-12 rounded-md" />
        </div>
        <SkeletonBlock block-class="mt-0.5 h-3 w-20" />
        <SkeletonBlock block-class="mt-1 h-3 w-full max-w-xs" />
      </div>

      <SkeletonBlock block-class="size-8 shrink-0 rounded-lg" />
    </article>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    count?: number
  }>(),
  {
    count: 6,
  },
)
</script>

