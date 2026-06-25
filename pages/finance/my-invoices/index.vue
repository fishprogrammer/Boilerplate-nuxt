<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">فاکتورهای من</h1>
          <p class="mt-1 text-sm text-text-secondary">فاکتورهای در انتظار پرداخت و پرداخت جزئی</p>
        </div>
        <div class="page-header-actions shrink-0">
          <BackIconButton />
        </div>
      </div>

      <SaleOrdersTableSkeleton v-if="isLoading" />

      <div
        v-else-if="loadError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ loadError }}
      </div>

      <div v-else-if="orders.length === 0" class="rounded-xl border border-dashed border-border px-4 py-16 text-center">
        <p class="text-sm font-medium text-text-primary">فاکتوری برای پرداخت ندارید</p>
        <p class="mt-1 text-xs text-text-secondary">فاکتورهای تسویه‌شده در این لیست نمایش داده نمی‌شوند.</p>
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="order in orders"
          :key="order.id"
          class="cursor-pointer rounded-xl border border-border bg-surface transition hover:border-secondary/40 hover:bg-surface-hover/30"
          @click="openOrder(order.id)"
        >
          <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="font-mono text-sm font-semibold dir-ltr text-right text-text-primary">{{ order.order_number }}</p>
              <p class="mt-1 text-xs text-text-muted">
                {{ formatPaymentMode(order.payment_mode) }} · {{ formatBirthDateForDisplay(order.enrollment_start) }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                :class="getSaleOrderStatusClass(order.status)"
              >
                {{ formatSaleOrderStatus(order.status) }}
              </span>
              <span class="text-sm font-semibold text-text-primary">{{ formatCatalogPriceIrr(order.total_amount) }}</span>
              <svg class="size-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'my-sale-orders',
  layout: 'dashboard',
})

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { financeService } from '~/api/services/finance.service'
import type { SaleOrder } from '~/api/types/finance.types'
import { parseMySaleOrdersListResponse } from '~/api/utils/finance-response'
import SaleOrdersTableSkeleton from '~/components/skeleton/SaleOrdersTableSkeleton.vue'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatCatalogPriceIrr } from '~/utils/catalog-format'
import { formatBirthDateForDisplay } from '~/utils/date'
import {
  formatPaymentMode,
  formatSaleOrderStatus,
  getSaleOrderStatusClass,
} from '~/utils/finance'

const router = useRouter()
const orders = ref<SaleOrder[]>([])
const isLoading = ref(true)
const loadError = ref('')

async function fetchOrders() {
  isLoading.value = true
  loadError.value = ''
  try {
    const response = await financeService.listMySaleOrders({ ordering: '-created_at', page_size: 50 })
    const parsed = parseMySaleOrdersListResponse(response)
    if (!parsed) {
      loadError.value = getApiErrorMessage(response, 'بارگذاری فاکتورها ناموفق بود.')
      orders.value = []
      return
    }
    orders.value = parsed.orders
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'بارگذاری فاکتورها ناموفق بود.')
    orders.value = []
  } finally {
    isLoading.value = false
  }
}

function openOrder(id: string) {
  router.push({ name: 'my-sale-order-view', params: { id } })
}

onMounted(fetchOrders)
</script>
