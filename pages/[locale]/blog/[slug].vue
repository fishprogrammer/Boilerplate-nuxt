<template>
  <div class="page-shell py-10">
    <div v-if="pending" class="text-sm text-text-secondary">{{ loadingLabel }}</div>
    <div v-else-if="loadError" class="text-sm text-red-600">{{ loadError }}</div>
    <article v-else-if="post" class="max-w-3xl">
      <SeoBreadcrumb :items="breadcrumbs" class="mb-6" />
      <h1 class="text-3xl font-bold text-text-primary">{{ post.title }}</h1>
      <p class="mt-3 text-sm text-text-secondary">{{ formatEpochSeconds(post.published_at, locale) }}</p>
      <div class="prose mt-8 max-w-none" v-html="post.body" />
    </article>
  </div>
</template>

<script setup lang="ts">
import { blogService } from '~/api/services/blog.service'
import { parseBlogPostDetailResponse } from '~/api/utils/api-response'
import type { BlogPost } from '~/api/types/blog.types'
import { formatEpochSeconds, type AppLocale } from '~/utils/locale'

definePageMeta({
  layout: 'public',
  middleware: ['locale'],
  public: true,
})

const route = useRoute()
const locale = computed(() => route.params.locale as AppLocale)
const slugOrId = computed(() => String(route.params.slug))

const post = ref<BlogPost | null>(null)
const pending = ref(true)
const loadError = ref('')

const loadingLabel = computed(() => (locale.value === 'fa' ? 'در حال بارگذاری...' : 'Loading...'))

try {
  const raw = await blogService.getPost(slugOrId.value)
  const parsed = parseBlogPostDetailResponse(raw)
  if (!parsed || parsed.status !== 'published') {
    loadError.value = locale.value === 'fa' ? 'مقاله منتشر نشده است.' : 'Post is not published.'
  } else {
    post.value = parsed
  }
} catch (error) {
  loadError.value = error instanceof Error ? error.message : 'Failed to load post'
} finally {
  pending.value = false
}

const breadcrumbs = computed(() => [
  { label: locale.value === 'fa' ? 'خانه' : 'Home', href: `/${locale.value}` },
  { label: locale.value === 'fa' ? 'وبلاگ' : 'Blog', href: `/${locale.value}/blog` },
  { label: post.value?.title ?? slugOrId.value, href: `/${locale.value}/blog/${slugOrId.value}` },
])

watchEffect(() => {
  if (!post.value) return
  useSeoFromApi(
    {
      title: post.value.title,
      description: post.value.body.slice(0, 160),
      canonical: `https://store.a4j.ir/${locale.value}/blog/${post.value.slug || post.value.id}`,
      robots: 'index,follow',
      og_title: post.value.title,
      og_description: post.value.body.slice(0, 160),
      og_image: 'https://store.a4j.ir/logo.png',
      hreflang: {
        fa: `https://store.a4j.ir/fa/blog/${post.value.slug || post.value.id}`,
        en: `https://store.a4j.ir/en/blog/${post.value.slug || post.value.id}`,
      },
      json_ld: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.value.title,
        datePublished: new Date(post.value.published_at * 1000).toISOString(),
      },
    },
    locale.value,
  )
})
</script>
