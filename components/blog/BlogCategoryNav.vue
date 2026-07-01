<template>
  <nav v-if="categories.length" class="mb-6 flex flex-wrap gap-2">
    <NuxtLink
      :to="localePath(locale, '/blog')"
      class="rounded-full border px-3 py-1 text-sm transition-colors"
      :class="activeSlug ? 'border-border text-text-secondary hover:border-primary hover:text-primary' : 'border-primary bg-primary/10 text-primary'"
    >
      {{ allLabel }}
    </NuxtLink>
    <NuxtLink
      v-for="category in categories"
      :key="category.id"
      :to="localePath(locale, `/blog/category/${category.slug}`)"
      class="rounded-full border px-3 py-1 text-sm transition-colors"
      :class="activeSlug === category.slug ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:border-primary hover:text-primary'"
    >
      {{ category.name }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { blogService } from '~/api/services/blog.service'
import type { BlogCategory } from '~/api/types/blog.types'
import { parseBlogCategoriesListResponse } from '~/api/utils/api-response'
import { localePath } from '~/utils/locale-path'
import type { AppLocale } from '~/utils/locale'

const props = defineProps<{
  locale: AppLocale
  activeSlug?: string
}>()

const categories = ref<BlogCategory[]>([])

const allLabel = computed(() => (props.locale === 'fa' ? 'همه' : 'All'))

try {
  const raw = await blogService.listCategories({
    locale: props.locale,
    is_active: true,
    page_size: 50,
    ordering: 'sort_order',
  })
  categories.value = parseBlogCategoriesListResponse(raw)?.categories ?? []
} catch {
  categories.value = []
}
</script>
