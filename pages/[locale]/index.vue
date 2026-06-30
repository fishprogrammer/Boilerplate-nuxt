<template>
  <div class="page-shell py-10">
    <section class="rounded-3xl bg-gradient-to-l from-primary/10 to-transparent p-8 md:p-12">
      <h1 class="text-3xl font-bold text-text-primary md:text-4xl">{{ heroTitle }}</h1>
      <p class="mt-4 max-w-2xl text-base text-text-secondary md:text-lg">{{ heroSubtitle }}</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <NuxtLink
          :to="`/${locale}/shop`"
          class="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          {{ ctaShop }}
        </NuxtLink>
        <NuxtLink
          :to="`/${locale}/blog`"
          class="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium hover:border-primary"
        >
          {{ ctaBlog }}
        </NuxtLink>
      </div>
    </section>

    <section class="mt-12">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h2 class="text-2xl font-semibold text-text-primary">{{ featuredTitle }}</h2>
        <NuxtLink :to="`/${locale}/shop`" class="text-sm text-primary hover:underline">
          {{ viewAll }}
        </NuxtLink>
      </div>
      <div v-if="pending" class="text-sm text-text-secondary">{{ loadingLabel }}</div>
      <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <ShopProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          :locale="locale"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { CatalogProductListItem } from '~/types/catalog'
import { isAppLocale, type AppLocale } from '~/utils/locale'

definePageMeta({
  layout: 'public',
  middleware: ['locale'],
  public: true,
})

const route = useRoute()
const locale = computed(() => route.params.locale as AppLocale)

if (!isAppLocale(locale.value)) {
  await navigateTo('/fa/')
}

const { listProducts } = useCatalog()
const { data, pending } = await useAsyncData(
  () => `home-products-${locale.value}`,
  () => listProducts(locale.value),
)

const featuredProducts = computed<CatalogProductListItem[]>(
  () => data.value?.items.filter((p) => p.is_featured).slice(0, 3) ?? [],
)

const copy = {
  fa: {
    heroTitle: 'فروشگاه نرم‌افزار Soft Store',
    heroSubtitle: 'افزونه وردپرس، اپلیکیشن داکر و ابزارهای حرفه‌ای با مدیریت لایسنس یکپارچه.',
    ctaShop: 'مشاهده فروشگاه',
    ctaBlog: 'وبلاگ',
    featuredTitle: 'محصولات ویژه',
    viewAll: 'همه محصولات',
    loadingLabel: 'در حال بارگذاری...',
    seoTitle: 'فروشگاه نرم‌افزار',
    seoDescription: 'خرید افزونه وردپرس و اپلیکیشن داکر با پشتیبانی و لایسنس آنلاین.',
  },
  en: {
    heroTitle: 'Soft Store Software Marketplace',
    heroSubtitle: 'WordPress plugins, Docker apps, and pro tools with integrated license management.',
    ctaShop: 'Browse shop',
    ctaBlog: 'Blog',
    featuredTitle: 'Featured products',
    viewAll: 'View all',
    loadingLabel: 'Loading...',
    seoTitle: 'Software store',
    seoDescription: 'Buy WordPress plugins and Docker apps with online licensing and support.',
  },
} as const

const t = computed(() => copy[locale.value])
const heroTitle = computed(() => t.value.heroTitle)
const heroSubtitle = computed(() => t.value.heroSubtitle)
const ctaShop = computed(() => t.value.ctaShop)
const ctaBlog = computed(() => t.value.ctaBlog)
const featuredTitle = computed(() => t.value.featuredTitle)
const viewAll = computed(() => t.value.viewAll)
const loadingLabel = computed(() => t.value.loadingLabel)

useSeoFromApi(
  {
    title: t.value.seoTitle,
    description: t.value.seoDescription,
    canonical: `https://store.a4j.ir/${locale.value}`,
    robots: 'index,follow',
    og_title: t.value.seoTitle,
    og_description: t.value.seoDescription,
    og_image: 'https://store.a4j.ir/logo.png',
    hreflang: {
      fa: 'https://store.a4j.ir/fa',
      en: 'https://store.a4j.ir/en',
    },
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Soft Store',
      url: `https://store.a4j.ir/${locale.value}`,
    },
  },
  locale.value,
)
</script>
