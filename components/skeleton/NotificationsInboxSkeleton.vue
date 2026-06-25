<template>
  <div role="status" aria-busy="true" aria-label="در حال بارگذاری اعلانات">
    <div
      v-if="showCountBar"
      class="mb-4 rounded-xl border border-border bg-surface-muted px-4 py-3"
    >
      <SkeletonBlock block-class="h-4 w-20" />
    </div>

    <ul class="space-y-3">
      <li
        v-for="row in rows"
        :key="row"
        class="rounded-xl border border-border bg-surface p-4"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <SkeletonBlock block-class="size-2 shrink-0 rounded-full" />
              <SkeletonBlock block-class="h-4 w-40 max-w-full" />
              <SkeletonBlock block-class="h-5 w-14 rounded-full" />
              <SkeletonBlock block-class="h-5 w-16 rounded-full" />
            </div>

            <div class="space-y-1.5">
              <SkeletonBlock block-class="h-3.5 w-full max-w-xl" />
              <SkeletonBlock block-class="h-3.5 w-4/5 max-w-lg" />
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <SkeletonBlock block-class="h-3 w-24" />
              <SkeletonBlock block-class="h-3 w-20" />
            </div>
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <SkeletonBlock block-class="h-8 w-16 rounded-lg" />
            <SkeletonBlock block-class="h-8 w-14 rounded-lg" />
            <SkeletonBlock block-class="size-9 rounded-lg" />
          </div>
        </div>
      </li>
    </ul>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    rows?: number
    showCountBar?: boolean
  }>(),
  {
    rows: 8,
    showCountBar: true,
  },
)
</script>

