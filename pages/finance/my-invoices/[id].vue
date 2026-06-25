<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">جزئیات فاکتور</h1>
          <p v-if="order" class="mt-1 text-sm text-text-secondary">{{ order.order_number }}</p>
        </div>
        <div class="page-header-actions shrink-0">
          <BackIconButton />
        </div>
      </div>

      <div v-if="isLoading" class="space-y-3">
        <SkeletonBlock block-class="h-24 w-full rounded-xl" />
        <SkeletonBlock block-class="h-40 w-full rounded-xl" />
      </div>

      <div
        v-else-if="loadError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ loadError }}
      </div>

      <div v-else-if="order" class="space-y-5">
        <div class="grid grid-cols-1 gap-3 rounded-xl border border-border px-4 py-4 text-sm sm:grid-cols-2">
          <div>
            <p class="text-xs text-text-muted">شماره فاکتور</p>
            <p class="mt-0.5 font-mono font-medium dir-ltr text-right text-text-primary">{{ order.order_number }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">وضعیت</p>
            <p class="mt-0.5">
              <span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium" :class="getSaleOrderStatusClass(order.status)">
                {{ formatSaleOrderStatus(order.status) }}
              </span>
            </p>
          </div>
          <div>
            <p class="text-xs text-text-muted">نوع پرداخت</p>
            <p class="mt-0.5 text-text-primary">{{ formatPaymentMode(order.payment_mode) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">مبلغ کل</p>
            <p class="mt-0.5 font-semibold text-text-primary">{{ formatCatalogPriceIrr(order.total_amount) }}</p>
          </div>
          <div>
            <p class="text-xs text-text-muted">شروع دوره</p>
            <p class="mt-0.5 text-text-primary">{{ formatBirthDateForDisplay(order.enrollment_start) }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <RouterLink :to="{ name: 'my-sale-orders' }" class="btn-muted-sm">
            بازگشت به فاکتورها
          </RouterLink>
          <RouterLink :to="{ name: 'wallet-deposit' }" class="btn-action rounded-xl px-5 py-2.5 text-sm">
            شارژ کیف پول
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'my-sale-order-view',
  layout: 'dashboard',
})

import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { financeService } from '~/api/services/finance.service'
import type { SaleOrder } from '~/api/types/finance.types'
import { parseSaleOrderDetailResponse } from '~/api/utils/finance-response'
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatCatalogPriceIrr } from '~/utils/catalog-format'
import { formatBirthDateForDisplay } from '~/utils/date'
import {
  formatPaymentMode,
  formatSaleOrderStatus,
  getSaleOrderStatusClass,
} from '~/utils/finance'

const route = useRoute()
const order = ref<SaleOrder | null>(null)
const isLoading = ref(true)
const loadError = ref('')

async function fetchOrder() {
  const id = String(route.params.id || '').trim()
  if (!id) {
    loadError.value = 'شناسه فاکتور نامعتبر است.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = ''
  try {
    const response = await financeService.getMySaleOrder(id)
    order.value = parseSaleOrderDetailResponse(response)
    if (!order.value) {
      loadError.value = getApiErrorMessage(response, 'فاکتور یافت نشد.')
    }
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'بارگذاری فاکتور ناموفق بود.')
    order.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchOrder)
</script>
