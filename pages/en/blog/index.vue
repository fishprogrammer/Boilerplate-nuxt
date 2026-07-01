<template>
  <div class="page-shell py-10">
    <header class="mb-4">
      <h1 class="text-3xl font-bold text-text-primary">{{ title }}</h1>
      <p class="mt-2 text-text-secondary">{{ subtitle }}</p>
    </header>

    <BlogCategoryNav locale="en" />

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
import { parseBlogPostsListResponse } from '~/api/utils/api-response'
import type { BlogPost } from '~/api/types/blog.types'
import BlogCategoryNav from '~/components/blog/BlogCategoryNav.vue'
import { formatEpochSeconds } from '~/utils/locale'
import { absoluteSiteUrl, localeHreflang } from '~/utils/locale-path'

definePageMeta({
  layout: 'public',
  public: true,
})

const locale = computed(() => 'en' as const)
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://store.a4j.ir')

const title = computed(() => 'Blog')
const subtitle = computed(() => 'Soft Store articles and guides')
const loadingLabel = computed(() => 'Loading...')
const emptyLabel = computed(() => 'No posts found.')

const loadError = ref('')
const posts = ref<BlogPost[]>([])
const pending = ref(true)

try {
  const raw = await blogService.listPosts({
    locale: 'en',
    status: 'published',
    page_size: 20,
    ordering: '-published_at',
  })
  const parsed = parseBlogPostsListResponse(raw)
  posts.value = parsed?.posts ?? []
} catch (error) {
  loadError.value = error instanceof Error ? error.message : 'Failed to load blog posts'
} finally {
  pending.value = false
}

useSeoFromApi(
  {
    title: title.value,
    description: subtitle.value,
    canonical: absoluteSiteUrl(siteUrl, 'en', '/blog'),
    robots: 'index,follow',
    og_title: title.value,
    og_description: subtitle.value,
    og_image: `${siteUrl}/logo.png`,
    hreflang: localeHreflang(siteUrl, '/blog'),
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: title.value,
      url: absoluteSiteUrl(siteUrl, 'en', '/blog'),
    },
  },
  'en',
)
</script>
