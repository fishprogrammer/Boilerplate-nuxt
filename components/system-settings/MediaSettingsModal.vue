<template>
    <SettingsFormModal
        :model-value="modelValue"
        title="ویرایش تنظیمات رسانه"
        description="پسوندهای مجاز، حجم آپلود و ابعاد thumbnail"
        :loading="isSaving"
        @update:model-value="$emit('update:modelValue', $event)"
        @save="submitUpdate"
        @cancel="resetForm"
    >
        <form class="space-y-4" @submit.prevent="submitUpdate">
            <div>
                <label for="allowed-extensions" class="mb-1 block text-xs font-medium text-text-primary">پسوندهای مجاز</label>
                <textarea
                    id="allowed-extensions"
                    v-model="form.allowed_extensions"
                    rows="3"
                    dir="ltr"
                    placeholder="jpg, png, pdf"
                    :class="textareaClass('allowed_extensions')"
                    @input="clearFieldError('allowed_extensions')"
                />
                <p class="mt-1 text-xs text-text-muted">بدون نقطه — با کاما جدا کنید. خالی = همه پسوندها مجاز</p>
                <p v-if="fieldErrors.allowed_extensions" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.allowed_extensions }}</p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                    <label for="max-upload-size" class="mb-1 block text-xs font-medium text-text-primary">حداکثر حجم آپلود (مگابایت)</label>
                    <input
                        id="max-upload-size"
                        v-model.number="form.max_upload_size_mb"
                        type="number"
                        min="1"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('max_upload_size_mb', true)"
                        @input="clearFieldError('max_upload_size_mb')"
                    />
                    <p v-if="fieldErrors.max_upload_size_mb" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.max_upload_size_mb }}</p>
                </div>

                <div>
                    <label for="thumbnail-width" class="mb-1 block text-xs font-medium text-text-primary">عرض thumbnail (px)</label>
                    <input
                        id="thumbnail-width"
                        v-model.number="form.thumbnail_width"
                        type="number"
                        min="1"
                        max="32767"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('thumbnail_width', true)"
                        @input="clearFieldError('thumbnail_width')"
                    />
                    <p v-if="fieldErrors.thumbnail_width" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.thumbnail_width }}</p>
                </div>

                <div>
                    <label for="thumbnail-height" class="mb-1 block text-xs font-medium text-text-primary">ارتفاع thumbnail (px)</label>
                    <input
                        id="thumbnail-height"
                        v-model.number="form.thumbnail_height"
                        type="number"
                        min="1"
                        max="32767"
                        step="1"
                        inputmode="numeric"
                        dir="ltr"
                        :class="inputClass('thumbnail_height', true)"
                        @input="clearFieldError('thumbnail_height')"
                    />
                    <p v-if="fieldErrors.thumbnail_height" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.thumbnail_height }}</p>
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
import type { MediaSettings, UpdateMediaSettingsRequest } from '~/api/types/system.types'
import { parseMediaSettingsResponse } from '~/api/utils/api-response'
import SettingsFormModal from '~/components/system-settings/SettingsFormModal.vue'
import { showToast } from '~/composables/useToast'
import { extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import { formatAllowedExtensionsInput, parseAllowedExtensionsInput } from '~/utils/system-settings'

const props = defineProps<{
    modelValue: boolean
    settings: MediaSettings | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    updated: [settings: MediaSettings]
}>()

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const textareaClassBase =
    'w-full min-h-24 rounded-lg border border-border px-3 py-2 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus resize-y'

const form = reactive({
    allowed_extensions: '',
    max_upload_size_mb: 1,
    thumbnail_width: 1,
    thumbnail_height: 1,
})

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})
let validatedPayload: UpdateMediaSettingsRequest | null = null

function inputClass(field: string, ltr = false): string {
    const base = fieldErrors[field]
        ? `${fieldClass} border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : fieldClass
    return ltr ? `${base} dir-ltr text-right` : base
}

function textareaClass(field: string): string {
    return fieldErrors[field]
        ? `${textareaClassBase} dir-ltr text-right border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : `${textareaClassBase} dir-ltr text-right`
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function toFormNumber(value: unknown, fallback = 1): number {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback
}

function populateForm(settings: MediaSettings | null) {
    form.allowed_extensions = formatAllowedExtensionsInput(settings?.allowed_extensions ?? [])
    form.max_upload_size_mb = toFormNumber(settings?.max_upload_size_mb)
    form.thumbnail_width = toFormNumber(settings?.thumbnail_width)
    form.thumbnail_height = toFormNumber(settings?.thumbnail_height)
}

function resetForm() {
    saveError.value = null
    clearFieldErrors()
    populateForm(props.settings)
}

function validatePositiveInt(value: unknown, field: string, label: string, max?: number): number | null {
    if (value === '' || value === null || value === undefined) {
        fieldErrors[field] = `${label} الزامی است.`
        return null
    }

    const parsed = Number(value)
    const intValue = Math.trunc(parsed)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed !== intValue) {
        fieldErrors[field] = `${label} باید عدد صحیح بزرگ‌تر از صفر باشد.`
        return null
    }

    if (max !== undefined && intValue > max) {
        fieldErrors[field] = `${label} حداکثر ${max} می‌تواند باشد.`
        return null
    }

    return intValue
}

function validateExtensions(value: string): string[] | null {
    const extensions = parseAllowedExtensionsInput(value)
    const invalid = extensions.find((ext) => !/^[a-z0-9]+$/i.test(ext))
    if (invalid) {
        fieldErrors.allowed_extensions = `پسوند «${invalid}» نامعتبر است.`
        return null
    }
    return extensions
}

function validateForm(): boolean {
    clearFieldErrors()
    saveError.value = null
    validatedPayload = null

    const extensions = validateExtensions(form.allowed_extensions)
    const maxUploadSize = validatePositiveInt(form.max_upload_size_mb, 'max_upload_size_mb', 'حداکثر حجم آپلود')
    const thumbnailWidth = validatePositiveInt(form.thumbnail_width, 'thumbnail_width', 'عرض thumbnail', 32767)
    const thumbnailHeight = validatePositiveInt(form.thumbnail_height, 'thumbnail_height', 'ارتفاع thumbnail', 32767)

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = 'لطفاً خطاهای فرم را برطرف کنید.'
        return false
    }

    validatedPayload = {
        allowed_extensions: extensions ?? [],
        max_upload_size_mb: maxUploadSize!,
        thumbnail_width: thumbnailWidth!,
        thumbnail_height: thumbnailHeight!,
    }

    return true
}

function buildPayload(): UpdateMediaSettingsRequest {
    return validatedPayload ?? {
        allowed_extensions: parseAllowedExtensionsInput(form.allowed_extensions),
        max_upload_size_mb: toFormNumber(form.max_upload_size_mb),
        thumbnail_width: toFormNumber(form.thumbnail_width),
        thumbnail_height: toFormNumber(form.thumbnail_height),
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
        const response = await systemService.patchMediaSettings(buildPayload())
        const parsed = parseMediaSettingsResponse(response)

        if (!parsed.ok || !parsed.settings) {
            saveError.value = parsed.message || getApiErrorMessage(response, 'خطا در ذخیره تنظیمات')
            applyApiErrors(response)
            return
        }

        showToast({
            message: parsed.message || 'تنظیمات رسانه ذخیره شد.',
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

