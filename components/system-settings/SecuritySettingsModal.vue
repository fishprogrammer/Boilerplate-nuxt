<template>
    <SettingsFormModal
        :model-value="modelValue"
        title="ویرایش تنظیمات امنیت"
        description="کپچا، OTP و محدودیت‌های ورود"
        :loading="isSaving"
        @update:model-value="$emit('update:modelValue', $event)"
        @save="submitUpdate"
        @cancel="resetForm"
    >
        <form class="space-y-4" @submit.prevent="submitUpdate">
            <label class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/50 px-4 py-3">
                <span class="text-sm font-medium text-text-primary">فعال‌سازی کپچا</span>
                <input
                    v-model="form.captcha_enabled"
                    type="checkbox"
                    class="size-4 accent-primary"
                    @change="clearFieldError('captcha_enabled')"
                />
            </label>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="captcha-ttl" class="mb-1 block text-xs font-medium text-text-primary">مدت اعتبار کپچا (ثانیه)</label>
                    <input
                        id="captcha-ttl"
                        v-model.number="form.captcha_ttl_seconds"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('captcha_ttl_seconds', true)"
                        @input="clearFieldError('captcha_ttl_seconds')"
                    />
                    <p v-if="fieldErrors.captcha_ttl_seconds" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.captcha_ttl_seconds }}</p>
                </div>

                <div>
                    <label for="login-max-attempts" class="mb-1 block text-xs font-medium text-text-primary">حداکثر تلاش ورود</label>
                    <input
                        id="login-max-attempts"
                        v-model.number="form.login_max_attempts"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('login_max_attempts', true)"
                        @input="clearFieldError('login_max_attempts')"
                    />
                    <p v-if="fieldErrors.login_max_attempts" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.login_max_attempts }}</p>
                </div>

                <div>
                    <label for="login-attempt-window" class="mb-1 block text-xs font-medium text-text-primary">بازه شمارش تلاش (دقیقه)</label>
                    <input
                        id="login-attempt-window"
                        v-model.number="form.login_attempt_window_minutes"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('login_attempt_window_minutes', true)"
                        @input="clearFieldError('login_attempt_window_minutes')"
                    />
                    <p v-if="fieldErrors.login_attempt_window_minutes" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.login_attempt_window_minutes }}</p>
                </div>

                <div>
                    <label for="login-block-minutes" class="mb-1 block text-xs font-medium text-text-primary">مدت مسدودسازی (دقیقه)</label>
                    <input
                        id="login-block-minutes"
                        v-model.number="form.login_block_minutes"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('login_block_minutes', true)"
                        @input="clearFieldError('login_block_minutes')"
                    />
                    <p v-if="fieldErrors.login_block_minutes" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.login_block_minutes }}</p>
                </div>

                <div class="sm:col-span-2">
                    <label for="otp-lifetime" class="mb-1 block text-xs font-medium text-text-primary">اعتبار OTP (دقیقه)</label>
                    <input
                        id="otp-lifetime"
                        v-model.number="form.otp_lifetime_minutes"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('otp_lifetime_minutes', true)"
                        @input="clearFieldError('otp_lifetime_minutes')"
                    />
                    <p v-if="fieldErrors.otp_lifetime_minutes" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.otp_lifetime_minutes }}</p>
                </div>
            </div>

            <div
                v-if="saveError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ saveError }}
            </div>
        </form>
    </SettingsFormModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { systemService } from '~/api/services/system.service'
import type { SecuritySettings, UpdateSecuritySettingsRequest } from '~/api/types/system.types'
import { parseSecuritySettingsResponse } from '~/api/utils/api-response'
import SettingsFormModal from '~/components/system-settings/SettingsFormModal.vue'
import { showToast } from '~/composables/useToast'
import { extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'

const props = defineProps<{
    modelValue: boolean
    settings: SecuritySettings | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    updated: [settings: SecuritySettings]
}>()

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const form = reactive({
    captcha_enabled: false,
    captcha_ttl_seconds: 0,
    login_max_attempts: 0,
    login_attempt_window_minutes: 0,
    login_block_minutes: 0,
    otp_lifetime_minutes: 0,
})

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})
let validatedPayload: UpdateSecuritySettingsRequest | null = null

function inputClass(field: string, ltr = false): string {
    const base = fieldErrors[field]
        ? `${fieldClass} border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : fieldClass
    return ltr ? `${base} dir-ltr text-right` : base
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function toFormNumber(value: unknown): number {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0
}

function populateForm(settings: SecuritySettings | null) {
    form.captcha_enabled = settings?.captcha_enabled ?? false
    form.captcha_ttl_seconds = toFormNumber(settings?.captcha_ttl_seconds)
    form.login_max_attempts = toFormNumber(settings?.login_max_attempts)
    form.login_attempt_window_minutes = toFormNumber(settings?.login_attempt_window_minutes)
    form.login_block_minutes = toFormNumber(settings?.login_block_minutes)
    form.otp_lifetime_minutes = toFormNumber(settings?.otp_lifetime_minutes)
}

function resetForm() {
    saveError.value = null
    clearFieldErrors()
    populateForm(props.settings)
}

function validateNonNegativeInt(value: unknown, field: string, label: string): number | null {
    if (value === '' || value === null || value === undefined) {
        fieldErrors[field] = `${label} الزامی است.`
        return null
    }

    const parsed = Number(value)
    const intValue = Math.trunc(parsed)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed !== intValue) {
        fieldErrors[field] = `${label} باید عدد صحیح بزرگ‌تر یا مساوی صفر باشد.`
        return null
    }

    return intValue
}

function validateForm(): boolean {
    clearFieldErrors()
    saveError.value = null
    validatedPayload = null

    const captchaTtl = validateNonNegativeInt(form.captcha_ttl_seconds, 'captcha_ttl_seconds', 'مدت اعتبار کپچا')
    const loginMaxAttempts = validateNonNegativeInt(form.login_max_attempts, 'login_max_attempts', 'حداکثر تلاش ورود')
    const loginAttemptWindow = validateNonNegativeInt(form.login_attempt_window_minutes, 'login_attempt_window_minutes', 'بازه شمارش تلاش')
    const loginBlockMinutes = validateNonNegativeInt(form.login_block_minutes, 'login_block_minutes', 'مدت مسدودسازی')
    const otpLifetime = validateNonNegativeInt(form.otp_lifetime_minutes, 'otp_lifetime_minutes', 'اعتبار OTP')

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = 'لطفاً خطاهای فرم را برطرف کنید.'
        return false
    }

    validatedPayload = {
        captcha_enabled: form.captcha_enabled,
        captcha_ttl_seconds: captchaTtl!,
        login_max_attempts: loginMaxAttempts!,
        login_attempt_window_minutes: loginAttemptWindow!,
        login_block_minutes: loginBlockMinutes!,
        otp_lifetime_minutes: otpLifetime!,
    }

    return true
}

function buildPayload(): UpdateSecuritySettingsRequest {
    return validatedPayload ?? {
        captcha_enabled: form.captcha_enabled,
        captcha_ttl_seconds: toFormNumber(form.captcha_ttl_seconds),
        login_max_attempts: toFormNumber(form.login_max_attempts),
        login_attempt_window_minutes: toFormNumber(form.login_attempt_window_minutes),
        login_block_minutes: toFormNumber(form.login_block_minutes),
        otp_lifetime_minutes: toFormNumber(form.otp_lifetime_minutes),
    }
}

function applyApiErrors(err: unknown) {
    clearFieldErrors()
    Object.assign(fieldErrors, extractApiFieldErrors(err))

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = getApiResponseMessage(err, 'اعتبارسنجی ناموفق بود')
        return
    }

    saveError.value = getApiErrorMessage(err, 'خطا در ذخیره تنظیمات')
}

async function submitUpdate() {
    if (isSaving.value || !validateForm()) return

    isSaving.value = true
    saveError.value = null

    try {
        const response = await systemService.patchSecuritySettings(buildPayload())
        const parsed = parseSecuritySettingsResponse(response)

        if (!parsed.ok || !parsed.settings) {
            saveError.value = parsed.message || getApiErrorMessage(response, 'خطا در ذخیره تنظیمات')
            applyApiErrors(response)
            return
        }

        showToast({
            message: parsed.message || 'تنظیمات امنیت ذخیره شد.',
            variant: 'success',
        })

        emit('updated', parsed.settings)
        emit('update:modelValue', false)
    } catch (err: unknown) {
        applyApiErrors(err)
    } finally {
        isSaving.value = false
    }
}

watch(
    () => [props.modelValue, props.settings] as const,
    ([open, settings]) => {
        if (!open) return
        saveError.value = null
        clearFieldErrors()
        populateForm(settings)
    },
    { immediate: true },
)
</script>

