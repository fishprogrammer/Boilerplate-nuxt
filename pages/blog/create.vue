<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">ایجاد پست جدید</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        پست جدید به‌صورت پیش‌فرض پیش‌نویس ذخیره می‌شود
                    </p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                </div>
            </div>

            <form @submit.prevent class="space-y-5">
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
                    <p class="mt-1 text-xs text-text-muted">نمیتواند خالی باشد. فقط حروف انگلیسی کوچک، اعداد و خط تیره.</p>
                    <p v-if="fieldErrors.slug" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.slug }}</p>
                </div>

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label for="blog-locale" class="mb-1 block text-xs font-medium text-text-primary">زبان</label>
                        <select id="blog-locale" v-model="postLocale" :class="inputClass('locale')" @change="onLocaleChange">
                            <option value="fa">فارسی</option>
                            <option value="en">English</option>
                        </select>
                        <p v-if="fieldErrors.locale" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.locale }}</p>
                    </div>
                    <div>
                        <label for="blog-category" class="mb-1 block text-xs font-medium text-text-primary">دسته‌بندی</label>
                        <select id="blog-category" v-model="categoryId" :class="inputClass('category')">
                            <option value="">انتخاب کنید</option>
                            <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                        <p v-if="fieldErrors.category" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.category }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label for="blog-meta-title" class="mb-1 block text-xs font-medium text-text-primary">meta_title</label>
                        <input id="blog-meta-title" v-model="metaTitle" type="text" :class="inputClass('meta_title')" />
                    </div>
                    <div>
                        <label for="blog-meta-description" class="mb-1 block text-xs font-medium text-text-primary">meta_description</label>
                        <input id="blog-meta-description" v-model="metaDescription" type="text" :class="inputClass('meta_description')" />
                    </div>
                </div>

                <div>
                    <label class="mb-1 block text-xs font-medium text-text-primary">متن</label>
                    <HtmlEditor
                        v-model="body"
                        placeholder="متن پست..."
                        :invalid="Boolean(fieldErrors.body)"
                        @update:model-value="clearFieldError('body')"
                    />
                    <p v-if="fieldErrors.body" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.body }}</p>
                </div>

                <p
                    v-if="status === 'published'"
                    class="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300"
                >
                    با انتخاب «منتشر شده»، زمان انتشار به‌صورت خودکار روی زمان فعلی تنظیم می‌شود.
                </p>

                <div class="flex flex-wrap gap-2">
                    <button
                        type="button"
                        :disabled="isSaving"
                        class="btn-action-sm"
                        @click="submitCreate"
                    >
                        {{ isSaving ? 'در حال ذخیره...' : submitLabel }}
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
  name: 'create-blog',
  layout: 'dashboard'
})

import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { blogService } from '~/api/services/blog.service'
import { buildCreateBlogPostPayload, parseBlogCategoriesListResponse, parseCreateBlogPostResponse } from '~/api/utils/api-response'
import type { BlogCategory, BlogPostStatus } from '~/api/types/blog.types'
import HtmlEditor from '~/components/HtmlEditor.vue'
import { showToast } from '~/composables/useToast'
import type { AppLocale } from '~/utils/locale'
import { API_FIELD_LABELS, extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { BLOG_POST_STATUS_OPTIONS, normalizeEnglishSlug, openBlogPreview, validateEnglishSlug } from '~/utils/blog'
import { isHtmlContentEmpty } from '~/utils/html'

const router = useRouter()

const statusOptions = BLOG_POST_STATUS_OPTIONS

const title = ref('')
const slug = ref('')
const body = ref('')
const status = ref<BlogPostStatus>('draft')
const postLocale = ref<AppLocale>('fa')
const categoryId = ref('')
const metaTitle = ref('')
const metaDescription = ref('')
const categories = ref<BlogCategory[]>([])

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const hasFieldErrors = computed(() => Object.keys(fieldErrors).length > 0)

const submitLabel = computed(() =>
    status.value === 'published' ? 'انتشار پست' : 'ذخیره پیش‌نویس',
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
    slug.value = normalizeEnglishSlug(slug.value)
}

async function loadCategories() {
    try {
        const response = await blogService.listCategories({
            locale: postLocale.value,
            page_size: 100,
            ordering: 'sort_order',
        })
        categories.value = parseBlogCategoriesListResponse(response)?.categories ?? []
        if (!categoryId.value || !categories.value.some((item) => item.id === categoryId.value)) {
            const general = categories.value.find((item) => item.slug === 'general')
            categoryId.value = general?.id || categories.value[0]?.id || ''
        }
    } catch {
        categories.value = []
        categoryId.value = ''
    }
}

function onLocaleChange() {
    clearFieldError('locale')
    void loadCategories()
}

function applyApiErrors(err: unknown) {
    clearFieldErrors()
    Object.assign(fieldErrors, extractApiFieldErrors(err))

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = getApiResponseMessage(err, 'اعتبارسنجی ناموفق بود')
        return
    }

    saveError.value = getApiErrorMessage(err, 'خطا در ایجاد پست')
}

async function submitCreate() {
    if (isSaving.value) return

    saveError.value = null
    clearFieldErrors()

    if (!title.value.trim()) {
        fieldErrors.title = 'عنوان الزامی است.'
        saveError.value = 'عنوان الزامی است.'
        return
    }

    const slugError = validateEnglishSlug(slug.value)
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

    if (!categoryId.value) {
        fieldErrors.category = 'دسته‌بندی الزامی است.'
        saveError.value = 'دسته‌بندی الزامی است.'
        return
    }

    isSaving.value = true

    try {
        const payload = buildCreateBlogPostPayload({
            title: title.value,
            slug: slug.value,
            body: body.value,
            status: status.value,
            locale: postLocale.value,
            category: categoryId.value,
            meta_title: metaTitle.value,
            meta_description: metaDescription.value,
        })

        const response = await blogService.createPost(payload)
        const parsed = parseCreateBlogPostResponse(response)

        if (!parsed.ok || !parsed.post) {
            applyApiErrors(response)
            return
        }

        const message = parsed.message || 'پست با موفقیت ایجاد شد.'
        showToast({ message, variant: 'success' })

        setTimeout(() => {
            if (parsed.post!.status === 'published') {
                router.push({ name: 'blog' })
                return
            }
            openBlogPreview(parsed.post!.id)
            router.push({ name: 'blog' })
        }, 600)
    } catch (err: unknown) {
        applyApiErrors(err)
    } finally {
        isSaving.value = false
    }
}

onMounted(() => {
    void loadCategories()
})
</script>
