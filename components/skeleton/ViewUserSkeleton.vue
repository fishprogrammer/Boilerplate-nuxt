<template>
  <div
    class="grid grid-cols-1 gap-4 md:grid-cols-3"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری جزئیات کاربر"
  >
    <div class="overflow-hidden rounded-xl border border-border bg-surface md:col-span-2">
      <div class="border-b border-border/50 px-4 py-3">
        <div class="flex items-center gap-2.5">
          <SkeletonBlock block-class="size-9 shrink-0 rounded-xl" />
          <div class="space-y-1.5">
            <SkeletonBlock block-class="h-4 w-24" />
            <SkeletonBlock block-class="h-3 w-28" />
          </div>
        </div>
      </div>

      <div class="divide-y divide-border/35">
        <div
          v-for="row in accountRows"
          :key="row"
          class="flex items-center justify-between gap-4 px-4 py-3.5"
        >
          <SkeletonBlock block-class="h-4 w-20 shrink-0" />
          <SkeletonBlock :block-class="`h-4 ${valueWidths[row - 1] ?? 'w-28'} max-w-[55%] shrink-0`" />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-surface">
        <div class="border-b border-border/50 px-4 py-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <SkeletonBlock block-class="size-9 shrink-0 rounded-xl" />
              <div class="space-y-1.5">
                <SkeletonBlock block-class="h-4 w-14" />
                <SkeletonBlock block-class="h-3 w-20" />
              </div>
            </div>
            <SkeletonBlock block-class="h-5 w-14 shrink-0 rounded-full" />
          </div>
        </div>

        <div class="flex flex-1 flex-col justify-between px-4 py-5">
          <div class="space-y-2">
            <SkeletonBlock block-class="h-3 w-16" />
            <SkeletonBlock block-class="h-8 w-36" />
          </div>
          <SkeletonBlock block-class="mt-5 h-10 w-full rounded-xl" />
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-border bg-surface">
        <div class="border-b border-border/50 px-4 py-3">
          <div class="flex items-center gap-2.5">
            <SkeletonBlock block-class="size-9 shrink-0 rounded-xl" />
            <div class="space-y-1.5">
              <SkeletonBlock block-class="h-4 w-24" />
              <SkeletonBlock block-class="h-3 w-28" />
            </div>
          </div>
        </div>

        <div class="space-y-3 p-4">
          <div
            v-for="row in accessRows"
            :key="row"
            class="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2.5"
          >
            <SkeletonBlock block-class="h-4 w-24" />
            <SkeletonBlock block-class="size-4 shrink-0 rounded" />
          </div>

          <div class="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2.5">
            <SkeletonBlock block-class="h-4 w-12" />
            <div class="flex flex-wrap justify-end gap-2">
              <SkeletonBlock
                v-for="chip in roleChips"
                :key="chip"
                block-class="h-5 w-14 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="md:col-span-3">
      <SkeletonBlock block-class="h-9 w-20 rounded-lg" />
    </div>

    <span class="sr-only">در حال بارگذاری اطلاعات کاربر...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    accountRows?: number
    accessRows?: number
    roleChips?: number
  }>(),
  {
    accountRows: 7,
    accessRows: 2,
    roleChips: 2,
  },
)

const valueWidths = ['w-32', 'w-20', 'w-24', 'w-28', 'w-40', 'w-12', 'w-24']
</script>
