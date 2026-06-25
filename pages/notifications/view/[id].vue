<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">مشاهده اعلان</h1>
                    <p class="mt-1 text-sm text-text-secondary">جزئیات اعلان دریافتی</p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                    <button
                        v-if="notification"
                        type="button"
                        class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 dark:text-text-muted dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        aria-label="حذف اعلان"
                        v-tooltip="'حذف'"
                        @click="openDeleteModal"
                    >
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <NotificationViewSkeleton v-if="isLoading" />

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <div v-else-if="notification" class="space-y-5">
                <div class="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                    <div class="border-b border-border/60 bg-surface-muted/70 px-4 py-2.5">
                        <p class="text-xs font-medium text-text-secondary">اطلاعات اعلان</p>
                    </div>
                    <div
                        class="grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-2"
                        :class="infoGridXlClass"
                    >
                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5">
                            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">تاریخ ارسال</p>
                                <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                    {{ formatNotificationDate(notification.created_at) }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5">
                            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">ارسال‌کننده</p>
                                <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                    {{ formatNotificationSender(notification, { includeRoles: false }) }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 bg-surface px-4 py-3.5">
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-lg"
                                :class="notification.is_read
                                    ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'"
                            >
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs text-text-muted">زمان خوانده‌شدن</p>
                                <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                    {{ notification.is_read && notification.read_at
                                        ? formatNotificationDate(notification.read_at)
                                        : 'هنوز خوانده نشده' }}
                                </p>
                            </div>
                        </div>

                        <div
                            v-if="notification.action_url"
                            class="flex items-start gap-3 bg-surface px-4 py-3.5 sm:col-span-2 xl:col-span-1"
                        >
                            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-xs text-text-muted">لینک اقدام</p>
                                <a
                                    v-if="actionHref"
                                    :href="actionHref"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="mt-0.5 inline-flex max-w-full items-center gap-1 text-sm font-semibold text-secondary hover:underline dir-ltr"
                                >
                                    <span class="truncate">{{ notification.action_url }}</span>
                                </a>
                                <p
                                    v-else
                                    class="mt-0.5 truncate text-sm font-semibold text-text-primary dir-ltr"
                                >
                                    {{ notification.action_url }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="overflow-hidden rounded-xl border border-border"
                    :class="notification.is_read ? 'bg-surface' : 'border-secondary/30 bg-secondary-muted/10'"
                >
                    <div class="flex flex-col gap-2 border-b border-border/60 bg-surface-muted/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <p class="text-xs font-medium text-text-secondary">متن اعلان</p>
                        <div class="flex flex-wrap items-center gap-2">
                            <span
                                v-if="!notification.is_read"
                                class="inline-flex items-center gap-1 rounded-lg border border-secondary/30 bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary"
                            >
                                <span class="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
                                خوانده‌نشده
                            </span>
                            <span
                                v-else
                                class="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300"
                            >
                                <NotificationReadIndicator :is-read="true" />
                                خوانده‌شده
                            </span>
                            <NotificationMetaBadge
                                kind="type"
                                :value="notification.notification_type"
                                :label="notification.notification_type_label"
                            />
                            <NotificationMetaBadge
                                kind="priority"
                                :value="notification.priority"
                                :label="notification.priority_label"
                            />
                        </div>
                    </div>

                    <div class="p-4 md:p-5">
                        <p class="mb-1 text-xs font-medium text-text-muted">عنوان</p>
                        <h2 class="text-lg font-semibold text-text-primary">
                            {{ notification.title || 'بدون عنوان' }}
                        </h2>

                        <p
                            v-if="notification.body"
                            class="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary"
                        >
                            {{ notification.body }}
                        </p>
                        <p v-else class="mt-4 text-sm text-text-muted">متنی برای این اعلان ثبت نشده است.</p>
                    </div>
                </div>
            </div>
        </div>

        <ConfirmModal
            v-model="showDeleteModal"
            title="حذف اعلان"
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
  name: 'view-notification',
  layout: 'dashboard'
})


import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { inboxService } from '~/api/services/inbox.service'
import { parseNotificationDetailResponse, parseNotificationReadResponse } from '~/api/utils/api-response'
import type { Notification } from '~/api/types/inbox.types'
import ConfirmModal from '~/components/ConfirmModal.vue'
import NotificationMetaBadge from '~/components/notifications/NotificationMetaBadge.vue'
import NotificationReadIndicator from '~/components/notifications/NotificationReadIndicator.vue'
import NotificationViewSkeleton from '~/components/skeleton/NotificationViewSkeleton.vue'
import { showToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import { getNotificationActionHref } from '~/utils/inbox-action-url'
import {
    formatNotificationDate,
    formatNotificationSender,
} from '~/utils/inbox'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { fetchCurrentUser, decrementUnreadCount } = authStore

const notification = ref<Notification | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

const deleteModalMessage = computed(() => {
    const label = notification.value?.title || 'این اعلان'
    return `آیا از حذف «${label}» مطمئن هستید؟`
})

const infoGridXlClass = computed(() => {
    const item = notification.value
    if (!item) return 'xl:grid-cols-2'

    let count = 3
    if (item.action_url) count++

    if (count >= 4) return 'xl:grid-cols-4'
    if (count === 3) return 'xl:grid-cols-3'
    return 'xl:grid-cols-2'
})

const actionHref = computed(() => {
    const url = notification.value?.action_url
    if (!url) return null
    return getNotificationActionHref(router, url)
})

async function markAsReadIfNeeded(id: string, current: Notification) {
    if (current.is_read) return

    try {
        const response = await inboxService.markNotificationAsRead(id)
        const updated = parseNotificationReadResponse(response)

        if (updated) {
            notification.value = updated
            fetchCurrentUser(true)
            return
        }

        notification.value = { ...current, is_read: true }
        fetchCurrentUser(true)
    } catch {
        // نمایش اعلان حتی اگر mark-read ناموفق باشد
    }
}

async function fetchNotification(id: string) {
    isLoading.value = true
    loadError.value = null
    notification.value = null

    try {
        const response = await inboxService.getNotification(id)
        const parsed = parseNotificationDetailResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت جزئیات اعلان با خطا مواجه شد.'
            return
        }

        notification.value = parsed
        await markAsReadIfNeeded(id, parsed)
    } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } }
        if (axiosErr.response?.status === 404) {
            loadError.value = 'اعلان مورد نظر یافت نشد.'
            return
        }
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت جزئیات اعلان')
    } finally {
        isLoading.value = false
    }
}

function openDeleteModal() {
    if (!notification.value) return
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!notification.value || isDeleting.value) return

    const current = notification.value
    isDeleting.value = true

    try {
        await inboxService.deleteNotification(current.id)
        showDeleteModal.value = false

        await fetchCurrentUser(true)

        showToast({ message: 'اعلان با موفقیت حذف شد.', variant: 'success' })
        router.push({ name: 'notifications' })
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در حذف اعلان'),
            variant: 'error',
        })
    } finally {
        isDeleting.value = false
    }
}

onMounted(() => {
    const id = String(route.params.id || '')
    if (!id) {
        loadError.value = 'شناسه اعلان نامعتبر است.'
        isLoading.value = false
        return
    }
    fetchNotification(id)
})

watch(
    () => route.params.id,
    (nextId) => {
        const id = String(nextId || '')
        if (!id) return
        fetchNotification(id)
    },
)
</script>
