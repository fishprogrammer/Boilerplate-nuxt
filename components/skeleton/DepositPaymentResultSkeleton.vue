<template>
  <div class="space-y-5" role="status" aria-busy="true" aria-label="در حال بررسی وضعیت پرداخت">
    <div class="rounded-xl border border-border/60 bg-surface-muted/30 px-4 py-5">
      <SkeletonBlock block-class="h-4 w-40" />
      <SkeletonBlock block-class="mt-2 h-3 w-56" />
    </div>

    <div class="grid grid-cols-1 gap-3 rounded-xl border border-border/40 px-4 py-4 sm:grid-cols-2">
      <div v-for="item in 4" :key="item" class="space-y-2">
        <SkeletonBlock block-class="h-3 w-16" />
        <SkeletonBlock block-class="h-4 w-32 max-w-full" />
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <SkeletonBlock block-class="h-10 w-32 rounded-xl" />
      <SkeletonBlock block-class="h-9 w-24 rounded-md" />
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
</script>
