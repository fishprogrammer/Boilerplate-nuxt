<template>
  <div class="space-y-2" role="status" aria-busy="true" aria-label="در حال بارگذاری درگاه‌ها">
    <article
      v-for="row in count"
      :key="row"
      class="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="space-y-1.5">
        <SkeletonBlock block-class="h-4 w-32" />
        <SkeletonBlock block-class="h-3 w-24" />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <SkeletonBlock block-class="h-3 w-10" />
        <SkeletonBlock block-class="h-8 w-16 rounded-lg" />
        <SkeletonBlock block-class="h-8 w-14 rounded-lg" />
        <SkeletonBlock block-class="h-3 w-8" />
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
    count: 5,
  },
)
</script>

