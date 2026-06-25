<template>
  <div
    class="space-y-4"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری دپارتمان‌ها"
  >
    <article
      v-for="row in count"
      :key="row"
      class="rounded-xl border border-border p-4"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <SkeletonBlock block-class="h-4 w-28" />
            <SkeletonBlock block-class="h-5 w-12 rounded-md" />
          </div>
          <SkeletonBlock block-class="mt-0.5 h-3 w-24" />
          <SkeletonBlock block-class="mt-1 h-3.5 w-full max-w-sm" />
        </div>

        <SkeletonBlock block-class="size-8 shrink-0 rounded-lg" />
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          v-for="panel in 2"
          :key="panel"
          class="rounded-lg border border-border/70 bg-surface-muted/30 p-3"
        >
          <SkeletonBlock block-class="mb-1 h-3 w-36" />
          <SkeletonBlock block-class="mb-2 h-3 w-28" />
          <SkeletonBlock block-class="h-10 w-full rounded-lg border border-border/40" />
          <SkeletonBlock block-class="mt-3 h-8 w-24 rounded-lg" />
        </div>
      </div>
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
    count: 3,
  },
)
</script>

