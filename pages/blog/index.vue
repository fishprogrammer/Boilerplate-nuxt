<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                    <div>
                        <h1 class="text-xl font-semibold text-text-primary">بلاگ</h1>
                        <p class="mt-1 text-sm text-text-secondary">
                            پست‌های بلاگ
                        </p>
                    </div>
                    <span
                        v-if="!isInitialLoading && !loadError"
                            class="brand-chip shrink-0 font-medium self-end"
                            style="align-items: self-end;"
                        >
                        {{ pagination.total_items }} پست
                    </span>
                </div>
                <RouterLink
                    v-if="hasPermission(PERMISSIONS.BLOG.ADD)"
                    :to="{ name: 'create-blog' }"
                    class="btn-action-sm gap-1.5"
                >
                    <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    پست جدید
                </RouterLink>
            </div>

            <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div class="md:col-span-4">
                    <label for="blog-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <div class="flex items-center gap-3">
                        <input
                            id="blog-search"
                            v-model="searchQuery"
                            type="search"
                            placeholder="عنوان، یا متن..."
                            class="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                            @keydown.enter.prevent="applyFilters"
                        />
                    </div>
                </div>
                <div class="md:col-span-2">
                    <label for="blog-status" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
                    <select
                        id="blog-status"
                        v-model="statusFilter"
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                    >
                        <option value="">همه</option>
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label for="blog-ordering" class="mb-1 block text-xs font-medium text-text-primary">مرتب‌سازی</label>
                    <select
                        id="blog-ordering"
                        v-model="ordering"
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                    >
                        <option v-for="option in orderingOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <div class="flex items-end gap-2 md:col-span-3">
                    <button
                        type="button"
                        class="btn-action"
                        :disabled="isFetching"
                        @click="applyFilters"
                    >
                        اعمال
                    </button>
                    <button
                        type="button"
                        class="btn-muted disabled:opacity-50"
                        :disabled="isFetching || !hasActiveFilters"
                        @click="resetFilters"
                    >
                        پاک کردن
                    </button>
                </div>
            </div>

            <div v-if="hasActiveFilters && !isInitialLoading && !loadError" class="mb-4 flex flex-wrap gap-2">
                <span v-if="appliedSearch" class="brand-chip">جستجو: {{ appliedSearch }}</span>
                <span v-if="appliedStatus" class="brand-chip">وضعیت: {{ formatBlogPostStatus(appliedStatus) }}</span>
            </div>

            <BlogPostsTableSkeleton v-if="isInitialLoading" :rows="10" />

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <template v-else>
                <div class="relative w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border">
                    <div
                        v-if="isFetching"
                        class="absolute inset-0 z-10 flex items-center justify-center bg-surface/70 backdrop-blur-[1px]"
                    >
                        <span class="text-sm text-text-secondary">در حال بارگذاری...</span>
                    </div>

                    <table class="w-full min-w-[720px] divide-y divide-border text-sm">
                        <thead class="bg-surface-muted">
                            <tr>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">عنوان</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">وضعیت</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">ایجاد</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">انتشار</th>
                                <th class="whitespace-nowrap px-4 py-3 text-center font-semibold text-text-primary">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border/60 bg-surface">
                            <tr v-if="posts.length === 0">
                                <td colspan="5" class="px-4 py-10 text-center text-text-secondary">
                                    پستی یافت نشد.
                                </td>
                            </tr>
                            <tr
                                v-for="post in posts"
                                :key="post.id"
                                class="hover:bg-surface-hover/60"
                            >
                                <td class="max-w-56 px-4 py-3">
                                    <p class="truncate font-medium text-text-primary">{{ post.title || '—' }}</p>
                                    <p class="mt-0.5 truncate text-xs text-text-muted">{{ excerptBlogBody(post.body) }}</p>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <span
                                        class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                        :class="getBlogPostStatusClass(post.status)"
                                    >
                                        {{ formatBlogPostStatus(post.status) }}
                                    </span>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {{ formatBlogPostDate(post.created_at) }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {{ formatBlogPostDate(post.published_at) }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <div class="flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                                            aria-label="مشاهده پست"
                                            v-tooltip="'مشاهده'"
                                            @click="viewPost(post)"
                                        >
                                            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            v-if="hasPermission(PERMISSIONS.BLOG.CHANGE)"
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                                            aria-label="ویرایش پست"
                                            v-tooltip="'ویرایش'"
                                            @click="editPost(post)"
                                        >
                                            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            v-if="hasPermission(PERMISSIONS.BLOG.DELETE)"
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                            aria-label="حذف پست"
                                            v-tooltip="'حذف'"
                                            @click="openDeleteModal(post)"
                                        >
                                            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <AppPagination
                    :page="pagination.page"
                    :total-pages="pagination.total_pages"
                    :disabled="isFetching"
                    @update:page="goToPage"
                />
            </template>
        </div>

        <ConfirmModal
            v-model="showDeleteModal"
            title="حذف پست"
            :message="deleteModalMessage"
            confirm-label="بله، حذف"
            cancel-label="انصراف"
            variant="danger"
            :loading="isDeleting"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'blog',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { blogService } from '~/api/services/blog.service'
import { parseBlogPostsListResponse } from '~/api/utils/api-response'
import type { BlogPost, BlogPostStatus } from '~/api/types/blog.types'
import type { PaginationMeta } from '~/api/types/auth.types'
import AppPagination from '~/components/AppPagination.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import BlogPostsTableSkeleton from '~/components/skeleton/BlogPostsTableSkeleton.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import {
    BLOG_ORDERING_OPTIONS,
    BLOG_POST_STATUS_OPTIONS,
    excerptBlogBody,
    formatBlogPostDate,
    formatBlogPostStatus,
    getBlogPostStatusClass,
    openBlogPreview,
} from '~/utils/blog'

const PAGE_SIZE = 15
const router = useRouter()
const { hasPermission, PERMISSIONS } = usePermissions()

const statusOptions = BLOG_POST_STATUS_OPTIONS
const orderingOptions = BLOG_ORDERING_OPTIONS

const posts = ref<BlogPost[]>([])
const pagination = ref<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
    total_items: 0,
    next: null,
    previous: null,
})

const searchQuery = ref('')
const statusFilter = ref<BlogPostStatus | ''>('')
const ordering = ref('-created_at')

const appliedSearch = ref('')
const appliedStatus = ref<BlogPostStatus | ''>('')

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const postToDelete = ref<BlogPost | null>(null)

const hasActiveFilters = computed(() => Boolean(appliedSearch.value || appliedStatus.value))

const deleteModalMessage = computed(() => {
    const post = postToDelete.value
    if (!post) return 'آیا از حذف این پست مطمئن هستید؟'
    return `آیا از حذف پست «${post.title || post.slug}» مطمئن هستید؟`
})

function viewPost(post: BlogPost) {
    openBlogPreview(post.id)
}

function editPost(post: BlogPost) {
    router.push({ name: 'edit-blog', params: { id: post.id } })
}

function openDeleteModal(post: BlogPost) {
    postToDelete.value = post
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!postToDelete.value || isDeleting.value) return

    isDeleting.value = true
    try {
        await blogService.deletePost(postToDelete.value.id)
        showDeleteModal.value = false
        postToDelete.value = null
        showToast({ message: 'پست با موفقیت حذف شد.', variant: 'success' })
        await fetchPosts(pagination.value.page)
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در حذف پست'),
            variant: 'error',
        })
    } finally {
        isDeleting.value = false
    }
}

async function fetchPosts(page = 1) {
    const isFirstLoad = isInitialLoading.value
    isFetching.value = true
    if (!isFirstLoad) loadError.value = null

    try {
        const params: {
            page: number
            page_size: number
            search?: string
            status?: BlogPostStatus
            ordering?: string
        } = {
            page,
            page_size: PAGE_SIZE,
            ordering: ordering.value,
        }
        if (appliedSearch.value) params.search = appliedSearch.value
        if (appliedStatus.value) params.status = appliedStatus.value

        const response = await blogService.listPosts(params)
        const parsed = parseBlogPostsListResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت لیست پست‌ها با خطا مواجه شد.'
            posts.value = []
            return
        }

        posts.value = parsed.posts
        pagination.value = parsed.pagination
        loadError.value = null
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست پست‌ها')
        if (isFirstLoad) posts.value = []
    } finally {
        isFetching.value = false
        isInitialLoading.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedStatus.value = statusFilter.value
    fetchPosts(1)
}

function resetFilters() {
    searchQuery.value = ''
    statusFilter.value = ''
    appliedSearch.value = ''
    appliedStatus.value = ''
    fetchPosts(1)
}

function goToPage(page: number) {
    if (page < 1 || page > pagination.value.total_pages) return
    fetchPosts(page)
}

onMounted(() => {
    fetchPosts()
})
</script>
