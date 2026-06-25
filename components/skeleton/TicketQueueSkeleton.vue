<template>
  <div role="status" aria-busy="true" aria-label="در حال بارگذاری صف اپراتور">
    <div class="space-y-3">
      <article
        v-for="row in rows"
        :key="row"
        class="rounded-xl border border-border bg-surface-muted/30 p-4"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <SkeletonBlock block-class="h-5 w-14 rounded-md" />
              <SkeletonBlock block-class="h-3.5 w-20" />
            </div>

            <SkeletonBlock block-class="h-4 w-3/5 max-w-md" />

            <SkeletonBlock block-class="mt-1 h-3.5 w-32" />
            <SkeletonBlock block-class="mt-1 h-3 w-24" />
          </div>

          <div class="flex shrink-0 flex-wrap gap-2">
            <SkeletonBlock block-class="h-8 w-16 rounded-lg" />
            <SkeletonBlock block-class="h-8 w-14 rounded-lg" />
          </div>
        </div>
      </article>
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    rows?: number
  }>(),
  {
    rows: 8,
  },
)
</script>

