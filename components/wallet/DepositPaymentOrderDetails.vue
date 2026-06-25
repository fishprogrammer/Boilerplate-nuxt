<template>
  <dl class="grid grid-cols-1 gap-3 rounded-xl border border-border px-4 py-4 text-sm sm:grid-cols-2">
    <div>
      <dt class="text-xs text-text-muted">شناسه سفارش</dt>
      <dd class="mt-0.5 break-all font-medium text-text-primary dir-ltr">{{ order.id }}</dd>
    </div>
    <div>
      <dt class="text-xs text-text-muted">درگاه</dt>
      <dd class="mt-0.5 text-text-primary">{{ order.gateway_title || '—' }}</dd>
    </div>
    <div>
      <dt class="text-xs text-text-muted">مبلغ</dt>
      <dd class="mt-0.5 font-semibold text-text-primary">{{ formatWalletAmount(order.amount) }} ریال</dd>
    </div>
    <div>
      <dt class="text-xs text-text-muted">وضعیت</dt>
      <dd class="mt-0.5">
        <span
          class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
          :class="getPaymentOrderStatusClass(order.status)"
        >
          {{ formatPaymentOrderStatus(order.status) }}
        </span>
      </dd>
    </div>
    <div v-if="order.reference_id">
      <dt class="text-xs text-text-muted">شماره پیگیری</dt>
      <dd class="mt-0.5 break-all text-text-primary dir-ltr">{{ order.reference_id }}</dd>
    </div>
    <div v-if="refreshedBalance !== null && refreshedBalance !== undefined">
      <dt class="text-xs text-text-muted">موجودی جدید</dt>
      <dd class="mt-0.5 font-semibold text-teal-700 dark:text-teal-300">
        {{ formatWalletAmount(refreshedBalance) }} ریال
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { PaymentOrder } from '~/api/types/payments.types'
import { formatPaymentOrderStatus, getPaymentOrderStatusClass } from '~/utils/payments'
import { formatWalletAmount } from '~/utils/wallet'

defineProps<{
  order: PaymentOrder
  refreshedBalance?: number | null
}>()
</script>
