<template>
  <div class="min-h-screen bg-app-bg text-text-primary" :dir="dir">
    <header class="border-b border-border bg-surface">
      <div class="page-shell flex items-center justify-between gap-4 py-4">
        <NuxtLink :to="localePath(locale, '/')" class="text-lg font-bold text-primary">
          {{ appName }}
        </NuxtLink>
        <nav class="flex flex-wrap items-center gap-4 text-sm">
          <NuxtLink :to="localePath(locale, '/shop')" class="hover:text-primary">{{ t.shop }}</NuxtLink>
          <NuxtLink :to="localePath(locale, '/blog')" class="hover:text-primary">{{ t.blog }}</NuxtLink>
          <NuxtLink :to="localeSwitchUrl" class="hover:text-primary">{{ t.switchLocale }}</NuxtLink>
          <NuxtLink :to="panelUrl" class="rounded-xl bg-primary px-3 py-1.5 text-white hover:opacity-90">
            {{ t.panel }}
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main>
      <slot />
    </main>
    <footer class="mt-12 border-t border-border bg-surface">
      <div class="page-shell py-8 text-sm text-text-secondary">
        <p>{{ appDescription }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { appConfig } from '~/config/app'
import { localeDir } from '~/utils/locale'
import { localePath, switchLocalePath } from '~/utils/locale-path'

const route = useRoute()
const locale = useAppLocale()
const dir = computed(() => localeDir(locale.value))

const appName = appConfig.name
const appDescription = appConfig.description || (locale.value === 'fa' ? 'فروشگاه نرم‌افزار' : 'Software store')

const localeSwitchUrl = computed(() => switchLocalePath(route.path, locale.value === 'fa' ? 'en' : 'fa'))

const panelUrl = '/panel'

const copy = {
  fa: { shop: 'فروشگاه', blog: 'وبلاگ', panel: 'پنل کاربری', switchLocale: 'English' },
  en: { shop: 'Shop', blog: 'Blog', panel: 'Customer panel', switchLocale: 'فارسی' },
} as const

const t = computed(() => copy[locale.value])
</script>
