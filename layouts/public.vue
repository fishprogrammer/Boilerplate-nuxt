<template>
  <PublicShell :locale="locale">
    <slot />
  </PublicShell>
</template>

<script setup lang="ts">
import PublicShell from '~/components/store/layout/PublicShell.vue'
import type { AppLocale } from '~/utils/locale'
import { localeDir } from '~/utils/locale'

const locale = useAppLocale()
const dir = computed(() => localeDir(locale.value))

useHead({
  htmlAttrs: {
    dir: () => dir.value,
  },
})
</script>
