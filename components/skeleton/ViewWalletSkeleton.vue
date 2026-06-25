<template>
  <div
    class="space-y-6"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری جزئیات کیف پول"
  >
    <div class="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
      <div class="border-b border-border/60 bg-surface-muted/70 px-4 py-2.5">
        <SkeletonBlock block-class="h-3 w-24" />
      </div>
      <div class="grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-2">
        <div
          v-for="item in 4"
          :key="`info-${item}`"
          class="space-y-2 bg-surface px-4 py-3.5"
        >
          <SkeletonBlock block-class="h-3 w-16" />
          <SkeletonBlock block-class="h-4 w-32 max-w-full" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div
        v-for="panel in 2"
        :key="`panel-${panel}`"
        class="rounded-xl border border-border bg-surface-muted/20 p-4"
      >
        <div class="mb-4 flex items-center gap-2.5">
          <SkeletonBlock block-class="size-8 shrink-0 rounded-lg" />
          <SkeletonBlock block-class="h-4 w-12" />
        </div>
        <div class="flex flex-col gap-3">
          <SkeletonField
            v-for="field in 3"
            :key="`field-${panel}-${field}`"
            label-class="mb-1 h-3 w-16"
            :input-class="field === 2 ? 'h-16 w-full rounded-lg border border-border/40' : 'h-10 w-full rounded-lg border border-border/40'"
          />
          <SkeletonBlock block-class="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-border/60 bg-surface-muted/20 px-4 py-3">
      <SkeletonBlock block-class="h-4 w-24" />
      <SkeletonBlock block-class="mt-2 h-4 w-full max-w-md" />
      <SkeletonBlock block-class="mt-2 h-3 w-48" />
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import SkeletonField from '~/components/skeleton/SkeletonField.vue'
</script>
