<template>

  <header class="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl">

    <div class="store-container">

      <div class="flex h-20 items-center justify-between gap-4">

        <div class="flex min-w-0 items-center gap-6 xl:gap-10">

          <button

            type="button"

            class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition xl:hidden"

            :aria-expanded="mobileOpen"

            aria-label="منو"

            @click="mobileOpen = !mobileOpen"

          >

            <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">

              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />

            </svg>

          </button>



          <NuxtLink :to="localePath(props.locale, '/')" class="flex shrink-0 items-center gap-3" :title="appName">

            <img :src="logoUrl" :alt="appName" width="120" height="48" class="h-10 w-auto object-contain" />

          </NuxtLink>



          <nav class="hidden xl:block" aria-label="منوی اصلی">

            <ul class="flex items-center gap-2 font-medium">

              <li v-for="item in navItems" :key="item.label">

                <div v-if="item.children?.length" class="group relative">

                  <NuxtLink

                    :to="item.to ? localePath(props.locale, item.to) : '#'"

                    class="flex h-12 items-center gap-2 rounded-2xl px-5 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-primary"

                  >

                    {{ item.label }}

                    <svg class="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">

                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />

                    </svg>

                  </NuxtLink>

                  <div class="invisible absolute right-0 top-full pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">

                    <div class="w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">

                      <ul class="space-y-1">

                        <li v-for="child in item.children" :key="child.label">

                          <NuxtLink

                            :to="localePath(props.locale, child.to)"

                            class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"

                          >

                            {{ child.label }}

                          </NuxtLink>

                        </li>

                      </ul>

                    </div>

                  </div>

                </div>

                <NuxtLink

                  v-else

                  :to="localePath(props.locale, item.to!)"

                  class="flex h-12 items-center gap-2 rounded-2xl px-5 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-primary"

                >

                  {{ item.label }}

                </NuxtLink>

              </li>

            </ul>

          </nav>

        </div>



        <div class="flex shrink-0 items-center gap-3">

          <PublicLanguageMenu :locale="props.locale" />

          <NuxtLink

            :to="localePath(props.locale, '/shop')"

            class="relative flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-emerald-50 hover:text-primary"

            aria-label="سبد خرید"

          >

            <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">

              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />

            </svg>

          </NuxtLink>



          <NuxtLink

            :to="accountUrl"

            class="flex h-12 max-w-48 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark lg:w-auto lg:px-5"

          >

            <svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">

              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

            </svg>

            <span class="hidden truncate lg:inline">{{ accountLabel }}</span>

          </NuxtLink>

        </div>

      </div>

      <nav

        v-if="mobileOpen"

        class="border-t border-slate-100 py-4 xl:hidden"

        aria-label="منوی موبایل"

      >

        <ul class="space-y-1">

          <template v-for="item in navItems" :key="`m-${item.label}`">

            <li>

              <NuxtLink

                v-if="!item.children?.length"

                :to="localePath(props.locale, item.to!)"

                class="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-primary"

                @click="mobileOpen = false"

              >

                {{ item.label }}

              </NuxtLink>

              <div v-else>

                <p class="px-4 py-2 text-xs font-bold text-slate-400">{{ item.label }}</p>

                <NuxtLink

                  v-for="child in item.children"

                  :key="child.label"

                  :to="localePath(props.locale, child.to)"

                  class="block rounded-2xl px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-primary"

                  @click="mobileOpen = false"

                >

                  {{ child.label }}

                </NuxtLink>

              </div>

            </li>

          </template>

        </ul>

      </nav>

    </div>

  </header>

</template>



<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'

import { storeToRefs } from 'pinia'

import PublicLanguageMenu from '~/components/store/layout/PublicLanguageMenu.vue'

import { hydrateUserSession } from '~/composables/useSession'

import { appConfig } from '~/config/app'

import { useAuthStore } from '~/stores/auth'

import type { AppLocale } from '~/utils/locale'

import { getAccessToken } from '~/utils/auth-storage'

import { localePath } from '~/utils/locale-path'



const props = defineProps<{

  locale: AppLocale

}>()



const mobileOpen = ref(false)

const authStore = useAuthStore()

const { user } = storeToRefs(authStore)

const appName = appConfig.name

const logoUrl = '/logo.png'



const copy = {

  fa: {

    login: 'ورود / ثبت نام',

    account: 'حساب کاربری',

    nav: {

      home: 'خانه',

      products: 'محصولات',

      blog: 'بلاگ',

      about: 'درباره ما',

      contact: 'تماس با ما',

      wpDesign: 'طراحی سایت وردپرس',

      plugins: 'افزونه وردپرس',

      software: 'ابزارهای نرم‌افزار',

      apps: 'اپلیکیشن / وب‌اپلیکیشن',

      crm: 'CRM',

    },

  },

  en: {

    login: 'Login / Register',

    account: 'My account',

    nav: {

      home: 'Home',

      products: 'Products',

      blog: 'Blog',

      about: 'About us',

      contact: 'Contact us',

      wpDesign: 'Custom WordPress sites',

      plugins: 'WordPress plugins',

      software: 'Software tools',

      apps: 'Apps & web applications',

      crm: 'CRM',

    },

  },

} as const



const t = computed(() => copy[props.locale])

const isLoggedIn = computed(() => !!getAccessToken() && !!user.value)

const accountUrl = computed(() => (isLoggedIn.value ? '/panel' : '/login'))

const accountLabel = computed(() => (isLoggedIn.value ? t.value.account : t.value.login))

onMounted(async () => {
  if (getAccessToken()) {
    await hydrateUserSession()
  }
})



const navItems = computed(() => {

  const n = t.value.nav

  return [

    { label: n.home, to: '/' },

    {

      label: n.products,

      to: '/shop',

      children: [

        { label: n.wpDesign, to: '/shop' },

        { label: n.plugins, to: '/shop/category/wordpress-plugins' },

        { label: n.software, to: '/shop' },

        { label: n.apps, to: '/shop/category/docker-apps' },

        { label: n.crm, to: '/shop' },

      ],

    },

    { label: n.blog, to: '/blog' },

    { label: n.about, to: '/#about' },

    { label: n.contact, to: '/tickets/guest/create' },

  ]

})

</script>

