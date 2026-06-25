<template>
  <div
    class="space-y-6"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری جزئیات تیکت"
  >
    <div class="overflow-hidden rounded-xl border border-border bg-surface-muted/20">
      <div class="flex flex-wrap items-center gap-3 border-b border-border/60 bg-surface-muted/35 px-3 py-2">
        <SkeletonBlock block-class="h-5 w-14 rounded-md" />
        <SkeletonBlock block-class="h-5 w-12 rounded-md" />
        <SkeletonBlock block-class="h-5 w-16 rounded-md" />
        <SkeletonBlock block-class="mr-auto h-3.5 w-24" />
      </div>

      <div class="flex flex-nowrap items-start gap-4 overflow-x-auto p-3">
        <div v-for="field in metaFields" :key="field" class="min-w-[4.5rem] shrink-0 space-y-1">
          <SkeletonBlock block-class="h-2.5 w-10" />
          <SkeletonBlock :block-class="`h-3.5 ${field}`" />
        </div>
      </div>
    </div>

    <section>
      <SkeletonBlock block-class="mb-3 h-4 w-12" />
      <div class="space-y-3">
        <div
          v-for="index in messageCount"
          :key="index"
          class="flex"
          :class="index % 2 === 1 ? 'justify-start' : 'justify-end'"
        >
          <div class="max-w-[85%] space-y-2 rounded-2xl border border-border/40 bg-surface-muted/40 px-4 py-3">
            <SkeletonBlock block-class="h-3 w-28" />
            <SkeletonBlock block-class="h-3.5 w-full max-w-xs" />
            <SkeletonBlock block-class="h-3.5 w-4/5 max-w-[14rem]" />
          </div>
        </div>
      </div>
    </section>

    <div class="space-y-3 border-t border-border/50 pt-5">
      <SkeletonBlock block-class="h-4 w-10" />
      <SkeletonBlock block-class="h-24 w-full rounded-lg border border-border/40" />
      <SkeletonBlock block-class="h-8 w-32 rounded-lg" />
      <div class="flex flex-wrap items-center justify-end gap-2">
        <SkeletonBlock block-class="h-8 w-20 rounded-lg" />
        <SkeletonBlock block-class="h-8 w-24 rounded-lg" />
      </div>
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    messageCount?: number
  }>(),
  {
    messageCount: 3,
  },
)

const metaFields = ['w-14', 'w-16', 'w-12', 'w-14', 'w-20', 'w-24']
</script>

