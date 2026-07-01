<template>
  <div v-if="pending" class="page-shell py-10 text-sm text-text-secondary">{{ loadingLabel }}</div>
  <div v-else-if="!category" class="page-shell py-10 text-sm text-red-600">{{ notFoundLabel }}</div>
  <div v-else class="page-shell py-10">
    <SeoBreadcrumb :items="breadcrumbs" class="mb-6" />
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-text-primary">{{ category.name }}</h1>
      <p class="mt-2 text-text-secondary">{{ category.description }}</p>
    </header>
    <div v-if="productsPending" class="text-sm text-text-secondary">{{ loadingLabel }}</div>
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
    <SeoJsonLd v-if="category.seo?.json_ld" :data="category.seo.json_ld" />
  </div>
</template>

<script setup lang="ts">
import { localePath } from '~/utils/locale-path'

definePageMeta({
  layout: 'public',
  public: true,
})

const route = useRoute()
const locale = useAppLocale()
const slug = computed(() => String(route.params.slug))

const { getCategory, listCategoryProducts } = useCatalog()

const { data: category, pending } = await useAsyncData(
  () => `category-${locale.value}-${slug.value}`,
  () => getCategory(slug.value, locale.value),
)

const { data: productsData, pending: productsPending } = await useAsyncData(
  () => `category-products-${locale.value}-${slug.value}`,
  () => listCategoryProducts(slug.value, { locale: locale.value, page_size: 48 }),
)

const products = computed(() => productsData.value?.items ?? [])

watchEffect(() => {
  if (category.value?.seo) {
    useSeoFromApi(category.value.seo, locale.value)
  }
})

const breadcrumbs = computed(() => [
  { label: locale.value === 'fa' ? 'خانه' : 'Home', href: localePath(locale.value, '/') },
  { label: locale.value === 'fa' ? 'فروشگاه' : 'Shop', href: localePath(locale.value, '/shop') },
  {
    label: category.value?.name ?? slug.value,
    href: localePath(locale.value, `/shop/category/${slug.value}`),
  },
])

const copy = {
  fa: { loadingLabel: 'در حال بارگذاری...', notFoundLabel: 'دسته‌بندی یافت نشد.', emptyLabel: 'محصولی در این دسته نیست.' },
  en: { loadingLabel: 'Loading...', notFoundLabel: 'Category not found.', emptyLabel: 'No products in this category.' },
} as const

const t = computed(() => copy[locale.value])
const loadingLabel = computed(() => t.value.loadingLabel)
const notFoundLabel = computed(() => t.value.notFoundLabel)
const emptyLabel = computed(() => t.value.emptyLabel)
</script>
