<template>
  <script
    v-if="data"
    type="application/ld+json"
    v-html="serialized"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  data: Record<string, unknown> | null | undefined
}>()

const serialized = computed(() => (props.data ? JSON.stringify(props.data) : ''))
</script>
