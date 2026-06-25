<template>
  <div
    class="users-table-scroll w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری لیست کاربران"
  >
    <table class="w-full min-w-[960px] divide-y divide-border text-sm">
      <thead v-if="showHeader" class="bg-surface-muted">
        <tr>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">#</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">نام کاربری</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">نام</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">نام خانوادگی</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">ایمیل</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">تلفن</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">نقش</th>
          <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">موجودی</th>
          <th class="whitespace-nowrap px-4 py-3 text-center font-semibold text-text-primary">عملیات</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border/60 bg-surface">
        <tr v-for="row in rows" :key="row">
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-8" />
          </td>
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-24" />
          </td>
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-16" />
          </td>
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-20" />
          </td>
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-36" />
          </td>
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-28" />
          </td>
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-14" />
          </td>
          <td class="px-4 py-3">
            <SkeletonBlock block-class="h-4 w-24" />
          </td>
          <td class="px-4 py-3">
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

