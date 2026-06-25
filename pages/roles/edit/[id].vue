<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">ویرایش نقش</h1>
                    <p class="mt-1 text-sm text-text-secondary">تعریف نقش جدید و تخصیص دسترسی‌ها</p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                </div>
            </div>

            <CreateRoleFormSkeleton v-if="isPageLoading" aria-label="در حال بارگذاری فرم ویرایش نقش" />

            <div v-else-if="pageLoadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {{ pageLoadError }}
            </div>

            <form v-else @submit.prevent="submitUpdate" class="space-y-5">
                <div>
                    <label for="role-name" class="mb-1 block text-xs font-medium text-text-primary">نام نقش</label>
                    <input
                        id="role-name"
                        v-model="roleName"
                        type="text"
                        dir="rtl"
                        autocomplete="off"
                        placeholder="مثال: کارشناس فروش"
                        :class="inputClass('name')"
                        @input="clearFieldError('name')"
                    />
                    <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.name }}</p>
                </div>

                <div class="rounded-xl border border-border bg-surface-muted p-4">
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 class="text-sm font-semibold text-text-primary">دسترسی‌ها</h2>
                            <p class="mt-1 text-xs text-text-secondary">
                                {{ selectedPermissionIds.length }} از {{ permissions.length }} دسترسی انتخاب شده
                            </p>
                        </div>
                        <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                            <input
                                ref="selectAllPermissionsCheckbox"
                                type="checkbox"
                                class="size-4 accent-primary"
                                :checked="areAllVisiblePermissionsSelected"
                                @change="toggleAllVisiblePermissions"
                            />
                            <span class="text-sm text-text-primary">انتخاب همه</span>
                        </label>
                    </div>

                    <div class="mb-4">
                        <input
                            v-model="permissionSearch"
                            type="search"
                            placeholder="جستجو در عنوان یا اپ..."
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                    </div>

                    <p v-if="fieldErrors.permissions" class="mb-3 text-xs text-red-600 dark:text-red-400">
                        {{ fieldErrors.permissions }}
                    </p>

                    <div v-if="filteredGroupedPermissions.length === 0" class="py-8 text-center text-sm text-text-secondary">
                        دسترسی‌ای یافت نشد.
                    </div>

                    <div v-else class="max-h-112 space-y-4 overflow-y-auto pe-1">
                        <section
                            v-for="group in filteredGroupedPermissions"
                            :key="group.app"
                            class="overflow-hidden rounded-xl border transition-colors"
                            :class="hasGroupSelection(group.items)
                                ? permissionGroupUi.sectionSelected
                                : permissionGroupUi.sectionDefault"
                        >
                            <div
                                class="flex items-center gap-2 border-b px-3 py-2.5 transition-colors"
                                :class="hasGroupSelection(group.items)
                                    ? permissionGroupUi.headerSelected
                                    : permissionGroupUi.headerDefault"
                            >
                                <button
                                    type="button"
                                    class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-right"
                                    :aria-expanded="!isGroupCollapsed(group.app)"
                                    @click="toggleGroupCollapse(group.app)"
                                >
                                    <svg
                                        class="size-4 shrink-0 transition-transform duration-200"
                                        :class="[
                                            !isGroupCollapsed(group.app) ? 'rotate-180' : '',
                                            hasGroupSelection(group.items)
                                                ? permissionGroupUi.chevronSelected
                                                : 'text-text-muted',
                                        ]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <div class="min-w-0 flex-1">
                                        <h3
                                            class="text-sm font-semibold"
                                            :class="hasGroupSelection(group.items)
                                                ? permissionGroupUi.titleSelected
                                                : 'text-text-primary'"
                                        >
                                            {{ formatAppLabel(group.app) }}
                                        </h3>
                                        <p class="text-xs text-text-muted dir-ltr text-right">{{ group.app }}</p>
                                    </div>
                                    <span
                                        class="shrink-0 rounded-md px-2 py-0.5 text-[0.6875rem]"
                                        :class="hasGroupSelection(group.items)
                                            ? permissionGroupUi.countBadgeSelected
                                            : permissionGroupUi.countBadgeDefault"
                                    >
                                        {{ groupSelectedCount(group.items) }}/{{ group.items.length }}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    :class="permissionGroupUi.selectGroupBtn"
                                    @click="toggleGroupSelection(group.items)"
                                >
                                    {{ isGroupFullySelected(group.items) ? 'لغو انتخاب' : 'انتخاب گروه' }}
                                </button>
                            </div>

                            <div v-show="!isGroupCollapsed(group.app)" class="overflow-x-auto">
                                <table class="w-full min-w-[420px] divide-y divide-border/60 text-sm">
                                    <thead class="bg-surface-muted/50">
                                        <tr>
                                            <th class="w-10 px-3 py-2.5" />
                                            <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">نوع</th>
                                            <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">عنوان</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-border/40">
                                        <tr
                                            v-for="permission in group.items"
                                            :key="permission.id"
                                            class="hover:bg-surface-hover/40"
                                        >
                                            <td class="px-3 py-2.5">
                                                <input
                                                    type="checkbox"
                                                    class="size-4 accent-primary"
                                                    :checked="isPermissionSelected(permission.id)"
                                                    @change="togglePermission(permission.id)"
                                                />
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-2.5">
                                                <span
                                                    class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                                    :class="actionBadgeClass(permission.codename)"
                                                >
                                                    {{ formatActionLabel(permission.codename) }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2.5 text-text-primary">{{ permission.name }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button
                        type="submit"
                        :disabled="isSaving"
                        class="btn-action-sm"
                    >
                        {{ isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
                    </button>
                    <RouterLink
                        :to="{ name: 'roles' }"
                        class="btn-muted-sm"
                    >
                        انصراف
                    </RouterLink>
                </div>

                <div v-if="saveError || hasFieldErrors" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/40">
                    <p v-if="saveError" class="text-sm font-medium text-red-700 dark:text-red-300">{{ saveError }}</p>
                    <ul v-if="hasFieldErrors" class="mt-2 list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-400">
                        <li v-for="(message, field) in fieldErrors" :key="field">
                            <span class="font-medium">{{ fieldLabel(field) }}:</span>
                            {{ message }}
                        </li>
                    </ul>
                </div>
                <p v-if="saveSuccess" class="text-sm text-green-600 dark:text-green-400">{{ saveSuccess }}</p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'edit-role',
  layout: 'dashboard'
})


import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import {
    buildCreateRolePayload,
    isApiSuccess,
    parsePermissionsListResponse,
    parseRoleDetailResponse,
} from '~/api/utils/api-response'
import type { Permission } from '~/api/types/auth.types'
import CreateRoleFormSkeleton from '~/components/skeleton/CreateRoleFormSkeleton.vue'
import { showToast } from '~/composables/useToast'
import { API_FIELD_LABELS, extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { permissionGroupUi } from '~/constants/permission-group-ui'

const APP_LABELS: Record<string, string> = {
    admin: 'مدیریت سیستم',
    auth: 'احراز هویت',
    contenttypes: 'انواع محتوا',
    sessions: 'نشست‌ها',
    users: 'کاربران',
}

const route = useRoute()
const router = useRouter()

const roleName = ref('')
const permissionSearch = ref('')
const selectAllPermissionsCheckbox = ref<HTMLInputElement | null>(null)
const permissions = ref<Permission[]>([])
const selectedPermissionIds = ref<number[]>([])
const collapsedGroupApps = ref<Set<string>>(new Set())

const isLoadingPermissions = ref(true)
const isLoadingRole = ref(true)
const isSaving = ref(false)
const pageLoadError = ref<string | null>(null)
const saveError = ref<string | null>(null)
const saveSuccess = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

const roleId = computed(() => String(route.params.id ?? ''))
const isPageLoading = computed(() => isLoadingPermissions.value || isLoadingRole.value)

const fieldClass =
    'w-full h-10 rounded border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:focus:border-secondary'

const hasFieldErrors = computed(() => Object.keys(fieldErrors).length > 0)

const filteredGroupedPermissions = computed(() => {
    const query = permissionSearch.value.trim().toLowerCase()
    const filtered = permissions.value.filter((item) => {
        if (!query) return true
        return (
            item.codename.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query) ||
            item.app.toLowerCase().includes(query)
        )
    })

    const groups = new Map<string, Permission[]>()
    for (const item of filtered) {
        const app = item.app || 'unknown'
        const list = groups.get(app) ?? []
        list.push(item)
        groups.set(app, list)
    }

    return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([app, items]) => ({ app, items }))
})

const visiblePermissionIds = computed(() =>
    filteredGroupedPermissions.value.flatMap((group) => group.items.map((item) => item.id)),
)

const areAllVisiblePermissionsSelected = computed(() => {
    const visible = visiblePermissionIds.value
    return visible.length > 0 && visible.every((id) => selectedPermissionIds.value.includes(id))
})

const isSomeVisiblePermissionsSelected = computed(() => {
    const visible = visiblePermissionIds.value
    if (visible.length === 0) return false
    const selectedCount = visible.filter((id) => selectedPermissionIds.value.includes(id)).length
    return selectedCount > 0 && selectedCount < visible.length
})

watch(isSomeVisiblePermissionsSelected, (indeterminate) => {
    if (selectAllPermissionsCheckbox.value) {
        selectAllPermissionsCheckbox.value.indeterminate = indeterminate
    }
}, { flush: 'post' })

watch(
    () => permissions.value.length,
    (count) => {
        if (count > 0) {
            const apps = [...new Set(permissions.value.map((item) => item.app || 'unknown'))]
            collapsedGroupApps.value = new Set(apps)
        }
    },
    { once: true },
)

watch(permissionSearch, (query) => {
    if (query.trim()) {
        collapsedGroupApps.value = new Set()
    }
})

function isGroupCollapsed(app: string): boolean {
    return collapsedGroupApps.value.has(app)
}

function toggleGroupCollapse(app: string) {
    const next = new Set(collapsedGroupApps.value)
    if (next.has(app)) {
        next.delete(app)
    } else {
        next.add(app)
    }
    collapsedGroupApps.value = next
}

function groupSelectedCount(items: Permission[]): number {
    return items.filter((item) => isPermissionSelected(item.id)).length
}

function hasGroupSelection(items: Permission[]): boolean {
    return groupSelectedCount(items) > 0
}

function fieldLabel(field: string): string {
    return API_FIELD_LABELS[field] || field
}

function inputClass(field: string): string {
    return fieldErrors[field]
        ? `${fieldClass} border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : fieldClass
}

function formatAppLabel(app: string): string {
    return APP_LABELS[app] || app
}

function getActionType(codename: string): string {
    const prefix = codename.split('_')[0]
    if (['add', 'change', 'delete', 'view'].includes(prefix)) return prefix
    return 'other'
}

function formatActionLabel(codename: string): string {
    const action = getActionType(codename)
    const labels: Record<string, string> = {
        add: 'افزودن',
        change: 'ویرایش',
        delete: 'حذف',
        view: 'مشاهده',
        other: 'سایر',
    }
    return labels[action] || action
}

function actionBadgeClass(codename: string): string {
    const action = getActionType(codename)
    const classes: Record<string, string> = {
        add: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
        change: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        delete: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        view: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        other: 'bg-surface-muted text-text-secondary',
    }
    return classes[action] || classes.other
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function isPermissionSelected(id: number): boolean {
    return selectedPermissionIds.value.includes(id)
}

function togglePermission(id: number) {
    if (isPermissionSelected(id)) {
        selectedPermissionIds.value = selectedPermissionIds.value.filter((item) => item !== id)
    } else {
        selectedPermissionIds.value = [...selectedPermissionIds.value, id]
    }
    clearFieldError('permissions')
}

function isGroupFullySelected(items: Permission[]): boolean {
    return items.length > 0 && items.every((item) => isPermissionSelected(item.id))
}

function toggleGroupSelection(items: Permission[]) {
    if (isGroupFullySelected(items)) {
        const ids = new Set(items.map((item) => item.id))
        selectedPermissionIds.value = selectedPermissionIds.value.filter((id) => !ids.has(id))
    } else {
        const merged = new Set([...selectedPermissionIds.value, ...items.map((item) => item.id)])
        selectedPermissionIds.value = Array.from(merged)
    }
    clearFieldError('permissions')
}

function toggleAllVisiblePermissions() {
    if (areAllVisiblePermissionsSelected.value) {
        selectedPermissionIds.value = selectedPermissionIds.value.filter(
            (id) => !visiblePermissionIds.value.includes(id),
        )
    } else {
        const merged = new Set([...selectedPermissionIds.value, ...visiblePermissionIds.value])
        selectedPermissionIds.value = Array.from(merged)
    }
    clearFieldError('permissions')
}

function applyApiErrors(err: unknown) {
    clearFieldErrors()
    Object.assign(fieldErrors, extractApiFieldErrors(err))

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = getApiResponseMessage(err, 'اعتبارسنجی ناموفق بود')
        return
    }

    saveError.value = getApiErrorMessage(err, 'خطا در ویرایش نقش')
}

async function fetchAllPermissions() {
    isLoadingPermissions.value = true

    try {
        const all: Permission[] = []
        let page = 1
        let totalPages = 1

        while (page <= totalPages) {
            const response = await authService.listPermissions({ page, page_size: 100 })
            const parsed = parsePermissionsListResponse(response)
            if (!parsed) {
                throw new Error('دریافت لیست دسترسی‌ها با خطا مواجه شد.')
            }

            all.push(...parsed.permissions)
            totalPages = parsed.pagination.total_pages
            page += 1
        }

        permissions.value = all
    } catch (err: unknown) {
        pageLoadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست دسترسی‌ها')
        permissions.value = []
    } finally {
        isLoadingPermissions.value = false
    }
}

async function fetchRole() {
    if (!roleId.value) {
        pageLoadError.value = 'شناسه نقش نامعتبر است.'
        isLoadingRole.value = false
        return
    }

    isLoadingRole.value = true

    try {
        const response = await authService.getRole(roleId.value)
        const parsed = parseRoleDetailResponse(response)

        if (!parsed) {
            pageLoadError.value = 'دریافت اطلاعات نقش با خطا مواجه شد.'
            return
        }

        roleName.value = parsed.name
        selectedPermissionIds.value = (parsed.permissions ?? []).map((item) => item.id)
    } catch (err: unknown) {
        pageLoadError.value = getApiErrorMessage(err, 'خطا در دریافت اطلاعات نقش')
    } finally {
        isLoadingRole.value = false
    }
}

async function submitUpdate() {
    if (!roleId.value) {
        saveError.value = 'شناسه نقش نامعتبر است.'
        return
    }

    saveError.value = null
    saveSuccess.value = null
    clearFieldErrors()

    if (!roleName.value.trim()) {
        saveError.value = 'نام نقش الزامی است.'
        return
    }

    isSaving.value = true

    try {
        const payload = buildCreateRolePayload(roleName.value, selectedPermissionIds.value)
        const response = await authService.updateRole(roleId.value, payload)

        if (!isApiSuccess(response)) {
            applyApiErrors(response)
            return
        }

        const updated = parseRoleDetailResponse(response)
        saveSuccess.value = `نقش «${updated?.name || roleName.value}» با موفقیت به‌روزرسانی شد.`
        showToast({ message: saveSuccess.value, variant: 'success' })

        setTimeout(() => {
            router.push({ name: 'roles' })
        }, 600)
    } catch (err: unknown) {
        applyApiErrors(err)
    } finally {
        isSaving.value = false
    }
}

onMounted(async () => {
    pageLoadError.value = null
    await Promise.all([fetchAllPermissions(), fetchRole()])
})
</script>
