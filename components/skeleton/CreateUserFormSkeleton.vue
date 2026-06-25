<template>
  <div
    class="grid grid-cols-1 gap-4 md:grid-cols-3"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری فرم ایجاد کاربر"
  >
    <!-- اطلاعات حساب -->
    <div class="space-y-3 rounded-xl border border-border bg-surface-muted p-4 md:col-span-2">
      <SkeletonBlock block-class="h-4 w-24" />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SkeletonField
          wrapper-class="sm:col-span-2"
          label-class="mb-1 h-3 w-14"
          input-class="h-10 w-full rounded border border-border/40"
        />

        <SkeletonField label-class="mb-1 h-3 w-8" />
        <SkeletonField label-class="mb-1 h-3 w-16" />

        <SkeletonField label-class="mb-1 h-3 w-16" />
        <SkeletonField label-class="mb-1 h-3 w-10" />

        <div>
          <SkeletonBlock block-class="mb-1 h-3 w-14" />
          <div class="relative">
            <SkeletonBlock block-class="h-10 w-full rounded border border-border/40" />
            <SkeletonBlock block-class="absolute inset-y-0 left-0 my-auto ml-3 size-5 rounded" />
          </div>
        </div>

        <SkeletonField label-class="mb-1 h-3 w-10" />

        <div>
          <SkeletonBlock block-class="mb-1 h-3 w-14" />
          <SkeletonBlock block-class="h-10 w-full rounded border border-border/40" />
        </div>
      </div>
    </div>

    <!-- دسترسی‌ها -->
    <div class="space-y-4 rounded-xl border border-border bg-surface-muted p-4">
      <SkeletonBlock block-class="h-4 w-20" />

      <SkeletonCheckboxRow label-class="h-4 w-16" />
      <SkeletonCheckboxRow label-class="h-4 w-24" />
      <SkeletonCheckboxRow label-class="h-4 w-28" />

      <div class="border-t border-border/60 pt-4">
        <SkeletonBlock block-class="mb-2 h-3 w-10" />
        <SkeletonBlock block-class="mb-3 h-3 w-32" />

        <div class="max-h-48 space-y-2 overflow-hidden pe-1">
          <SkeletonCheckboxRow v-for="i in roleRows" :key="i" label-class="h-4 w-20" />
        </div>
      </div>
    </div>

    <!-- دسترسی‌های مستقیم -->
    <div class="rounded-xl border border-border bg-surface-muted p-4 md:col-span-3">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-1">
          <SkeletonBlock block-class="h-4 w-28" />
          <SkeletonBlock block-class="h-3 w-40" />
        </div>
        <div class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <SkeletonBlock block-class="size-4 shrink-0 rounded" />
          <SkeletonBlock block-class="h-4 w-16" />
        </div>
      </div>

      <SkeletonBlock block-class="mb-4 h-10 w-full rounded-lg border border-border/40" />

      <div class="max-h-112 space-y-4 overflow-hidden pe-1">
        <section
          v-for="group in permissionGroups"
          :key="group"
          class="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <header class="flex items-center justify-between gap-2 border-b border-border/60 bg-surface-muted/60 px-3 py-2.5">
            <div class="space-y-1">
              <SkeletonBlock block-class="h-4 w-24" />
              <SkeletonBlock block-class="h-3 w-16" />
            </div>
            <SkeletonBlock block-class="h-3 w-14" />
          </header>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[420px] divide-y divide-border/60 text-sm">
              <thead class="bg-surface-muted/50">
                <tr>
                  <th class="w-10 px-3 py-2.5">
                    <SkeletonBlock block-class="mx-auto size-4 rounded" />
                  </th>
                  <th class="px-3 py-2.5">
                    <SkeletonBlock block-class="h-3 w-8" />
                  </th>
                  <th class="px-3 py-2.5">
                    <SkeletonBlock block-class="h-3 w-12" />
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/40">
                <tr v-for="row in permissionRows" :key="`${group}-${row}`">
                  <td class="px-3 py-2.5">
                    <SkeletonBlock block-class="size-4 rounded" />
                  </td>
                  <td class="px-3 py-2.5">
                    <SkeletonBlock block-class="h-5 w-14 rounded-md" />
                  </td>
                  <td class="px-3 py-2.5">
                    <SkeletonBlock block-class="h-4 w-full max-w-48" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 md:col-span-3">
      <SkeletonBlock block-class="h-9 w-28 rounded-lg" />
      <SkeletonBlock block-class="h-9 w-20 rounded-lg" />
    </div>

    <span class="sr-only">در حال بارگذاری نقش‌ها و دسترسی‌ها...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import SkeletonCheckboxRow from '~/components/skeleton/SkeletonCheckboxRow.vue'
import SkeletonField from '~/components/skeleton/SkeletonField.vue'

withDefaults(
  defineProps<{
    roleRows?: number
    permissionGroups?: number
    permissionRows?: number
  }>(),
  {
    roleRows: 4,
    permissionGroups: 2,
    permissionRows: 3,
  },
)
</script>

