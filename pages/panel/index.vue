<template>
  <HomeDashboard />
</template>

<script setup lang="ts">
import HomeDashboard from '~/components/dashboard/HomeDashboard.vue'

definePageMeta({
  name: 'Index',
  layout: 'dashboard',
})
</script>
