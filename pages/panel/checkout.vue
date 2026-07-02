<script setup lang="ts">
definePageMeta({
  name: 'panel-checkout',
  middleware: ['noindex', 'auth'],
})

const route = useRoute()

await navigateTo({ path: '/checkout', query: route.query }, { replace: true })
</script>

<template>
  <div />
</template>
