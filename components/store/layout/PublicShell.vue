<template>
  <div class="min-h-screen bg-white text-slate-900" :dir="dir">
    <PublicHeader :locale="locale" />
    <main>
      <slot />
    </main>
    <PublicFooter :locale="locale" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PublicFooter from '~/components/store/layout/PublicFooter.vue'
import PublicHeader from '~/components/store/layout/PublicHeader.vue'
import { localeDir } from '~/utils/locale'
import type { AppLocale } from '~/utils/locale'

const props = defineProps<{
  locale: AppLocale
}>()

const dir = computed(() => localeDir(props.locale))
</script>
