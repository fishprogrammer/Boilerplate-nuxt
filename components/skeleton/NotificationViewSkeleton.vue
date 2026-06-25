<template>
  <div
    class="space-y-5"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری جزئیات اعلان"
  >
    <div class="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
      <div class="border-b border-border/60 bg-surface-muted/70 px-4 py-2.5">
        <SkeletonBlock block-class="h-3.5 w-24" />
      </div>
      <div class="grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="field in infoFields"
          :key="field"
          class="flex items-start gap-3 bg-surface px-4 py-3.5"
        >
          <SkeletonBlock block-class="size-9 shrink-0 rounded-lg" />
          <div class="min-w-0 flex-1 space-y-2">
            <SkeletonBlock block-class="h-3 w-16" />
            <SkeletonBlock :block-class="`h-4 ${field}`" />
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-border bg-surface">
      <div class="flex flex-col gap-2 border-b border-border/60 bg-surface-muted/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <SkeletonBlock block-class="h-3.5 w-16" />
        <div class="flex flex-wrap items-center gap-2">
          <SkeletonBlock
            v-for="badge in badgeCount"
            :key="badge"
            block-class="h-5 w-16 rounded-full"
          />
        </div>
      </div>
      <div class="p-4 md:p-5">
        <SkeletonBlock block-class="h-6 w-2/3 max-w-md" />
        <div class="mt-4 space-y-2">
          <SkeletonBlock
            v-for="(line, index) in bodyLineWidths.slice(0, bodyLines)"
            :key="index"
            :block-class="`h-3.5 ${line}`"
          />
        </div>
      </div>
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    badgeCount?: number
    bodyLines?: number
  }>(),
  {
    badgeCount: 3,
    bodyLines: 4,
  },
)

const infoFields = ['w-28', 'w-24', 'w-32', 'w-36']
const bodyLineWidths = ['w-full', 'w-full', 'w-4/5', 'w-3/5']
</script>

