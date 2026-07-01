<script setup lang="ts">
const props = defineProps<{
  data: Record<string, unknown> | null | undefined
}>()

useHead(() => ({
  script: props.data
    ? [
        {
          key: 'seo-json-ld',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(props.data),
        },
      ]
    : [],
}))
</script>

<template>
  <span class="hidden" aria-hidden="true" />
</template>
