<template>
    <SettingsFormModal
        :model-value="modelValue"
        title="ویرایش سرویس پیامک"
        description="تنظیمات Kavenegar و قالب‌های OTP"
        :loading="isSaving"
        @update:model-value="$emit('update:modelValue', $event)"
        @save="submitUpdate"
        @cancel="resetForm"
    >
        <form class="space-y-4" @submit.prevent="submitUpdate">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label for="sms-sender" class="mb-1 block text-xs font-medium text-text-primary">شماره فرستنده</label>
                    <input
                        id="sms-sender"
                        v-model="form.sender"
                        type="text"
                        dir="ltr"
                        maxlength="50"
                        autocomplete="off"
                        placeholder="10008663"
                        :class="inputClass('sender')"
                        @input="clearFieldError('sender')"
                    />
                    <p v-if="fieldErrors.sender" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.sender }}</p>
                </div>

                <div>
                    <label for="sms-lookup-type" class="mb-1 block text-xs font-medium text-text-primary">نوع lookup</label>
                    <select
                        id="sms-lookup-type"
                        v-model="form.lookup_type"
                        :class="inputClass('lookup_type')"
                        @change="clearFieldError('lookup_type')"
                    >
                        <option v-for="option in lookupTypeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <p v-if="fieldErrors.lookup_type" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.lookup_type }}</p>
                </div>

                <div class="sm:col-span-2">
                    <label for="sms-api-key-env" class="mb-1 block text-xs font-medium text-text-primary">نام متغیر API Key</label>
                    <input
                        id="sms-api-key-env"
                        v-model="form.api_key_env_name"
                        type="text"
                        dir="ltr"
                        maxlength="100"
                        autocomplete="off"
                        placeholder="KAVENEGAR_API_KEY"
                        :class="inputClass('api_key_env_name')"
                        @input="clearFieldError('api_key_env_name')"
                    />
                    <p v-if="fieldErrors.api_key_env_name" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.api_key_env_name }}</p>
                </div>

                <div>
                    <label for="login-otp-template" class="mb-1 block text-xs font-medium text-text-primary">قالب OTP ورود</label>
                    <input
                        id="login-otp-template"
                        v-model="form.login_otp_template"
                        type="text"
                        dir="ltr"
                        maxlength="100"
                        autocomplete="off"
                        placeholder="login-otp"
                        :class="inputClass('login_otp_template')"
                        @input="clearFieldError('login_otp_template')"
                    />
                    <p class="mt-1 text-xs text-text-muted">نام قالب تأییدشده در پنل کاوه‌نگار (با %token)</p>
                    <p v-if="fieldErrors.login_otp_template" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.login_otp_template }}</p>
                </div>

                <div>
                    <label for="register-otp-template" class="mb-1 block text-xs font-medium text-text-primary">قالب OTP ثبت‌نام</label>
                    <input
                        id="register-otp-template"
                        v-model="form.register_otp_template"
                        type="text"
                        dir="ltr"
                        maxlength="100"
                        autocomplete="off"
                        placeholder="register-otp"
                        :class="inputClass('register_otp_template')"
                        @input="clearFieldError('register_otp_template')"
                    />
                    <p class="mt-1 text-xs text-text-muted">نام قالب تأییدشده در پنل کاوه‌نگار (با %token)</p>
                    <p v-if="fieldErrors.register_otp_template" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.register_otp_template }}</p>
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
import type { SmsProviderSettings, UpdateSmsProviderSettingsRequest } from '~/api/types/system.types'
import { parseSmsProviderSettingsResponse } from '~/api/utils/api-response'
import SettingsFormModal from '~/components/system-settings/SettingsFormModal.vue'
import { showToast } from '~/composables/useToast'
import { extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { SMS_LOOKUP_TYPE_OPTIONS } from '~/utils/system-settings'

const props = defineProps<{
    modelValue: boolean
    settings: SmsProviderSettings | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    updated: [settings: SmsProviderSettings]
}>()

const lookupTypeOptions = SMS_LOOKUP_TYPE_OPTIONS

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const form = reactive({
    sender: '',
    lookup_type: 'sms',
    api_key_env_name: '',
    login_otp_template: '',
    register_otp_template: '',
})

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

function inputClass(field: string): string {
    return fieldErrors[field]
        ? `${fieldClass} dir-ltr text-right border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : `${fieldClass} dir-ltr text-right`
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function normalizeLookupType(value: string | undefined): string {
    return value === 'call' ? 'call' : 'sms'
}

function populateForm(settings: SmsProviderSettings | null) {
    form.sender = settings?.sender ?? ''
    form.lookup_type = normalizeLookupType(settings?.lookup_type)
    form.api_key_env_name = settings?.api_key_env_name ?? ''
    form.login_otp_template = settings?.login_otp_template ?? ''
    form.register_otp_template = settings?.register_otp_template ?? ''
}

function resetForm() {
    saveError.value = null
    clearFieldErrors()
    populateForm(props.settings)
}

function validateRequiredText(value: string, field: string, label: string, maxLength: number) {
    const trimmed = value.trim()
    if (!trimmed) {
        fieldErrors[field] = `${label} الزامی است.`
        return
    }
    if (trimmed.length > maxLength) {
        fieldErrors[field] = `${label} حداکثر ${maxLength} کاراکتر می‌تواند باشد.`
    }
}

function validateForm(): boolean {
    clearFieldErrors()
    saveError.value = null

    validateRequiredText(form.sender, 'sender', 'شماره فرستنده', 50)
    validateRequiredText(form.lookup_type, 'lookup_type', 'نوع lookup', 20)
    validateRequiredText(form.api_key_env_name, 'api_key_env_name', 'نام متغیر API Key', 100)
    validateRequiredText(form.login_otp_template, 'login_otp_template', 'قالب OTP ورود', 100)
    validateRequiredText(form.register_otp_template, 'register_otp_template', 'قالب OTP ثبت‌نام', 100)

    if (!['sms', 'call'].includes(form.lookup_type)) {
        fieldErrors.lookup_type = 'نوع lookup باید sms یا call باشد.'
    }

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = 'لطفاً خطاهای فرم را برطرف کنید.'
        return false
    }

    return true
}

function buildPayload(): UpdateSmsProviderSettingsRequest {
    return {
        sender: form.sender.trim(),
        lookup_type: form.lookup_type.trim(),
        api_key_env_name: form.api_key_env_name.trim(),
        login_otp_template: form.login_otp_template.trim(),
        register_otp_template: form.register_otp_template.trim(),
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
        const response = await systemService.patchSmsProviderSettings(buildPayload())
        const parsed = parseSmsProviderSettingsResponse(response)

        if (!parsed.ok || !parsed.settings) {
            applyApiErrors(response)
            return
        }

        showToast({
            message: parsed.message || 'تنظیمات پیامک ذخیره شد.',
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
)
</script>

