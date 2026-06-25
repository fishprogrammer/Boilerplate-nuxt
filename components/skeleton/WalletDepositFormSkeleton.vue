<template>
  <div class="space-y-5" role="status" aria-busy="true" aria-label="در حال بارگذاری فرم شارژ">
    <div class="rounded-xl border border-border bg-surface-muted/40 px-4 py-4">
      <SkeletonBlock block-class="h-3 w-20" />
      <SkeletonBlock block-class="mt-1 h-8 w-36" />
    </div>

    <div class="space-y-3">
      <SkeletonBlock block-class="h-4 w-20" />
      <div
        v-for="row in gatewayRows"
        :key="row"
        class="flex items-start gap-3 rounded-xl border border-border px-4 py-3"
      >
        <SkeletonBlock block-class="mt-1 size-4 shrink-0 rounded-full" />
        <div class="min-w-0 flex-1 space-y-1.5">
          <SkeletonBlock block-class="h-4 w-32" />
          <SkeletonBlock block-class="h-3 w-48 max-w-full" />
        </div>
      </div>
    </div>

    <div>
      <SkeletonBlock block-class="mb-1 h-3 w-24" />
      <SkeletonBlock block-class="h-11 w-full rounded-lg border border-border/40" />
      <SkeletonBlock block-class="mt-1 h-3 w-40" />
    </div>

    <SkeletonBlock block-class="h-10 w-full rounded-xl" />

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    gatewayRows?: number
  }>(),
  {
    gatewayRows: 2,
  },
)
</script>

