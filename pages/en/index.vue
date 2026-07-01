<template>
  <StoreHomePage locale="en" />
</template>

<script setup lang="ts">
import StoreHomePage from '~/components/store/StoreHomePage.vue'

definePageMeta({
  layout: 'public',
  public: true,
})
</script>
