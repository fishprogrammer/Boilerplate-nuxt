<template>
  <div
    :class="embedded ? 'flex flex-col gap-2' : 'roles-grid-panel'"
    role="status"
    aria-busy="true"
    aria-label="در حال بارگذاری نقش‌ها"
  >
    <article v-for="row in count" :key="row" class="role-card overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/60 px-3 py-2.5">
        <div class="flex min-w-0 basis-full items-center gap-2 sm:basis-auto sm:flex-1">
          <span
            class="role-card-icon size-8 shrink-0 animate-pulse opacity-50"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1 space-y-1.5">
            <SkeletonBlock block-class="h-4 w-28 max-w-[70%]" />
            <SkeletonBlock block-class="h-3 w-40 max-w-[85%]" />
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <SkeletonBlock block-class="h-[1.375rem] w-[4.25rem] rounded-md" />
          <SkeletonBlock block-class="h-[1.375rem] w-[5rem] rounded-md" />
        </div>

        <div class="flex shrink-0 items-center gap-0.5">
          <SkeletonBlock
            v-for="action in 3"
            :key="action"
            block-class="size-7 rounded-lg"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2 bg-[var(--color-role-card-body)] px-3 py-2.5 md:flex-row md:items-center md:gap-2">
        <SkeletonBlock block-class="h-3 w-14 shrink-0" />
        <div class="flex min-w-0 flex-wrap items-center gap-1 md:flex-1">
          <SkeletonBlock
            v-for="(width, chip) in chipWidths.slice(0, chipCount)"
            :key="chip"
            :block-class="`h-6 ${width} rounded-md`"
          />
        </div>
      </div>
    </article>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'

withDefaults(
  defineProps<{
    count?: number
    embedded?: boolean
    chipCount?: number
  }>(),
  {
    count: 5,
    embedded: false,
    chipCount: 4,
  },
)

const chipWidths = ['w-14', 'w-20', 'w-16', 'w-24', 'w-12']
</script>

