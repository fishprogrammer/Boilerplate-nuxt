<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                    <div>
                        <h1 class="text-xl font-semibold text-text-primary">نظرات بلاگ</h1>
                        <p class="mt-1 text-sm text-text-secondary">
                            نظرات پست‌ها
                        </p>
                    </div>
                    <span
                        v-if="!isInitialLoading && !loadError"
                        class="brand-chip shrink-0 font-medium self-end"
                    >
                        {{ pagination.total_items }} نظر
                    </span>
                </div>
            </div>

            <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div class="md:col-span-4">
                    <label for="comment-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <input
                        id="comment-search"
                        v-model="searchQuery"
                        type="search"
                        placeholder="متن، نام یا ایمیل..."
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                        @keydown.enter.prevent="applyFilters"
                    />
                </div>
                <div class="md:col-span-2">
                    <label for="comment-status" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
                    <select
                        id="comment-status"
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
                    <label for="comment-ordering" class="mb-1 block text-xs font-medium text-text-primary">مرتب‌سازی</label>
                    <select
                        id="comment-ordering"
                        v-model="ordering"
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                    >
                        <option v-for="option in orderingOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <div class="flex items-end gap-2 md:col-span-2">
                    <button
                        type="button"
                        class="btn-action w-full"
                        :disabled="isFetching"
                        @click="applyFilters"
                    >
                        اعمال
                    </button>
                </div>
            </div>

            <div v-if="hasActiveFilters && !isInitialLoading && !loadError" class="mb-4 flex flex-wrap gap-2">
                <span v-if="appliedSearch" class="brand-chip">جستجو: {{ appliedSearch }}</span>
                <span v-if="appliedStatus" class="brand-chip">وضعیت: {{ formatBlogCommentStatus(appliedStatus) }}</span>
                <button
                    type="button"
                    class="text-xs text-text-secondary underline hover:text-text-primary"
                    :disabled="isFetching"
                    @click="resetFilters"
                >
                    پاک کردن فیلترها
                </button>
            </div>

            <div v-if="isInitialLoading" class="py-12 text-center text-sm text-text-secondary">
                در حال بارگذاری...
            </div>

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

                    <table class="w-full min-w-[840px] divide-y divide-border text-sm">
                        <thead class="bg-surface-muted">
                            <tr>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">نویسنده</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">ایمیل</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">متن</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">وضعیت</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">تاریخ</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">پاسخ مدیر</th>
                                <th class="whitespace-nowrap px-4 py-3 text-center font-semibold text-text-primary">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border/60 bg-surface">
                            <tr v-if="comments.length === 0">
                                <td colspan="7" class="px-4 py-10 text-center text-text-secondary">
                                    نظری یافت نشد.
                                </td>
                            </tr>
                            <tr
                                v-for="comment in comments"
                                :key="comment.id"
                                class="hover:bg-surface-hover/60"
                            >
                                <td class="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                                    {{ formatBlogCommentAuthor(comment.author_name, comment.username) }}
                                </td>
                                <td class="max-w-44 truncate px-4 py-3 text-text-secondary dir-ltr text-right">
                                    {{ comment.author_email || '—' }}
                                </td>
                                <td class="max-w-xs px-4 py-3 text-text-secondary">
                                    <p class="line-clamp-2">{{ excerptBlogCommentBody(comment.body) }}</p>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <span
                                        class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                        :class="getBlogCommentStatusClass(comment.status)"
                                    >
                                        {{ formatBlogCommentStatus(comment.status) }}
                                    </span>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {{ formatBlogCommentDate(comment.created_at) }}
                                </td>
                                <td class="max-w-48 px-4 py-3 text-text-secondary">
                                    <p v-if="comment.admin_reply" class="line-clamp-2">{{ excerptBlogCommentBody(comment.admin_reply, 80) }}</p>
                                    <span v-else class="text-text-muted">—</span>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <div class="flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                                            aria-label="مشاهده نظر"
                                            v-tooltip="'مشاهده'"
                                            @click="viewComment(comment)"
                                        >
                                            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            v-if="canDelete"
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                            aria-label="حذف نظر"
                                            v-tooltip="'حذف'"
                                            @click="openDeleteModal(comment)"
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
            title="حذف نظر"
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
  name: 'blog-comments',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { blogService } from '~/api/services/blog.service'
import { parseBlogCommentsListResponse } from '~/api/utils/api-response'
import type { BlogComment, BlogCommentStatus } from '~/api/types/blog.types'
import type { PaginationMeta } from '~/api/types/auth.types'
import AppPagination from '~/components/AppPagination.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import {
    BLOG_COMMENT_ORDERING_OPTIONS,
    BLOG_COMMENT_STATUS_OPTIONS,
    excerptBlogCommentBody,
    formatBlogCommentAuthor,
    formatBlogCommentDate,
    formatBlogCommentStatus,
    getBlogCommentStatusClass,
} from '~/utils/blog-comments'

const router = useRouter()
const { hasPermission, isStaff, PERMISSIONS } = usePermissions()

const PAGE_SIZE = 15

const statusOptions = BLOG_COMMENT_STATUS_OPTIONS
const orderingOptions = BLOG_COMMENT_ORDERING_OPTIONS

const comments = ref<BlogComment[]>([])
const pagination = ref<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
    total_items: 0,
    next: null,
    previous: null,
})

const searchQuery = ref('')
const statusFilter = ref<BlogCommentStatus | ''>('')
const ordering = ref('-created_at')

const appliedSearch = ref('')
const appliedStatus = ref<BlogCommentStatus | ''>('')

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)

const showDeleteModal = ref(false)
const isDeleting = ref(false)
const itemToDelete = ref<BlogComment | null>(null)

const canDelete = computed(
    () => hasPermission(PERMISSIONS.BLOG.DELETE_COMMENT) || isStaff.value,
)

const deleteModalMessage = computed(() => {
    const item = itemToDelete.value
    if (!item) return 'آیا از حذف این نظر مطمئن هستید؟'
    const author = formatBlogCommentAuthor(item.author_name, item.username)
    return `آیا از حذف نظر «${author}» مطمئن هستید؟`
})

const hasActiveFilters = computed(
    () => Boolean(appliedSearch.value || appliedStatus.value),
)

async function fetchComments(page = 1) {
    const isFirstLoad = isInitialLoading.value
    isFetching.value = true
    if (!isFirstLoad) loadError.value = null

    try {
        const params: {
            page: number
            page_size: number
            search?: string
            status?: BlogCommentStatus
            ordering?: string
        } = {
            page,
            page_size: PAGE_SIZE,
            ordering: ordering.value,
        }

        if (appliedSearch.value) params.search = appliedSearch.value
        if (appliedStatus.value) params.status = appliedStatus.value

        const response = await blogService.listComments(params)
        const parsed = parseBlogCommentsListResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت لیست نظرات با خطا مواجه شد.'
            comments.value = []
            return
        }

        comments.value = parsed.comments
        pagination.value = parsed.pagination
        loadError.value = null
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست نظرات')
        if (isFirstLoad) comments.value = []
    } finally {
        isFetching.value = false
        isInitialLoading.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedStatus.value = statusFilter.value
    fetchComments(1)
}

function resetFilters() {
    searchQuery.value = ''
    statusFilter.value = ''
    appliedSearch.value = ''
    appliedStatus.value = ''
    fetchComments(1)
}

function goToPage(page: number) {
    if (page < 1 || page > pagination.value.total_pages) return
    fetchComments(page)
}

function viewComment(comment: BlogComment) {
    router.push({ name: 'view-blog-comment', params: { id: comment.id } })
}

function openDeleteModal(comment: BlogComment) {
    itemToDelete.value = comment
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!itemToDelete.value || isDeleting.value) return

    isDeleting.value = true

    try {
        await blogService.deleteComment(itemToDelete.value.id)
        showDeleteModal.value = false
        showToast({ message: 'نظر با موفقیت حذف شد.', variant: 'success' })
        itemToDelete.value = null
        await fetchComments(pagination.value.page)
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در حذف نظر'),
            variant: 'error',
        })
    } finally {
        isDeleting.value = false
    }
}

onMounted(() => {
    fetchComments()
})
</script>
