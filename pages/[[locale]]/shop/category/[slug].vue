<template>
  <div v-if="pending" class="page-shell py-10 text-sm text-text-secondary">{{ loadingLabel }}</div>
  <div v-else-if="!category" class="page-shell py-10 text-sm text-red-600">{{ notFoundLabel }}</div>
  <div v-else class="page-shell py-10">
    <SeoBreadcrumb :items="breadcrumbs" class="mb-6" />
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-text-primary">{{ category.name }}</h1>
      <p class="mt-2 text-text-secondary">{{ category.description }}</p>
    </header>
    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
import { localePath } from '~/utils/locale-path'

definePageMeta({
  layout: 'public',
  public: true,
})

const route = useRoute()
const locale = useAppLocale()
const slug = computed(() => String(route.params.slug))

const { getCategory, listProducts } = useCatalog()

const { data: category, pending } = await useAsyncData(
  () => `category-${locale.value}-${slug.value}`,
  () => getCategory(slug.value, locale.value),
)

const { data: productsData } = await useAsyncData(
  () => `category-products-${locale.value}-${slug.value}`,
  () => listProducts(locale.value),
)

const products = computed(
  () => productsData.value?.items.filter((p) => p.category?.slug === slug.value) ?? [],
)

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
  fa: { loadingLabel: 'در حال بارگذاری...', notFoundLabel: 'دسته‌بندی یافت نشد.' },
  en: { loadingLabel: 'Loading...', notFoundLabel: 'Category not found.' },
} as const

const t = computed(() => copy[locale.value])
const loadingLabel = computed(() => t.value.loadingLabel)
const notFoundLabel = computed(() => t.value.notFoundLabel)
</script>
