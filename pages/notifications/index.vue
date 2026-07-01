<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div class="flex flex-wrap items-center gap-2">
                        <h1 class="text-xl font-semibold text-text-primary">اعلانات</h1>
                        <span
                            v-if="!isInitialLoading && !loadError && unreadCount > 0"
                            class="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary-muted/25 px-2.5 py-1 text-xs font-medium tabular-nums text-secondary"
                        >
                            <span
                                class="size-1.5 rounded-full bg-secondary"
                                aria-hidden="true"
                            />
                            {{ unreadCount.toLocaleString('fa-IR') }} خوانده‌نشده
                        </span>
                    </div>
                    <p class="mt-1 text-sm text-text-secondary">
                        صندوق ورودی اعلان‌های سیستم
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <button
                        v-if="showMarkAllReadButton"
                        type="button"
                        class="btn-muted-sm inline-flex items-center gap-1.5"
                        :disabled="isMarkingAllRead || isFetching"
                        @click="markAllAsRead"
                    >
                        <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.5L8 16l11.5-11.5" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.5L12.5 16l11.5-11.5" />
                        </svg>
                        {{ isMarkingAllRead ? '...' : 'خواندن همه' }}
                    </button>
                    <button
                        v-if="hasPermission(PERMISSIONS.INBOX.ADD)"
                        type="button"
                        class="btn-action-sm gap-1.5"
                        @click="router.push({ name: 'send-notification' })"
                    >
                        <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        اعلان جدید
                    </button>
                </div>
            </div>

            <div class="mb-5">
                <div
                    class="inline-flex w-full rounded-full border border-border bg-surface-muted/40 p-1 sm:w-auto"
                    role="tablist"
                    aria-label="فیلتر وضعیت خواندن"
                >
                        <button
                            v-for="tab in readTabs"
                            :key="tab.value"
                            type="button"
                            role="tab"
                            class="relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex-initial sm:px-4"
                            :class="readFilter === tab.value
                                ? 'bg-secondary text-white shadow-sm ring-1 ring-secondary/30'
                                : 'text-text-secondary hover:bg-surface/60 hover:text-text-primary'"
                            :aria-selected="readFilter === tab.value"
                            @click="setReadFilter(tab.value)"
                        >
                            {{ tab.label }}
                            <span
                                v-if="tab.value === 'false' && unreadCount > 0"
                                class="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold tabular-nums"
                                :class="readFilter === tab.value
                                    ? 'bg-white/25 text-white'
                                    : 'bg-secondary text-white'"
                            >
                                {{ unreadCount > 99 ? '99+' : unreadCount.toLocaleString('fa-IR') }}
                            </span>
                        </button>
                </div>
            </div>

            <div class="mb-5 grid grid-cols-2 gap-3 md:grid-cols-12">
                <div class="col-span-2 md:col-span-4">
                    <label for="inbox-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <div
                        class="flex overflow-hidden rounded-lg border border-border bg-surface focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 dark:focus-within:border-secondary"
                    >
                        <input
                            id="inbox-search"
                            v-model="searchQuery"
                            type="search"
                            placeholder="عنوان یا متن..."
                            class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                            @keydown.enter.prevent="applyFilters"
                        />
                        <button
                            type="button"
                            class="shrink-0 px-3 text-text-muted transition-colors hover:text-secondary disabled:opacity-50"
                            aria-label="جستجو"
                            :disabled="isFetching"
                            @click="applyFilters"
                        >
                            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="md:col-span-2">
                    <label for="inbox-type" class="mb-1 block text-xs font-medium text-text-primary">نوع</label>
                    <select
                        id="inbox-type"
                        v-model="typeFilter"
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                        @change="applyFilters"
                    >
                        <option value="">همه</option>
                        <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label for="inbox-priority" class="mb-1 block text-xs font-medium text-text-primary">اولویت</label>
                    <select
                        id="inbox-priority"
                        v-model="priorityFilter"
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                        @change="applyFilters"
                    >
                        <option value="">همه</option>
                        <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <div class="col-span-2 md:col-span-4">
                    <label for="inbox-ordering" class="mb-1 block text-xs font-medium text-text-primary">مرتب‌سازی</label>
                    <select
                        id="inbox-ordering"
                        v-model="ordering"
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                        @change="applyFilters"
                    >
                        <option v-for="option in orderingOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>

            <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap gap-2">
                <span v-if="appliedSearch" class="brand-chip">جستجو: {{ appliedSearch }}</span>
                <span v-if="appliedReadFilter === 'false'" class="brand-chip">خوانده‌نشده</span>
                <span v-if="appliedReadFilter === 'true'" class="brand-chip">خوانده‌شده</span>
                <span v-if="appliedType" class="brand-chip">نوع: {{ formatNotificationType(appliedType) }}</span>
                <span v-if="appliedPriority" class="brand-chip">اولویت: {{ formatNotificationPriority(appliedPriority) }}</span>
                <button
                    type="button"
                    class="text-xs text-text-secondary underline hover:text-text-primary"
                    :disabled="isFetching"
                    @click="resetFilters"
                >
                    پاک کردن فیلترها
                </button>
            </div>

            <NotificationsInboxSkeleton v-if="isInitialLoading" />

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <template v-else>
                <div v-if="items.length === 0" class="rounded-xl border border-dashed border-border px-4 py-16 text-center">
                    <svg class="mx-auto mb-3 size-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p class="text-sm font-medium text-text-primary">اعلانی یافت نشد</p>
                    <p class="mt-1 text-xs text-text-secondary">فیلترها را تغییر دهید یا بعداً دوباره بررسی کنید.</p>
                </div>

                <ul v-else class="relative space-y-3">
                    <div
                        v-if="isFetching"
                        class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
                    >
                        <NotificationsInboxSkeleton
                            :rows="Math.max(displayItems.length, 6)"
                            :show-count-bar="false"
                        />
                    </div>

                    <li v-for="item in displayItems" :key="item.id">
                        <NotificationsInboxItem
                            :item="item"
                            @open="viewNotification"
                            @delete="openDeleteModal"
                        />
                    </li>
                </ul>

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
  name: 'notifications',
  layout: 'dashboard'
})


import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { inboxService } from '~/api/services/inbox.service'
import { parseInboxListResponse, parseNotificationReadResponse } from '~/api/utils/api-response'
import type { Notification } from '~/api/types/inbox.types'
import type { PaginationMeta } from '~/api/types/auth.types'
import AppPagination from '~/components/AppPagination.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import NotificationsInboxItem from '~/components/notifications/NotificationsInboxItem.vue'
import NotificationsInboxSkeleton from '~/components/skeleton/NotificationsInboxSkeleton.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import { navigateNotificationAction } from '~/utils/inbox-action-url'
import {
    formatNotificationPriority,
    formatNotificationType,
    matchesNotificationSearch,
    NOTIFICATION_PRIORITY_OPTIONS,
    NOTIFICATION_TYPE_OPTIONS,
} from '~/utils/inbox'

const PAGE_SIZE = 15
const SEARCH_FETCH_PAGE_SIZE = 100
const MAX_SEARCH_FETCH_PAGES = 20
const router = useRouter()
const { hasPermission, PERMISSIONS } = usePermissions()
const authStore = useAuthStore()
const { decrementUnreadCount, fetchCurrentUser, unreadCount } = authStore

const readTabs = [
    { value: '', label: 'همه' },
    { value: 'false', label: 'خوانده‌نشده' },
    { value: 'true', label: 'خوانده‌شده' },
] as const

const typeOptions = NOTIFICATION_TYPE_OPTIONS
const priorityOptions = NOTIFICATION_PRIORITY_OPTIONS

const orderingOptions = [
    { value: '-created_at', label: 'جدیدترین' },
    { value: 'created_at', label: 'قدیمی‌ترین' },
    { value: '-priority', label: 'اولویت (زیاد به کم)' },
    { value: 'priority', label: 'اولویت (کم به زیاد)' },
]

const items = ref<Notification[]>([])
const pagination = ref<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
    total_items: 0,
    next: null,
    previous: null,
})

const searchQuery = ref('')
const readFilter = ref('')
const typeFilter = ref('')
const priorityFilter = ref('')
const ordering = ref('-created_at')

const appliedSearch = ref('')
const appliedReadFilter = ref('')
const appliedType = ref('')
const appliedPriority = ref('')
const searchResultsCache = ref<Notification[]>([])

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const isMarkingAllRead = ref(false)
const itemToDelete = ref<Notification | null>(null)

const deleteModalMessage = computed(() => {
    const item = itemToDelete.value
    if (!item) return 'آیا از حذف این اعلان مطمئن هستید؟'
    const label = item.title || 'این اعلان'
    return `آیا از حذف «${label}» مطمئن هستید؟`
})

const hasActiveFilters = computed(
    () =>
        Boolean(appliedSearch.value) ||
        Boolean(appliedReadFilter.value) ||
        Boolean(appliedType.value) ||
        Boolean(appliedPriority.value),
)

const showMarkAllReadButton = computed(
    () => !isInitialLoading.value && !loadError.value && items.value.length > 0,
)

const displayItems = computed(() => {
    if (appliedReadFilter.value) return items.value
    return [...items.value].sort((a, b) => Number(a.is_read) - Number(b.is_read))
})

function setReadFilter(value: string) {
    if (readFilter.value === value) return
    readFilter.value = value
    applyFilters()
}

function buildInboxListParams(page: number, pageSize: number) {
    const params: Parameters<typeof inboxService.listNotifications>[0] = {
        page,
        page_size: pageSize,
        ordering: ordering.value,
    }

    if (appliedSearch.value) params.search = appliedSearch.value
    if (appliedType.value) params.notification_type = appliedType.value
    if (appliedPriority.value) params.priority = appliedPriority.value
    if (appliedReadFilter.value === 'true') params.is_read = true
    if (appliedReadFilter.value === 'false') params.is_read = false

    return params
}

function paginateSearchResults(all: Notification[], page: number) {
    const totalItems = all.length
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
    const safePage = Math.min(Math.max(1, page), totalPages)

    return {
        items: all.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
        pagination: {
            page: safePage,
            page_size: PAGE_SIZE,
            total_pages: totalPages,
            total_items: totalItems,
            next: safePage < totalPages ? String(safePage + 1) : null,
            previous: safePage > 1 ? String(safePage - 1) : null,
        } satisfies PaginationMeta,
    }
}

async function fetchAllInboxItems() {
    const all: Notification[] = []
    let page = 1
    let totalPages = 1

    while (page <= totalPages && page <= MAX_SEARCH_FETCH_PAGES) {
        const response = await inboxService.listNotifications(
            buildInboxListParams(page, SEARCH_FETCH_PAGE_SIZE),
        )
        const parsed = parseInboxListResponse(response)
        if (!parsed) break

        all.push(...parsed.items)
        totalPages = parsed.pagination.total_pages
        page += 1
    }

    return all
}

async function fetchNotifications(page = 1) {
    const isFirstLoad = isInitialLoading.value
    isFetching.value = true
    if (!isFirstLoad) loadError.value = null

    try {
        if (appliedSearch.value) {
            const allItems = await fetchAllInboxItems()
            const filtered = allItems.filter((item) =>
                matchesNotificationSearch(item, appliedSearch.value),
            )
            searchResultsCache.value = filtered

            const paged = paginateSearchResults(filtered, page)
            items.value = paged.items
            pagination.value = paged.pagination
            loadError.value = null
            return
        }

        searchResultsCache.value = []
        const response = await inboxService.listNotifications(buildInboxListParams(page, PAGE_SIZE))
        const parsed = parseInboxListResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت لیست اعلانات با خطا مواجه شد.'
            items.value = []
            return
        }

        items.value = parsed.items
        pagination.value = parsed.pagination
        loadError.value = null
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست اعلانات')
        if (isFirstLoad) items.value = []
    } finally {
        isFetching.value = false
        isInitialLoading.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedReadFilter.value = readFilter.value
    appliedType.value = typeFilter.value
    appliedPriority.value = priorityFilter.value
    pagination.value.page = 1
    fetchNotifications(1)
}

function resetFilters() {
    searchQuery.value = ''
    readFilter.value = ''
    typeFilter.value = ''
    priorityFilter.value = ''
    appliedSearch.value = ''
    appliedReadFilter.value = ''
    appliedType.value = ''
    appliedPriority.value = ''
    searchResultsCache.value = []
    pagination.value.page = 1
    fetchNotifications(1)
}

function goToPage(page: number) {
    if (appliedSearch.value) {
        const paged = paginateSearchResults(searchResultsCache.value, page)
        if (page < 1 || page > paged.pagination.total_pages) return
        items.value = paged.items
        pagination.value = paged.pagination
        return
    }

    if (page < 1 || page > pagination.value.total_pages) return
    fetchNotifications(page)
}

async function viewNotification(item: Notification) {
    if (!item.is_read) {
        try {
            const response = await inboxService.markNotificationAsRead(item.id)
            const updated = parseNotificationReadResponse(response)
            const idx = items.value.findIndex((entry) => entry.id === item.id)
            if (idx >= 0) {
                items.value[idx] = updated ?? { ...items.value[idx], is_read: true }
            }
            if (!updated) decrementUnreadCount()
            fetchCurrentUser(true)
        } catch {
            // navigate even if mark-read fails
        }
    }

    navigateNotificationAction(router, item.action_url, item.id)
}

async function markAllAsRead() {
    if (isMarkingAllRead.value) return

    isMarkingAllRead.value = true
    try {
        await inboxService.markAllNotificationsAsRead()
        await fetchCurrentUser(true)
        showToast({ message: 'همه اعلان‌ها خوانده شد.', variant: 'success' })
        await fetchNotifications(pagination.value.page)
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در خواندن همه اعلان‌ها'),
            variant: 'error',
        })
    } finally {
        isMarkingAllRead.value = false
    }
}

function openDeleteModal(item: Notification) {
    itemToDelete.value = item
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!itemToDelete.value || isDeleting.value) return

    const deleted = itemToDelete.value
    const currentPage = pagination.value.page
    isDeleting.value = true

    try {
        await inboxService.deleteNotification(deleted.id)
        showDeleteModal.value = false
        itemToDelete.value = null

        await fetchCurrentUser(true)

        showToast({ message: 'اعلان با موفقیت حذف شد.', variant: 'success' })
        await fetchNotifications(currentPage)

        if (items.value.length === 0 && currentPage > 1) {
            await fetchNotifications(currentPage - 1)
        }
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
    fetchNotifications()
})
</script>
