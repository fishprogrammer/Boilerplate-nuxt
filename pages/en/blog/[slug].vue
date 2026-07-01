<template>
  <div class="page-shell py-10">
    <div v-if="pending" class="text-sm text-text-secondary">{{ loadingLabel }}</div>
    <div v-else-if="loadError" class="text-sm text-red-600">{{ loadError }}</div>
    <article v-else-if="post" class="max-w-3xl">
      <SeoBreadcrumb :items="breadcrumbs" class="mb-6" />
      <h1 class="text-3xl font-bold text-text-primary">{{ post.title }}</h1>
      <p class="mt-3 text-sm text-text-secondary">{{ formatEpochSeconds(post.published_at, 'en') }}</p>
      <div class="prose mt-8 max-w-none" v-html="post.body" />
    </article>
  </div>
</template>

<script setup lang="ts">
import { blogService } from '~/api/services/blog.service'
import { parseBlogPostDetailResponse } from '~/api/utils/api-response'
import type { BlogPost } from '~/api/types/blog.types'
import { formatEpochSeconds } from '~/utils/locale'
import { localePath } from '~/utils/locale-path'
import { resolveBlogPostSeo } from '~/utils/blog-seo'

definePageMeta({
  layout: 'public',
  public: true,
})

const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://store.a4j.ir')
const slugOrId = computed(() => String(route.params.slug))

const post = ref<BlogPost | null>(null)
const pending = ref(true)
const loadError = ref('')
const loadingLabel = computed(() => 'Loading...')

try {
  const raw =
    (await blogService.getPublishedPostBySlug(slugOrId.value, 'en')) ??
    (await blogService.getPost(slugOrId.value))
  const parsed = parseBlogPostDetailResponse(raw)
  if (!parsed || parsed.status !== 'published' || parsed.locale !== 'en') {
    loadError.value = 'Post is not published.'
  } else {
    post.value = parsed
  }
} catch (error) {
  loadError.value = error instanceof Error ? error.message : 'Failed to load post'
} finally {
  pending.value = false
}

const breadcrumbs = computed(() => [
  { label: 'Home', href: localePath('en', '/') },
  { label: 'Blog', href: localePath('en', '/blog') },
  {
    label: post.value?.title ?? slugOrId.value,
    href: localePath('en', `/blog/${slugOrId.value}`),
  },
])

watchEffect(() => {
  if (!post.value) return
  useSeoFromApi(resolveBlogPostSeo(post.value, 'en', siteUrl), 'en')
})
</script>
