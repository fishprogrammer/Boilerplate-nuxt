<template>
  <nav v-if="categories.length" class="mb-6 flex flex-wrap gap-2">
    <NuxtLink
      :to="shopUrl"
      class="rounded-full border px-3 py-1 text-sm transition"
      :class="!activeSlug ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:border-primary/40'"
    >
      {{ allLabel }}
    </NuxtLink>
    <NuxtLink
      v-for="category in categories"
      :key="category.id"
      :to="localePath(locale, `/shop/category/${category.slug}`)"
      class="rounded-full border px-3 py-1 text-sm transition"
      :class="activeSlug === category.slug ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:border-primary/40'"
    >
      {{ category.name }}
      <span v-if="category.product_count" class="mr-1 text-xs opacity-70">({{ category.product_count }})</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import type { CatalogCategory } from '~/types/catalog'
import type { AppLocale } from '~/utils/locale'
import { localePath } from '~/utils/locale-path'

const props = defineProps<{
  locale: AppLocale
  categories: CatalogCategory[]
  activeSlug?: string
}>()

const shopUrl = computed(() => localePath(props.locale, '/shop'))

const allLabel = computed(() => (props.locale === 'fa' ? 'همه' : 'All'))
</script>
