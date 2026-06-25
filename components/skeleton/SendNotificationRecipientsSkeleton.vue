<template>
  <div
    class="max-h-72 overflow-hidden rounded-xl border border-border bg-surface"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری گیرندگان"
  >
    <table class="w-full divide-y divide-border/60 text-sm">
      <thead v-if="showHeader" class="sticky top-0 z-20 bg-surface-muted">
        <tr>
          <th class="w-10 px-3 py-2.5">
            <SkeletonBlock block-class="mx-auto size-4 rounded" />
          </th>
          <th class="whitespace-nowrap px-3 py-2.5 text-right">
            <SkeletonBlock block-class="h-3 w-16" />
          </th>
          <th class="whitespace-nowrap px-3 py-2.5 text-right">
            <SkeletonBlock block-class="h-3 w-8" />
          </th>
          <th class="whitespace-nowrap px-3 py-2.5 text-right">
            <SkeletonBlock block-class="h-3 w-10" />
          </th>
          <th class="whitespace-nowrap px-3 py-2.5 text-right">
            <SkeletonBlock block-class="h-3 w-10" />
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/40">
        <tr v-for="row in rows" :key="row">
          <td class="px-3 py-2.5">
            <SkeletonBlock block-class="size-4 rounded" />
          </td>
          <td class="px-3 py-2.5">
            <SkeletonBlock block-class="h-4 w-24" />
          </td>
          <td class="px-3 py-2.5">
            <SkeletonBlock block-class="h-4 w-20" />
          </td>
          <td class="px-3 py-2.5">
            <SkeletonBlock block-class="h-4 w-32" />
          </td>
          <td class="px-3 py-2.5">
            <SkeletonBlock block-class="h-4 w-28" />
          </td>
        </tr>
      </tbody>
    </table>
    <span class="sr-only">در حال بارگذاری گیرندگان...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    rows?: number
    showHeader?: boolean
  }>(),
  {
    rows: 8,
    showHeader: true,
  },
)
</script>

