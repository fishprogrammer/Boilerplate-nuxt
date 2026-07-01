<template>
  <div class="page-shell py-10">
    <header class="mb-4">
      <h1 class="text-3xl font-bold text-text-primary">{{ pageTitle }}</h1>
      <p class="mt-2 text-text-secondary">{{ subtitle }}</p>
    </header>

    <BlogCategoryNav :locale="locale" :active-slug="categorySlug" />

    <div v-if="pending" class="text-sm text-text-secondary">{{ loadingLabel }}</div>
    <div v-else-if="loadError" class="text-sm text-red-600">{{ loadError }}</div>
    <div v-else-if="posts.length === 0" class="text-sm text-text-secondary">{{ emptyLabel }}</div>
    <div v-else class="grid gap-4">
      <article
        v-for="post in posts"
        :key="post.id"
        class="rounded-2xl border border-border bg-surface p-5"
      >
        <h2 class="text-xl font-semibold text-text-primary">
          <NuxtLink :to="localePath(locale, `/blog/${post.slug || post.id}`)" class="hover:text-primary">
            {{ post.title }}
          </NuxtLink>
        </h2>
        <p class="mt-2 text-sm text-text-secondary">{{ formatEpochSeconds(post.published_at, locale) }}</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { blogService } from '~/api/services/blog.service'
import { parseBlogPostsListResponse, parseBlogCategoryDetailResponse } from '~/api/utils/api-response'
import type { BlogPost } from '~/api/types/blog.types'
import BlogCategoryNav from '~/components/blog/BlogCategoryNav.vue'
import { formatEpochSeconds } from '~/utils/locale'
import { localePath } from '~/utils/locale-path'

definePageMeta({
  layout: 'public',
  public: true,
})

const route = useRoute()
const locale = useAppLocale()
const categorySlug = computed(() => String(route.params.slug || ''))

const categoryName = ref('')
const loadError = ref('')
const posts = ref<BlogPost[]>([])
const pending = ref(true)
const categorySeo = ref<import('~/types/seo').SeoPayload | null>(null)

const pageTitle = computed(() =>
  categoryName.value
    ? locale.value === 'fa'
      ? `دسته: ${categoryName.value}`
      : categoryName.value
    : locale.value === 'fa'
      ? 'وبلاگ'
      : 'Blog',
)
const subtitle = computed(() =>
  locale.value === 'fa' ? 'مقالات این دسته‌بندی' : 'Posts in this category',
)
const loadingLabel = computed(() => (locale.value === 'fa' ? 'در حال بارگذاری...' : 'Loading...'))
const emptyLabel = computed(() => (locale.value === 'fa' ? 'مقاله‌ای یافت نشد.' : 'No posts found.'))

try {
  const [categoryRaw, postsRaw] = await Promise.all([
    blogService.getCategoryBySlug(categorySlug.value, locale.value),
    blogService.listPosts({
      locale: locale.value,
      status: 'published',
      category_slug: categorySlug.value,
      page_size: 20,
      ordering: '-published_at',
    }),
  ])
  const category = parseBlogCategoryDetailResponse(categoryRaw)
  if (category) {
    categoryName.value = category.name
    categorySeo.value = category.seo ?? null
  }
  const parsed = parseBlogPostsListResponse(postsRaw)
  posts.value = parsed?.posts ?? []
  if (!categoryName.value) {
    categoryName.value = posts.value[0]?.category?.name || categorySlug.value
  }
} catch (error) {
  loadError.value = error instanceof Error ? error.message : 'Failed to load blog posts'
} finally {
  pending.value = false
}

watchEffect(() => {
  if (categorySeo.value) {
    useSeoFromApi(categorySeo.value, locale.value)
  }
})
</script>
