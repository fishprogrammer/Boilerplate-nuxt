<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-linear-to-b from-slate-50 via-white to-white">
      <div class="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-200/35 blur-3xl" aria-hidden="true" />
      <div class="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-200/25 blur-3xl" aria-hidden="true" />

      <div class="store-container relative py-10 lg:py-24">
        <div class="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div class="relative z-10">
            <h1 class="max-w-xl text-3xl font-black leading-[1.2]! text-slate-900 sm:text-5xl xl:text-6xl">
              {{ t.heroTitleBefore }}
              <b class="relative z-10 text-primary">{{ t.heroTitleHighlight }}</b>
              {{ t.heroTitleAfter }}
            </h1>
            <p class="mt-7 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">
              {{ t.heroSubtitle }}
            </p>
            <div class="mt-7 flex flex-col gap-4 sm:flex-row lg:mt-10">
              <NuxtLink
                :to="localePath(locale, '/shop')"
                class="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-8 text-sm font-bold text-white shadow-2xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-dark"
              >
                {{ t.ctaProducts }}
                <StoreLandingArrowIcon />
              </NuxtLink>
              <a
                :href="consultationPhoneHref"
                class="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary"
              >
                {{ t.ctaConsultation }}
              </a>
            </div>
            <div class="mt-14 hidden grid-cols-2 gap-5 sm:grid-cols-3 lg:grid">
              <div
                v-for="stat in t.heroStats"
                :key="stat.label"
                class="rounded-3xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl"
                :class="stat.wide ? 'col-span-2 sm:col-span-1' : ''"
              >
                <div class="text-3xl font-black text-slate-900">{{ stat.value }}</div>
                <div class="mt-2 text-sm text-slate-500">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="relative mx-auto max-w-xl">
              <div class="absolute inset-0 scale-110 rounded-[44px] bg-primary/15 blur-3xl" aria-hidden="true" />
              <div class="relative overflow-hidden rounded-[36px] border border-white/50 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl">
                <div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div class="flex items-center gap-2">
                    <span class="h-3 w-3 rounded-full bg-rose-400" />
                    <span class="h-3 w-3 rounded-full bg-amber-400" />
                    <span class="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div class="rounded-xl bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
                    {{ siteHost }}
                  </div>
                </div>
                <div class="grid gap-4 p-5 lg:p-8">
                  <NuxtLink
                    v-for="card in t.heroCards"
                    :key="card.title"
                    :to="localePath(locale, card.to)"
                    class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 lg:p-6"
                  >
                    <div class="absolute left-0 top-0 h-40 w-40 rounded-full blur-3xl transition-all duration-500" :class="card.glow" />
                    <div class="relative z-1 flex items-center gap-4">
                      <LandingStrokeIcon
                        :path="card.icon"
                        :icon-bg="card.iconBg"
                        :icon-color="card.iconColor"
                        size="lg"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="text-lg font-black text-slate-900">{{ card.title }}</div>
                        <div class="mt-2 text-sm text-slate-500">{{ card.desc }}</div>
                      </div>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Products -->
    <section class="relative overflow-hidden py-10 lg:py-20">
      <div class="absolute inset-0 bg-linear-to-b from-emerald-50/35 via-white to-white" aria-hidden="true" />
      <div class="store-container relative">
        <div class="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-white bg-linear-to-br from-emerald-50 to-teal-100/40 px-5 py-2.5 text-sm font-extrabold text-primary shadow-md shadow-primary/5">
              <span class="h-2 w-2 rounded-full bg-linear-to-r from-primary to-secondary" />
              <span class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                {{ t.productsBadge }}
              </span>
            </div>
            <h2 class="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              {{ t.productsTitle }}
              <span class="text-primary">{{ t.productsTitleHighlight }}</span>
            </h2>
          </div>
          <div class="flex gap-3 overflow-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
            <button
              v-for="tab in productTabs"
              :key="tab.id"
              type="button"
              class="shrink-0 rounded-2xl px-5 py-3 text-sm font-bold transition"
              :class="activeTab === tab.id
                ? 'bg-primary text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary'"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="pending" class="py-12 text-center text-sm text-slate-500">{{ t.loading }}</div>
        <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <LandingProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            :locale="locale"
          />
        </div>

        <div class="mt-10 flex justify-center lg:mt-14">
          <NuxtLink
            :to="localePath(locale, '/shop')"
            class="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary lg:w-auto"
          >
            {{ t.viewAllProducts }}
            <StoreLandingArrowIcon />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Support CTA + Features -->
    <section class="relative overflow-hidden pb-10 pt-10 lg:pb-20">
      <div class="absolute inset-0 bg-linear-to-b from-white via-slate-50/70 to-white" aria-hidden="true" />
      <div class="store-container relative">
        <div class="relative mb-16 overflow-hidden rounded-[40px] bg-linear-to-r from-primary via-emerald-600 to-secondary p-8 shadow-2xl shadow-primary/20 lg:p-10">
          <div class="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-2xl text-center lg:text-right">
              <h3 class="text-2xl font-black leading-8 text-white lg:text-3xl">{{ t.supportTitle }}</h3>
              <p class="mt-3 text-[15px] leading-8 text-emerald-100">{{ t.supportDesc }}</p>
            </div>
            <div class="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-end">
              <NuxtLink
                :to="localePath(locale, '/tickets/guest/create')"
                class="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-sm font-black text-primary shadow-2xl transition hover:scale-[1.03]"
              >
                {{ t.supportCta }}
              </NuxtLink>
              <a
                :href="consultationPhoneHref"
                class="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                {{ t.ctaConsultation }}
              </a>
            </div>
          </div>
        </div>

        <div class="mx-auto mb-10 max-w-3xl text-center lg:mb-16">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-white bg-linear-to-br from-emerald-50 to-teal-100/40 px-4 py-2.5 text-sm font-extrabold text-primary shadow-md shadow-primary/5">
            <span class="h-2 w-2 rounded-full bg-linear-to-r from-primary to-secondary" />
            <span class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">{{ t.featuresBadge }}</span>
          </div>
          <h2 class="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {{ t.featuresTitle }}
            <span class="text-primary">{{ t.featuresTitleHighlight }}</span>
            {{ t.featuresTitleAfter }}
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="(feature, index) in t.features"
            :key="feature.title"
            class="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/50"
          >
            <LandingStrokeIcon
              :path="feature.icon"
              :icon-bg="feature.iconBg"
              :icon-color="feature.iconColor"
            />
            <div class="relative mt-6 lg:mt-8">
              <h3 class="text-xl font-black text-slate-900 lg:text-2xl">{{ feature.title }}</h3>
              <p class="mt-2 text-[15px] leading-8 text-slate-600 lg:mt-4">{{ feature.desc }}</p>
            </div>
            <div class="absolute left-6 top-6 text-6xl font-black text-slate-100 transition group-hover:text-emerald-50">
              {{ String(index + 1).padStart(2, '0') }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog -->
    <section v-if="blogPosts.length" class="relative overflow-hidden py-10 lg:py-20">
      <div class="store-container relative">
        <div class="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-white bg-linear-to-br from-emerald-50 to-teal-100/40 px-5 py-2.5 text-sm font-extrabold text-primary shadow-md shadow-primary/5">
              <span class="h-2 w-2 rounded-full bg-linear-to-r from-primary to-secondary" />
              <span class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">{{ t.blogBadge }}</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 sm:text-3xl">
              {{ t.blogTitle }}
              <span class="text-primary">{{ t.blogTitleHighlight }}</span>
            </h2>
          </div>
          <NuxtLink
            :to="localePath(locale, '/blog')"
            class="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary"
          >
            {{ t.viewAllArticles }}
            <StoreLandingArrowIcon />
          </NuxtLink>
        </div>
        <div class="grid gap-6 lg:grid-cols-3">
          <article v-for="post in blogPosts" :key="post.id">
            <NuxtLink
              :to="localePath(locale, `/blog/${post.slug}`)"
              class="group block h-full overflow-hidden rounded-[32px] border border-slate-200 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-100/40"
            >
              <div class="aspect-16/10 overflow-hidden bg-linear-to-br from-emerald-100 to-teal-100">
                <img
                  v-if="post.cover"
                  :src="post.cover"
                  :alt="post.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div class="p-7">
                <div class="mb-4 flex flex-wrap items-center gap-3">
                  <span class="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-primary">{{ post.category }}</span>
                </div>
                <h3 class="line-clamp-2 text-lg font-black leading-8 text-slate-900 transition group-hover:text-primary">
                  {{ post.title }}
                </h3>
                <p v-if="post.excerpt" class="mt-4 text-sm leading-7 text-slate-500">{{ post.excerpt }}</p>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="relative overflow-hidden py-12 lg:py-20">
      <div class="absolute inset-0 bg-linear-to-br from-emerald-800 via-primary to-secondary" aria-hidden="true" />
      <div class="store-container relative">
        <div class="mx-auto mb-10 max-w-3xl text-center lg:mb-16">
          <h2 class="text-2xl font-black leading-tight text-white sm:text-3xl">
            {{ t.statsTitle }}
            <span class="text-teal-200">{{ t.statsTitleHighlight }}</span>
          </h2>
          <p class="mt-3 text-[15px] leading-8 text-emerald-100 lg:mt-5">{{ t.statsDesc }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-6">
          <div
            v-for="stat in t.stats"
            :key="stat.label"
            class="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-8 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/15"
          >
            <div class="text-4xl font-black text-white lg:text-5xl">{{ stat.value }}</div>
            <div class="mt-3 text-lg font-bold text-teal-100">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="about" class="relative overflow-hidden py-10 lg:py-20">
      <div class="store-container relative">
        <div class="mx-auto mb-10 max-w-3xl text-center lg:mb-16">
          <h2 class="text-2xl font-black text-slate-900 sm:text-3xl">{{ t.faqTitle }}</h2>
        </div>
        <div class="mx-auto max-w-5xl space-y-4">
          <div
            v-for="(item, index) in t.faq"
            :key="item.q"
            class="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 px-5 py-5 text-right lg:px-7 lg:py-6"
              @click="openFaq = openFaq === index ? null : index"
            >
              <span class="text-sm font-black text-slate-900 lg:text-base">{{ item.q }}</span>
              <span class="text-xl text-primary">{{ openFaq === index ? '−' : '+' }}</span>
            </button>
            <div v-show="openFaq === index" class="border-t border-slate-100 px-5 pb-5 lg:px-7 lg:pb-7">
              <p class="text-sm leading-7 text-slate-600 lg:text-[15px]">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appConfig } from '~/config/app'
import type { CatalogProductListItem } from '~/types/catalog'
import type { AppLocale } from '~/utils/locale'
import { absoluteSiteUrl, localeHreflang, localePath } from '~/utils/locale-path'
import { parseBlogPostsListResponse } from '~/api/utils/api-response'
import { blogService } from '~/api/services/blog.service'
import LandingProductCard from '~/components/store/landing/LandingProductCard.vue'
import LandingStrokeIcon from '~/components/store/landing/LandingStrokeIcon.vue'
import StoreLandingArrowIcon from '~/components/store/landing/StoreLandingArrowIcon.vue'

const props = defineProps<{
  locale: AppLocale
}>()

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://store.a4j.ir')
const siteHost = computed(() => {
  try {
    return new URL(siteUrl).host
  } catch {
    return 'store.a4j.ir'
  }
})

const activeTab = ref<string>('all')
const openFaq = ref<number | null>(0)

const consultationPhoneHref = 'tel:+989354120055'

const copy = {
  fa: {
    heroTitleBefore: 'راهکارهای ',
    heroTitleHighlight: 'نرم‌افزاری و دیجیتال',
    heroTitleAfter: ' برای رشد کسب‌وکار',
    heroSubtitle: 'طراحی اختصاصی سایت وردپرس، افزونه، ابزار حرفه‌ای، اپلیکیشن / وب‌اپلیکیشن و CRM — با توسعه سفارشی و پشتیبانی فنی مستمر',
    ctaProducts: 'مرور فروشگاه',
    ctaConsultation: 'مشاوره رایگان',
    heroStats: [
      { value: '+8', label: 'سال فعالیت', wide: false },
      { value: '+1.2K', label: 'پروژه تحویل‌شده', wide: false },
      { value: '24/7', label: 'پشتیبانی فنی', wide: true },
    ],
    heroCards: [
      {
        title: 'طراحی اختصاصی سایت وردپرس',
        desc: 'سایت‌های سفارشی با معماری مناسب نیاز کسب‌وکار شما',
        to: '/shop',
        icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary-dark',
        glow: 'bg-emerald-100/80',
      },
      {
        title: 'افزونه وردپرس',
        desc: 'ماژول‌های اختصاصی با تمرکز بر کارایی، امنیت و مقیاس‌پذیری',
        to: '/shop/category/wordpress-plugins',
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        glow: 'bg-sky-100/80',
      },
      {
        title: 'ابزارهای حرفه‌ای نرم‌افزار',
        desc: 'راهکارهای دسکتاپ و ابزارهای تخصصی برای تیم‌های فنی',
        to: '/shop',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        glow: 'bg-purple-100/80',
      },
      {
        title: 'اپلیکیشن / وب‌اپلیکیشن',
        desc: 'برنامه‌های موبایل و دسکتاپ به‌همراه سامانه‌های تحت وب مقیاس‌پذیر برای دسترسی از هر دستگاه',
        to: '/shop/category/docker-apps',
        icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        glow: 'bg-cyan-100/80',
      },
      {
        title: 'CRM',
        desc: 'مدیریت مشتری، فروش و ارتباطات در یک پنل یکپارچه',
        to: '/shop',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        iconBg: 'bg-pink-100',
        iconColor: 'text-red-600',
        glow: 'bg-pink-100/80',
      },
    ],
    productsBadge: 'محصولات منتخب',
    productsTitle: 'راهکارهای ',
    productsTitleHighlight: appConfig.name,
    viewAllProducts: 'مشاهده همه محصولات',
    loading: 'در حال بارگذاری...',
    tabs: {
      all: 'همه',
      plugins: 'افزونه وردپرس',
      software: 'ابزار نرم‌افزار',
      apps: 'اپلیکیشن / وب‌اپ',
      crm: 'CRM',
    },
    supportTitle: 'برای انتخاب راهکار یا سفارش توسعه با ما در تماس باشید',
    supportDesc: 'تیم فنی ما در انتخاب محصول، پیاده‌سازی اختصاصی و رفع چالش‌های پروژه همراه شماست؛ از مشاوره اولیه تا راه‌اندازی نهایی پاسخگو هستیم.',
    supportCta: 'ارتباط با پشتیبانی',
    featuresBadge: 'چرا مشتریان با ما کار می‌کنند؟',
    featuresTitle: 'فراتر از فروش، ',
    featuresTitleHighlight: 'همراهی در توسعه',
    featuresTitleAfter: ' و پشتیبانی',
    features: [
      {
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        title: 'کد تمیز و استاندارد',
        desc: 'محصولات با معماری قابل نگهداری توسعه داده می‌شوند تا توسعه و گسترش بعدی برای تیم شما ساده بماند.',
      },
      {
        icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        title: 'پشتیبانی پس از فروش',
        desc: 'پس از خرید، تیم فنی در راه‌اندازی، به‌روزرسانی و رفع مشکلات احتمالی در کنار شماست.',
      },
      {
        icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        title: 'امکان سفارشی‌سازی',
        desc: 'بسیاری از راهکارها قابل شخصی‌سازی هستند تا دقیقاً با فرآیند و نیاز سازمان شما هم‌راستا شوند.',
      },
      {
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        title: 'تحویل و دسترسی سریع',
        desc: 'پس از تأیید سفارش، دسترسی به فایل‌ها، مستندات و به‌روزرسانی‌ها بلافاصله فعال می‌شود.',
      },
    ],
    blogBadge: 'وبلاگ فنی',
    blogTitle: 'نکات و ',
    blogTitleHighlight: 'مقالات تخصصی',
    viewAllArticles: 'مشاهده همه مقالات',
    statsTitle: 'اعتماد مشتریان، ',
    statsTitleHighlight: 'انگیزه ما',
    statsDesc: 'هر پروژه تحویل‌داده‌شده برای ما یک مسئولیت بلندمدت نسبت به کیفیت، پایداری و پشتیبانی است.',
    stats: [
      { value: '+8', label: 'سال فعالیت' },
      { value: '+1.2K', label: 'پروژه تحویل‌شده' },
      { value: '+35', label: 'راهکار منتشر شده' },
      { value: '24/7', label: 'پشتیبانی فنی' },
    ],
    faqTitle: 'سوالات متداول',
    faq: [
      { q: 'آیا امکان طراحی سایت وردپرس به‌صورت اختصاصی وجود دارد؟', a: 'بله. علاوه بر محصولات آماده، تیم ما طراحی و توسعه سایت وردپرس متناسب با برند و نیاز شما را نیز انجام می‌دهد.' },
      { q: 'محصولات شامل به‌روزرسانی می‌شوند؟', a: 'بله. راهکارها به‌صورت دوره‌ای به‌روزرسانی می‌شوند و با نسخه‌های جدید وردپرس و محیط‌های رایج تست می‌گردند.' },
      { q: 'CRM شما برای چه نوع کسب‌وکارهایی مناسب است؟', a: 'CRM ما برای تیم‌های فروش، پشتیبانی و مدیریت ارتباط با مشتری طراحی شده و قابل توسعه برای فرآیندهای اختصاصی سازمان است.' },
      { q: 'آیا پشتیبانی فنی پس از خرید ارائه می‌شود؟', a: 'بله. پشتیبانی فنی از طریق تیکت و راهنمای نصب در دسترس است و برای پروژه‌های سفارشی، قرارداد پشتیبانی جداگانه نیز قابل تنظیم است.' },
    ],
    seoTitle: 'فروشگاه راهکارهای وردپرس، نرم‌افزار و CRM',
    seoDescription: 'طراحی سایت وردپرس، افزونه اختصاصی، ابزار نرم‌افزاری، اپلیکیشن / وب‌اپلیکیشن و CRM با پشتیبانی حرفه‌ای.',
  },
  en: {
    heroTitleBefore: 'Digital ',
    heroTitleHighlight: 'software solutions',
    heroTitleAfter: ' for growing businesses',
    heroSubtitle: 'Custom WordPress sites, plugins, professional tools, apps & web apps, and CRM — with tailored development and ongoing technical support.',
    ctaProducts: 'Browse store',
    ctaConsultation: 'Free consultation',
    heroStats: [
      { value: '+8', label: 'Years active', wide: false },
      { value: '+1.2K', label: 'Projects delivered', wide: false },
      { value: '24/7', label: 'Technical support', wide: true },
    ],
    heroCards: [
      {
        title: 'Custom WordPress sites',
        desc: 'Tailored websites built around your business goals and workflow',
        to: '/shop',
        icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary-dark',
        glow: 'bg-emerald-100/80',
      },
      {
        title: 'WordPress plugins',
        desc: 'Custom modules focused on performance, security, and scalability',
        to: '/shop/category/wordpress-plugins',
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        glow: 'bg-sky-100/80',
      },
      {
        title: 'Professional software tools',
        desc: 'Desktop utilities and specialized tools for technical teams',
        to: '/shop',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        glow: 'bg-purple-100/80',
      },
      {
        title: 'Apps & web applications',
        desc: 'Mobile and desktop applications plus scalable browser-based systems accessible from any device',
        to: '/shop/category/docker-apps',
        icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        glow: 'bg-cyan-100/80',
      },
      {
        title: 'CRM',
        desc: 'Unified customer, sales, and communication management',
        to: '/shop',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        iconBg: 'bg-pink-100',
        iconColor: 'text-red-600',
        glow: 'bg-pink-100/80',
      },
    ],
    productsBadge: 'Featured solutions',
    productsTitle: 'Solutions from ',
    productsTitleHighlight: appConfig.name,
    viewAllProducts: 'View all products',
    loading: 'Loading...',
    tabs: {
      all: 'All',
      plugins: 'WordPress plugins',
      software: 'Software tools',
      apps: 'Apps & web apps',
      crm: 'CRM',
    },
    supportTitle: 'Need help choosing a solution or planning custom development?',
    supportDesc: 'Our technical team supports you from product selection through custom implementation and troubleshooting — from first consultation to go-live.',
    supportCta: 'Contact support',
    featuresBadge: 'Why teams work with us',
    featuresTitle: 'Beyond sales — ',
    featuresTitleHighlight: 'development partnership',
    featuresTitleAfter: ' and support',
    features: [
      {
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        title: 'Clean, maintainable code',
        desc: 'Products are built with architectures that stay easy to extend and maintain for your team.',
      },
      {
        icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        title: 'Post-purchase support',
        desc: 'After purchase, our team helps with setup, updates, and resolving technical issues.',
      },
      {
        icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        title: 'Customization options',
        desc: 'Many solutions can be tailored to align with your organization’s processes and requirements.',
      },
      {
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        title: 'Fast delivery and access',
        desc: 'Once your order is confirmed, files, documentation, and updates become available immediately.',
      },
    ],
    blogBadge: 'Technical blog',
    blogTitle: 'Insights and ',
    blogTitleHighlight: 'expert articles',
    viewAllArticles: 'View all articles',
    statsTitle: 'Customer trust is ',
    statsTitleHighlight: 'our drive',
    statsDesc: 'Every delivered project is a long-term commitment to quality, stability, and support.',
    stats: [
      { value: '+8', label: 'Years active' },
      { value: '+1.2K', label: 'Projects delivered' },
      { value: '+35', label: 'Published solutions' },
      { value: '24/7', label: 'Technical support' },
    ],
    faqTitle: 'FAQ',
    faq: [
      { q: 'Do you offer custom WordPress site development?', a: 'Yes. In addition to ready-made products, our team designs and builds WordPress sites tailored to your brand and requirements.' },
      { q: 'Do products include updates?', a: 'Yes. Solutions are updated regularly and tested against current WordPress versions and common hosting environments.' },
      { q: 'Who is your CRM built for?', a: 'Our CRM suits sales, support, and customer success teams and can be extended for organization-specific workflows.' },
      { q: 'Is technical support available after purchase?', a: 'Yes. Support is available via tickets and setup guides; custom projects can include dedicated support agreements.' },
    ],
    seoTitle: 'WordPress, software, and CRM solutions store',
    seoDescription: 'Custom WordPress sites, plugins, professional software, apps & web apps, and CRM with expert support.',
  },
} as const

const t = computed(() => copy[props.locale])

const productTabs = computed(() => [
  { id: 'all', label: t.value.tabs.all },
  { id: 'plugins', label: t.value.tabs.plugins },
  { id: 'software', label: t.value.tabs.software },
  { id: 'apps', label: t.value.tabs.apps },
  { id: 'crm', label: t.value.tabs.crm },
])

function isCrmProduct(p: CatalogProductListItem) {
  const slug = p.slug.toLowerCase()
  const name = p.name.toLowerCase()
  return slug.includes('crm') || name.includes('crm')
}

const { listProducts } = useCatalog()
const { data: productsData, pending } = await useAsyncData(
  () => `home-products-${props.locale}`,
  () => listProducts(props.locale),
)

const allProducts = computed<CatalogProductListItem[]>(() => productsData.value?.items ?? [])

const filteredProducts = computed(() => {
  const items = allProducts.value
  if (activeTab.value === 'all') return items.slice(0, 8)
  if (activeTab.value === 'plugins') {
    return items.filter((p) => p.product_type === 'wordpress_plugin' || p.category?.slug === 'wordpress-plugins').slice(0, 8)
  }
  if (activeTab.value === 'software') {
    return items.filter((p) => p.product_type === 'desktop' || p.product_type === 'other').slice(0, 8)
  }
  if (activeTab.value === 'apps') {
    return items.filter((p) => p.product_type === 'docker_app' && !isCrmProduct(p)).slice(0, 8)
  }
  if (activeTab.value === 'crm') {
    return items.filter(isCrmProduct).slice(0, 8)
  }
  return items.slice(0, 8)
})

interface LandingBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  cover: string | null
  category: string
}

const { data: blogData } = await useAsyncData(
  () => `home-blog-${props.locale}`,
  async () => {
    try {
      const raw = await blogService.listPosts({ status: 'published', page_size: 3, ordering: '-published_at' })
      const parsed = parseBlogPostsListResponse(raw)
      return parsed?.posts ?? []
    } catch {
      return []
    }
  },
)

const blogPosts = computed<LandingBlogPost[]>(() =>
  (blogData.value ?? []).slice(0, 3).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.body.replace(/<[^>]+>/g, '').slice(0, 120),
    cover: null,
    category: props.locale === 'fa' ? 'مقاله فنی' : 'Tech article',
  })),
)

useSeoFromApi(
  {
    title: t.value.seoTitle,
    description: t.value.seoDescription,
    canonical: absoluteSiteUrl(siteUrl, props.locale, '/'),
    robots: 'index,follow',
    og_title: t.value.seoTitle,
    og_description: t.value.seoDescription,
    og_image: `${siteUrl}/logo.png`,
    hreflang: localeHreflang(siteUrl, '/'),
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.public.appName || 'Soft Store',
      url: absoluteSiteUrl(siteUrl, props.locale, '/'),
    },
  },
  props.locale,
)
</script>
