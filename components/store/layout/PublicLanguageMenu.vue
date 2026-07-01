<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-emerald-50 hover:text-primary"
      :aria-expanded="open"
      :aria-label="t.ariaLabel"
      @click.stop="open = !open"
    >
      <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    </button>

    <div
      v-show="open"
      class="absolute left-0 top-full z-50 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10 xl:left-auto xl:right-0"
    >
      <NuxtLink
        v-for="option in options"
        :key="option.locale"
        :to="switchTarget(option.locale)"
        class="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition"
        :class="locale === option.locale
          ? 'bg-emerald-50 font-semibold text-primary'
          : 'text-slate-700 hover:bg-slate-100'"
        @click="open = false"
      >
        <span>{{ option.label }}</span>
        <svg
          v-if="locale === option.locale"
          class="size-4 shrink-0 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AppLocale } from '~/utils/locale'
import { switchLocalePath } from '~/utils/locale-path'

const props = defineProps<{
  locale: AppLocale
}>()

const route = useRoute()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const copy = {
  fa: { ariaLabel: 'انتخاب زبان' },
  en: { ariaLabel: 'Select language' },
} as const

const t = computed(() => copy[props.locale])

const options = [
  { locale: 'fa' as AppLocale, label: 'فارسی' },
  { locale: 'en' as AppLocale, label: 'English' },
] as const

function switchTarget(targetLocale: AppLocale) {
  const path = switchLocalePath(route.path, targetLocale)
  return Object.keys(route.query).length ? { path, query: route.query } : path
}

function handleDocumentClick(event: MouseEvent) {
  if (!open.value) return
  if (rootRef.value?.contains(event.target as Node)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
