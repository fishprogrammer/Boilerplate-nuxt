<template>
  <div class="page-shell py-10">
    <header class="mb-4">
      <h1 class="text-3xl font-bold text-text-primary">{{ pageTitle }}</h1>
      <p class="mt-2 text-text-secondary">{{ subtitle }}</p>
    </header>

    <BlogCategoryNav locale="en" :active-slug="categorySlug" />

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
          <NuxtLink :to="localePath('en', `/blog/${post.slug || post.id}`)" class="hover:text-primary">
            {{ post.title }}
          </NuxtLink>
        </h2>
        <p class="mt-2 text-sm text-text-secondary">{{ formatEpochSeconds(post.published_at, 'en') }}</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { blogService } from '~/api/services/blog.service'
import { parseBlogPostsListResponse } from '~/api/utils/api-response'
import type { BlogPost } from '~/api/types/blog.types'
import BlogCategoryNav from '~/components/blog/BlogCategoryNav.vue'
import { formatEpochSeconds } from '~/utils/locale'
import { absoluteSiteUrl, localeHreflang, localePath } from '~/utils/locale-path'

definePageMeta({
  layout: 'public',
  public: true,
})

const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://store.a4j.ir')
const categorySlug = computed(() => String(route.params.slug || ''))

const categoryName = ref('')
const loadError = ref('')
const posts = ref<BlogPost[]>([])
const pending = ref(true)

const pageTitle = computed(() => categoryName.value || 'Blog')
const subtitle = computed(() => 'Posts in this category')
const loadingLabel = computed(() => 'Loading...')
const emptyLabel = computed(() => 'No posts found.')

try {
  const raw = await blogService.listPosts({
    locale: 'en',
    status: 'published',
    category_slug: categorySlug.value,
    page_size: 20,
    ordering: '-published_at',
  })
  const parsed = parseBlogPostsListResponse(raw)
  posts.value = parsed?.posts ?? []
  categoryName.value = posts.value[0]?.category?.name || categorySlug.value
} catch (error) {
  loadError.value = error instanceof Error ? error.message : 'Failed to load blog posts'
} finally {
  pending.value = false
}

const categoryPath = computed(() => `/blog/category/${categorySlug.value}`)

useSeoFromApi(
  {
    title: pageTitle.value,
    description: subtitle.value,
    canonical: absoluteSiteUrl(siteUrl, 'en', categoryPath.value),
    robots: 'index,follow',
    og_title: pageTitle.value,
    og_description: subtitle.value,
    og_image: `${siteUrl}/logo.png`,
    hreflang: localeHreflang(siteUrl, categoryPath.value),
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle.value,
      url: absoluteSiteUrl(siteUrl, 'en', categoryPath.value),
    },
  },
  'en',
)
</script>
