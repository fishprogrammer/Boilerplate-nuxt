<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">ویرایش پست</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        ویرایش اطلاعات پست بلاگ
                    </p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                </div>
            </div>

            <BlogPostFormSkeleton
                v-if="isLoading"
                aria-label="در حال بارگذاری فرم ویرایش پست"
            />

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <form v-else @submit.prevent class="space-y-5">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div class="sm:col-span-2">
                        <label for="blog-title" class="mb-1 block text-xs font-medium text-text-primary">عنوان</label>
                        <input
                            id="blog-title"
                            v-model="title"
                            type="text"
                            placeholder="عنوان پست"
                            :class="inputClass('title')"
                            @input="clearFieldError('title')"
                            @keydown.enter.prevent
                        />
                        <p v-if="fieldErrors.title" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.title }}</p>
                    </div>
                    <div>
                        <label for="blog-status" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
                        <select
                            id="blog-status"
                            v-model="status"
                            :class="inputClass('status')"
                            @change="clearFieldError('status')"
                        >
                            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                        <p v-if="fieldErrors.status" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.status }}</p>
                    </div>
                </div>

                <div>
                    <label for="blog-slug" class="mb-1 block text-xs font-medium text-text-primary">
                        slug
                        <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="blog-slug"
                        v-model="slug"
                        type="text"
                        dir="ltr"
                        required
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="my-post-slug"
                        :class="inputClass('slug', true)"
                        @input="onSlugInput"
                        @keydown.enter.prevent
                    />
                    <p class="mt-1 text-xs text-text-muted">اجباری — حروف انگلیسی، اعداد، خط تیره و زیرخط.</p>
                    <p v-if="fieldErrors.slug" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.slug }}</p>
                </div>

                <div>
                    <label class="mb-1 block text-xs font-medium text-text-primary">متن</label>
                    <HtmlEditor
                        :key="editorKey"
                        v-model="body"
                        placeholder="متن پست..."
                        :invalid="Boolean(fieldErrors.body)"
                        @update:model-value="clearFieldError('body')"
                    />
                    <p v-if="fieldErrors.body" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.body }}</p>
                </div>

                <p
                    v-if="status === 'published' && previousStatus !== 'published'"
                    class="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300"
                >
                    با انتخاب «منتشر شده»، زمان انتشار به‌صورت خودکار روی زمان فعلی تنظیم می‌شود.
                </p>

                <div class="flex flex-wrap gap-2">
                    <button
                        type="button"
                        :disabled="isSaving"
                        class="btn-action-sm"
                        @click="submitUpdate"
                    >
                        {{ submitLabel }}
                    </button>
                    <RouterLink
                        :to="{ name: 'blog' }"
                        class="btn-muted-sm"
                    >
                        انصراف
                    </RouterLink>
                </div>

                <div
                    v-if="saveError || hasFieldErrors"
                    class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/40"
                >
                    <p v-if="saveError" class="text-sm font-medium text-red-700 dark:text-red-300">{{ saveError }}</p>
                    <ul v-if="hasFieldErrors" class="mt-2 list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-400">
                        <li v-for="(message, field) in fieldErrors" :key="field">
                            <span class="font-medium">{{ fieldLabel(field) }}:</span>
                            {{ message }}
                        </li>
                    </ul>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'edit-blog',
  layout: 'dashboard'
})

import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { blogService } from '~/api/services/blog.service'
import type { BlogPostStatus } from '~/api/types/blog.types'
import {
    buildUpdateBlogPostPayload,
    parseBlogPostDetailResponse,
    parseUpdateBlogPostResponse,
} from '~/api/utils/api-response'
import HtmlEditor from '~/components/HtmlEditor.vue'
import BlogPostFormSkeleton from '~/components/skeleton/BlogPostFormSkeleton.vue'
import { showToast } from '~/composables/useToast'
import { API_FIELD_LABELS, extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { BLOG_POST_STATUS_OPTIONS, normalizeBlogSlug, openBlogPreview, validateBlogSlug } from '~/utils/blog'
import { isHtmlContentEmpty } from '~/utils/html'

const route = useRoute()
const router = useRouter()

const statusOptions = BLOG_POST_STATUS_OPTIONS

const postId = computed(() => String(route.params.id || ''))

const title = ref('')
const slug = ref('')
const body = ref('')
const status = ref<BlogPostStatus>('draft')
const previousStatus = ref<BlogPostStatus>('draft')
const previousPublishedAt = ref(0)
const editorKey = ref(0)

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isSaving = ref(false)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const hasFieldErrors = computed(() => Object.keys(fieldErrors).length > 0)

const submitLabel = computed(() =>
    isSaving.value ? 'در حال بروزرسانی...' : 'بروزرسانی',
)

function fieldLabel(field: string): string {
    return API_FIELD_LABELS[field] || field
}

function inputClass(field: string, ltr = false): string {
    const base = fieldErrors[field]
        ? `${fieldClass} border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : fieldClass
    return ltr ? `${base} dir-ltr text-right` : base
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function onSlugInput() {
    clearFieldError('slug')
    slug.value = normalizeBlogSlug(slug.value)
}

function applyApiErrors(err: unknown, fallbackMessage: string) {
    clearFieldErrors()
    Object.assign(fieldErrors, extractApiFieldErrors(err))

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = getApiResponseMessage(err, 'اعتبارسنجی ناموفق بود')
        return
    }

    saveError.value = getApiErrorMessage(err, fallbackMessage)
}

function populateForm(data: {
    title: string
    slug: string
    body: string
    status: BlogPostStatus
    published_at: number
}) {
    title.value = data.title
    slug.value = data.slug.trim()
    body.value = data.body
    status.value = data.status
    previousStatus.value = data.status
    previousPublishedAt.value = data.published_at
    editorKey.value += 1
}

async function fetchPost() {
    if (!postId.value) {
        loadError.value = 'شناسه پست نامعتبر است.'
        isLoading.value = false
        return
    }

    isLoading.value = true
    loadError.value = null

    try {
        const response = await blogService.getPost(postId.value)
        const post = parseBlogPostDetailResponse(response)

        if (!post) {
            loadError.value = getApiResponseMessage(response, 'پست یافت نشد.')
            return
        }

        populateForm(post)
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در بارگذاری پست')
    } finally {
        isLoading.value = false
    }
}

async function submitUpdate() {
    if (isSaving.value) return

    saveError.value = null
    clearFieldErrors()

    if (!title.value.trim()) {
        fieldErrors.title = 'عنوان الزامی است.'
        saveError.value = 'عنوان الزامی است.'
        return
    }

    const slugError = validateBlogSlug(slug.value)
    if (slugError) {
        fieldErrors.slug = slugError
        saveError.value = slugError
        return
    }

    if (isHtmlContentEmpty(body.value)) {
        fieldErrors.body = 'متن پست الزامی است.'
        saveError.value = 'متن پست الزامی است.'
        return
    }

    isSaving.value = true

    try {
        const payload = buildUpdateBlogPostPayload({
            title: title.value,
            slug: slug.value,
            body: body.value,
            status: status.value,
            previousStatus: previousStatus.value,
            previousPublishedAt: previousPublishedAt.value,
        })

        const response = await blogService.updatePost(postId.value, payload)
        const parsed = parseUpdateBlogPostResponse(response)

        if (!parsed.ok || !parsed.post) {
            applyApiErrors(response, 'خطا در ویرایش پست')
            return
        }

        const message = parsed.message || 'پست با موفقیت ویرایش شد.'
        showToast({ message, variant: 'success' })

        populateForm(parsed.post)

        setTimeout(() => {
            if (parsed.post!.status === 'published') {
                router.push({ name: 'blog' })
                return
            }
            openBlogPreview(parsed.post!.id)
            router.push({ name: 'blog' })
        }, 600)
    } catch (err: unknown) {
        applyApiErrors(err, 'خطا در ویرایش پست')
    } finally {
        isSaving.value = false
    }
}

onMounted(fetchPost)

watch(postId, (nextId, prevId) => {
    if (nextId && nextId !== prevId) {
        fetchPost()
    }
})
</script>
