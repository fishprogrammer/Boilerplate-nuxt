<template>
  <StoreHomePage locale="fa" />
</template>

<script setup lang="ts">
import StoreHomePage from '~/components/store/StoreHomePage.vue'

definePageMeta({
  name: 'StoreHome',
  layout: 'public',
  public: true,
})
</script>
