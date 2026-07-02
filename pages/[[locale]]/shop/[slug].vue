<template>
  <div v-if="pending" class="page-shell py-10 text-sm text-text-secondary">{{ loadingLabel }}</div>
  <div v-else-if="!product" class="page-shell py-10 text-sm text-red-600">{{ notFoundLabel }}</div>
  <div v-else class="page-shell py-10">
    <SeoBreadcrumb :items="breadcrumbs" class="mb-6" />

    <article>
      <header class="grid gap-8 lg:grid-cols-2">
        <ShopProductGallery :screenshots="product.screenshots" :name="product.name" />
        <div>
          <p v-if="product.current_version" class="text-sm text-text-secondary">
            {{ versionLabel }} {{ product.current_version }}
          </p>
          <h1 class="mt-2 text-3xl font-bold text-text-primary">{{ product.name }}</h1>
          <p class="mt-4 text-base text-text-secondary">{{ product.short_description }}</p>
          <div v-if="defaultPlan" class="mt-4 text-2xl font-bold text-primary">{{ heroPrice }}</div>
          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink :to="buyUrl" class="btn-action-sm">{{ ctaLabel }}</NuxtLink>
            <NuxtLink :to="supportUrl" class="btn-muted-sm">{{ supportLabel }}</NuxtLink>
          </div>
          <ul v-if="defaultPlan?.features?.length" class="mt-6 space-y-2 text-sm text-text-secondary">
            <li v-for="feature in defaultPlan.features" :key="feature" class="flex gap-2">
              <span class="text-primary">✓</span>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>
      </header>

      <div v-if="product.video_url" class="mt-10 aspect-video overflow-hidden rounded-2xl border border-border">
        <iframe
          :src="product.video_url"
          class="h-full w-full"
          title="Product video"
          loading="lazy"
          allowfullscreen
        />
      </div>

      <section class="prose mt-10 max-w-none" v-html="sanitizedDescription" />

      <section class="mt-10">
        <h2 class="mb-4 text-2xl font-semibold">{{ plansTitle }}</h2>
            <ShopPricingTable :plans="product.plans" :locale="locale" :product-slug="product.slug" />
      </section>

      <section v-if="product.changelog_summary" class="mt-10 rounded-2xl border border-border bg-surface p-5">
        <h2 class="mb-2 text-xl font-semibold">{{ changelogTitle }}</h2>
        <p class="text-sm text-text-secondary">{{ product.changelog_summary }}</p>
      </section>

      <section v-if="product.faqs.length" class="mt-10">
        <h2 class="mb-4 text-2xl font-semibold">{{ faqTitle }}</h2>
        <ShopFaqAccordion :faqs="product.faqs" />
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
import { localePath } from '~/utils/locale-path'
import { formatIRR } from '~/utils/locale'
import { sanitizeProductHtml } from '~/utils/sanitize-html'

definePageMeta({
  layout: 'public',
  public: true,
})

const route = useRoute()
const locale = useAppLocale()
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

const defaultPlan = computed(() => {
  const plans = product.value?.plans ?? []
  return plans.find((p) => p.is_default) ?? plans[0] ?? null
})

const sanitizedDescription = computed(() =>
  sanitizeProductHtml(product.value?.description_html ?? ''),
)

const heroPrice = computed(() => {
  const plan = defaultPlan.value
  if (!plan) return '—'
  if (plan.pricing_model === 'free' || plan.price === 0) {
    return locale.value === 'fa' ? 'رایگان' : 'Free'
  }
  return formatIRR(plan.price, locale.value)
})

const ctaLabel = computed(() => {
  const plan = defaultPlan.value
  if (!plan) return locale.value === 'fa' ? 'خرید' : 'Buy'
  if (plan.pricing_model === 'free' || plan.price === 0) {
    return locale.value === 'fa' ? 'دریافت رایگان' : 'Get free'
  }
  return locale.value === 'fa' ? 'خرید' : 'Buy'
})

const buyUrl = computed(() => {
  const planId = defaultPlan.value?.id
  if (!planId) return localePath(locale.value, '/shop')
  const params = new URLSearchParams({ plan: planId, product: slug.value })
  return `/checkout?${params.toString()}`
})

const supportUrl = computed(
  () => `/panel/tickets/new?product=${encodeURIComponent(slug.value)}`,
)

const breadcrumbs = computed(() => [
  { label: locale.value === 'fa' ? 'خانه' : 'Home', href: localePath(locale.value, '/') },
  { label: locale.value === 'fa' ? 'فروشگاه' : 'Shop', href: localePath(locale.value, '/shop') },
  {
    label: product.value?.name ?? slug.value,
    href: localePath(locale.value, `/shop/${slug.value}`),
  },
])

const copy = {
  fa: {
    loadingLabel: 'در حال بارگذاری محصول...',
    notFoundLabel: 'محصول یافت نشد.',
    versionLabel: 'نسخه',
    supportLabel: 'پشتیبانی / تیکت',
    faqTitle: 'سوالات متداول',
    relatedTitle: 'محصولات مرتبط',
    plansTitle: 'پلن‌ها و قیمت',
    changelogTitle: 'تغییرات اخیر',
  },
  en: {
    loadingLabel: 'Loading product...',
    notFoundLabel: 'Product not found.',
    versionLabel: 'Version',
    supportLabel: 'Support ticket',
    faqTitle: 'FAQ',
    relatedTitle: 'Related products',
    plansTitle: 'Plans & pricing',
    changelogTitle: 'Recent changes',
  },
} as const

const t = computed(() => copy[locale.value])
const loadingLabel = computed(() => t.value.loadingLabel)
const notFoundLabel = computed(() => t.value.notFoundLabel)
const versionLabel = computed(() => t.value.versionLabel)
const supportLabel = computed(() => t.value.supportLabel)
const faqTitle = computed(() => t.value.faqTitle)
const relatedTitle = computed(() => t.value.relatedTitle)
const plansTitle = computed(() => t.value.plansTitle)
const changelogTitle = computed(() => t.value.changelogTitle)
</script>
