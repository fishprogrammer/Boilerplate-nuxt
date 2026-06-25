<template>
  <div role="status" aria-busy="true" aria-label="در حال بارگذاری تراکنش‌ها">
    <div
      v-if="showCountBar"
      class="mb-4 rounded-xl border border-border bg-surface-muted px-4 py-3"
    >
      <SkeletonBlock block-class="h-4 w-20" />
    </div>

    <div class="w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border">
      <table class="w-full min-w-[760px] divide-y divide-border text-sm">
        <thead v-if="showHeader" class="bg-surface-muted">
          <tr>
            <th class="whitespace-nowrap px-4 py-3 text-right">
              <SkeletonBlock block-class="h-3 w-8" />
            </th>
            <th class="whitespace-nowrap px-4 py-3 text-right">
              <SkeletonBlock block-class="h-3 w-10" />
            </th>
            <th class="whitespace-nowrap px-4 py-3 text-right">
              <SkeletonBlock block-class="h-3 w-28" />
            </th>
            <th class="whitespace-nowrap px-4 py-3 text-right">
              <SkeletonBlock block-class="h-3 w-12" />
            </th>
            <th class="whitespace-nowrap px-4 py-3 text-right">
              <SkeletonBlock block-class="h-3 w-14" />
            </th>
            <th class="whitespace-nowrap px-4 py-3 text-right">
              <SkeletonBlock block-class="h-3 w-10" />
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/60 bg-surface">
          <tr v-for="row in rows" :key="row">
            <td class="whitespace-nowrap px-4 py-3">
              <SkeletonBlock block-class="h-4 w-16" />
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <SkeletonBlock block-class="h-4 w-24" />
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <SkeletonBlock block-class="h-4 w-28" />
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <SkeletonBlock block-class="h-5 w-14 rounded-md" />
            </td>
            <td class="px-4 py-3">
              <SkeletonBlock block-class="h-4 w-full max-w-[180px]" />
              <SkeletonBlock block-class="mt-1 h-3 w-24" />
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <SkeletonBlock block-class="h-4 w-28" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    rows?: number
    showHeader?: boolean
    showCountBar?: boolean
  }>(),
  {
    rows: 10,
    showHeader: true,
    showCountBar: true,
  },
)
</script>

