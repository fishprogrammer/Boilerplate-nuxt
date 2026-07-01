<template>

  <footer class="relative overflow-hidden pt-10">

    <div class="relative overflow-hidden bg-slate-950">

      <svg

        class="absolute inset-x-0 top-0 mx-auto text-slate-950"

        width="105"

        height="64"

        viewBox="516 0 97 25"

        xmlns="http://www.w3.org/2000/svg"

        preserveAspectRatio="xMidYMin meet"

        aria-hidden="true"

      >

        <path

          fill="currentColor"

          d="M516.197 0 C528.249 0 537.826 10.2721 546.86 18.2479 C551.635 22.4627 557.786 25 564.5 25 C571.214 25 577.365 22.4627 582.14 18.2479 C591.174 10.2721 600.751 0 612.803 0"

        />

      </svg>



      <div class="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />



      <div class="store-container relative">

        <div class="grid gap-14 border-b border-white/10 py-20 lg:grid-cols-6">

          <div class="lg:col-span-2">

            <NuxtLink :to="localePath(locale, '/')" class="inline-flex items-center gap-3">

              <img :src="logoUrl" :alt="appName" width="120" height="48" class="h-10 w-auto brightness-0 invert" />

            </NuxtLink>

            <p class="mt-8 max-w-xl text-[15px] leading-8 text-slate-400">

              {{ t.description }}

            </p>

          </div>



          <div>

            <h3 class="text-xl font-black text-white">{{ t.quickLinks }}</h3>

            <ul class="mt-8 space-y-3 text-sm text-slate-400">

              <li v-for="link in quickLinks" :key="link.label">

                <NuxtLink :to="localePath(locale, link.to)" class="transition hover:text-white">

                  {{ link.label }}

                </NuxtLink>

              </li>

            </ul>

          </div>



          <div>

            <h3 class="text-xl font-black text-white">{{ t.productsTitle }}</h3>

            <ul class="mt-8 space-y-3 text-sm text-slate-400">

              <li v-for="link in productLinks" :key="link.label">

                <NuxtLink :to="localePath(locale, link.to)" class="transition hover:text-white">

                  {{ link.label }}

                </NuxtLink>

              </li>

            </ul>

          </div>



          <div id="contact" class="lg:col-span-2">

            <h3 class="text-xl font-black text-white">{{ t.contactTitle }}</h3>

            <div class="mt-8 space-y-4">

              <a

                v-if="contactPhone"

                :href="`tel:${contactPhone}`"

                class="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"

              >

                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition group-hover:bg-emerald-500 group-hover:text-white">

                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">

                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z" />

                  </svg>

                </div>

                <span class="text-sm text-slate-400">{{ contactPhone }}</span>

              </a>

              <a

                v-if="contactEmail"

                :href="`mailto:${contactEmail}`"

                class="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"

              >

                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 transition group-hover:bg-teal-500 group-hover:text-white">

                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">

                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                  </svg>

                </div>

                <span class="text-sm text-slate-400">{{ contactEmail }}</span>

              </a>

            </div>

          </div>

        </div>



        <div class="flex flex-col gap-6 py-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-right">

          <p class="text-sm text-slate-500">{{ t.copyright }}</p>

        </div>

      </div>

    </div>

  </footer>

</template>



<script setup lang="ts">

import { computed } from 'vue'

import { appConfig } from '~/config/app'

import type { AppLocale } from '~/utils/locale'

import { localePath } from '~/utils/locale-path'



const props = defineProps<{

  locale: AppLocale

}>()



const appName = appConfig.name

const logoUrl = '/logo.png'

const contactPhone = ''

const contactEmail = ''



const copy = {

  fa: {

    description: 'ارائه‌دهنده راهکارهای وردپرس، نرم‌افزار، اپلیکیشن / وب‌اپلیکیشن و CRM با توسعه اختصاصی، پشتیبانی فنی و به‌روزرسانی مستمر.',

    quickLinks: 'دسترسی سریع',

    productsTitle: 'دسته‌بندی',

    contactTitle: 'اطلاعات تماس',

    copyright: `تمامی حقوق مادی و معنوی این سایت برای ${appConfig.name} محفوظ می‌باشد`,

    links: {

      home: 'خانه',

      shop: 'فروشگاه',

      blog: 'بلاگ',

      login: 'ورود / ثبت نام',

      wpDesign: 'طراحی سایت وردپرس',

      plugins: 'افزونه وردپرس',

      software: 'ابزارهای نرم‌افزار',

      apps: 'اپلیکیشن / وب‌اپلیکیشن',

      crm: 'CRM',

    },

  },

  en: {

    description: 'WordPress, software, apps & web applications, and CRM solutions with custom development, technical support, and ongoing updates.',

    quickLinks: 'Quick links',

    productsTitle: 'Solution categories',

    contactTitle: 'Contact',

    copyright: `All rights reserved © ${appConfig.name}`,

    links: {

      home: 'Home',

      shop: 'Shop',

      blog: 'Blog',

      login: 'Login / Register',

      wpDesign: 'Custom WordPress sites',

      plugins: 'WordPress plugins',

      software: 'Software tools',

      apps: 'Apps & web applications',

      crm: 'CRM',

    },

  },

} as const



const t = computed(() => copy[props.locale])

const quickLinks = computed(() => {

  const l = t.value.links

  return [

    { label: l.home, to: '/' },

    { label: l.shop, to: '/shop' },

    { label: l.blog, to: '/blog' },

    { label: l.login, to: '/login' },

  ]

})

const productLinks = computed(() => {

  const l = t.value.links

  return [

    { label: l.wpDesign, to: '/shop' },

    { label: l.plugins, to: '/shop/category/wordpress-plugins' },

    { label: l.software, to: '/shop' },

    { label: l.apps, to: '/shop/category/docker-apps' },

    { label: l.crm, to: '/shop' },

  ]

})

</script>

