<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToast />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import AppToast from '~/components/AppToast.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import { useTheme } from '~/composables/useTheme'

useTheme()
</script>
