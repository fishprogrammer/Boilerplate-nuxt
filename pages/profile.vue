<template>
        <div class="page-shell">
            <div class="page-card">
                <div class="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
                    <div class="size-16 shrink-0 rounded-full border border-border bg-[url('/user-placeholder.png')] bg-cover bg-center shadow-sm"></div>
                    <div class="flex w-full flex-1 flex-col items-center gap-3 lg:items-stretch">
                        <div class="flex w-full flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                            <div class="text-center lg:text-right">
                                <h1 class="text-xl font-semibold text-text-primary">{{ profileTitle }}</h1>
                                <p class="mt-1 text-sm text-text-secondary">{{ userEmail || userPhone || '—' }}</p>
                                <div v-if="unreadCount > 0" class="mt-3 flex justify-center lg:justify-start">
                                    <span class="inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">پیام‌ها: {{ unreadCount }}</span>
                                </div>
                            </div>

                            <div v-if="!isEditing" class="w-full shrink-0 sm:w-auto">
                                <button
                                    type="button"
                                    class="btn-action-sm w-full sm:w-auto"
                                    @click="startEdit"
                                >
                                    ویرایش پروفایل
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <template v-if="!isEditing">
                        <div class="relative md:col-span-2 overflow-hidden rounded-xl border border-border bg-surface">
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
                    </template>

                    <template v-else>
                        <div class="relative md:col-span-2 overflow-hidden rounded-xl border border-border bg-surface p-4">
                            <div
                                class="pointer-events-none absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-transparent dark:from-secondary/15 dark:via-primary/5 dark:to-transparent"
                                aria-hidden="true"
                            />
                            <div
                                class="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full bg-secondary/10 blur-2xl dark:bg-secondary/15"
                                aria-hidden="true"
                            />

                            <div class="relative mb-3 flex items-center gap-2.5">
                                <div class="flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground">
                                    <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h2 class="text-sm font-semibold text-text-primary">ویرایش اطلاعات حساب</h2>
                            </div>
                            <form @submit.prevent="saveEdit" class="relative space-y-3 text-sm text-text-secondary">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-text-primary text-xs font-medium mb-1">نام</label>
                                        <input v-model="form.first_name" :class="fieldClass" />
                                    </div>
                                    <div>
                                        <label class="block text-text-primary text-xs font-medium mb-1">نام خانوادگی</label>
                                        <input v-model="form.last_name" :class="fieldClass" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-text-primary text-xs font-medium mb-1">تاریخ تولد</label>
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
                                    </div>
                                    <div>
                                        <label class="block text-text-primary text-xs font-medium mb-1">جنسیت</label>
                                        <select v-model="form.gender" :class="fieldClass">
                                            <option value="">—</option>
                                            <option value="male">مرد</option>
                                            <option value="female">زن</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-text-primary text-xs font-medium mb-1">تماس</label>
                                        <input v-model="form.phone_number" dir="ltr" :class="fieldClassLtr" />
                                    </div>
                                    <div>
                                        <label class="block text-text-primary text-xs font-medium mb-1">کد ملی</label>
                                        <input
                                            v-model="form.national_id"
                                            type="text"
                                            inputmode="numeric"
                                            maxlength="10"
                                            autocomplete="off"
                                            dir="ltr"
                                            :class="fieldClassLtr"
                                            @input="onNationalIdInput"
                                        />
                                        <p v-if="nationalIdError" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ nationalIdError }}</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-text-primary text-xs font-medium mb-1">ایمیل</label>
                                        <input v-model="form.email" type="email" dir="ltr" :class="fieldClassLtr" />
                                    </div>
                                </div>
                                <div class="flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        :disabled="isSaving"
                                        class="btn-action-sm"
                                    >
                                        {{ isSaving ? 'در حال ذخیره...' : 'ذخیره' }}
                                    </button>
                                    <button
                                        type="button"
                                        :disabled="isSaving"
                                        @click="cancelEdit"
                                        class="btn-muted-sm"
                                    >
                                        انصراف
                                    </button>
                                </div>
                                <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
                            </form>
                        </div>
                    </template>

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

                            <div class="mt-5 space-y-2.5">
                                <RouterLink
                                    v-if="walletActive"
                                    :to="{ name: 'wallet-deposit' }"
                                    class="btn-action-sm w-full gap-2"
                                >
                                    <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    شارژ کیف پول
                                </RouterLink>

                                <RouterLink
                                    :to="{ name: 'wallet' }"
                                    class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-surface-hover/40 px-3 py-2.5 text-sm font-medium text-text-primary hover:border-secondary/40 hover:bg-secondary-muted/20 hover:text-secondary dark:bg-surface-hover/30 dark:hover:bg-secondary-muted/20"
                                >
                                    <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    تاریخچه تراکنش‌ها
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'Profile',
  layout: 'dashboard'
})

    import { computed, onMounted, watch, ref, reactive } from 'vue'
    import { useAuthStore } from '~/stores/auth'
    import { hydrateUserSession } from '~/composables/useSession'
    import { buildUpdateMePayload } from '~/api/utils/api-response'
    import type { Gender } from '~/api/types/auth.types'
    import { birthDateToPickerValue, formatBirthDateForDisplay } from '~/utils/date'
    import { getApiErrorMessage } from '~/utils/api-error'
    import { getAccessToken } from '~/utils/auth-storage'
    import { formatWalletAmount } from '~/utils/wallet'
    import { formatNationalIdDisplay, getNationalIdValidationError, normalizeNationalIdInput } from '~/utils/national-id'

    const { user, userEmail, userPhone, unreadCount, isLoading, updateCurrentUser } = useAuthStore()

    const profileTitle = computed(() => {
        const u = (user as any)?.value
        if (!u) return 'کاربر'

        const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
        return fullName || 'کاربر'
    })

    const isEditing = ref(false)
    const isSaving = ref(false)
    const saveError = ref<string | null>(null)
    const nationalIdError = ref<string | null>(null)
    const fieldClass =
        'w-full h-10 rounded border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:focus:border-secondary'
    const fieldClassLtr = `${fieldClass} text-right`

    const displayedGender = computed(() => {
        const gender = (user as any)?.value?.gender as Gender | undefined
        if (gender === 'male') return 'مرد'
        if (gender === 'female') return 'زن'
        return '—'
    })

    const displayedBirthDate = computed(() => {
        return formatBirthDateForDisplay((user as any)?.value?.birth_date)
    })

    const accountFields = computed(() => {
        const u = (user as any)?.value
        const empty = '—'

        return [
            { label: 'نام', value: u?.first_name || empty },
            { label: 'نام خانوادگی', value: u?.last_name || empty },
            { label: 'تماس', value: u?.phone_number || empty, ltr: true },
            { label: 'کد ملی', value: formatNationalIdDisplay(u?.national_id), ltr: true },
            { label: 'ایمیل', value: u?.email || empty, ltr: true, breakAll: true },
            { label: 'تاریخ تولد', value: displayedBirthDate.value },
            { label: 'جنسیت', value: displayedGender.value },
        ]
    })

    const walletBalance = computed(() => {
        const u = (user as any)?.value
        if (!u) return '0'
        const raw = u.wallet?.balance ?? u.wallet_balance ?? 0
        return formatWalletAmount(raw)
    })

    const walletActive = computed(() => {
        const u = (user as any)?.value
        if (!u) return false
        return Boolean(u.wallet?.is_active ?? u.wallet_is_active)
    })

    const form = reactive({
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        national_id: '',
        birth_date: '',
        gender: '' as Gender | '',
    })

    function startEdit() {
        const u = (user as any)?.value || {}
        form.email = u.email ?? ''
        form.first_name = u.first_name ?? ''
        form.last_name = u.last_name ?? ''
        form.phone_number = u.phone_number ?? ''
        form.national_id = u.national_id ?? ''
        form.birth_date = birthDateToPickerValue(u.birth_date)
        form.gender = u.gender === 'male' || u.gender === 'female' ? u.gender : ''
        saveError.value = null
        nationalIdError.value = null
        isEditing.value = true
    }

    function cancelEdit() {
        saveError.value = null
        nationalIdError.value = null
        isEditing.value = false
    }

    function onNationalIdInput() {
        form.national_id = normalizeNationalIdInput(form.national_id)
        nationalIdError.value = null
    }

    async function saveEdit() {
        saveError.value = null
        nationalIdError.value = null

        const nationalIdValidation = form.national_id.trim()
            ? getNationalIdValidationError(form.national_id)
            : null
        if (nationalIdValidation) {
            nationalIdError.value = nationalIdValidation
            return
        }
        isSaving.value = true

        try {
            const payload = buildUpdateMePayload({
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                phone_number: form.phone_number,
                national_id: form.national_id,
                birth_date: form.birth_date || undefined,
                gender: form.gender || undefined,
            })

            await updateCurrentUser(payload)
            isEditing.value = false
        } catch (err: unknown) {
            saveError.value = getApiErrorMessage(err, 'خطا در ذخیره پروفایل')
            console.error('Profile update error:', err)
        } finally {
            isSaving.value = false
        }
    }

    onMounted(async () => {
        // Prevent duplicate requests when parent layout already fetches /me.
        if (!getAccessToken()) return

        const existing = (user as any)?.value
        if (existing) return

        // If another component (e.g. DashboardLayout) is already fetching, wait for it to finish
        if ((isLoading as any)?.value) {
            await new Promise<void>((resolve) => {
                const stop = watch(() => (isLoading as any).value, (val) => {
                    if (!val) {
                        stop()
                        resolve()
                    }
                })
                // safety timeout in case something hangs
                setTimeout(() => {
                    stop()
                    resolve()
                }, 5000)
            })
            return
        }

        try {
            await hydrateUserSession()
        } catch (err) {
            console.warn('Failed to hydrate session on profile mount', err)
        }
    })
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