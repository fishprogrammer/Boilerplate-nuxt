<template>
  <div class="rounded-xl border border-border bg-surface p-4">
    <svg :viewBox="`0 0 ${width} ${height}`" class="h-56 w-full" role="img" aria-label="GSC analytics chart">
      <polyline
        :points="clicksPoints"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="text-primary"
      />
      <polyline
        :points="impressionsPoints"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-dasharray="4 3"
        class="text-text-muted opacity-70"
      />
      <g v-for="(point, index) in scaledPoints" :key="point.date">
        <text
          v-if="index === 0 || index === scaledPoints.length - 1 || index % labelStep === 0"
          :x="point.x"
          :y="height - 4"
          text-anchor="middle"
          class="fill-text-muted text-[9px] dir-ltr"
        >
          {{ point.date }}
        </text>
      </g>
    </svg>
    <p class="mt-2 text-xs text-text-muted">
      <span class="text-primary">—</span> کلیک
      <span class="mr-3 text-text-muted">- -</span> نمایش
    </p>
  </div>
</template>

<script setup lang="ts">
import type { GscAnalyticsRow } from '~/types/seo-admin'

const props = defineProps<{ rows: GscAnalyticsRow[] }>()

const width = 640
const height = 200
const padding = { top: 16, right: 16, bottom: 28, left: 16 }

const scaledPoints = computed(() => {
  const items = props.rows
  if (!items.length) return []
  const maxClicks = Math.max(...items.map((r) => r.clicks), 1)
  const maxImpressions = Math.max(...items.map((r) => r.impressions), 1)
  const max = Math.max(maxClicks, maxImpressions)
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  return items.map((row, index) => ({
    date: row.date,
    x: padding.left + (index / Math.max(items.length - 1, 1)) * innerW,
    clicksY: padding.top + innerH - (row.clicks / max) * innerH,
    impressionsY: padding.top + innerH - (row.impressions / max) * innerH,
  }))
})

const clicksPoints = computed(() =>
  scaledPoints.value.map((p) => `${p.x},${p.clicksY}`).join(' '),
)
const impressionsPoints = computed(() =>
  scaledPoints.value.map((p) => `${p.x},${p.impressionsY}`).join(' '),
)
const labelStep = computed(() => Math.max(1, Math.ceil(props.rows.length / 6)))
</script>
