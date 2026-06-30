<template>
  <div v-if="pending" class="page-shell py-10 text-sm text-text-secondary">{{ loadingLabel }}</div>
  <div v-else-if="!product" class="page-shell py-10 text-sm text-red-600">{{ notFoundLabel }}</div>
  <div v-else class="page-shell py-10">
    <SeoBreadcrumb :items="breadcrumbs" class="mb-6" />

    <article>
      <header class="grid gap-8 lg:grid-cols-2">
        <div class="overflow-hidden rounded-2xl border border-border bg-surface">
          <img
            :src="product.screenshots[0]?.url || '/logo.png'"
            :alt="product.name"
            class="h-full w-full object-cover"
            width="800"
            height="500"
          />
        </div>
        <div>
          <p class="text-sm text-text-secondary">{{ versionLabel }} {{ product.current_version }}</p>
          <h1 class="mt-2 text-3xl font-bold text-text-primary">{{ product.name }}</h1>
          <p class="mt-4 text-base text-text-secondary">{{ product.short_description }}</p>
          <div class="mt-6">
            <ShopPricingTable :plans="product.plans" :locale="locale" />
          </div>
          <NuxtLink
            :to="supportUrl"
            class="mt-4 inline-flex text-sm text-primary hover:underline"
          >
            {{ supportLabel }}
          </NuxtLink>
        </div>
      </header>

      <section class="prose mt-10 max-w-none" v-html="product.description_html" />

      <section v-if="product.faqs.length" class="mt-10">
        <h2 class="mb-4 text-2xl font-semibold">{{ faqTitle }}</h2>
        <div class="space-y-3">
          <details
            v-for="faq in product.faqs"
            :key="faq.question"
            class="rounded-xl border border-border bg-surface p-4"
          >
            <summary class="cursor-pointer font-medium">{{ faq.question }}</summary>
            <p class="mt-2 text-sm text-text-secondary">{{ faq.answer }}</p>
          </details>
        </div>
      </section>

      <section v-if="product.related_products.length" class="mt-12">
        <h2 class="mb-4 text-2xl font-semibold">{{ relatedTitle }}</h2>
        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <ShopProductCard
            v-for="item in product.related_products"
            :key="item.id"
            :product="item"
            :locale="locale"
          />
        </div>
      </section>
    </article>

    <SeoJsonLd :data="product.seo.json_ld" />
  </div>
</template>

<script setup lang="ts">
import { isAppLocale, type AppLocale } from '~/utils/locale'

definePageMeta({
  layout: 'public',
  middleware: ['locale'],
  public: true,
})

const route = useRoute()
const locale = computed(() => route.params.locale as AppLocale)
const slug = computed(() => String(route.params.slug))

const { getProduct } = useCatalog()

const { data: product, pending } = await useAsyncData(
  () => `product-${locale.value}-${slug.value}`,
  () => getProduct(slug.value, locale.value),
)

watchEffect(() => {
  if (product.value?.seo) {
    useSeoFromApi(product.value.seo, locale.value)
  }
})

const breadcrumbs = computed(() => [
  { label: locale.value === 'fa' ? 'خانه' : 'Home', href: `/${locale.value}` },
  { label: locale.value === 'fa' ? 'فروشگاه' : 'Shop', href: `/${locale.value}/shop` },
  { label: product.value?.name ?? slug.value, href: `/${locale.value}/shop/${slug.value}` },
])

const supportUrl = computed(
  () => `/tickets/create?product=${encodeURIComponent(slug.value)}`,
)

const copy = {
  fa: {
    loadingLabel: 'در حال بارگذاری محصول...',
    notFoundLabel: 'محصول یافت نشد.',
    versionLabel: 'نسخه',
    supportLabel: 'نیاز به پشتیبانی دارید؟ تیکت باز کنید',
    faqTitle: 'سوالات متداول',
    relatedTitle: 'محصولات مرتبط',
  },
  en: {
    loadingLabel: 'Loading product...',
    notFoundLabel: 'Product not found.',
    versionLabel: 'Version',
    supportLabel: 'Need support? Open a ticket',
    faqTitle: 'FAQ',
    relatedTitle: 'Related products',
  },
} as const

const t = computed(() => copy[locale.value])
const loadingLabel = computed(() => t.value.loadingLabel)
const notFoundLabel = computed(() => t.value.notFoundLabel)
const versionLabel = computed(() => t.value.versionLabel)
const supportLabel = computed(() => t.value.supportLabel)
const faqTitle = computed(() => t.value.faqTitle)
const relatedTitle = computed(() => t.value.relatedTitle)
</script>
