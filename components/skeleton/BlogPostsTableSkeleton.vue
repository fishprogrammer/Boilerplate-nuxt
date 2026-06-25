<template>
  <div
    class="w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری لیست پست‌ها"
  >
    <table class="w-full min-w-[720px] divide-y divide-border text-sm">
      <thead v-if="showHeader" class="bg-surface-muted">
        <tr>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">عنوان</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">وضعیت</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">ایجاد</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">انتشار</th>
          <th class="whitespace-nowrap px-4 py-3 text-center font-semibold text-text-primary">عملیات</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/60 bg-surface">
        <tr v-for="row in rows" :key="row">
          <td class="max-w-56 px-4 py-3">
            <SkeletonBlock block-class="h-4 w-40 max-w-full" />
            <SkeletonBlock block-class="mt-1.5 h-3 w-full max-w-[12rem]" />
          </td>
          <td class="whitespace-nowrap px-4 py-3">
            <SkeletonBlock block-class="h-5 w-16 rounded-md" />
          </td>
          <td class="whitespace-nowrap px-4 py-3">
            <SkeletonBlock block-class="h-4 w-24" />
          </td>
          <td class="whitespace-nowrap px-4 py-3">
            <SkeletonBlock block-class="h-4 w-24" />
          </td>
          <td class="whitespace-nowrap px-4 py-3">
            <div class="flex items-center justify-center gap-1">
              <SkeletonBlock block-class="size-8 rounded-lg" />
              <SkeletonBlock block-class="size-8 rounded-lg" />
              <SkeletonBlock block-class="size-8 rounded-lg" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <span class="sr-only">در حال بارگذاری...</span>
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
    rows: 10,
    showHeader: true,
  },
)
</script>

