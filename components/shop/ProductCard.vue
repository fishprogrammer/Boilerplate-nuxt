<template>
  <article class="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <NuxtLink :to="productUrl" class="block">
      <div class="relative aspect-[16/10] bg-app-bg">
        <span
          class="absolute start-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold"
          :class="badgeClass"
        >
          {{ pricingBadge }}
        </span>
        <img
          v-if="product.thumbnail_url"
          :src="product.thumbnail_url"
          :alt="product.name"
          class="h-full w-full object-cover"
          loading="lazy"
          width="400"
          height="250"
        />
        <div v-else class="flex h-full items-center justify-center text-text-muted">
          {{ product.name.charAt(0) }}
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-2 p-4">
        <p v-if="product.category" class="text-xs text-text-secondary">
          {{ product.category.name }}
        </p>
        <h3 class="text-lg font-semibold text-text-primary">{{ product.name }}</h3>
        <p class="line-clamp-2 text-sm text-text-secondary">{{ product.short_description }}</p>
        <p class="mt-auto text-base font-bold text-primary">
          {{ priceLabel }}
        </p>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { CatalogProductListItem } from '~/types/catalog'
import { formatIRR, type AppLocale } from '~/utils/locale'
import { localePath } from '~/utils/locale-path'

const props = defineProps<{
  product: CatalogProductListItem
  locale: AppLocale
}>()

const productUrl = computed(() => localePath(props.locale, `/shop/${props.product.slug}`))

const priceLabel = computed(() => {
  if (props.product.pricing_model === 'free' || props.product.price_from === 0) {
    return props.locale === 'fa' ? 'رایگان' : 'Free'
  }
  if (props.product.price_from == null) return '—'
  return formatIRR(props.product.price_from, props.locale)
})

const pricingBadge = computed(() => {
  const labels = {
    fa: { free: 'رایگان', one_time: 'یک‌بار', subscription: 'اشتراک' },
    en: { free: 'Free', one_time: 'One-time', subscription: 'Subscription' },
  }
  return labels[props.locale][props.product.pricing_model]
})

const badgeClass = computed(() => {
  if (props.product.pricing_model === 'free') return 'bg-emerald-100 text-emerald-800'
  if (props.product.pricing_model === 'subscription') return 'bg-violet-100 text-violet-800'
  return 'bg-sky-100 text-sky-800'
})
</script>
