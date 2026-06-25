<template>
    <SettingsFormModal
        :model-value="modelValue"
        title="ویرایش تنظیمات عمومی"
        description="زبان، منطقه زمانی و نقش پیش‌فرض کاربران جدید"
        :loading="isSaving"
        @update:model-value="$emit('update:modelValue', $event)"
        @save="submitUpdate"
        @cancel="resetForm"
    >
        <form class="space-y-4" @submit.prevent="submitUpdate">
            <div>
                <label for="language-code" class="mb-1 block text-xs font-medium text-text-primary">زبان</label>
                <select
                    id="language-code"
                    v-model="form.language_code"
                    :class="inputClass('language_code')"
                    @change="clearFieldError('language_code')"
                >
                    <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
                <p v-if="fieldErrors.language_code" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.language_code }}</p>
            </div>

            <div>
                <label for="time-zone" class="mb-1 block text-xs font-medium text-text-primary">منطقه زمانی</label>
                <input
                    id="time-zone"
                    v-model="form.time_zone"
                    type="text"
                    dir="ltr"
                    maxlength="50"
                    autocomplete="off"
                    placeholder="Asia/Tehran"
                    :class="inputClass('time_zone')"
                    @input="clearFieldError('time_zone')"
                />
                <p v-if="fieldErrors.time_zone" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.time_zone }}</p>
            </div>

            <div>
                <label for="default-user-role" class="mb-1 block text-xs font-medium text-text-primary">نقش پیش‌فرض کاربر</label>
                <select
                    id="default-user-role"
                    v-model="form.default_user_role"
                    :class="inputClass('default_user_role')"
                    :disabled="isRolesLoading"
                    @change="clearFieldError('default_user_role')"
                >
                    <option value="">بدون نقش</option>
                    <option v-for="role in roles" :key="role.id" :value="String(role.id)">
                        {{ formatRoleName(role.name) }}
                    </option>
                </select>
                <p v-if="isRolesLoading" class="mt-1 text-xs text-text-muted">در حال بارگذاری نقش‌ها...</p>
                <p v-else-if="rolesLoadError" class="mt-1 text-xs text-amber-600 dark:text-amber-400">{{ rolesLoadError }}</p>
                <p v-if="fieldErrors.default_user_role" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.default_user_role }}</p>
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
import { authService } from '~/api/services/auth.service'
import { systemService } from '~/api/services/system.service'
import type { Role } from '~/api/types/auth.types'
import type { GeneralSettings, LanguageCode, UpdateGeneralSettingsRequest } from '~/api/types/system.types'
import { parseGeneralSettingsResponse, parseRolesListResponse } from '~/api/utils/api-response'
import SettingsFormModal from '~/components/system-settings/SettingsFormModal.vue'
import { showToast } from '~/composables/useToast'
import { extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { formatRoleLabel, LANGUAGE_CODE_OPTIONS } from '~/utils/system-settings'

const props = defineProps<{
    modelValue: boolean
    settings: GeneralSettings | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    updated: [settings: GeneralSettings]
}>()

const languageOptions = LANGUAGE_CODE_OPTIONS

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const form = reactive({
    language_code: 'fa' as LanguageCode,
    time_zone: '',
    default_user_role: '',
})

const roles = ref<Role[]>([])
const isSaving = ref(false)
const isRolesLoading = ref(false)
const rolesLoadError = ref<string | null>(null)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

function formatRoleName(name: string): string {
    return formatRoleLabel({ name })
}

function inputClass(field: string): string {
    return fieldErrors[field]
        ? `${fieldClass} border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : fieldClass
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function populateForm(settings: GeneralSettings | null) {
    const language = settings?.language_code === 'en' ? 'en' : 'fa'
    form.language_code = language
    form.time_zone = settings?.time_zone ?? ''
    form.default_user_role = settings?.default_user_role ? String(settings.default_user_role) : ''
}

function resetForm() {
    saveError.value = null
    clearFieldErrors()
    populateForm(props.settings)
}

async function fetchRoles() {
    isRolesLoading.value = true
    rolesLoadError.value = null

    try {
        const response = await authService.listRoles({ page: 1, page_size: 100 })
        const parsed = parseRolesListResponse(response)
        roles.value = parsed?.roles ?? []

        if (!parsed?.roles?.length) {
            rolesLoadError.value = 'نقشی برای انتخاب یافت نشد.'
        }
    } catch (err: unknown) {
        roles.value = []
        rolesLoadError.value = getApiErrorMessage(err, 'خطا در دریافت نقش‌ها')
    } finally {
        isRolesLoading.value = false
    }
}

function validateForm(): boolean {
    clearFieldErrors()
    saveError.value = null

    if (!form.language_code) {
        fieldErrors.language_code = 'انتخاب زبان الزامی است.'
    }

    if (!form.time_zone.trim()) {
        fieldErrors.time_zone = 'منطقه زمانی الزامی است.'
    } else if (form.time_zone.trim().length > 50) {
        fieldErrors.time_zone = 'منطقه زمانی حداکثر ۵۰ کاراکتر می‌تواند باشد.'
    }

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = 'لطفاً خطاهای فرم را برطرف کنید.'
        return false
    }

    return true
}

function buildPayload(): UpdateGeneralSettingsRequest {
    return {
        language_code: form.language_code,
        time_zone: form.time_zone.trim(),
        default_user_role: form.default_user_role ? Number(form.default_user_role) : null,
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
        const response = await systemService.patchGeneralSettings(buildPayload())
        const parsed = parseGeneralSettingsResponse(response)

        if (!parsed.ok || !parsed.settings) {
            applyApiErrors(response)
            return
        }

        showToast({
            message: parsed.message || 'تنظیمات عمومی ذخیره شد.',
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
        fetchRoles()
    },
)
</script>

