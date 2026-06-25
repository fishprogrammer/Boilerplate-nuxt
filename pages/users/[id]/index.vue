<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">مشاهده کاربر</h1>
                    <p class="mt-1 text-sm text-text-secondary">جزئیات حساب کاربری</p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                    <span
                        v-if="user"
                        class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                        :class="accessFlags.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'"
                    >
                        {{ accessFlags.is_active ? 'فعال' : 'غیرفعال' }}
                    </span>
                    <span
                        v-if="user && user.profile_complete === false"
                        class="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                    >
                        پروفایل ناقص
                    </span>
                    <span
                        v-else-if="user && user.profile_complete === true"
                        class="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                    >
                        پروفایل کامل
                    </span>
                </div>
            </div>

            <ViewUserSkeleton v-if="isLoading" />

            <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {{ loadError }}
            </div>

            <template v-else-if="user">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="relative overflow-hidden rounded-xl border border-border bg-surface md:col-span-2">
                    <div
                        class="pointer-events-none absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-transparent dark:from-secondary/15 dark:via-primary/5 dark:to-transparent"
                        aria-hidden="true"
                    />
                    <div
                        class="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full bg-secondary/10 blur-2xl dark:bg-secondary/15"
                        aria-hidden="true"
                    />
                    <div
                        class="pointer-events-none absolute -bottom-10 -left-4 size-28 rounded-full bg-primary/10 blur-2xl dark:bg-primary/10"
                        aria-hidden="true"
                    />

                    <div class="relative border-b border-border/50 px-4 py-3">
                        <div class="flex items-center gap-2.5">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground">
                                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-sm font-semibold text-text-primary">اطلاعات حساب</h2>
                                <p class="mt-0.5 text-xs text-text-muted">جزئیات پروفایل کاربری</p>
                            </div>
                        </div>
                    </div>

                    <dl class="relative divide-y divide-border/35">
                        <div
                            v-for="field in accountFields"
                            :key="field.label"
                            class="flex items-start justify-between gap-4 px-4 py-3.5 hover:bg-secondary-muted/20 dark:hover:bg-secondary-muted/10"
                        >
                            <dt class="shrink-0 text-sm text-text-secondary">{{ field.label }}</dt>
                            <dd
                                class="min-w-0 text-left text-sm font-medium text-text-primary"
                                :class="[
                                    field.ltr ? 'dir-ltr' : '',
                                    field.breakAll ? 'break-all' : 'truncate',
                                ]"
                            >
                                {{ field.value }}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div class="flex flex-col gap-4">
                    <div class="relative flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-surface">
                        <div
                            class="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-500/10 via-secondary/5 to-transparent dark:from-amber-500/5 dark:via-secondary/10"
                            aria-hidden="true"
                        />
                        <div
                            class="pointer-events-none absolute -left-6 -top-6 size-28 rounded-full bg-amber-400/10 blur-2xl dark:bg-amber-500/5"
                            aria-hidden="true"
                        />
                        <div
                            class="pointer-events-none absolute -bottom-8 -right-4 size-32 rounded-full bg-secondary/10 blur-2xl"
                            aria-hidden="true"
                        />

                        <div class="relative border-b border-border/50 px-4 py-3">
                            <div class="flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2.5">
                                    <div class="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11a1 1 0 100 2 1 1 0 000-2z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8v2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-text-primary">کیف پول</h2>
                                        <p class="text-[0.6875rem] text-text-muted">موجودی به ریال</p>
                                    </div>
                                </div>
                                <span
                                    class="inline-flex shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium"
                                    :class="walletActive
                                        ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'"
                                >
                                    {{ walletActive ? 'فعال' : 'غیرفعال' }}
                                </span>
                            </div>
                        </div>

                        <div class="relative flex flex-1 flex-col justify-between px-4 py-5">
                            <div>
                                <p class="text-xs font-medium text-text-secondary">موجودی فعلی</p>
                                <p class="mt-2 text-2xl font-bold leading-tight tracking-tight text-text-primary">
                                    {{ walletBalance }}
                                    <span class="text-sm font-medium text-text-secondary">ریال</span>
                                </p>
                            </div>

                            <RouterLink
                                v-if="canAccessRoute('wallet-manage')"
                                :to="{ name: 'wallet-manage' }"
                                class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-surface-hover/40 px-3 py-2.5 text-sm font-medium text-text-primary hover:border-secondary/40 hover:bg-secondary-muted/20 hover:text-secondary dark:bg-surface-hover/30 dark:hover:bg-secondary-muted/20"
                            >
                                <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                مدیریت کیف پول
                            </RouterLink>
                        </div>
                    </div>

                    <div class="relative overflow-hidden rounded-xl border border-border bg-surface">
                        <div
                            class="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-secondary/5 to-transparent dark:from-primary/10 dark:via-secondary/10 dark:to-transparent"
                            aria-hidden="true"
                        />
                        <div
                            class="pointer-events-none absolute -left-4 top-0 size-24 rounded-full bg-primary/10 blur-2xl dark:bg-primary/10"
                            aria-hidden="true"
                        />

                        <div class="relative border-b border-border/50 px-4 py-3">
                            <div class="flex items-center gap-2.5">
                                <div class="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary">
                                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-sm font-semibold text-text-primary">جزئیات دسترسی</h2>
                                    <p class="mt-0.5 text-xs text-text-muted">نقش و سطح دسترسی</p>
                                </div>
                            </div>
                        </div>

                        <div class="relative space-y-3 p-4">
                            <label
                                v-if="accessFlags.is_staff"
                                class="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2.5 dark:bg-surface-hover/30"
                            >
                                <span class="text-sm text-text-primary">کارمند</span>
                                <input checked type="checkbox" disabled class="size-4 accent-primary" />
                            </label>
                            <label
                                v-if="accessFlags.is_superuser"
                                class="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2.5 dark:bg-surface-hover/30"
                            >
                                <span class="text-sm text-text-primary">مدیر کل (superuser)</span>
                                <input checked type="checkbox" disabled class="size-4 accent-primary" />
                            </label>

                            <div class="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2.5 dark:bg-surface-hover/30">
                                <span class="text-sm text-text-primary">نقش‌ها</span>
                                <div v-if="user.roles?.length" class="flex flex-wrap justify-end gap-2">
                                    <span
                                        v-for="(role, roleIndex) in user.roles"
                                        :key="userRoleKey(role, roleIndex)"
                                        class="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-secondary/15 dark:text-secondary"
                                    >
                                        {{ normalizeUserRoleLabel(role) }}
                                    </span>
                                </div>
                                <span v-else class="text-sm text-text-muted">—</span>
                            </div>

                            <div class="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2.5 dark:bg-surface-hover/30">
                                <span class="text-sm text-text-primary">دسترسی‌های مستقیم</span>
                                <span class="text-sm font-medium text-text-primary">{{ permissionCount }}</span>
                            </div>

                            <div
                                v-if="user.profile_complete === false"
                                class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                            >
                                فیلدهای ناقص: {{ formatProfileMissingFields(user.profile_missing_fields) }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 md:col-span-3">
                    <button
                        v-if="hasPermission(PERMISSIONS.USERS.CHANGE)"
                        type="button"
                        class="btn-action-sm"
                        @click="goEdit"
                    >
                        ویرایش
                    </button>
                </div>
            </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'user-view',
  layout: 'dashboard'
})

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Gender, UserProfile } from '~/api/types/auth.types'
import ViewUserSkeleton from '~/components/skeleton/ViewUserSkeleton.vue'
import { formatBirthDateForDisplay } from '~/utils/date'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatNationalIdDisplay } from '~/utils/national-id'
import { usePermissions } from '~/composables/usePermissions'
import { useUsersStore } from '~/stores/users'
import { formatWalletAmount } from '~/utils/wallet'
import { formatProfileMissingFields, normalizeUserRoleLabel, userRoleKey } from '~/utils/users'

const route = useRoute()
const router = useRouter()
const { hasPermission, PERMISSIONS, canAccessRoute } = usePermissions()
const { setUserInStore, fetchUserById } = useUsersStore()

const user = ref<UserProfile | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const userId = computed(() => String(route.params.id ?? ''))

const accessFlags = computed(() => {
    const u = user.value
    if (!u) return { is_active: false, is_staff: false, is_superuser: false }

    return {
        is_active: u.is_active !== false,
        is_staff: u.is_staff === true,
        is_superuser: u.is_superuser === true,
    }
})

const permissionCount = computed(() => {
    const count = user.value?.permissions?.length ?? 0
    return count.toLocaleString('fa-IR')
})

const walletBalance = computed(() => {
    const u = user.value
    if (!u) return '0'
    const raw = u.wallet?.balance ?? u.wallet_balance ?? 0
    return formatWalletAmount(raw)
})

const walletActive = computed(() => {
    const u = user.value
    if (!u) return false
    return Boolean(u.wallet?.is_active ?? u.wallet_is_active)
})

const accountFields = computed(() => {
    const u = user.value
    if (!u) return []

    return [
        { label: 'نام کاربری', value: displayValue(u.username), ltr: true },
        { label: 'نام', value: displayValue(u.first_name) },
        { label: 'نام خانوادگی', value: displayValue(u.last_name) },
        { label: 'شماره موبایل', value: displayValue(u.phone_number), ltr: true },
        { label: 'کد ملی', value: formatNationalIdDisplay(u.national_id), ltr: true },
        { label: 'ایمیل', value: displayValue(u.email), ltr: true, breakAll: true },
        { label: 'جنسیت', value: displayGender(u.gender) },
        { label: 'تاریخ تولد', value: displayBirthDate(u.birth_date) },
    ]
})

function displayValue(value?: string | null): string {
    return value?.trim() ? value : '—'
}

function displayGender(gender?: Gender): string {
    if (gender === 'male') return 'مرد'
    if (gender === 'female') return 'زن'
    return '—'
}

function displayBirthDate(value?: string | number): string {
    return formatBirthDateForDisplay(value)
}

function goEdit() {
    router.push({ name: 'user-edit', params: { id: userId.value } })
}

async function fetchUser() {
    if (!userId.value) {
        loadError.value = 'شناسه کاربر نامعتبر است.'
        isLoading.value = false
        return
    }

    isLoading.value = true
    loadError.value = null

    try {
        const parsed = await fetchUserById(userId.value, true)
        if (!parsed) {
            loadError.value = 'دریافت اطلاعات کاربر با خطا مواجه شد.'
            user.value = null
            return
        }

        setUserInStore(parsed)
        user.value = parsed
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت اطلاعات کاربر')
        user.value = null
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void fetchUser()
})

watch(userId, () => {
    void fetchUser()
})
</script>
