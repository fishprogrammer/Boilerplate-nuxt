<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">مشاهده نظر</h1>
                    <p class="mt-1 text-sm text-text-secondary">جزئیات نظر بلاگ</p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                    <button
                        v-if="comment && canDelete"
                        type="button"
                        class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 dark:text-text-muted dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        aria-label="حذف نظر"
                        v-tooltip="'حذف'"
                        @click="openDeleteModal"
                    >
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div v-if="isLoading" class="py-12 text-center text-sm text-text-secondary">
                در حال بارگذاری...
            </div>

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <div v-else-if="comment" class="space-y-5">
                <div class="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                    <div class="border-b border-border/60 bg-surface-muted/70 px-4 py-2.5">
                        <p class="text-xs font-medium text-text-secondary">اطلاعات نظر</p>
                    </div>
                    <div class="grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-2">
                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5">
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">نویسنده</p>
                                <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                    {{ formatBlogCommentAuthor(comment.author_name, comment.username) }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5">
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">ایمیل</p>
                                <p class="mt-0.5 text-sm font-semibold text-text-primary dir-ltr text-right">
                                    {{ comment.author_email || '—' }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5">
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">وضعیت</p>
                                <span
                                    class="mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                    :class="getBlogCommentStatusClass(comment.status)"
                                >
                                    {{ formatBlogCommentStatus(comment.status) }}
                                </span>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5">
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">تاریخ ثبت</p>
                                <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                    {{ formatBlogCommentDate(comment.created_at) }}
                                </p>
                            </div>
                        </div>

                        <div
                            v-if="comment.updated_at > comment.created_at"
                            class="flex items-start gap-3 bg-surface px-4 py-3.5 sm:col-span-2"
                        >
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">آخرین به‌روزرسانی</p>
                                <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                    {{ formatBlogCommentDate(comment.updated_at) }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5 sm:col-span-2">
                            <div class="min-w-0 flex-1">
                                <p class="text-xs text-text-muted">پست</p>
                                <RouterLink
                                    v-if="comment.post"
                                    :to="{ name: 'view-blog', params: { id: comment.post } }"
                                    class="mt-0.5 inline-flex max-w-full items-center gap-1 text-sm font-semibold text-secondary hover:underline dir-ltr"
                                    target="_blank"
                                >
                                    <span class="truncate">{{ comment.post }}</span>
                                </RouterLink>
                                <p v-else class="mt-0.5 text-sm font-semibold text-text-primary">—</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="rounded-xl border border-border bg-surface-muted/30 p-4">
                    <p class="mb-2 text-xs font-medium text-text-muted">متن نظر</p>
                    <p class="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-text-primary">
                        {{ comment.body || '—' }}
                    </p>
                </div>

                <div
                    v-if="canModerate"
                    class="rounded-xl border border-border bg-surface p-4"
                >
                    <p class="mb-3 text-sm font-semibold text-text-primary">مدیریت وضعیت</p>
                    <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="submitStatusUpdate">
                        <div class="flex-1">
                            <label for="comment-status" class="mb-1.5 block text-xs font-medium text-text-primary">
                                وضعیت نظر
                            </label>
                            <select
                                id="comment-status"
                                v-model="statusDraft"
                                class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none input-focus"
                                :class="{ 'border-red-400': !!statusFieldError }"
                                @change="statusFieldError = ''"
                            >
                                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                            <p v-if="statusFieldError" class="mt-1.5 text-xs text-red-600">
                                {{ statusFieldError }}
                            </p>
                        </div>
                        <button
                            type="submit"
                            class="btn-action sm:shrink-0"
                            :disabled="isSubmittingStatus || statusDraft === comment.status"
                        >
                            {{ isSubmittingStatus ? 'در حال ذخیره...' : 'ذخیره وضعیت' }}
                        </button>
                    </form>
                    <p v-if="statusError" class="mt-3 text-sm text-red-600">{{ statusError }}</p>
                </div>

                <div
                    v-if="comment.admin_reply && !canReply"
                    class="rounded-xl border border-secondary/30 bg-secondary-muted/10 p-4"
                >
                    <p class="mb-2 text-xs font-medium text-secondary">پاسخ مدیر</p>
                    <p class="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-text-primary">
                        {{ comment.admin_reply }}
                    </p>
                    <p
                        v-if="comment.replied_at > 0 || comment.replied_by_username"
                        class="mt-3 text-xs text-text-muted"
                    >
                        <template v-if="comment.replied_at > 0">
                            {{ formatBlogCommentDate(comment.replied_at) }}
                        </template>
                        <template v-if="comment.replied_by_username">
                            <span v-if="comment.replied_at > 0"> · </span>
                            {{ comment.replied_by_username }}
                        </template>
                    </p>
                </div>

                <div
                    v-if="canReply"
                    class="rounded-xl border border-border bg-surface p-4"
                >
                    <p class="mb-3 text-sm font-semibold text-text-primary">
                        {{ comment.admin_reply ? 'ویرایش پاسخ مدیر' : 'پاسخ مدیر' }}
                    </p>
                    <form class="space-y-3" @submit.prevent="submitReply">
                        <div>
                            <label for="admin-reply" class="mb-1.5 block text-xs font-medium text-text-primary">
                                متن پاسخ
                            </label>
                            <textarea
                                id="admin-reply"
                                v-model="adminReplyDraft"
                                rows="4"
                                placeholder="پاسخ رسمی به این نظر..."
                                class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus resize-y min-h-24 leading-relaxed"
                                :class="{ 'border-red-400': !!replyFieldError }"
                                @input="replyFieldError = ''"
                            />
                            <p v-if="replyFieldError" class="mt-1.5 text-xs text-red-600">
                                {{ replyFieldError }}
                            </p>
                        </div>

                        <p v-if="replyError" class="text-sm text-red-600">
                            {{ replyError }}
                        </p>

                        <p v-if="replySuccess" class="text-sm text-green-700">
                            {{ replySuccess }}
                        </p>

                        <button
                            type="submit"
                            class="btn-action"
                            :disabled="isSubmittingReply"
                        >
                            {{ isSubmittingReply ? 'در حال ذخیره...' : (comment.admin_reply ? 'به‌روزرسانی پاسخ' : 'ثبت پاسخ') }}
                        </button>
                    </form>

                    <div
                        v-if="comment.admin_reply && comment.replied_at > 0"
                        class="mt-4 border-t border-border/60 pt-3 text-xs text-text-muted"
                    >
                        آخرین پاسخ:
                        {{ formatBlogCommentDate(comment.replied_at) }}
                        <template v-if="comment.replied_by_username">
                            · {{ comment.replied_by_username }}
                        </template>
                    </div>
                </div>
            </div>
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
  name: 'view-blog-comment',
  layout: 'dashboard'
})

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { blogService } from '~/api/services/blog.service'
import { parseBlogCommentDetailResponse } from '~/api/utils/api-response'
import type { BlogComment, BlogCommentStatus } from '~/api/types/blog.types'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import {
    BLOG_COMMENT_STATUS_OPTIONS,
    formatBlogCommentAuthor,
    formatBlogCommentDate,
    formatBlogCommentStatus,
    getBlogCommentStatusClass,
} from '~/utils/blog-comments'

const route = useRoute()
const router = useRouter()
const { hasPermission, isStaff, PERMISSIONS } = usePermissions()

const statusOptions = BLOG_COMMENT_STATUS_OPTIONS

const comment = ref<BlogComment | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const adminReplyDraft = ref('')
const statusDraft = ref<BlogCommentStatus>('pending')
const isSubmittingReply = ref(false)
const isSubmittingStatus = ref(false)
const replyError = ref<string | null>(null)
const replySuccess = ref<string | null>(null)
const replyFieldError = ref('')
const statusError = ref<string | null>(null)
const statusFieldError = ref('')

const showDeleteModal = ref(false)
const isDeleting = ref(false)

const canModerate = computed(
    () => hasPermission(PERMISSIONS.BLOG.CHANGE_COMMENT) || isStaff.value,
)

const canReply = computed(
    () => hasPermission(PERMISSIONS.BLOG.CHANGE_COMMENT) || isStaff.value,
)

const canDelete = computed(
    () => hasPermission(PERMISSIONS.BLOG.DELETE_COMMENT) || isStaff.value,
)

const deleteModalMessage = computed(() => {
    const author = comment.value
        ? formatBlogCommentAuthor(comment.value.author_name, comment.value.username)
        : 'این نظر'
    return `آیا از حذف نظر «${author}» مطمئن هستید؟`
})

const commentId = () => String(route.params.id || '')

function syncReplyDraft() {
    adminReplyDraft.value = comment.value?.admin_reply?.trim() ?? ''
}

function syncStatusDraft() {
    statusDraft.value = comment.value?.status ?? 'pending'
}

async function fetchComment() {
    const id = commentId()
    if (!id) {
        loadError.value = 'شناسه نظر نامعتبر است.'
        isLoading.value = false
        return
    }

    isLoading.value = true
    loadError.value = null
    comment.value = null
    replyError.value = null
    replySuccess.value = null
    replyFieldError.value = ''

    try {
        const response = await blogService.getComment(id)
        const parsed = parseBlogCommentDetailResponse(response)

        if (!parsed) {
            loadError.value = getApiResponseMessage(response, 'دریافت جزئیات نظر با خطا مواجه شد.')
            return
        }

        comment.value = parsed
        syncReplyDraft()
        syncStatusDraft()
    } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } }
        if (axiosErr.response?.status === 404) {
            loadError.value = 'نظر مورد نظر یافت نشد.'
            return
        }
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت جزئیات نظر')
    } finally {
        isLoading.value = false
    }
}

async function submitReply() {
    if (!comment.value) return

    replyError.value = null
    replySuccess.value = null
    replyFieldError.value = ''

    const adminReply = adminReplyDraft.value.trim()
    if (!adminReply) {
        replyFieldError.value = 'متن پاسخ الزامی است.'
        return
    }

    isSubmittingReply.value = true

    try {
        const response = await blogService.replyComment(comment.value.id, { admin_reply: adminReply })
        const updated = parseBlogCommentDetailResponse(response)

        if (!updated) {
            const fieldErrors = extractApiFieldErrors(response)
            if (fieldErrors.admin_reply) {
                replyFieldError.value = fieldErrors.admin_reply
            } else {
                replyError.value = getApiResponseMessage(response, 'ثبت پاسخ با خطا مواجه شد.')
            }
            return
        }

        comment.value = updated
        syncReplyDraft()
        replySuccess.value = getApiResponseMessage(response, 'پاسخ با موفقیت ثبت شد.')
        showToast({ message: replySuccess.value, variant: 'success' })
    } catch (err: unknown) {
        const fieldErrors = extractApiFieldErrors(err)
        if (fieldErrors.admin_reply) {
            replyFieldError.value = fieldErrors.admin_reply
        } else {
            replyError.value = getApiErrorMessage(err, 'ثبت پاسخ با خطا مواجه شد.')
        }
    } finally {
        isSubmittingReply.value = false
    }
}

async function submitStatusUpdate() {
    if (!comment.value) return

    statusError.value = null
    statusFieldError.value = ''

    if (statusDraft.value === comment.value.status) return

    isSubmittingStatus.value = true

    try {
        const response = await blogService.updateComment(comment.value.id, {
            status: statusDraft.value,
        })
        const updated = parseBlogCommentDetailResponse(response)

        if (!updated) {
            const fieldErrors = extractApiFieldErrors(response)
            if (fieldErrors.status) {
                statusFieldError.value = fieldErrors.status
            } else {
                statusError.value = getApiResponseMessage(response, 'به‌روزرسانی وضعیت با خطا مواجه شد.')
            }
            return
        }

        comment.value = updated
        syncStatusDraft()
        showToast({
            message: getApiResponseMessage(response, 'وضعیت نظر با موفقیت به‌روزرسانی شد.'),
            variant: 'success',
        })
    } catch (err: unknown) {
        const fieldErrors = extractApiFieldErrors(err)
        if (fieldErrors.status) {
            statusFieldError.value = fieldErrors.status
        } else {
            statusError.value = getApiErrorMessage(err, 'به‌روزرسانی وضعیت با خطا مواجه شد.')
        }
    } finally {
        isSubmittingStatus.value = false
    }
}

function openDeleteModal() {
    if (!comment.value) return
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!comment.value || isDeleting.value) return

    isDeleting.value = true

    try {
        await blogService.deleteComment(comment.value.id)
        showDeleteModal.value = false
        showToast({ message: 'نظر با موفقیت حذف شد.', variant: 'success' })
        router.push({ name: 'blog-comments' })
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در حذف نظر'),
            variant: 'error',
        })
    } finally {
        isDeleting.value = false
    }
}

onMounted(fetchComment)

watch(
    () => route.params.id,
    (nextId, prevId) => {
        if (nextId && nextId !== prevId) {
            fetchComment()
        }
    },
)
</script>
