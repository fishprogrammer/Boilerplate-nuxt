<template>
  <div class="page-shell py-10">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-text-primary">{{ title }}</h1>
      <p class="mt-2 text-text-secondary">{{ subtitle }}</p>
      <p v-if="!catalogApiLive" class="mt-2 text-xs text-amber-600">{{ mockNotice }}</p>
    </header>

    <div v-if="pending" class="text-sm text-text-secondary">{{ loadingLabel }}</div>
    <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <ShopProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :locale="locale"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { absoluteSiteUrl, localeHreflang } from '~/utils/locale-path'

definePageMeta({
  layout: 'public',
  public: true,
})

const locale = useAppLocale()
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://store.a4j.ir')
const { listProducts, catalogApiLive } = useCatalog()

const { data, pending } = await useAsyncData(
  () => `shop-index-${locale.value}`,
  () => listProducts(locale.value),
)

const products = computed(() => data.value?.items ?? [])

const copy = {
  fa: {
    title: 'فروشگاه',
    subtitle: 'افزونه‌ها و اپلیکیشن‌های آماده استقرار',
    mockNotice: 'نمایش داده‌های نمونه — API کاتالوگ هنوز فعال نیست.',
    loadingLabel: 'در حال بارگذاری محصولات...',
    seoTitle: 'فروشگاه نرم‌افزار',
    seoDescription: 'لیست محصولات نرم‌افزاری Soft Store',
  },
  en: {
    title: 'Shop',
    subtitle: 'Plugins and ready-to-deploy applications',
    mockNotice: 'Showing mock data — catalog API is not live yet.',
    loadingLabel: 'Loading products...',
    seoTitle: 'Software shop',
    seoDescription: 'Soft Store product catalog',
  },
} as const

const t = computed(() => copy[locale.value])
const title = computed(() => t.value.title)
const subtitle = computed(() => t.value.subtitle)
const mockNotice = computed(() => t.value.mockNotice)
const loadingLabel = computed(() => t.value.loadingLabel)

useSeoFromApi(
  {
    title: t.value.seoTitle,
    description: t.value.seoDescription,
    canonical: absoluteSiteUrl(siteUrl, locale.value, '/shop'),
    robots: 'index,follow',
    og_title: t.value.seoTitle,
    og_description: t.value.seoDescription,
    og_image: `${siteUrl}/logo.png`,
    hreflang: localeHreflang(siteUrl, '/shop'),
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t.value.seoTitle,
      url: absoluteSiteUrl(siteUrl, locale.value, '/shop'),
    },
  },
  locale.value,
)
</script>
