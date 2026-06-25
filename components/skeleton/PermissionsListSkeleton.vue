<template>
  <div role="status" aria-busy="true" aria-label="در حال بارگذاری دسترسی‌ها">
    <div
      v-if="showCountBar"
      class="mb-4 rounded-xl border border-border bg-surface-muted px-4 py-3"
    >
      <SkeletonBlock block-class="h-4 w-32" />
    </div>

    <div class="space-y-4">
      <section
        v-for="group in groups"
        :key="group"
        class="overflow-hidden rounded-xl border border-border bg-surface"
      >
        <header class="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-surface-muted px-4 py-3">
          <div class="flex items-center gap-2">
            <SkeletonBlock block-class="size-8 shrink-0 rounded-lg" />
            <div class="space-y-1">
              <SkeletonBlock block-class="h-4 w-24" />
              <SkeletonBlock block-class="h-3 w-16" />
            </div>
          </div>
          <SkeletonBlock block-class="h-5 w-16 rounded-full" />
        </header>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] divide-y divide-border/60 text-sm">
            <thead class="bg-surface-muted/50">
              <tr>
                <th class="whitespace-nowrap px-4 py-2.5">
                  <SkeletonBlock block-class="h-3 w-10" />
                </th>
                <th class="whitespace-nowrap px-4 py-2.5">
                  <SkeletonBlock block-class="h-3 w-8" />
                </th>
                <th class="whitespace-nowrap px-4 py-2.5">
                  <SkeletonBlock block-class="h-3 w-16" />
                </th>
                <th class="whitespace-nowrap px-4 py-2.5">
                  <SkeletonBlock block-class="h-3 w-12" />
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/40">
              <tr v-for="row in rowsPerGroup" :key="`${group}-${row}`">
                <td class="whitespace-nowrap px-4 py-2.5">
                  <SkeletonBlock block-class="h-4 w-8" />
                </td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <SkeletonBlock block-class="h-5 w-14 rounded-md" />
                </td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <SkeletonBlock block-class="h-4 w-28" />
                </td>
                <td class="px-4 py-2.5">
                  <SkeletonBlock block-class="h-4 w-full max-w-xs" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    groups?: number
    rowsPerGroup?: number
    showCountBar?: boolean
  }>(),
  {
    groups: 3,
    rowsPerGroup: 4,
    showCountBar: true,
  },
)
</script>

