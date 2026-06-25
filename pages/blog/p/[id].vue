<template>
    <div class="min-h-screen bg-app-bg text-text-primary" dir="rtl">
        <div class="page-shell flex w-full flex-col items-center px-2 py-6 md:px-4 md:py-12">
            <div
                v-if="post?.status === 'draft'"
                class="mb-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
            >
                پیش‌نویس — این پست هنوز منتشر نشده است
            </div>

            <div
                v-if="isLoading"
                class="flex w-full max-w-3xl items-center justify-center rounded-2xl border border-border bg-surface px-6 py-16 shadow-sm"
            >
                <p class="text-sm text-text-secondary">در حال بارگذاری...</p>
            </div>

            <div
                v-else-if="loadError"
                class="w-full max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <article
                v-else-if="post"
                class="w-full max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8"
            >
                <header class="mb-8 border-b border-border pb-6 text-center">
                    <h1 class="text-2xl font-bold leading-snug text-text-primary md:text-3xl">
                        {{ post.title || 'بدون عنوان' }}
                    </h1>

                    <div class="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                        <time :datetime="displayDateIso">{{ displayDateLabel }}</time>
                        <template v-if="post.updated_at > post.created_at">
                            <span aria-hidden="true">·</span>
                            <span>به‌روزرسانی {{ formatBlogPostDate(post.updated_at) }}</span>
                        </template>
                    </div>
                </header>

                <div
                    v-if="hasBody"
                    class="blog-entry-content text-base leading-relaxed text-text-primary dark:text-white"
                    dir="rtl"
                    v-html="displayBody"
                />
                <p v-else class="py-12 text-center text-sm text-text-muted">
                    متنی برای این پست ثبت نشده است.
                </p>

                <BlogPostComments
                    v-if="post.status === 'published'"
                    :post-id="post.id"
                />
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'view-blog',
  layout: 'blank',
  standalone: true,
  title: 'مشاهده پست'
})

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import moment from 'moment-jalaali'
import { blogService } from '~/api/services/blog.service'
import type { BlogPost } from '~/api/types/blog.types'
import { parseBlogPostDetailResponse } from '~/api/utils/api-response'
import { getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { formatBlogPostDate } from '~/utils/blog'
import { isHtmlContentEmpty, prepareBlogBodyHtmlForDisplay } from '~/utils/html'
import BlogPostComments from '~/components/blog/BlogPostComments.vue'

const route = useRoute()

const post = ref<BlogPost | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const postId = computed(() => String(route.params.id || ''))

const hasBody = computed(() => post.value ? !isHtmlContentEmpty(post.value.body) : false)

const displayBody = computed(() =>
    post.value ? prepareBlogBodyHtmlForDisplay(post.value.body) : '',
)

const displayTimestamp = computed(() => {
    if (!post.value) return 0
    if (post.value.status === 'published' && post.value.published_at > 0) {
        return post.value.published_at
    }
    return post.value.created_at
})

const displayDateLabel = computed(() => formatBlogPostDate(displayTimestamp.value))

const displayDateIso = computed(() => {
    const ts = displayTimestamp.value
    if (!Number.isFinite(ts) || ts <= 0) return undefined
    const seconds = ts > 1e12 ? Math.floor(ts / 1000) : Math.floor(ts)
    return moment.unix(seconds).toISOString()
})

async function fetchPost() {
    if (!postId.value) {
        loadError.value = 'شناسه پست نامعتبر است.'
        isLoading.value = false
        return
    }

    isLoading.value = true
    loadError.value = null
    post.value = null

    try {
        const response = await blogService.getPost(postId.value)
        const parsed = parseBlogPostDetailResponse(response)

        if (!parsed) {
            loadError.value = getApiResponseMessage(response, 'پست یافت نشد.')
            return
        }

        post.value = parsed
    } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } }
        if (axiosErr.response?.status === 404) {
            loadError.value = 'پست مورد نظر یافت نشد.'
            return
        }
        loadError.value = getApiErrorMessage(err, 'خطا در بارگذاری پست')
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchPost)

watch(postId, (nextId, prevId) => {
    if (nextId && nextId !== prevId) {
        fetchPost()
    }
})
</script>

<style scoped>
.blog-entry-content {
    color: var(--color-text-primary);
    overflow-wrap: anywhere;
}

.blog-entry-content :deep(p),
.blog-entry-content :deep(li),
.blog-entry-content :deep(td),
.blog-entry-content :deep(th),
.blog-entry-content :deep(div),
.blog-entry-content :deep(span) {
    color: inherit;
}

.blog-entry-content :deep(p) {
    margin: 0 0 1.25em;
}

.blog-entry-content :deep(p:last-child) {
    margin-bottom: 0;
}

.blog-entry-content :deep(h1),
.blog-entry-content :deep(h2),
.blog-entry-content :deep(h3),
.blog-entry-content :deep(h4),
.blog-entry-content :deep(h5),
.blog-entry-content :deep(h6) {
    color: var(--color-text-primary);
    font-weight: 700;
    line-height: 1.35;
    margin: 1.75em 0 0.75em;
}

.blog-entry-content :deep(h1) { font-size: 2em; }
.blog-entry-content :deep(h2) { font-size: 1.625em; }
.blog-entry-content :deep(h3) { font-size: 1.375em; }
.blog-entry-content :deep(h4) { font-size: 1.125em; }
.blog-entry-content :deep(h5),
.blog-entry-content :deep(h6) { font-size: 1em; }

.blog-entry-content :deep(h1:first-child),
.blog-entry-content :deep(h2:first-child),
.blog-entry-content :deep(h3:first-child),
.blog-entry-content :deep(h4:first-child),
.blog-entry-content :deep(h5:first-child),
.blog-entry-content :deep(h6:first-child) {
    margin-top: 0;
}

.blog-entry-content :deep(ul),
.blog-entry-content :deep(ol) {
    margin: 0 0 1.25em;
    padding-right: 1.625em;
    padding-left: 0;
}

.blog-entry-content :deep(li) {
    margin-bottom: 0.35em;
}

.blog-entry-content :deep(li > ul),
.blog-entry-content :deep(li > ol) {
    margin-top: 0.35em;
    margin-bottom: 0;
}

.blog-entry-content :deep(blockquote) {
    margin: 1.5em 0;
    padding: 0.5em 1.25em 0.5em 0;
    border-right: 4px solid var(--color-secondary);
    border-left: none;
    color: var(--color-text-secondary);
    font-style: italic;
}

.blog-entry-content :deep(a) {
    color: var(--color-secondary-dark);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.blog-entry-content :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.75em auto;
}

.blog-entry-content :deep(pre),
.blog-entry-content :deep(pre.ql-syntax) {
    direction: ltr;
    text-align: left;
    overflow-x: auto;
    margin: 1.5em 0;
    padding: 1em 1.25em;
    border-radius: 0.375rem;
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
    font-size: 0.875em;
    line-height: 1.6;
}

.blog-entry-content :deep(code) {
    direction: ltr;
    unicode-bidi: plaintext;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.875em;
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-muted);
    color: var(--color-text-primary);
    border-radius: 0.25rem;
    padding: 0.15em 0.4em;
}

.blog-entry-content :deep(.ql-direction-ltr) {
    direction: ltr;
    text-align: left;
}

.blog-entry-content :deep(.ql-direction-rtl),
.blog-entry-content :deep(.ql-align-right) {
    direction: rtl;
    text-align: right;
}

.blog-entry-content :deep(.ql-align-center) {
    text-align: center;
}

.blog-entry-content :deep(.ql-align-left) {
    direction: ltr;
    text-align: left;
}
</style>

<style>
.dark .blog-entry-content,
.dark .blog-entry-content :is(p, li, ol, ul, span, div, td, th, blockquote, pre, code, h1, h2, h3, h4, h5, h6, strong, em, u, s) {
    color: #ffffff !important;
}

.dark .blog-entry-content a {
    color: var(--color-secondary) !important;
}
</style>
