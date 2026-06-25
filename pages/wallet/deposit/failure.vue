<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">پرداخت ناموفق</h1>
          <p class="mt-1 text-sm text-text-secondary">شارژ کیف پول انجام نشد</p>
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
          class="rounded-xl border border-teal-200 bg-teal-50 px-4 py-4 text-sm text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-200"
        >
          <p class="font-medium">این سفارش پرداخت شده است.</p>
          <RouterLink :to="{ name: 'wallet-deposit-success', query: { order_id: order.id, status: order.status } }" class="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
            مشاهده صفحه موفقیت
          </RouterLink>
        </div>

        <div
          v-else
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-5 dark:border-red-900/50 dark:bg-red-950/30"
        >
          <div class="flex items-start gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-semibold text-red-900 dark:text-red-100">{{ failureTitle }}</p>
              <p v-if="order.failure_reason" class="mt-1 text-sm text-red-800 dark:text-red-200">
                {{ order.failure_reason }}
              </p>
            </div>
          </div>
        </div>

        <DepositPaymentOrderDetails :order="order" />

        <div class="flex flex-wrap gap-2">
          <RouterLink :to="{ name: 'wallet-deposit' }" class="btn-action rounded-xl px-5 py-2.5 text-sm">
            تلاش مجدد
          </RouterLink>
          <RouterLink :to="{ name: 'wallet' }" class="btn-muted-sm">
            مشاهده کیف پول
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'wallet-deposit-failure',
  layout: 'dashboard',
})

import { computed } from 'vue'
import DepositPaymentOrderDetails from '~/components/wallet/DepositPaymentOrderDetails.vue'
import DepositPaymentResultSkeleton from '~/components/skeleton/DepositPaymentResultSkeleton.vue'
import { useDepositPaymentResult } from '~/composables/useDepositPaymentResult'

const { order, isLoading, loadError, orderId } = useDepositPaymentResult()

const failureTitle = computed(() => {
  if (!order.value) return 'پرداخت ناموفق بود.'
  if (order.value.status === 'cancelled') return 'پرداخت لغو شد.'
  if (order.value.status === 'failed') return 'پرداخت ناموفق بود.'
  return `وضعیت سفارش: ${order.value.status}`
})
</script>
