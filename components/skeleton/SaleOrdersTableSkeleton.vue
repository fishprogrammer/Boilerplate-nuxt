<template>
  <div class="overflow-x-auto rounded-xl border border-border" role="status" aria-busy="true" aria-label="در حال بارگذاری فاکتورها">
    <table class="w-full min-w-[720px] divide-y divide-border text-sm">
      <thead class="bg-surface-muted">
        <tr>
          <th class="px-4 py-3"><SkeletonBlock block-class="mx-auto h-4 w-20" /></th>
          <th class="px-4 py-3"><SkeletonBlock block-class="mx-auto h-4 w-16" /></th>
          <th class="px-4 py-3"><SkeletonBlock block-class="mx-auto h-4 w-24" /></th>
          <th class="px-4 py-3"><SkeletonBlock block-class="mx-auto h-4 w-16" /></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/60 bg-surface">
        <tr v-for="row in rows" :key="row">
          <td class="px-4 py-3"><SkeletonBlock block-class="h-4 w-28" /></td>
          <td class="px-4 py-3"><SkeletonBlock block-class="mx-auto h-5 w-20 rounded-md" /></td>
          <td class="px-4 py-3"><SkeletonBlock block-class="mx-auto h-4 w-24" /></td>
          <td class="px-4 py-3"><SkeletonBlock block-class="mx-auto h-4 w-20" /></td>
        </tr>
      </tbody>
    </table>
    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(defineProps<{ rows?: number }>(), { rows: 8 })
</script>
