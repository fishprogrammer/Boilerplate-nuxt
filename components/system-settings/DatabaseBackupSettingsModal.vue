<template>
    <SettingsFormModal
        :model-value="modelValue"
        title="ویرایش پشتیبان‌گیری دیتابیس"
        description="مسیر ذخیره، مدت نگهداری و مسیر PostgreSQL"
        :loading="isSaving"
        @update:model-value="$emit('update:modelValue', $event)"
        @save="submitUpdate"
        @cancel="resetForm"
    >
        <form class="space-y-4" @submit.prevent="submitUpdate">
            <div>
                <label for="backup-dir" class="mb-1 block text-xs font-medium text-text-primary">مسیر بکاپ</label>
                <input
                    id="backup-dir"
                    v-model="form.backup_dir"
                    type="text"
                    dir="ltr"
                    autocomplete="off"
                    placeholder="/var/backups/db"
                    :class="inputClass('backup_dir')"
                    @input="clearFieldError('backup_dir')"
                />
                <p v-if="fieldErrors.backup_dir" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.backup_dir }}</p>
            </div>

            <div>
                <label for="retention-days" class="mb-1 block text-xs font-medium text-text-primary">مدت نگهداری (روز)</label>
                <input
                    id="retention-days"
                    v-model="form.retention_days"
                    type="number"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    dir="ltr"
                    placeholder="30"
                    :class="inputClass('retention_days', true)"
                    @input="clearFieldError('retention_days')"
                />
                <p v-if="fieldErrors.retention_days" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.retention_days }}</p>
            </div>

            <div>
                <label for="postgresql-bin-path" class="mb-1 block text-xs font-medium text-text-primary">مسیر PostgreSQL</label>
                <input
                    id="postgresql-bin-path"
                    v-model="form.postgresql_bin_path"
                    type="text"
                    dir="ltr"
                    autocomplete="off"
                    placeholder="/usr/lib/postgresql/16/bin"
                    :class="inputClass('postgresql_bin_path')"
                    @input="clearFieldError('postgresql_bin_path')"
                />
                <p v-if="fieldErrors.postgresql_bin_path" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.postgresql_bin_path }}</p>
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
import type { DatabaseBackupSettings, UpdateDatabaseBackupSettingsRequest } from '~/api/types/system.types'
import { parseDatabaseBackupSettingsResponse } from '~/api/utils/api-response'
import SettingsFormModal from '~/components/system-settings/SettingsFormModal.vue'
import { showToast } from '~/composables/useToast'
import { extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'

const props = defineProps<{
    modelValue: boolean
    settings: DatabaseBackupSettings | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    updated: [settings: DatabaseBackupSettings]
}>()

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const form = reactive({
    backup_dir: '',
    retention_days: '',
    postgresql_bin_path: '',
})

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

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

function populateForm(settings: DatabaseBackupSettings | null) {
    form.backup_dir = settings?.backup_dir ?? ''
    form.retention_days = settings?.retention_days ? String(settings.retention_days) : ''
    form.postgresql_bin_path = settings?.postgresql_bin_path ?? ''
}

function resetForm() {
    saveError.value = null
    clearFieldErrors()
    populateForm(props.settings)
}

function validateForm(): boolean {
    clearFieldErrors()
    saveError.value = null

    if (!form.backup_dir.trim()) {
        fieldErrors.backup_dir = 'مسیر بکاپ الزامی است.'
    }

    const retention = Number(form.retention_days)
    if (!form.retention_days.trim() || !Number.isFinite(retention) || retention < 1) {
        fieldErrors.retention_days = 'مدت نگهداری باید عددی بزرگ‌تر از صفر باشد.'
    }

    if (!form.postgresql_bin_path.trim()) {
        fieldErrors.postgresql_bin_path = 'مسیر PostgreSQL الزامی است.'
    }

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = 'لطفاً خطاهای فرم را برطرف کنید.'
        return false
    }

    return true
}

function buildPayload(): UpdateDatabaseBackupSettingsRequest {
    return {
        backup_dir: form.backup_dir.trim(),
        retention_days: Number(form.retention_days),
        postgresql_bin_path: form.postgresql_bin_path.trim(),
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
        const response = await systemService.patchDatabaseBackupSettings(buildPayload())
        const parsed = parseDatabaseBackupSettingsResponse(response)

        if (!parsed.ok || !parsed.settings) {
            applyApiErrors(response)
            return
        }

        showToast({
            message: parsed.message || 'تنظیمات پشتیبان‌گیری ذخیره شد.',
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

