<template>
  <div
    class="animate-pulse rounded-md bg-surface-muted dark:bg-surface-hover/70"
    :class="blockClass"
  />
</template>

<script setup lang="ts">
defineProps<{
  blockClass?: string
}>()
</script>

