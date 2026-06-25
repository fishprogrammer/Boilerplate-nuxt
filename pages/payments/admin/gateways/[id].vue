<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">{{ isEdit ? 'ویرایش درگاه' : 'درگاه جدید' }}</h1>
          <p class="mt-1 text-sm text-text-secondary">تنظیمات اختصاصی هر درگاه پرداخت</p>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <PaymentGatewayFormSkeleton v-if="isLoading" />
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{{ loadError }}</div>

      <form v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="saveGateway">
        <div v-if="!isEdit" class="sm:col-span-2">
          <label class="mb-1 block text-xs font-medium text-text-primary">درایور</label>
          <select v-model="form.driver" required class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
            <option value="">انتخاب درایور</option>
            <option v-for="driver in drivers" :key="driver.code" :value="driver.code">
              {{ driver.title || driver.code }}
            </option>
          </select>
        </div>
        <div v-else class="sm:col-span-2">
          <p class="text-xs text-text-muted">درایور: <span class="dir-ltr">{{ form.driver }}</span></p>
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-medium text-text-primary">عنوان</label>
          <input v-model="form.title" type="text" required class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">حداقل مبلغ (ریال)</label>
          <input
            v-model="form.min_amount"
            type="tel"
            inputmode="numeric"
            autocomplete="off"
            placeholder="اختیاری"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm outline-none placeholder:text-text-muted input-focus"
            @input="onMinAmountInput"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">حداکثر مبلغ (ریال)</label>
          <input
            v-model="form.max_amount"
            type="tel"
            inputmode="numeric"
            autocomplete="off"
            placeholder="اختیاری"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm outline-none placeholder:text-text-muted input-focus"
            @input="onMaxAmountInput"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">ترتیب نمایش</label>
          <input v-model.number="form.sort_order" type="number" min="0" step="1" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div class="flex flex-col justify-end gap-2">
          <label class="flex items-center gap-2 text-sm text-text-primary">
            <input v-model="form.is_active" type="checkbox" class="rounded border-border" />
            فعال
          </label>
          <label class="flex items-center gap-2 text-sm text-text-primary">
            <input v-model="form.is_sandbox" type="checkbox" class="rounded border-border" />
            حالت sandbox
          </label>
        </div>

        <div class="sm:col-span-2 space-y-3 rounded-xl border border-border p-4">
          <p class="text-sm font-medium text-text-primary">اعتبارنامه (credentials)</p>
          <div v-for="field in credentialFields" :key="field.key" class="grid grid-cols-1 gap-1">
            <label class="text-xs font-medium text-text-primary">{{ field.label }}</label>
            <input
              v-model="credentialValues[field.key]"
              :type="field.secret ? 'password' : 'text'"
              dir="ltr"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
            />
          </div>
          <div v-if="credentialFields.length === 0" class="grid grid-cols-1 gap-2">
            <label class="text-xs font-medium text-text-primary">JSON credentials</label>
            <textarea
              v-model="credentialsJson"
              rows="4"
              dir="ltr"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
              placeholder='{"merchant_id":"..."}'
            />
          </div>
        </div>

        <div class="sm:col-span-2">
          <button type="submit" class="btn-action rounded-xl px-5 py-2.5 text-sm" :disabled="isSaving">
            {{ isSaving ? 'در حال ذخیره...' : 'ذخیره درگاه' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'payment-gateway-edit',
  layout: 'dashboard'
})

import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentsService } from '~/api/services/payments.service'
import type { PaymentDriver, PaymentDriverCredentialField } from '~/api/types/payments.types'
import { isApiSuccess, parsePaymentDriversResponse, parsePaymentGatewayAdminDetailResponse } from '~/api/utils/api-response'
import PaymentGatewayFormSkeleton from '~/components/skeleton/PaymentGatewayFormSkeleton.vue'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatAmountInput, formatWalletAmount, parseOptionalAmount } from '~/utils/wallet'

const route = useRoute()
const router = useRouter()

const drivers = ref<PaymentDriver[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref('')
const credentialsJson = ref('')
const credentialValues = reactive<Record<string, string>>({})

const form = reactive({
  driver: '',
  title: '',
  is_active: true,
  is_sandbox: false,
  min_amount: '',
  max_amount: '',
  sort_order: 0,
})

const gatewayId = computed(() => String(route.params.id || ''))
const isEdit = computed(() => Boolean(gatewayId.value && route.name === 'payment-gateway-edit'))

const selectedDriver = computed(() =>
  drivers.value.find((item) => item.code === form.driver) || null,
)

const credentialFields = computed((): PaymentDriverCredentialField[] => {
  if (isEdit.value) {
    return Object.keys(credentialValues).map((key) => ({
      key,
      label: key,
      secret: true,
    }))
  }
  return selectedDriver.value?.credential_fields || []
})

function onMinAmountInput(event: Event) {
  form.min_amount = formatAmountInput((event.target as HTMLInputElement).value)
}

function onMaxAmountInput(event: Event) {
  form.max_amount = formatAmountInput((event.target as HTMLInputElement).value)
}

function buildCredentialsPayload(): Record<string, unknown> {
  if (credentialFields.value.length > 0) {
    const payload: Record<string, unknown> = {}
    for (const field of credentialFields.value) {
      const value = credentialValues[field.key]?.trim()
      if (value) payload[field.key] = value
    }
    return payload
  }

  try {
    const parsed = JSON.parse(credentialsJson.value || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {}
  } catch {
    return {}
  }
}

function fillCredentialValues(credentials: Record<string, unknown>) {
  Object.keys(credentialValues).forEach((key) => delete credentialValues[key])
  for (const [key, value] of Object.entries(credentials)) {
    credentialValues[key] = String(value ?? '')
  }
  credentialsJson.value = ''
}

async function fetchPageData() {
  isLoading.value = true
  loadError.value = ''
  try {
    const driversResponse = await paymentsService.listDrivers()
    drivers.value = parsePaymentDriversResponse(driversResponse) || []

    if (isEdit.value) {
      const response = await paymentsService.getAdminGateway(gatewayId.value)
      const gateway = parsePaymentGatewayAdminDetailResponse(response)
      if (!gateway) {
        loadError.value = 'درگاه یافت نشد.'
        return
      }
      form.driver = gateway.driver
      form.title = gateway.title
      form.is_active = gateway.is_active
      form.is_sandbox = gateway.is_sandbox
      form.min_amount = gateway.min_amount != null ? formatWalletAmount(gateway.min_amount) : ''
      form.max_amount = gateway.max_amount != null ? formatWalletAmount(gateway.max_amount) : ''
      form.sort_order = gateway.sort_order
      fillCredentialValues(gateway.credentials)
    }
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در بارگذاری')
  } finally {
    isLoading.value = false
  }
}

async function saveGateway() {
  if (isSaving.value || !form.title.trim()) return
  if (!isEdit.value && !form.driver) {
    showToast({ message: 'درایور را انتخاب کنید.', variant: 'error' })
    return
  }

  isSaving.value = true
  const payload = {
    title: form.title.trim(),
    is_active: form.is_active,
    is_sandbox: form.is_sandbox,
    min_amount: parseOptionalAmount(form.min_amount),
    max_amount: parseOptionalAmount(form.max_amount),
    sort_order: form.sort_order,
    credentials: buildCredentialsPayload(),
  }

  try {
    const response = isEdit.value
      ? await paymentsService.patchAdminGateway(gatewayId.value, payload)
      : await paymentsService.createAdminGateway({ driver: form.driver, ...payload })

    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ذخیره ناموفق بود'), variant: 'error' })
      return
    }

    showToast({ message: 'درگاه ذخیره شد.', variant: 'success' })
    if (!isEdit.value) {
      const created = parsePaymentGatewayAdminDetailResponse(response)
      if (created?.id) {
        router.replace({ name: 'payment-gateway-edit', params: { id: created.id } })
        return
      }
    }
    router.push({ name: 'payment-gateways' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'ذخیره ناموفق بود'), variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchPageData)
</script>
