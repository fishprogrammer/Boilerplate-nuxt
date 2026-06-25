<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">کاربران</h1>
                    <p class="mt-1 text-sm text-text-secondary">مدیریت حساب‌های کاربری سیستم</p>
                </div>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                        v-if="canExportUsers"
                        type="button"
                        class="btn-muted-sm"
                        :disabled="isExporting"
                        @click="downloadUsersExportFile"
                    >
                        {{ isExporting ? 'در حال آماده‌سازی...' : 'خروجی Excel' }}
                    </button>
                    <button
                        v-if="hasPermission(PERMISSIONS.USERS.ADD)"
                        type="button"
                        class="btn-action-sm flex items-center gap-1.5"
                        @click="router.push({ name: 'create-user' })"
                    >
                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        افزودن کاربر جدید
                    </button>
                </div>
            </div>

            <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:gap-2">
                <div class="min-w-0 md:flex-2">
                    <label for="users-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <div class="flex overflow-hidden rounded-lg border border-border bg-surface focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 dark:focus-within:border-secondary">
                        <input
                            id="users-search"
                            v-model="searchQuery"
                            type="text"
                            autocomplete="off"
                            placeholder="نام، ایمیل، موبایل..."
                            class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                            :disabled="isFetching"
                            @keydown.enter.prevent="applyFilters"
                        />
                        <button
                            v-if="searchQuery.trim() || appliedSearch"
                            type="button"
                            class="flex shrink-0 items-center justify-center px-2 text-text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
                            :disabled="isFetching"
                            aria-label="پاک کردن جستجو"
                            @click="clearSearch"
                        >
                            <svg
                                class="size-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                                aria-hidden="true"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            class="flex shrink-0 items-center justify-center px-3 text-text-muted transition-colors hover:text-secondary disabled:opacity-50"
                            :disabled="isFetching"
                            aria-label="جستجو"
                            @click="applyFilters"
                        >
                            <svg
                                class="size-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 md:contents">
                    <div class="min-w-0 md:flex-1">
                        <label for="users-active" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
                        <select
                            id="users-active"
                            v-model="activeFilter"
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option value="">همه</option>
                            <option value="true">فعال</option>
                            <option value="false">غیرفعال</option>
                        </select>
                    </div>
                    <div class="min-w-0 md:flex-1">
                        <label for="users-staff" class="mb-1 block text-xs font-medium text-text-primary">کارمند</label>
                        <select
                            id="users-staff"
                            v-model="staffFilter"
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option value="">همه</option>
                            <option value="true">کارمند</option>
                            <option value="false">غیرکارمند</option>
                        </select>
                    </div>
                    <div class="min-w-0 md:flex-1">
                        <label for="users-gender" class="mb-1 block text-xs font-medium text-text-primary">جنسیت</label>
                        <select
                            id="users-gender"
                            v-model="genderFilter"
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="min-w-0 md:flex-[1.5]">
                    <label for="users-ordering" class="mb-1 block text-xs font-medium text-text-primary">مرتب‌سازی</label>
                    <select
                        id="users-ordering"
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

            <div v-if="hasActiveFilters && !isInitialLoading && !loadError" class="mb-4 flex flex-wrap gap-2">
                <span v-if="appliedSearch" class="brand-chip">جستجو: {{ appliedSearch }}</span>
                <span v-if="appliedActiveFilter === 'true'" class="brand-chip">فعال</span>
                <span v-if="appliedActiveFilter === 'false'" class="brand-chip">غیرفعال</span>
                <span v-if="appliedStaffFilter === 'true'" class="brand-chip">کارمند</span>
                <span v-if="appliedStaffFilter === 'false'" class="brand-chip">غیرکارمند</span>
                <span v-if="appliedGenderFilter" class="brand-chip">جنسیت: {{ formatUserGender(appliedGenderFilter) }}</span>
                <button
                    type="button"
                    class="text-xs text-text-secondary underline hover:text-text-primary"
                    :disabled="isFetching"
                    @click="resetFilters"
                >
                    پاک کردن فیلترها
                </button>
            </div>

            <UsersTableSkeleton v-if="isInitialLoading" />

            <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {{ loadError }}
            </div>

            <template v-else>
                <div class="users-table-scroll relative w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border">
                    <div
                        v-if="isFetching"
                        class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
                    >
                        <UsersTableSkeleton :rows="Math.max(users.length, 8)" :show-header="false" />
                    </div>

                    <table class="w-full min-w-[52rem] divide-y divide-border text-sm">
                        <thead class="bg-surface-muted">
                            <tr>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">#</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">نام</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">تلفن</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">کد ملی</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">وضعیت</th>
                                <th class="whitespace-nowrap px-4 py-3 text-center font-semibold text-text-primary">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border/60 bg-surface">
                            <tr v-if="users.length === 0">
                                <td colspan="6" class="px-4 py-8 text-center text-text-secondary">
                                    کاربری یافت نشد.
                                </td>
                            </tr>
                            <tr
                                v-for="item in users"
                                :key="item.id"
                                class="hover:bg-surface-hover/60"
                            >
                                <td class="whitespace-nowrap px-4 py-3 text-text-primary">{{ item.id }}</td>
                                <td class="max-w-48 truncate px-4 py-3 text-text-primary">{{ formatUserDisplayName(item) }}</td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-primary dir-ltr text-right">{{ item.phone_number || '—' }}</td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-primary dir-ltr text-right">{{ formatNationalIdDisplay(item.national_id) }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex flex-wrap gap-1">
                                        <span
                                            class="inline-flex rounded-full px-2 py-0.5 text-[0.6875rem] font-medium"
                                            :class="isUserActive(item)
                                                ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'"
                                        >
                                            {{ isUserActive(item) ? 'فعال' : 'غیرفعال' }}
                                        </span>
                                        <span
                                            v-if="item.is_staff"
                                            class="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[0.6875rem] font-medium text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                                        >
                                            کارمند
                                        </span>
                                        <span
                                            v-if="item.is_superuser"
                                            class="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[0.6875rem] font-medium text-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
                                        >
                                            مدیر کل
                                        </span>
                                        <span
                                            v-if="item.profile_complete === false"
                                            class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                            v-tooltip="formatProfileMissingFields(item.profile_missing_fields)"
                                        >
                                            پروفایل ناقص
                                        </span>
                                    </div>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <div class="flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                                            aria-label="نمایش کاربر"
                                            v-tooltip="'نمایش'"
                                            @click="viewUser(item)"
                                        >
                                            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            v-if="hasPermission(PERMISSIONS.USERS.CHANGE)"
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                                            aria-label="ویرایش کاربر"
                                            v-tooltip="'ویرایش'"
                                            @click="editUser(item)"
                                        >
                                            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            v-if="hasPermission(PERMISSIONS.USERS.DELETE)"
                                            type="button"
                                            class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                            aria-label="حذف کاربر"
                                            v-tooltip="'حذف'"
                                            @click="openDeleteModal(item)"
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
            title="حذف کاربر"
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
  name: 'users',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import { parseUsersListResponse } from '~/api/utils/api-response'
import type { Gender, PaginationMeta, UserProfile } from '~/api/types/auth.types'
import AppPagination from '~/components/AppPagination.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import UsersTableSkeleton from '~/components/skeleton/UsersTableSkeleton.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage, getApiResponseMessage, isNetworkError } from '~/utils/api-error'
import { formatNationalIdDisplay } from '~/utils/national-id'
import {
    buildUsersListParams,
    downloadUsersExport,
    formatProfileMissingFields,
    formatUserDisplayName,
    formatUserGender,
    isUserActive,
    USER_GENDER_FILTER_OPTIONS,
    USER_LIST_ORDERING_OPTIONS,
    UsersExportError,
    type UsersListFilterState,
} from '~/utils/users'

const PAGE_SIZE = 10
const router = useRouter()
const { hasPermission, PERMISSIONS, isStaff } = usePermissions()

const users = ref<UserProfile[]>([])
const pagination = ref<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
    total_items: 0,
    next: null,
    previous: null,
})

const isInitialLoading = ref(true)
const isFetching = ref(false)
const isExporting = ref(false)
const loadError = ref<string | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const userToDelete = ref<UserProfile | null>(null)

const searchQuery = ref('')
const activeFilter = ref('')
const staffFilter = ref('')
const genderFilter = ref('')
const ordering = ref('')
const appliedOrdering = ref('')

const appliedSearch = ref('')
const appliedActiveFilter = ref('')
const appliedStaffFilter = ref('')
const appliedGenderFilter = ref<Gender | ''>('')

const canExportUsers = computed(
    () => isStaff.value && hasPermission(PERMISSIONS.USERS.EXPORT),
)

const orderingOptions = USER_LIST_ORDERING_OPTIONS
const genderOptions = USER_GENDER_FILTER_OPTIONS

const hasActiveFilters = computed(() =>
    Boolean(
        appliedSearch.value
        || appliedActiveFilter.value
        || appliedStaffFilter.value
        || appliedGenderFilter.value,
    ),
)

const deleteModalMessage = computed(() => {
    const user = userToDelete.value
    if (!user) return 'آیا از حذف این کاربر مطمئن هستید؟'
    const label = formatUserDisplayName(user) || user.email || String(user.id)
    return `آیا از حذف کاربر «${label}» مطمئن هستید؟`
})

function viewUser(user: UserProfile) {
    router.push({ name: 'user-view', params: { id: String(user.id) } })
}

function editUser(user: UserProfile) {
    router.push({ name: 'user-edit', params: { id: String(user.id) } })
}

function openDeleteModal(user: UserProfile) {
    userToDelete.value = user
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!userToDelete.value || isDeleting.value) return

    isDeleting.value = true
    try {
        await authService.deleteUser(userToDelete.value.id)
        showDeleteModal.value = false
        userToDelete.value = null
        showToast({ message: 'کاربر با موفقیت حذف شد.', variant: 'success' })
        await fetchUsers(pagination.value.page)
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در حذف کاربر'),
            variant: 'error',
        })
    } finally {
        isDeleting.value = false
    }
}

function getAppliedFilters(): UsersListFilterState {
    return {
        search: appliedSearch.value,
        ordering: appliedOrdering.value,
        gender: appliedGenderFilter.value,
        is_active: appliedActiveFilter.value,
        is_staff: appliedStaffFilter.value,
    }
}

async function downloadUsersExportFile() {
    if (isExporting.value) return
    isExporting.value = true

    try {
        const filename = await downloadUsersExport(getAppliedFilters())
        showToast({ message: `فایل ${filename} دانلود شد.`, variant: 'success' })
    } catch (err: unknown) {
        let message = 'خروجی اکسل کاربران با خطا مواجه شد.'
        if (err instanceof UsersExportError) {
            if (err.code === 'export_forbidden') {
                message = 'شما مجاز به خروجی گرفتن از لیست کاربران نیستید.'
            } else if (err.message && err.message !== 'export_failed' && err.message !== 'export_invalid_response') {
                message = err.message
            }
        }
        showToast({ message, variant: 'error' })
    } finally {
        isExporting.value = false
    }
}

async function fetchUsers(page = pagination.value.page) {
    const isFirstLoad = isInitialLoading.value
    isFetching.value = true
    if (!isFirstLoad) loadError.value = null

    const params = buildUsersListParams(getAppliedFilters(), {
        page,
        page_size: PAGE_SIZE,
    })

    let lastErr: unknown = null

    try {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await authService.listUsers(params)
                const parsed = parseUsersListResponse(response)

                if (!parsed) {
                    loadError.value = getApiResponseMessage(response, 'دریافت لیست کاربران با خطا مواجه شد.')
                    users.value = []
                    return
                }

                users.value = parsed.users
                pagination.value = parsed.pagination
                loadError.value = null
                return
            } catch (err: unknown) {
                lastErr = err
                const status = (err as { response?: { status?: number } })?.response?.status
                const retryable =
                    isNetworkError(err) || status === 500 || status === 502 || status === 503 || status === 504
                if (attempt === 0 && retryable) {
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    continue
                }
                break
            }
        }

        loadError.value = getApiErrorMessage(lastErr, 'خطا در دریافت لیست کاربران')
        if (isFirstLoad) users.value = []
    } finally {
        isFetching.value = false
        isInitialLoading.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedActiveFilter.value = activeFilter.value
    appliedStaffFilter.value = staffFilter.value
    appliedGenderFilter.value = genderFilter.value === 'male' || genderFilter.value === 'female'
        ? genderFilter.value
        : ''
    appliedOrdering.value = ordering.value
    pagination.value.page = 1
    fetchUsers(1)
}

function clearSearch() {
    searchQuery.value = ''
    appliedSearch.value = ''
    pagination.value.page = 1
    fetchUsers(1)
}

function resetFilters() {
    searchQuery.value = ''
    activeFilter.value = ''
    staffFilter.value = ''
    genderFilter.value = ''
    ordering.value = ''
    appliedSearch.value = ''
    appliedActiveFilter.value = ''
    appliedStaffFilter.value = ''
    appliedGenderFilter.value = ''
    appliedOrdering.value = ''
    pagination.value.page = 1
    fetchUsers(1)
}

function goToPage(page: number) {
    if (page < 1 || page > pagination.value.total_pages) return
    pagination.value.page = page
    fetchUsers(page)
}

onMounted(() => {
    fetchUsers(1)
})
</script>
