<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">نقش‌ها</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        مدیریت نقش‌های سیستم و مشاهده دسترسی‌های هر نقش
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <RouterLink
                    v-if="hasPermission(PERMISSIONS.AUTH.VIEW_PERMISSION)"
                    :to="{ name: 'permissions' }"
                    class="btn-muted-sm"
                    >
                    مشاهده دسترسی‌ها
                    </RouterLink>
                    <RouterLink
                    v-if="hasPermission(PERMISSIONS.AUTH.ADD_GROUP)"
                    :to="{ name: 'create-role' }"
                    class="btn-action-sm gap-1.5"
                    >
                    <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    نقش جدید
                    </RouterLink>
                </div>
            </div>

            <div class="mb-5">
                <label for="role-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                <div class="flex items-center gap-3">
                    <input
                        id="role-search"
                        v-model="searchQuery"
                        type="search"
                        placeholder="نام نقش..."
                        class="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                        @keydown.enter.prevent="applyFilters"
                    />
                    <span
                        v-if="!isInitialLoading && !loadError"
                        class="brand-chip shrink-0 font-medium"
                    >
                        {{ pagination.total_items }} نقش
                    </span>
                </div>
            </div>

            <div v-if="appliedSearch && !isInitialLoading && !loadError" class="mb-4">
                <span class="brand-chip">جستجو: {{ appliedSearch }}</span>
            </div>

            <RolesGridSkeleton v-if="isInitialLoading" :count="5" />

            <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {{ loadError }}
            </div>

            <template v-else>
                <div v-if="roles.length === 0" class="rounded-xl border border-border px-4 py-12 text-center text-sm text-text-secondary">
                    نقشی یافت نشد.
                </div>

                <div v-else class="roles-grid-panel relative">
                    <div
                        v-if="isFetching"
                        class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
                    >
                        <RolesGridSkeleton
                            embedded
                            :count="Math.max(roles.length, 4)"
                            :chip-count="5"
                        />
                    </div>

                    <article
                        v-for="role in roles"
                        :key="role.id"
                        class="role-card"
                    >
                        <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/60 px-3 py-2.5">
                            <div class="flex min-w-0 basis-full items-center gap-2 sm:basis-auto sm:flex-1">
                                <span class="role-card-icon size-8 shrink-0">
                                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </span>
                                <div class="min-w-0 flex-1">
                                    <h2 class="truncate text-sm font-semibold text-text-primary">
                                        {{ formatRoleDisplayName(role) }}
                                    </h2>
                                    <p class="truncate text-xs text-text-muted dir-ltr text-right">#{{ role.id }} · {{ role.name }}</p>
                                </div>
                            </div>

                            <div class="flex shrink-0 items-center gap-2 text-xs text-text-secondary">
                                <span class="rounded-md bg-surface-muted px-2 py-0.5">{{ role.user_count ?? 0 }} کاربر</span>
                                <span class="rounded-md bg-surface-muted px-2 py-0.5">{{ permissionCount(role) }} دسترسی</span>
                            </div>

                            <div class="flex shrink-0 items-center gap-0.5">
                                <button
                                    type="button"
                                    class="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                                    aria-label="نمایش نقش"
                                    v-tooltip="'نمایش'"
                                    @click="viewRole(role)"
                                >
                                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button
                                    v-if="hasPermission(PERMISSIONS.AUTH.CHANGE_GROUP)"
                                    type="button"
                                    class="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                                    aria-label="ویرایش نقش"
                                    v-tooltip="'ویرایش'"
                                    @click="editRole(role)"
                                >
                                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    v-if="hasPermission(PERMISSIONS.AUTH.DELETE_GROUP)"
                                    type="button"
                                    class="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                    aria-label="حذف نقش"
                                    v-tooltip="'حذف'"
                                    @click="openDeleteModal(role)"
                                >
                                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2 px-3 py-2.5 md:flex-row md:items-center md:gap-2">
                            <span class="shrink-0 text-xs font-medium text-text-muted">دسترسی‌ها</span>
                            <div v-if="role.permissions?.length" class="flex min-w-0 flex-wrap items-center gap-1 md:flex-1">
                                <span
                                    v-for="permission in role.permissions.slice(0, 5)"
                                    :key="permission.id"
                                    class="role-card-chip max-w-40 truncate"
                                    v-tooltip="permission.name"
                                >
                                    {{ permission.name }}
                                </span>
                                <span
                                    v-if="role.permissions.length > 5"
                                    class="role-card-chip-more shrink-0"
                                >
                                    +{{ role.permissions.length - 5 }}
                                </span>
                            </div>
                            <span v-else class="text-xs text-text-muted">بدون دسترسی</span>
                        </div>
                    </article>
                </div>

                <AppPagination
                    :page="pagination.page"
                    :total-pages="pagination.total_pages"
                    :disabled="isFetching"
                    @update:page="goToPage"
                />
            </template>
        </div>

        <RoleViewModal v-model="showRoleModal" :role-id="selectedRoleId" />

        <ConfirmModal
            v-model="showDeleteModal"
            title="حذف نقش"
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
  name: 'roles',
  layout: 'dashboard'
})


import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import { parseRolesListResponse } from '~/api/utils/api-response'
import type { PaginationMeta, Role } from '~/api/types/auth.types'
import AppPagination from '~/components/AppPagination.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import RoleViewModal from '~/components/RoleViewModal.vue'
import RolesGridSkeleton from '~/components/skeleton/RolesGridSkeleton.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { formatRoleDisplayName } from '~/utils/user-roles'
import { getApiErrorMessage } from '~/utils/api-error'

const PAGE_SIZE = 15
const SEARCH_DEBOUNCE_MS = 350

const router = useRouter()
const { hasPermission, PERMISSIONS } = usePermissions()

const roles = ref<Role[]>([])
const pagination = ref<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
    total_items: 0,
    next: null,
    previous: null,
})

const searchQuery = ref('')
const appliedSearch = ref('')

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)
const showRoleModal = ref(false)
const selectedRoleId = ref<number | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const roleToDelete = ref<Role | null>(null)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const deleteModalMessage = computed(() => {
    const role = roleToDelete.value
    if (!role) return 'آیا از حذف این نقش مطمئن هستید؟'
    const label = formatRoleDisplayName(role) || String(role.id)
    return `آیا از حذف نقش «${label}» مطمئن هستید؟`
})

function permissionCount(role: Role): number {
    return role.permissions?.length ?? 0
}

function viewRole(role: Role) {
    selectedRoleId.value = role.id
    showRoleModal.value = true
}

function editRole(role: Role) {
    router.push({ name: 'edit-role', params: { id: String(role.id) } })
}

function openDeleteModal(role: Role) {
    roleToDelete.value = role
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!roleToDelete.value || isDeleting.value) return

    isDeleting.value = true
    try {
        await authService.deleteRole(roleToDelete.value.id)
        showDeleteModal.value = false
        roleToDelete.value = null
        showToast({ message: 'نقش با موفقیت حذف شد.', variant: 'success' })
        await fetchRoles(pagination.value.page)
    } catch (err: unknown) {
        showToast({
            message: getApiErrorMessage(err, 'خطا در حذف نقش'),
            variant: 'error',
        })
    } finally {
        isDeleting.value = false
    }
}

async function fetchRoles(page = 1) {
    const isFirstLoad = isInitialLoading.value
    isFetching.value = true
    if (!isFirstLoad) loadError.value = null

    try {
        const params: Record<string, string | number> = {
            page,
            page_size: PAGE_SIZE,
        }
        if (appliedSearch.value) params.search = appliedSearch.value

        const response = await authService.listRoles(params)
        const parsed = parseRolesListResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت لیست نقش‌ها با خطا مواجه شد.'
            roles.value = []
            return
        }

        roles.value = parsed.roles
        pagination.value = parsed.pagination
        loadError.value = null
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست نقش‌ها')
        if (isFirstLoad) roles.value = []
    } finally {
        isFetching.value = false
        isInitialLoading.value = false
    }
}

function applyFilters() {
    const nextSearch = searchQuery.value.trim()
    if (nextSearch === appliedSearch.value && roles.value.length > 0) return

    appliedSearch.value = nextSearch
    fetchRoles(1)
}

watch(searchQuery, () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
        applyFilters()
    }, SEARCH_DEBOUNCE_MS)
})

function goToPage(page: number) {
    if (page < 1 || page > pagination.value.total_pages) return
    fetchRoles(page)
}

onMounted(() => {
    fetchRoles()
})

onBeforeUnmount(() => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})
</script>
