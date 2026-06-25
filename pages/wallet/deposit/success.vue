<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">پرداخت موفق</h1>
          <p class="mt-1 text-sm text-text-secondary">شارژ کیف پول با موفقیت انجام شد</p>
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
          v-if="order.status === 'paid'"
          class="rounded-xl border border-teal-200 bg-teal-50 px-4 py-5 dark:border-teal-900/50 dark:bg-teal-950/30"
        >
          <div class="flex items-start gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-semibold text-teal-900 dark:text-teal-100">پرداخت با موفقیت انجام شد</p>
              <p class="mt-1 text-sm text-teal-800 dark:text-teal-200">کیف پول شما شارژ شد.</p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <p class="font-medium">وضعیت سفارش: {{ formatPaymentOrderStatus(order.status) }}</p>
          <p class="mt-2 text-xs">این صفحه مخصوص پرداخت موفق است. در صورت ناموفق بودن پرداخت به صفحه ناموفق هدایت شوید.</p>
          <RouterLink :to="{ name: 'wallet-deposit-failure', query: { order_id: order.id, status: order.status } }" class="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
            مشاهده صفحه ناموفق
          </RouterLink>
        </div>

        <DepositPaymentOrderDetails :order="order" :refreshed-balance="refreshedBalance" />

        <div class="flex flex-wrap gap-2">
          <RouterLink :to="{ name: 'wallet' }" class="btn-action rounded-xl px-5 py-2.5 text-sm">
            مشاهده کیف پول
          </RouterLink>
          <RouterLink v-if="order.status !== 'paid'" :to="{ name: 'wallet-deposit' }" class="btn-muted-sm">
            تلاش مجدد
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'wallet-deposit-success',
  layout: 'dashboard',
})

import DepositPaymentOrderDetails from '~/components/wallet/DepositPaymentOrderDetails.vue'
import DepositPaymentResultSkeleton from '~/components/skeleton/DepositPaymentResultSkeleton.vue'
import { useDepositPaymentResult } from '~/composables/useDepositPaymentResult'
import { formatPaymentOrderStatus } from '~/utils/payments'

const { order, refreshedBalance, isLoading, loadError, orderId } = useDepositPaymentResult()
</script>
