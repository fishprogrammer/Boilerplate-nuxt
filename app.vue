<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToast />
  <ConfirmDialog />
  <PwaUpdateBanner v-if="isProd" />
</template>

<script setup lang="ts">
import AppToast from '~/components/AppToast.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import PwaUpdateBanner from '~/components/PwaUpdateBanner.vue'
import { useTheme } from '~/composables/useTheme'

const isProd = import.meta.env.PROD

useTheme()
</script>
