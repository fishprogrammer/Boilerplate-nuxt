<template>
  <div role="status" aria-busy="true" aria-label="در حال بارگذاری رسانه‌ها">
    <div
      v-if="showCountBar"
      class="mb-4 rounded-xl border border-border bg-surface-muted px-4 py-3"
    >
      <SkeletonBlock block-class="h-4 w-20" />
    </div>

    <div
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <article
        v-for="item in count"
        :key="item"
        class="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
      >
        <SkeletonBlock block-class="aspect-square w-full rounded-none" />
        <div class="space-y-1.5 border-t border-border/70 p-2.5">
          <SkeletonBlock block-class="h-3 w-full max-w-full" />
          <SkeletonBlock block-class="h-2.5 w-4/5" />
          <SkeletonBlock block-class="h-2.5 w-3/5" />
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
    count?: number
    showCountBar?: boolean
  }>(),
  {
    count: 12,
    showCountBar: true,
  },
)
</script>

