<template>
  <div
    :class="embedded ? 'space-y-5' : 'space-y-5'"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری تنظیمات سیستم"
  >
    <section
      v-for="(fieldCount, index) in sectionFieldCounts"
      :key="index"
      class="overflow-hidden rounded-xl border border-border bg-surface dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"
    >
      <header class="flex items-center justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3 dark:bg-surface-hover/55">
        <div class="flex min-w-0 items-center gap-3">
          <SkeletonBlock block-class="size-9 shrink-0 rounded-lg" />
          <div class="min-w-0 space-y-1.5">
            <SkeletonBlock block-class="h-4 w-28 max-w-[60vw]" />
            <SkeletonBlock block-class="h-3 w-40 max-w-[70vw]" />
          </div>
        </div>
        <SkeletonBlock block-class="size-8 shrink-0 rounded-lg" />
      </header>

      <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        <SkeletonField
          v-for="field in fieldCount"
          :key="field"
          :label-class="fieldLabelClasses[(index + field) % fieldLabelClasses.length]"
        />
      </div>

      <div
        v-if="index === 3"
        class="border-t border-border bg-surface-muted/60 px-4 py-4 dark:bg-surface-hover/35"
      >
        <SkeletonBlock block-class="mb-3 h-3 w-24" />
        <div class="flex flex-wrap gap-2">
          <SkeletonBlock
            v-for="chip in 5"
            :key="chip"
            block-class="h-6 w-12 rounded-full"
          />
        </div>
      </div>
    </section>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import SkeletonField from '~/components/skeleton/SkeletonField.vue'

withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

const sectionFieldCounts = [4, 6, 6, 3, 4]

const fieldLabelClasses = [
  'mb-1 h-3 w-16',
  'mb-1 h-3 w-24',
  'mb-1 h-3 w-28',
  'mb-1 h-3 w-20',
  'mb-1 h-3 w-32',
]
</script>

