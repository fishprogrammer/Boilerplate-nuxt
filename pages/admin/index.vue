<script setup lang="ts">
definePageMeta({
  name: 'admin-index',
  middleware: ['noindex', 'staff'],
  layout: 'dashboard',
})

await navigateTo({ name: 'catalog-products' }, { replace: true })
</script>

<template>
  <div />
</template>
