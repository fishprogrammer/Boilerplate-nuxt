<template>
  <div
    class="mb-6 overflow-hidden rounded-xl border border-border bg-surface-muted/40"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری موجودی کیف پول"
  >
    <div class="border-b border-border/60 bg-surface-muted/70 px-4 py-2.5">
      <SkeletonBlock block-class="h-3 w-20" />
    </div>
    <div class="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-2">
        <SkeletonBlock block-class="h-9 w-40 max-w-full" />
        <SkeletonBlock block-class="h-3 w-36" />
      </div>
      <SkeletonBlock block-class="h-6 w-14 shrink-0 rounded-full self-start" />
    </div>
    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
</script>

