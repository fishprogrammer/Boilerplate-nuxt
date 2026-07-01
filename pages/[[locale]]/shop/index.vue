<template>
  <div class="page-shell py-10">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-text-primary">{{ title }}</h1>
      <p class="mt-2 text-text-secondary">{{ subtitle }}</p>
      <p v-if="!catalogApiLive" class="mt-2 text-xs text-amber-600">{{ mockNotice }}</p>
    </header>

    <ShopCategoryNav :locale="locale" :categories="categories" />

    <div class="mb-6 grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-4">
      <div class="md:col-span-2">
        <label :for="`shop-search-${locale}`" class="mb-1 block text-xs font-medium">{{ searchLabel }}</label>
        <input
          :id="`shop-search-${locale}`"
          v-model="searchQuery"
          type="search"
          class="w-full rounded-lg border border-border bg-app-bg px-3 py-2 text-sm outline-none input-focus"
          :placeholder="searchPlaceholder"
          @keydown.enter.prevent="applyFilters"
        />
      </div>
      <div>
        <label :for="`shop-type-${locale}`" class="mb-1 block text-xs font-medium">{{ typeLabel }}</label>
        <select :id="`shop-type-${locale}`" v-model="productType" class="w-full rounded-lg border border-border bg-app-bg px-3 py-2 text-sm outline-none input-focus">
          <option value="">{{ allLabel }}</option>
          <option value="wordpress_plugin">{{ typeLabels.wordpress_plugin }}</option>
          <option value="docker_app">{{ typeLabels.docker_app }}</option>
          <option value="desktop">{{ typeLabels.desktop }}</option>
          <option value="other">{{ typeLabels.other }}</option>
        </select>
      </div>
      <div>
        <label :for="`shop-pricing-${locale}`" class="mb-1 block text-xs font-medium">{{ pricingLabel }}</label>
        <select :id="`shop-pricing-${locale}`" v-model="pricingModel" class="w-full rounded-lg border border-border bg-app-bg px-3 py-2 text-sm outline-none input-focus">
          <option value="">{{ allLabel }}</option>
          <option value="free">{{ pricingLabels.free }}</option>
          <option value="one_time">{{ pricingLabels.one_time }}</option>
          <option value="subscription">{{ pricingLabels.subscription }}</option>
        </select>
      </div>
      <div class="flex items-end gap-2 md:col-span-4">
        <button type="button" class="btn-action-sm" :disabled="pending" @click="applyFilters">{{ applyLabel }}</button>
        <button type="button" class="btn-muted-sm" :disabled="pending || !hasFilters" @click="resetFilters">{{ resetLabel }}</button>
      </div>
    </div>

    <div v-if="pending" class="text-sm text-text-secondary">{{ loadingLabel }}</div>
    <div v-else-if="products.length === 0" class="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-text-secondary">
      {{ emptyLabel }}
    </div>
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
const { listProducts, listCategories, catalogApiLive } = useCatalog()

const searchQuery = ref('')
const productType = ref('')
const pricingModel = ref('')
const appliedSearch = ref('')
const appliedType = ref('')
const appliedPricing = ref('')

const { data: categoriesData } = await useAsyncData(
  () => `shop-categories-${locale.value}`,
  () => listCategories(locale.value),
)
const categories = computed(() => categoriesData.value ?? [])

const { data, pending, refresh } = await useAsyncData(
  () => `shop-index-${locale.value}-${appliedSearch.value}-${appliedType.value}-${appliedPricing.value}`,
  () =>
    listProducts({
      locale: locale.value,
      search: appliedSearch.value || undefined,
      product_type: (appliedType.value || undefined) as import('~/types/catalog').ProductType | undefined,
      pricing_model: (appliedPricing.value || undefined) as import('~/types/catalog').PricingModel | undefined,
      page_size: 48,
      ordering: '-published_at',
    }),
)

const products = computed(() => data.value?.items ?? [])
const hasFilters = computed(() => !!(appliedSearch.value || appliedType.value || appliedPricing.value))

function applyFilters() {
  appliedSearch.value = searchQuery.value.trim()
  appliedType.value = productType.value
  appliedPricing.value = pricingModel.value
  void refresh()
}

function resetFilters() {
  searchQuery.value = ''
  productType.value = ''
  pricingModel.value = ''
  appliedSearch.value = ''
  appliedType.value = ''
  appliedPricing.value = ''
  void refresh()
}

const copy = {
  fa: {
    title: 'فروشگاه',
    subtitle: 'افزونه‌ها و اپلیکیشن‌های آماده استقرار',
    mockNotice: 'نمایش داده‌های نمونه — API کاتالوگ هنوز فعال نیست.',
    loadingLabel: 'در حال بارگذاری محصولات...',
    emptyLabel: 'محصولی یافت نشد.',
    searchLabel: 'جستجو',
    searchPlaceholder: 'نام یا توضیح محصول...',
    typeLabel: 'نوع محصول',
    pricingLabel: 'مدل قیمت',
    allLabel: 'همه',
    applyLabel: 'اعمال فیلتر',
    resetLabel: 'پاک کردن',
    seoTitle: 'فروشگاه نرم‌افزار',
    seoDescription: 'لیست محصولات نرم‌افزاری Soft Store',
    typeLabels: {
      wordpress_plugin: 'افزونه وردپرس',
      docker_app: 'اپ داکر',
      desktop: 'دسکتاپ',
      other: 'سایر',
    },
    pricingLabels: {
      free: 'رایگان',
      one_time: 'یک‌بار پرداخت',
      subscription: 'اشتراک',
    },
  },
  en: {
    title: 'Shop',
    subtitle: 'Plugins and ready-to-deploy applications',
    mockNotice: 'Showing mock data — catalog API is not live yet.',
    loadingLabel: 'Loading products...',
    emptyLabel: 'No products found.',
    searchLabel: 'Search',
    searchPlaceholder: 'Product name or description...',
    typeLabel: 'Product type',
    pricingLabel: 'Pricing model',
    allLabel: 'All',
    applyLabel: 'Apply filters',
    resetLabel: 'Clear',
    seoTitle: 'Software shop',
    seoDescription: 'Soft Store product catalog',
    typeLabels: {
      wordpress_plugin: 'WordPress plugin',
      docker_app: 'Docker app',
      desktop: 'Desktop',
      other: 'Other',
    },
    pricingLabels: {
      free: 'Free',
      one_time: 'One-time',
      subscription: 'Subscription',
    },
  },
} as const

const t = computed(() => copy[locale.value])
const title = computed(() => t.value.title)
const subtitle = computed(() => t.value.subtitle)
const mockNotice = computed(() => t.value.mockNotice)
const loadingLabel = computed(() => t.value.loadingLabel)
const emptyLabel = computed(() => t.value.emptyLabel)
const searchLabel = computed(() => t.value.searchLabel)
const searchPlaceholder = computed(() => t.value.searchPlaceholder)
const typeLabel = computed(() => t.value.typeLabel)
const pricingLabel = computed(() => t.value.pricingLabel)
const allLabel = computed(() => t.value.allLabel)
const applyLabel = computed(() => t.value.applyLabel)
const resetLabel = computed(() => t.value.resetLabel)
const typeLabels = computed(() => t.value.typeLabels)
const pricingLabels = computed(() => t.value.pricingLabels)

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
