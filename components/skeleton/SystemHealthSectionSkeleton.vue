<template>
  <div
    class="space-y-4"
    role="status"
    aria-busy="true"
    :aria-label="variant === 'full' ? 'در حال بررسی سلامت سرویس' : 'در حال بررسی probe'"
  >
    <SkeletonBlock
      v-if="variant === 'probe'"
      block-class="h-3 w-full max-w-md"
    />

    <div class="rounded-xl border border-border/40 bg-surface-muted/30 px-4 py-3 dark:bg-surface-hover/30">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0 flex-1 space-y-2">
          <SkeletonBlock block-class="h-4 w-48 max-w-full" />
          <SkeletonBlock block-class="h-3 w-32 max-w-[70%]" />
        </div>
        <div class="space-y-1.5 shrink-0">
          <SkeletonBlock block-class="h-3 w-24" />
          <SkeletonBlock block-class="h-3 w-28" />
        </div>
      </div>
    </div>

    <div
      class="grid grid-cols-1 gap-3"
      :class="variant === 'full' ? 'sm:grid-cols-2' : ''"
    >
      <article
        v-for="card in variant === 'full' ? 2 : 1"
        :key="card"
        class="rounded-xl border border-border/40 bg-surface-muted/30 p-4 dark:bg-surface-hover/30"
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <SkeletonBlock block-class="h-4 w-24" />
          <SkeletonBlock block-class="h-5 w-14 rounded-full" />
        </div>
        <SkeletonBlock block-class="h-3 w-20" />
        <SkeletonBlock block-class="mt-2 h-4 w-16" />
      </article>
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    variant?: 'full' | 'probe'
  }>(),
  {
    variant: 'full',
  },
)
</script>

