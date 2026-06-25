<template>
  <div
    class="space-y-5"
    role="status"
    aria-busy="true"
    :aria-label="ariaLabel"
  >
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="sm:col-span-2">
        <SkeletonField
          label-class="mb-1 h-3 w-10"
          input-class="h-10 w-full rounded-lg border border-border/40"
        />
      </div>
      <div>
        <SkeletonField
          label-class="mb-1 h-3 w-12"
          input-class="h-10 w-full rounded-lg border border-border/40"
        />
      </div>
    </div>

    <div>
      <SkeletonField
        label-class="mb-1 h-3 w-10"
        input-class="h-10 w-full rounded-lg border border-border/40"
      />
      <SkeletonBlock block-class="mt-1 h-3 w-56 max-w-full" />
    </div>

    <div>
      <SkeletonBlock block-class="mb-1 h-3 w-8" />
      <div class="overflow-hidden rounded-lg border border-border/40">
        <div class="flex flex-wrap gap-2 border-b border-border/40 bg-surface-muted/50 px-3 py-2">
          <SkeletonBlock
            v-for="tool in toolbarButtons"
            :key="tool"
            block-class="size-8 rounded"
          />
        </div>
        <div class="space-y-2 p-4">
          <SkeletonBlock
            v-for="(line, index) in editorLines"
            :key="index"
            :block-class="`h-4 ${line}`"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <SkeletonBlock block-class="h-9 w-28 rounded-lg" />
      <SkeletonBlock block-class="h-9 w-16 rounded-lg" />
    </div>

    <span class="sr-only">در حال بارگذاری...</span>
  </div>
</template>

<script setup lang="ts">
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import SkeletonField from '~/components/skeleton/SkeletonField.vue'

withDefaults(
  defineProps<{
    ariaLabel?: string
    toolbarButtons?: number
  }>(),
  {
    ariaLabel: 'در حال بارگذاری فرم پست',
    toolbarButtons: 6,
  },
)

const editorLines = ['w-full', 'w-5/6', 'w-4/6', 'w-full', 'w-3/4']
</script>

