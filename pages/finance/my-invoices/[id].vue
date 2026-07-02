<script setup lang="ts">
definePageMeta({
  name: 'my-sale-order-view',
  layout: 'dashboard',
})

const route = useRoute()
const id = String(route.params.id || '')

await navigateTo(
  id ? { name: 'panel-order-view', params: { id } } : { name: 'panel-orders' },
  { replace: true },
)
</script>

<template>
  <div />
</template>
