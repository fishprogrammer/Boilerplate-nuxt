<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">تنظیمات پرداخت</h1>
          <p class="mt-1 text-sm text-text-secondary">محدودیت شارژ و آدرس بازگشت کاربر بعد از پرداخت</p>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <PaymentSettingsFormSkeleton v-if="isLoading" />

      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{{ loadError }}</div>

      <form v-else-if="form" class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="saveSettings">
        <div class="sm:col-span-2">
          <label class="flex items-center gap-2 text-sm text-text-primary">
            <input v-model="form.deposits_enabled" type="checkbox" class="rounded border-border" :disabled="!canChangeSettings" />
            فعال بودن شارژ آنلاین
          </label>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">حداقل مبلغ شارژ (ریال)</label>
          <AmountInput
            v-model="minDepositAmount"
            placeholder="مثلاً ۱۰۰٬۰۰۰"
            input-class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm outline-none placeholder:text-text-muted input-focus"
            :disabled="!canChangeSettings"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">حداکثر مبلغ شارژ (ریال)</label>
          <AmountInput
            v-model="maxDepositAmount"
            placeholder="مثلاً ۵۰٬۰۰۰٬۰۰۰"
            input-class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm outline-none placeholder:text-text-muted input-focus"
            :disabled="!canChangeSettings"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-medium text-text-primary">URL موفقیت (frontend_success_url)</label>
          <input
            v-model="form.frontend_success_url"
            type="url"
            dir="ltr"
            placeholder=""
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            :disabled="!canChangeSettings"
          />
          <p v-if="canChangeSettings" class="mt-1.5 text-xs text-text-muted">
            پیشنهاد
            <span v-if="publicOriginSource === 'env'"> (آدرس سایت از <code dir="ltr">NUXT_PUBLIC_APP_PUBLIC_URL</code>)</span>
            <span v-else> (آدرس فعلی مرورگر: <span dir="ltr">{{ publicOrigin }}</span>)</span>:
            <button
              type="button"
              class="ms-1 cursor-pointer text-secondary underline-offset-2 hover:text-primary hover:underline dir-ltr"
              @click="applySuggestedSuccessUrl"
            >
              {{ suggestedSuccessUrl }}
            </button>
          </p>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-medium text-text-primary">URL ناموفق (frontend_failure_url)</label>
          <input
            v-model="form.frontend_failure_url"
            type="url"
            dir="ltr"
            placeholder=""
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            :disabled="!canChangeSettings"
          />
          <p v-if="canChangeSettings" class="mt-1.5 text-xs text-text-muted">
            پیشنهاد
            <span v-if="publicOriginSource === 'env'"> (آدرس سایت از <code dir="ltr">NUXT_PUBLIC_APP_PUBLIC_URL</code>)</span>
            <span v-else> (آدرس فعلی مرورگر: <span dir="ltr">{{ publicOrigin }}</span>)</span>:
            <button
              type="button"
              class="ms-1 cursor-pointer text-secondary underline-offset-2 hover:text-primary hover:underline dir-ltr"
              @click="applySuggestedFailureUrl"
            >
              {{ suggestedFailureUrl }}
            </button>
          </p>
        </div>
        <div class="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          بدون تنظیم URLهای بازگشت، کاربر بعد از پرداخت JSON خام API را می‌بیند.
          از placeholderهای <code dir="ltr">{order_id}</code> و <code dir="ltr">{status}</code> استفاده کنید.
          صفحات پیشنهادی: <span class="dir-ltr">{{ ROUTES.WALLET_DEPOSIT_SUCCESS }}</span> و <span class="dir-ltr">{{ ROUTES.WALLET_DEPOSIT_FAILURE }}</span>.
        </div>
        <div v-if="canChangeSettings" class="sm:col-span-2">
          <button type="submit" class="btn-action rounded-xl px-5 py-2.5 text-sm" :disabled="isSaving">
            {{ isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات' }}
          </button>
        </div>
        <p v-else class="sm:col-span-2 text-xs text-text-muted">فقط مشاهده — برای ویرایش به permission «change paymentsettings» نیاز دارید.</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'payment-settings',
  layout: 'dashboard',
})

import { computed, onMounted, ref } from 'vue'
import { paymentsService } from '~/api/services/payments.service'
import type { PaymentSettings } from '~/api/types/payments.types'
import { isApiSuccess, parsePaymentSettingsResponse } from '~/api/utils/api-response'
import PaymentSettingsFormSkeleton from '~/components/skeleton/PaymentSettingsFormSkeleton.vue'
import AmountInput from '~/components/AmountInput.vue'
import { ROUTES } from '~/constants/routes'
import { getAppPublicOrigin, getAppPublicOriginSource } from '~/config/app'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import { buildSuggestedPaymentReturnUrl } from '~/utils/payments'
import { parseWalletAmount } from '~/utils/wallet'

const { hasPermission, PERMISSIONS } = usePermissions()
const canChangeSettings = computed(() => hasPermission(PERMISSIONS.PAYMENTS.CHANGE_SETTINGS))

const suggestedSuccessUrl = computed(() => buildSuggestedPaymentReturnUrl(ROUTES.WALLET_DEPOSIT_SUCCESS))
const suggestedFailureUrl = computed(() => buildSuggestedPaymentReturnUrl(ROUTES.WALLET_DEPOSIT_FAILURE))
const publicOrigin = computed(() => getAppPublicOrigin())
const publicOriginSource = computed(() => getAppPublicOriginSource())

function applySuggestedSuccessUrl() {
  if (!form.value || !canChangeSettings.value) return
  form.value.frontend_success_url = suggestedSuccessUrl.value
}

function applySuggestedFailureUrl() {
  if (!form.value || !canChangeSettings.value) return
  form.value.frontend_failure_url = suggestedFailureUrl.value
}

const form = ref<PaymentSettings | null>(null)
const minDepositAmount = ref<number | null>(null)
const maxDepositAmount = ref<number | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref('')

function syncDepositAmountInputs() {
  if (!form.value) {
    minDepositAmount.value = null
    maxDepositAmount.value = null
    return
  }
  minDepositAmount.value = form.value.min_deposit_amount
  maxDepositAmount.value = form.value.max_deposit_amount
}

async function fetchSettings() {
  isLoading.value = true
  try {
    const response = await paymentsService.getAdminSettings()
    form.value = parsePaymentSettingsResponse(response)
    syncDepositAmountInputs()
    if (!form.value) loadError.value = 'دریافت تنظیمات ناموفق بود.'
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت تنظیمات')
  } finally {
    isLoading.value = false
  }
}

async function saveSettings() {
  if (!form.value || isSaving.value || !canChangeSettings.value) return
  isSaving.value = true
  try {
    const response = await paymentsService.patchAdminSettings({
      deposits_enabled: form.value.deposits_enabled,
      min_deposit_amount: parseWalletAmount(minDepositAmount.value),
      max_deposit_amount: parseWalletAmount(maxDepositAmount.value),
      frontend_success_url: form.value.frontend_success_url.trim(),
      frontend_failure_url: form.value.frontend_failure_url.trim(),
    })
    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ذخیره ناموفق بود'), variant: 'error' })
      return
    }
    form.value = parsePaymentSettingsResponse(response) || form.value
    syncDepositAmountInputs()
    showToast({ message: 'تنظیمات ذخیره شد.', variant: 'success' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'ذخیره ناموفق بود'), variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchSettings)
</script>
