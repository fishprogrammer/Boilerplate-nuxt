<template>
  <div class="rounded-xl border border-border bg-surface p-4">
    <svg :viewBox="`0 0 ${width} ${height}`" class="h-56 w-full" role="img" aria-label="نمودار MRR">
      <polyline
        :points="polylinePoints"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="text-primary"
      />
      <g v-for="(point, index) in scaledPoints" :key="point.month">
        <circle :cx="point.x" :cy="point.y" r="3" class="fill-primary" />
        <text
          v-if="index === 0 || index === scaledPoints.length - 1 || index % labelStep === 0"
          :x="point.x"
          :y="height - 4"
          text-anchor="middle"
          class="fill-text-muted text-[10px]"
        >
          {{ point.month }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import type { MrrDataPoint } from '~/types/finance'

const props = defineProps<{ points: MrrDataPoint[] }>()

const width = 640
const height = 200
const padding = { top: 16, right: 16, bottom: 28, left: 16 }

const scaledPoints = computed(() => {
  const items = props.points
  if (!items.length) return []
  const values = items.map((p) => p.mrr)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  return items.map((point, index) => ({
    month: point.month,
    x: padding.left + (index / Math.max(items.length - 1, 1)) * innerW,
    y: padding.top + innerH - ((point.mrr - min) / range) * innerH,
  }))
})

const polylinePoints = computed(() => scaledPoints.value.map((p) => `${p.x},${p.y}`).join(' '))

const labelStep = computed(() => Math.max(1, Math.ceil(props.points.length / 6)))
</script>
