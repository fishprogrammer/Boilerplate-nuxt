<template>
  <div role="status" aria-busy="true" aria-label="در حال بارگذاری تیکت‌ها">
    <div class="space-y-2.5">
      <article
        v-for="row in rows"
        :key="row"
        class="relative overflow-hidden rounded-xl border border-border bg-surface"
      >
        <SkeletonBlock block-class="absolute inset-y-0 right-0 w-1 rounded-none" />

        <div class="flex items-center gap-3 p-3.5 pl-4 sm:p-4">
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div class="flex flex-wrap items-center gap-1.5">
                <SkeletonBlock block-class="h-5 w-14 rounded-md" />
                <SkeletonBlock block-class="h-5 w-12 rounded-md" />
                <SkeletonBlock block-class="h-5 w-16 rounded-md" />
              </div>
              <SkeletonBlock block-class="h-3.5 w-16 shrink-0" />
            </div>

            <SkeletonBlock block-class="h-4 w-3/5 max-w-md" />

            <div class="mt-1 space-y-1.5">
              <SkeletonBlock block-class="h-3.5 w-full max-w-xl" />
              <SkeletonBlock block-class="h-3.5 w-4/5 max-w-lg" />
            </div>

            <div class="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/50 pt-2">
              <SkeletonBlock block-class="h-3 w-20" />
              <SkeletonBlock block-class="h-3 w-24" />
              <SkeletonBlock block-class="h-3 w-16" />
            </div>
          </div>

          <SkeletonBlock block-class="size-4 shrink-0 rounded sm:size-5" />
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

