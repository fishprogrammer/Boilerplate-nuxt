<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">تنظیمات سیستم</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        مدیریت تنظیمات عمومی، امنیت، پیامک، رسانه و پشتیبان‌گیری
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <span class="text-sm text-text-muted">
                        نسخه برنامه:
                        <span class="font-medium text-text-secondary dir-ltr">{{ appVersion }}</span>
                    </span>
                    <button
                        type="button"
                        class="btn-muted-sm gap-1.5"
                        :disabled="isLoading"
                        @click="fetchSettings"
                    >
                        <svg
                            class="size-4 shrink-0"
                            :class="isLoading ? 'animate-spin' : ''"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        بروزرسانی
                    </button>
                </div>
            </div>

            <SystemSettingsSkeleton v-if="isInitialLoading" />

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <div v-else-if="settings" class="relative space-y-5">
                <div
                    v-if="isFetching"
                    class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
                >
                    <SystemSettingsSkeleton embedded />
                </div>

                <section
                    v-if="hasPermission(PERMISSIONS.SYSTEM.VIEW_GENERAL)"
                    class="overflow-hidden rounded-xl border border-border bg-surface dark:border-border-muted dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"
                >
                    <SettingSectionHeader
                        title="تنظیمات عمومی"
                        description="زبان، منطقه زمانی و نقش پیش‌فرض"
                        icon-class="bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20"
                        :show-edit="hasPermission(PERMISSIONS.SYSTEM.CHANGE_GENERAL)"
                        @edit="showGeneralModal = true"
                    >
                        <template #icon>
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </template>
                    </SettingSectionHeader>
                    <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SettingField label="زبان" :value="formatLanguageCode(settings.general.language_code)" />
                        <SettingField label="منطقه زمانی" :value="formatSettingText(settings.general.time_zone)" ltr />
                        <SettingField label="نقش پیش‌فرض کاربر" :value="formatRoleLabel(settings.general.default_user_role_detail)" />
                        <SettingField
                            label="آخرین بروزرسانی"
                            :value="formatSettingTimestamp(settings.general.updated_at)"
                            field-class="sm:col-span-2 xl:col-span-2"
                        />
                    </div>
                </section>

                <section
                    v-if="hasPermission(PERMISSIONS.SYSTEM.VIEW_SECURITY)"
                    class="overflow-hidden rounded-xl border border-border bg-surface dark:border-border-muted dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"
                >
                    <SettingSectionHeader
                        title="امنیت"
                        description="کپچا، OTP و محدودیت ورود"
                        icon-class="bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20"
                        :show-edit="hasPermission(PERMISSIONS.SYSTEM.CHANGE_SECURITY)"
                        @edit="showSecurityModal = true"
                    >
                        <template #icon>
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </template>
                    </SettingSectionHeader>
                    <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SettingField label="کپچا" :value="formatSettingBoolean(settings.security.captcha_enabled)" />
                        <SettingField label="مدت اعتبار کپچا" :value="formatSecondsAsMinutes(settings.security.captcha_ttl_seconds)" />
                        <SettingField label="حداکثر تلاش ورود" :value="formatSettingText(settings.security.login_max_attempts)" />
                        <SettingField label="بازه شمارش تلاش (دقیقه)" :value="formatSettingText(settings.security.login_attempt_window_minutes)" />
                        <SettingField label="مدت مسدودسازی (دقیقه)" :value="formatSettingText(settings.security.login_block_minutes)" />
                        <SettingField label="اعتبار OTP (دقیقه)" :value="formatSettingText(settings.security.otp_lifetime_minutes)" />
                        <SettingField
                            label="آخرین بروزرسانی"
                            :value="formatSettingTimestamp(settings.security.updated_at)"
                            field-class="sm:col-span-2 xl:col-span-3"
                        />
                    </div>
                </section>

                <section
                    v-if="hasPermission(PERMISSIONS.SYSTEM.VIEW_SMS)"
                    class="overflow-hidden rounded-xl border border-border bg-surface dark:border-border-muted dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"
                >
                    <SettingSectionHeader
                        title="سرویس پیامک"
                        description="تنظیمات Kavenegar و قالب OTP"
                        icon-class="bg-green-50 text-green-600 ring-green-100 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/20"
                        :show-edit="hasPermission(PERMISSIONS.SYSTEM.CHANGE_SMS)"
                        @edit="showSmsProviderModal = true"
                    >
                        <template #icon>
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </template>
                    </SettingSectionHeader>
                    <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SettingField label="شماره فرستنده" :value="formatSettingText(settings.sms_provider.sender)" ltr />
                        <SettingField label="نوع lookup" :value="formatSettingText(settings.sms_provider.lookup_type)" ltr />
                        <SettingField label="نام متغیر API Key" :value="formatSettingText(settings.sms_provider.api_key_env_name)" ltr />
                        <SettingField label="قالب OTP ورود" :value="formatSettingText(settings.sms_provider.login_otp_template)" ltr />
                        <SettingField label="قالب OTP ثبت‌نام" :value="formatSettingText(settings.sms_provider.register_otp_template)" ltr />
                        <SettingField label="آخرین بروزرسانی" :value="formatSettingTimestamp(settings.sms_provider.updated_at)" />
                    </div>
                </section>

                <section
                    v-if="hasPermission(PERMISSIONS.SYSTEM.VIEW_MEDIA)"
                    class="overflow-hidden rounded-xl border border-border bg-surface dark:border-border-muted dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"
                >
                    <SettingSectionHeader
                        title="رسانه"
                        description="آپلود فایل و thumbnail"
                        icon-class="bg-purple-50 text-purple-600 ring-purple-100 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/20"
                        :show-edit="hasPermission(PERMISSIONS.SYSTEM.CHANGE_MEDIA)"
                        @edit="showMediaModal = true"
                    >
                        <template #icon>
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </template>
                    </SettingSectionHeader>
                    <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SettingField label="حداکثر حجم آپلود" :value="`${formatSettingText(settings.media.max_upload_size_mb)} مگابایت`" />
                        <SettingField label="عرض thumbnail" :value="`${formatSettingText(settings.media.thumbnail_width)} px`" />
                        <SettingField label="ارتفاع thumbnail" :value="`${formatSettingText(settings.media.thumbnail_height)} px`" />
                        <SettingField
                            label="آخرین بروزرسانی"
                            :value="formatSettingTimestamp(settings.media.updated_at)"
                            field-class="sm:col-span-2 xl:col-span-3"
                        />
                    </div>
                    <div class="border-t border-border bg-surface-muted/60 px-4 py-4 dark:border-border-muted dark:bg-surface-hover/35">
                        <p class="mb-3 text-xs font-medium text-text-secondary">پسوندهای مجاز</p>
                        <div class="flex flex-wrap gap-2">
                            <span
                                v-for="ext in settings.media.allowed_extensions"
                                :key="ext"
                                class="inline-flex rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-text-primary ring-1 ring-border dir-ltr dark:bg-surface-hover dark:text-[#f5f5f5] dark:ring-border-muted"
                            >
                                .{{ ext }}
                            </span>
                            <span v-if="settings.media.allowed_extensions.length === 0" class="text-sm text-text-muted">همه</span>
                        </div>
                    </div>
                </section>

                <section
                    v-if="hasPermission(PERMISSIONS.SYSTEM.VIEW_BACKUP)"
                    class="overflow-hidden rounded-xl border border-border bg-surface dark:border-border-muted dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"
                >
                    <SettingSectionHeader
                        title="پشتیبان‌گیری دیتابیس"
                        description="مسیر ذخیره و نگهداری بکاپ"
                        icon-class="bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/20"
                        :show-edit="hasPermission(PERMISSIONS.SYSTEM.CHANGE_BACKUP)"
                        @edit="showDatabaseBackupModal = true"
                    >
                        <template #icon>
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </template>
                    </SettingSectionHeader>
                    <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        <SettingField
                            label="مسیر بکاپ"
                            :value="formatSettingText(settings.database_backup.backup_dir)"
                            ltr
                            field-class="sm:col-span-2"
                        />
                        <SettingField label="مدت نگهداری" :value="`${formatSettingText(settings.database_backup.retention_days)} روز`" />
                        <SettingField
                            label="مسیر PostgreSQL"
                            :value="formatSettingText(settings.database_backup.postgresql_bin_path)"
                            ltr
                            field-class="sm:col-span-2 xl:col-span-2"
                        />
                        <SettingField label="آخرین بروزرسانی" :value="formatSettingTimestamp(settings.database_backup.updated_at)" />
                    </div>
                </section>
            </div>
        </div>

        <GeneralSettingsModal
            v-model="showGeneralModal"
            :settings="settings?.general ?? null"
            @updated="onGeneralUpdated"
        />

        <SecuritySettingsModal
            v-model="showSecurityModal"
            :settings="settings?.security ?? null"
            @updated="onSecurityUpdated"
        />

        <SmsProviderSettingsModal
            v-model="showSmsProviderModal"
            :settings="settings?.sms_provider ?? null"
            @updated="onSmsProviderUpdated"
        />

        <MediaSettingsModal
            v-model="showMediaModal"
            :settings="settings?.media ?? null"
            @updated="onMediaUpdated"
        />

        <DatabaseBackupSettingsModal
            v-model="showDatabaseBackupModal"
            :settings="settings?.database_backup ?? null"
            @updated="onDatabaseBackupUpdated"
        />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'system-settings',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { systemService } from '~/api/services/system.service'
import SystemSettingsSkeleton from '~/components/skeleton/SystemSettingsSkeleton.vue'
import { parseSystemSettingsResponse } from '~/api/utils/api-response'
import type {
    DatabaseBackupSettings,
    GeneralSettings,
    MediaSettings,
    SecuritySettings,
    SmsProviderSettings,
    SystemSettings,
} from '~/api/types/system.types'
import SettingField from '~/components/SettingField.vue'
import DatabaseBackupSettingsModal from '~/components/system-settings/DatabaseBackupSettingsModal.vue'
import GeneralSettingsModal from '~/components/system-settings/GeneralSettingsModal.vue'
import MediaSettingsModal from '~/components/system-settings/MediaSettingsModal.vue'
import SecuritySettingsModal from '~/components/system-settings/SecuritySettingsModal.vue'
import SmsProviderSettingsModal from '~/components/system-settings/SmsProviderSettingsModal.vue'
import SettingSectionHeader from '~/components/system-settings/SettingSectionHeader.vue'
import { appConfig } from '~/config/app'
import { usePermissions } from '~/composables/usePermissions'
import { getApiErrorMessage } from '~/utils/api-error'
import {
    formatLanguageCode,
    formatRoleLabel,
    formatSecondsAsMinutes,
    formatSettingBoolean,
    formatSettingText,
    formatSettingTimestamp,
} from '~/utils/system-settings'

const settings = ref<SystemSettings | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const isInitialLoading = computed(() => isLoading.value && !settings.value)
const isFetching = computed(() => isLoading.value && !!settings.value)
const showGeneralModal = ref(false)
const showSecurityModal = ref(false)
const showSmsProviderModal = ref(false)
const showMediaModal = ref(false)
const showDatabaseBackupModal = ref(false)
const { hasPermission, PERMISSIONS } = usePermissions()
const appVersion = appConfig.version

function onGeneralUpdated(updated: GeneralSettings) {
    if (!settings.value) return
    settings.value.general = updated
}

function onSecurityUpdated(updated: SecuritySettings) {
    if (!settings.value) return
    settings.value = {
        ...settings.value,
        security: updated,
    }
}

function onSmsProviderUpdated(updated: SmsProviderSettings) {
    if (!settings.value) return
    settings.value.sms_provider = updated
}

function onMediaUpdated(updated: MediaSettings) {
    if (!settings.value) return
    settings.value = {
        ...settings.value,
        media: updated,
    }
}

function onDatabaseBackupUpdated(updated: DatabaseBackupSettings) {
    if (!settings.value) return
    settings.value.database_backup = updated
}

async function fetchSettings() {
    isLoading.value = true
    loadError.value = null

    try {
        const response = await systemService.getSettings()
        const parsed = parseSystemSettingsResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت تنظیمات سیستم با خطا مواجه شد.'
            settings.value = null
            return
        }

        settings.value = parsed
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت تنظیمات سیستم')
        settings.value = null
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchSettings()
})
</script>
