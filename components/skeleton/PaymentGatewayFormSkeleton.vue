<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری فرم درگاه پرداخت"
  >
    <div class="sm:col-span-2">
      <SkeletonField
        label-class="mb-1 h-3 w-14"
        input-class="h-10 w-full rounded-lg border border-border/40"
      />
    </div>

    <div class="sm:col-span-2">
      <SkeletonField
        label-class="mb-1 h-3 w-10"
        input-class="h-10 w-full rounded-lg border border-border/40"
      />
    </div>

    <SkeletonField label-class="mb-1 h-3 w-24" />
    <SkeletonField label-class="mb-1 h-3 w-28" />

    <SkeletonField label-class="mb-1 h-3 w-20" />
    <div class="flex flex-col justify-end gap-2">
      <div class="flex items-center gap-2">
        <SkeletonBlock block-class="size-4 shrink-0 rounded" />
        <SkeletonBlock block-class="h-4 w-10" />
      </div>
      <div class="flex items-center gap-2">
        <SkeletonBlock block-class="size-4 shrink-0 rounded" />
        <SkeletonBlock block-class="h-4 w-24" />
      </div>
    </div>

    <div class="space-y-3 rounded-xl border border-border/40 p-4 sm:col-span-2">
      <SkeletonBlock block-class="h-4 w-36" />
      <SkeletonField
        v-for="index in credentialFields"
        :key="index"
        label-class="mb-1 h-3 w-24"
        input-class="h-10 w-full rounded-lg border border-border/40"
      />
    </div>

    <div class="sm:col-span-2">
      <SkeletonBlock block-class="h-10 w-32 rounded-xl" />
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import SkeletonField from '~/components/skeleton/SkeletonField.vue'

withDefaults(
  defineProps<{
    credentialFields?: number
  }>(),
  {
    credentialFields: 2,
  },
)
</script>
