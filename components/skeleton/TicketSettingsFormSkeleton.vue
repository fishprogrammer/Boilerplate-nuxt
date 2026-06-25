<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری تنظیمات تیکت"
  >
    <SkeletonField label-class="mb-1 h-3 w-28" />
    <SkeletonField label-class="mb-1 h-3 w-24" />
    <SkeletonField label-class="mb-1 h-3 w-24" />
    <SkeletonField label-class="mb-1 h-3 w-32" />

    <div class="flex items-center gap-2 sm:col-span-2">
      <SkeletonBlock block-class="size-4 shrink-0 rounded" />
      <SkeletonBlock block-class="h-4 w-36" />
    </div>

    <div class="sm:col-span-2">
      <SkeletonBlock block-class="h-3 w-48" />
    </div>

    <div class="sm:col-span-2">
      <SkeletonBlock block-class="h-10 w-32 rounded-xl" />
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import SkeletonField from '~/components/skeleton/SkeletonField.vue'
</script>

