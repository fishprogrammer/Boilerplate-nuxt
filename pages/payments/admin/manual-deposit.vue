<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">شارژ دستی کیف پول</h1>
          <p class="mt-1 text-sm text-text-secondary">واریز مستقیم اعتبار</p>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="submitManualDeposit">
        <div class="sm:col-span-2">
          <UserSearchPicker
            v-model="selectedUserId"
            label="کاربر"
            :error="userError"
            required
            @clear-error="userError = ''"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">مبلغ (ریال)</label>
          <input
            v-model="amountInput"
            type="tel"
            inputmode="numeric"
            autocomplete="off"
            placeholder="مثلاً ۵۰۰٬۰۰۰"
            required
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm outline-none placeholder:text-text-muted input-focus"
            @input="onAmountInput"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-medium text-text-primary">توضیحات</label>
          <input v-model="form.description" type="text" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-medium text-text-primary">مرجع</label>
          <input v-model="form.reference" type="text" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div class="sm:col-span-2">
          <button type="submit" class="btn-action-sm" :disabled="isSubmitting">
            {{ isSubmitting ? 'در حال ثبت...' : 'ثبت شارژ دستی' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'payment-manual-deposit',
  layout: 'dashboard'
})

import { reactive, ref } from 'vue'
import { paymentsService } from '~/api/services/payments.service'
import { isApiSuccess, parseManualDepositResponse } from '~/api/utils/api-response'
import UserSearchPicker from '~/components/UserSearchPicker.vue'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import { parseDepositAmountInput } from '~/utils/payments'
import { formatAmountInput } from '~/utils/wallet'

const form = reactive({
  description: '',
  reference: '',
})

const selectedUserId = ref<number | null>(null)
const userError = ref('')
const amountInput = ref('')
const isSubmitting = ref(false)

function onAmountInput(event: Event) {
  const target = event.target as HTMLInputElement
  amountInput.value = formatAmountInput(target.value)
}

async function submitManualDeposit() {
  if (isSubmitting.value) return

  const amount = parseDepositAmountInput(amountInput.value)
  if (!Number.isInteger(amount) || amount < 1) {
    showToast({ message: 'مبلغ باید عدد صحیح مثبت باشد.', variant: 'error' })
    return
  }

  if (!selectedUserId.value || selectedUserId.value < 1) {
    userError.value = 'کاربر را از لیست جستجو انتخاب کنید.'
    return
  }

  isSubmitting.value = true
  try {
    const response = await paymentsService.manualDeposit({
      user_id: selectedUserId.value,
      amount,
      description: form.description.trim() || undefined,
      reference: form.reference.trim() || undefined,
    })

    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ثبت ناموفق بود'), variant: 'error' })
      return
    }

    const result = parseManualDepositResponse(response)
    showToast({
      message: result?.transaction
        ? `شارژ ثبت شد. موجودی پس از تراکنش: ${result.transaction.balance_after.toLocaleString('fa-IR')} ریال`
        : 'شارژ دستی ثبت شد.',
      variant: 'success',
    })

    selectedUserId.value = null
    amountInput.value = ''
    form.description = ''
    form.reference = ''
    userError.value = ''
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'ثبت ناموفق بود'), variant: 'error' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
