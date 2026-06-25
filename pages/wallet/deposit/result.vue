<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">نتیجه پرداخت</h1>
          <p class="mt-1 text-sm text-text-secondary">بررسی وضعیت سفارش شارژ کیف پول</p>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <div v-if="!orderId" class="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
        <span>شناسه سفارش یافت نشد.</span>
        <BackIconButton />
      </div>

      <DepositPaymentResultSkeleton v-else-if="isLoading" />

      <div
        v-else-if="loadError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ loadError }}
      </div>

      <div v-else-if="order" class="space-y-5">
        <div
          class="rounded-xl border px-4 py-4"
          :class="order.status === 'paid'
            ? 'border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/30'
            : order.status === 'failed' || order.status === 'cancelled'
              ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30'
              : 'border-border bg-surface-muted/40'"
        >
          <p class="text-sm font-medium text-text-primary">
            {{ statusMessage }}
          </p>
          <p v-if="order.failure_reason && order.status !== 'paid'" class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ order.failure_reason }}
          </p>
        </div>

        <DepositPaymentOrderDetails :order="order" :refreshed-balance="refreshedBalance" />

        <div class="flex flex-wrap gap-2">
          <RouterLink :to="{ name: 'wallet' }" class="btn-action rounded-xl px-5 py-2.5 text-sm">
            مشاهده کیف پول
          </RouterLink>
          <RouterLink
            v-if="order.status !== 'paid'"
            :to="{ name: 'wallet-deposit' }"
            class="btn-muted-sm"
          >
            تلاش مجدد
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'wallet-deposit-result',
  layout: 'dashboard'
})

import { computed } from 'vue'
import DepositPaymentOrderDetails from '~/components/wallet/DepositPaymentOrderDetails.vue'
import DepositPaymentResultSkeleton from '~/components/skeleton/DepositPaymentResultSkeleton.vue'
import { useDepositPaymentResult } from '~/composables/useDepositPaymentResult'

const { order, refreshedBalance, isLoading, loadError, orderId } = useDepositPaymentResult()

const statusMessage = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'paid') return 'پرداخت با موفقیت انجام شد و کیف پول شارژ شد.'
  if (order.value.status === 'failed') return 'پرداخت ناموفق بود.'
  if (order.value.status === 'cancelled') return 'پرداخت لغو شد.'
  return 'وضعیت سفارش در حال بررسی است.'
})
</script>
