<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-surface">
    <img
      :src="activeImage.url || '/logo.png'"
      :alt="activeImage.alt || name"
      class="aspect-16/10 w-full object-cover"
      width="800"
      height="500"
    />
    <div v-if="screenshots.length > 1" class="flex gap-2 overflow-x-auto p-3">
      <button
        v-for="(shot, index) in screenshots"
        :key="shot.id"
        type="button"
        class="shrink-0 overflow-hidden rounded-lg border-2 transition"
        :class="index === activeIndex ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'"
        @click="activeIndex = index"
      >
        <img
          :src="shot.thumbnail_url || shot.url || '/logo.png'"
          :alt="shot.alt || name"
          class="h-16 w-24 object-cover"
          width="96"
          height="64"
          loading="lazy"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaRef } from '~/types/catalog'

const props = defineProps<{
  screenshots: MediaRef[]
  name: string
}>()

const activeIndex = ref(0)

const activeImage = computed(() => props.screenshots[activeIndex.value] ?? { id: '', url: null, thumbnail_url: null, alt: props.name })
</script>
