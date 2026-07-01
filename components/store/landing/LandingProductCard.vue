<template>
  <article class="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/50">
    <div class="relative overflow-hidden">
      <NuxtLink :to="productUrl" class="block aspect-square overflow-hidden bg-linear-to-br from-emerald-100 to-teal-100">
        <img
          v-if="product.thumbnail_url"
          :src="product.thumbnail_url"
          :alt="product.name"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <div v-else class="flex h-full items-center justify-center bg-emerald-50/60">
          <LandingStrokeIcon
            path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            icon-bg="bg-emerald-100"
            icon-color="text-primary"
            size="lg"
          />
        </div>
      </NuxtLink>
      <div
        v-if="categoryLabel"
        class="absolute bottom-4 right-4 rounded-xl bg-violet-600 px-3 py-1 text-xs font-bold text-white"
      >
        {{ categoryLabel }}
      </div>
    </div>

    <div class="p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 text-amber-500">
          <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span class="text-sm font-semibold">5</span>
        </div>
      </div>

      <h3 class="line-clamp-2 text-lg font-black leading-8 text-slate-900 transition group-hover:text-primary">
        <NuxtLink :to="productUrl">{{ product.name }}</NuxtLink>
      </h3>

      <p class="mt-4 line-clamp-2 text-sm leading-7 text-slate-500">
        {{ product.short_description }}
      </p>

      <div class="mt-6 flex items-center justify-between gap-4">
        <div class="text-2xl font-black text-slate-900">{{ priceLabel }}</div>
        <NuxtLink
          :to="productUrl"
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-110 hover:bg-primary-dark"
          :aria-label="product.name"
        >
          <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import LandingStrokeIcon from '~/components/store/landing/LandingStrokeIcon.vue'
import type { CatalogProductListItem } from '~/types/catalog'
import { formatIRR, type AppLocale } from '~/utils/locale'
import { localePath } from '~/utils/locale-path'

const props = defineProps<{
  product: CatalogProductListItem
  locale: AppLocale
}>()

const productUrl = computed(() => localePath(props.locale, `/shop/${props.product.slug}`))

const categoryLabel = computed(() => props.product.category?.name ?? '')

const priceLabel = computed(() => {
  if (props.product.pricing_model === 'free' || props.product.price_from === 0) {
    return props.locale === 'fa' ? 'رایگان' : 'Free'
  }
  if (props.product.price_from == null) return '—'
  return formatIRR(props.product.price_from, props.locale)
})
</script>
