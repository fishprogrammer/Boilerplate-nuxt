<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">افزودن کاربر جدید</h1>
                    <p class="mt-1 text-sm text-text-secondary">اطلاعات حساب</p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                </div>
            </div>

            <CreateUserFormSkeleton v-if="isLoadingOptions" />

            <div v-else-if="optionsLoadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {{ optionsLoadError }}
            </div>

            <form v-else @submit.prevent="submitCreate" class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-3 rounded-xl border border-border bg-surface-muted p-4 md:col-span-2">

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                            <label class="mb-1 block text-xs font-medium text-text-primary">نام کاربری</label>
                            <input
                                v-model="form.username"
                                dir="ltr"
                                required
                                autocomplete="off"
                                :class="inputClass('username')"
                                @input="clearFieldError('username')"
                            />
                            <p v-if="fieldErrors.username" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.username }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">نام</label>
                            <input v-model="form.first_name" :class="inputClass('first_name')" @input="clearFieldError('first_name')" />
                            <p v-if="fieldErrors.first_name" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.first_name }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">نام خانوادگی</label>
                            <input v-model="form.last_name" :class="inputClass('last_name')" @input="clearFieldError('last_name')" />
                            <p v-if="fieldErrors.last_name" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.last_name }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">شماره موبایل</label>
                            <input
                                v-model="form.phone_number"
                                type="tel"
                                inputmode="numeric"
                                autocomplete="tel"
                                dir="ltr"
                                maxlength="11"
                                placeholder="09123456789"
                                :class="inputClass('phone_number', true)"
                                @input="onPhoneInput"
                            />
                            <p v-if="fieldErrors.phone_number" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.phone_number }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">
                                کد ملی
                                <span class="font-normal text-text-muted">(اختیاری)</span>
                            </label>
                            <input
                                v-model="form.national_id"
                                type="text"
                                inputmode="numeric"
                                dir="ltr"
                                maxlength="10"
                                placeholder="۱۰ رقم"
                                :class="inputClass('national_id', true)"
                                @input="onNationalIdInput"
                            />
                            <p v-if="fieldErrors.national_id" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.national_id }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">ایمیل</label>
                            <input
                                v-model="form.email"
                                type="email"
                                inputmode="email"
                                autocomplete="email"
                                dir="ltr"
                                placeholder="example@gmail.com"
                                required
                                :class="inputClass('email', true)"
                                @input="clearFieldError('email')"
                            />
                            <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.email }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">رمز عبور</label>
                            <div class="relative">
                                <input
                                    v-model="form.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    dir="ltr"
                                    required
                                    autocomplete="new-password"
                                    :class="[inputClass('password', true), 'pl-10']"
                                    @input="clearFieldError('password')"
                                />
                                <button
                                    type="button"
                                    class="absolute inset-y-0 left-0 flex cursor-pointer items-center px-3 text-text-muted hover:text-text-primary"
                                    :aria-label="showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'"
                                    @click="showPassword = !showPassword"
                                >
                                    <svg v-if="showPassword" class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                    <svg v-else class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.password }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">جنسیت</label>
                            <select v-model="form.gender" :class="inputClass('gender')" @change="clearFieldError('gender')">
                                <option value="">—</option>
                                <option value="male">مرد</option>
                                <option value="female">زن</option>
                            </select>
                            <p v-if="fieldErrors.gender" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.gender }}</p>
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-text-primary">تاریخ تولد</label>
                            <div class="profile-date-picker">
                                <DatePicker
                                    v-model="form.birth_date"
                                    type="date"
                                    format="YYYY-MM-DD"
                                    display-format="jYYYY/jMM/jDD"
                                    placeholder="تاریخ تولد را انتخاب کنید"
                                    input-class="profile-date-picker-input"
                                    clearable
                                    auto-submit
                                />
                            </div>
                            <p v-if="fieldErrors.birth_date" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.birth_date }}</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-4 rounded-xl border border-border bg-surface-muted p-4">
                    <h2 class="text-sm font-semibold text-text-primary">دسترسی‌ها</h2>
                    <label class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                        <span class="text-sm text-text-primary">حساب فعال</span>
                        <input v-model="form.is_active" type="checkbox" class="size-4 accent-primary" />
                    </label>
                    <label class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                        <span class="text-sm text-text-primary">کارمند (staff)</span>
                        <input v-model="form.is_staff" type="checkbox" class="size-4 accent-primary" />
                    </label>
                    <label class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                        <span class="text-sm text-text-primary">مدیر کل (superuser)</span>
                        <input v-model="form.is_superuser" type="checkbox" class="size-4 accent-primary" />
                    </label>

                    <div class="border-t border-border/60 pt-4">
                        <h3 class="mb-2 text-xs font-semibold text-text-primary">نقش‌ها</h3>
                        <p class="mb-3 text-xs text-text-secondary">
                            {{ selectedGroupIds.length }} از {{ roles.length }} نقش انتخاب شده
                        </p>
                        <div v-if="roles.length === 0" class="rounded-lg border border-border bg-surface px-3 py-4 text-center text-xs text-text-secondary">
                            نقشی یافت نشد.
                        </div>
                        <div v-else class="max-h-48 space-y-2 overflow-y-auto pe-1">
                            <label
                                v-for="role in roles"
                                :key="role.id"
                                class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                            >
                                <span class="text-sm text-text-primary">{{ formatRoleDisplayName(role) }}</span>
                                <input
                                    type="checkbox"
                                    class="size-4 accent-primary"
                                    :checked="isGroupSelected(role.id)"
                                    @change="toggleGroup(role.id)"
                                />
                            </label>
                        </div>
                        <p v-if="fieldErrors.groups" class="mt-2 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.groups }}</p>
                    </div>
                </div>

                <div class="rounded-xl border border-border bg-surface-muted p-4 md:col-span-3">
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 class="text-sm font-semibold text-text-primary">دسترسی‌های مستقیم</h2>
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

                    <p v-if="fieldErrors.user_permissions" class="mb-3 text-xs text-red-600 dark:text-red-400">
                        {{ fieldErrors.user_permissions }}
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
                                    @click="togglePermissionGroupSelection(group.items)"
                                >
                                    {{ isPermissionGroupFullySelected(group.items) ? 'لغو انتخاب' : 'انتخاب گروه' }}
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

                <div class="flex flex-wrap gap-2 md:col-span-3">
                    <button
                        type="submit"
                        :disabled="isSaving"
                        class="btn-action-sm"
                    >
                        {{ isSaving ? 'در حال ایجاد...' : 'ایجاد کاربر' }}
                    </button>
                    <button
                        type="button"
                        :disabled="isSaving"
                        class="btn-muted-sm"
                        @click="goBack"
                    >
                        انصراف
                    </button>
                </div>

                <div v-if="saveError || hasFieldErrors" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 md:col-span-3 dark:border-red-900/50 dark:bg-red-950/40">
                    <p v-if="saveError" class="text-sm font-medium text-red-700 dark:text-red-300">{{ saveError }}</p>
                    <ul v-if="hasFieldErrors" class="mt-2 list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-400">
                        <li v-for="(message, field) in fieldErrors" :key="field">
                            <span class="font-medium">{{ fieldLabel(field) }}:</span>
                            {{ message }}
                        </li>
                    </ul>
                </div>
                <p v-if="saveSuccess" class="text-sm text-green-600 md:col-span-3">{{ saveSuccess }}</p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'create-user',
  layout: 'dashboard'
})

import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import {
    buildCreateUserPayload,
    isApiSuccess,
    parseCreateUserResponse,
    parsePermissionsListResponse,
    parseRolesListResponse,
} from '~/api/utils/api-response'
import type { Gender, Permission, Role } from '~/api/types/auth.types'
import CreateUserFormSkeleton from '~/components/skeleton/CreateUserFormSkeleton.vue'
import { API_FIELD_LABELS, extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { isValidEmail } from '~/utils/email'
import { isValidMobile, sanitizeMobileInput } from '~/utils/phone'
import { getNationalIdValidationError, normalizeNationalIdInput } from '~/utils/national-id'
import { permissionGroupUi } from '~/constants/permission-group-ui'
import { formatRoleDisplayName } from '~/utils/user-roles'

const APP_LABELS: Record<string, string> = {
    admin: 'مدیریت سیستم',
    auth: 'احراز هویت',
    contenttypes: 'انواع محتوا',
    sessions: 'نشست‌ها',
    users: 'کاربران',
}

const router = useRouter()

const fieldClass =
    'w-full h-10 rounded border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:focus:border-secondary'
const fieldClassLtr = `${fieldClass}`

const form = reactive({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    national_id: '',
    birth_date: '',
    gender: '' as Gender | '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
})

const isSaving = ref(false)
const showPassword = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const selectedGroupIds = ref<number[]>([])
const selectedPermissionIds = ref<number[]>([])
const permissionSearch = ref('')
const collapsedGroupApps = ref<Set<string>>(new Set())
const selectAllPermissionsCheckbox = ref<HTMLInputElement | null>(null)
const isLoadingOptions = ref(true)
const optionsLoadError = ref<string | null>(null)

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
        add: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
        change: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
        delete: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
        view: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
        other: 'bg-surface-muted text-text-secondary',
    }
    return classes[action] || classes.other
}

function isGroupSelected(id: number): boolean {
    return selectedGroupIds.value.includes(id)
}

function toggleGroup(id: number) {
    if (isGroupSelected(id)) {
        selectedGroupIds.value = selectedGroupIds.value.filter((item) => item !== id)
    } else {
        selectedGroupIds.value = [...selectedGroupIds.value, id]
    }
    clearFieldError('groups')
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
    clearFieldError('user_permissions')
}

function isPermissionGroupFullySelected(items: Permission[]): boolean {
    return items.length > 0 && items.every((item) => isPermissionSelected(item.id))
}

function togglePermissionGroupSelection(items: Permission[]) {
    const ids = items.map((item) => item.id)
    if (isPermissionGroupFullySelected(items)) {
        selectedPermissionIds.value = selectedPermissionIds.value.filter((id) => !ids.includes(id))
    } else {
        const merged = new Set([...selectedPermissionIds.value, ...ids])
        selectedPermissionIds.value = Array.from(merged)
    }
    clearFieldError('user_permissions')
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
    clearFieldError('user_permissions')
}

async function fetchAllRoles() {
    const all: Role[] = []
    let page = 1
    let totalPages = 1

    while (page <= totalPages) {
        const response = await authService.listRoles({ page, page_size: 100 })
        const parsed = parseRolesListResponse(response)
        if (!parsed) {
            throw new Error('دریافت لیست نقش‌ها با خطا مواجه شد.')
        }

        all.push(...parsed.roles)
        totalPages = parsed.pagination.total_pages
        page += 1
    }

    roles.value = all
}

async function fetchAllPermissions() {
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
}

async function loadOptions() {
    isLoadingOptions.value = true
    optionsLoadError.value = null

    try {
        await Promise.all([fetchAllRoles(), fetchAllPermissions()])
    } catch (err: unknown) {
        optionsLoadError.value = getApiErrorMessage(err, 'خطا در بارگذاری نقش‌ها و دسترسی‌ها')
    } finally {
        isLoadingOptions.value = false
    }
}

onMounted(() => {
    loadOptions()
})

function fieldLabel(field: string): string {
    return API_FIELD_LABELS[field] || field
}

function inputClass(field: string, ltr = false): string {
    const base = ltr ? fieldClassLtr : fieldClass
    return fieldErrors[field] ? `${base} border-red-400 focus:border-red-500 focus:ring-red-500/20` : base
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function applyApiErrors(err: unknown) {
    clearFieldErrors()
    Object.assign(fieldErrors, extractApiFieldErrors(err))

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = getApiResponseMessage(err, 'اعتبارسنجی ناموفق بود')
        return
    }

    saveError.value = getApiErrorMessage(err, 'خطا در ایجاد کاربر')
}

function goBack() {
    router.push({ name: 'users' })
}

function onPhoneInput() {
    form.phone_number = sanitizeMobileInput(form.phone_number)
    clearFieldError('phone_number')
}

function onNationalIdInput() {
    form.national_id = normalizeNationalIdInput(form.national_id)
    clearFieldError('national_id')
}

async function submitCreate() {
    saveError.value = null
    saveSuccess.value = null
    clearFieldErrors()

    if (!form.username.trim()) {
        saveError.value = 'نام کاربری الزامی است.'
        return
    }
    if (!form.email.trim()) {
        saveError.value = 'ایمیل الزامی است.'
        return
    }
    if (!isValidEmail(form.email)) {
        saveError.value = 'فرمت ایمیل معتبر نیست.'
        return
    }
    if (!form.password) {
        saveError.value = 'رمز عبور الزامی است.'
        return
    }
    if (form.phone_number && !isValidMobile(form.phone_number)) {
        saveError.value = 'شماره موبایل باید ۱۱ رقم و با 09 شروع شود.'
        return
    }
    const nationalIdValidation = form.national_id.trim()
        ? getNationalIdValidationError(form.national_id)
        : null
    if (nationalIdValidation) {
        fieldErrors.national_id = nationalIdValidation
        saveError.value = 'لطفاً خطاهای فرم را برطرف کنید.'
        return
    }

    isSaving.value = true

    try {
        const payload = buildCreateUserPayload({
            username: form.username,
            email: form.email,
            password: form.password,
            first_name: form.first_name,
            last_name: form.last_name,
            phone_number: form.phone_number,
            national_id: form.national_id || undefined,
            birth_date: form.birth_date || undefined,
            gender: form.gender || undefined,
            is_active: form.is_active,
            is_staff: form.is_staff,
            is_superuser: form.is_superuser,
            groups: selectedGroupIds.value,
            user_permissions: selectedPermissionIds.value,
        })

        const response = await authService.createUser(payload)

        if (!isApiSuccess(response)) {
            const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
            throw Object.assign(
                new Error(typeof root.message === 'string' ? root.message : 'ایجاد کاربر ناموفق بود'),
                { errors: root.errors, code: root.code },
            )
        }

        const created = parseCreateUserResponse(response)
        saveSuccess.value =
            typeof (response as Record<string, unknown>).message === 'string'
                ? String((response as Record<string, unknown>).message)
                : `کاربر «${created?.username || form.username}» با موفقیت ایجاد شد.`

        setTimeout(() => {
            router.push({ name: 'users' })
        }, 800)
    } catch (err: unknown) {
        applyApiErrors(err)
    } finally {
        isSaving.value = false
    }
}
</script>

<style scoped>
.profile-date-picker :deep(.vpd-main) {
    display: block;
    width: 100%;
}

.profile-date-picker :deep(.vpd-input-group) {
    height: 2.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
    overflow: hidden;
    background: var(--color-surface);
}

.profile-date-picker :deep(.vpd-input-group input),
.profile-date-picker :deep(.profile-date-picker-input) {
    height: 100%;
    border: 0;
    border-radius: 0;
    padding: 0 0.75rem;
    line-height: 1.25rem;
    font-size: 0.875rem;
}

.profile-date-picker :deep(.vpd-icon-btn) {
    height: 100%;
    padding: 0 0.625rem;
}
</style>
