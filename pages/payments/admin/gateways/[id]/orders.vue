<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">سفارش‌های درگاه</h1>
          <p class="mt-1 text-sm text-text-secondary">{{ gatewayTitle || '—' }}</p>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
          <select v-model="statusFilter" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
            <option value="">همه</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="flex items-end sm:col-span-2">
          <button type="button" class="btn-action-sm" :disabled="isFetching" @click="fetchOrders(1)">
            اعمال فیلتر
          </button>
        </div>
      </div>

      <div v-if="isInitialLoading" class="py-12 text-center text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{{ loadError }}</div>
      <template v-else>
        <div class="relative w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border">
          <table class="w-full min-w-[760px] divide-y divide-border text-sm">
            <thead class="bg-surface-muted">
              <tr>
                <th class="px-4 py-3 text-right font-semibold text-text-primary">مبلغ</th>
                <th class="px-4 py-3 text-right font-semibold text-text-primary">وضعیت</th>
                <th class="px-4 py-3 text-right font-semibold text-text-primary">پیگیری</th>
                <th class="px-4 py-3 text-right font-semibold text-text-primary">تاریخ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/60 bg-surface">
              <tr v-if="orders.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-text-secondary">سفارشی یافت نشد.</td>
              </tr>
              <tr v-for="order in orders" :key="order.id">
                <td class="whitespace-nowrap px-4 py-3 font-semibold text-text-primary">
                  {{ formatWalletAmount(order.amount) }} ریال
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium" :class="getPaymentOrderStatusClass(order.status)">
                    {{ formatPaymentOrderStatus(order.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-text-secondary dir-ltr">{{ order.reference_id || '—' }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-text-secondary">{{ formatPaymentOrderDate(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination
          :page="pagination.page"
          :total-pages="pagination.total_pages"
          :disabled="isFetching"
          @update:page="goToPage"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'payment-gateway-orders',
  layout: 'dashboard'
})

import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { paymentsService } from '~/api/services/payments.service'
import type { PaymentOrder, PaymentOrderStatus } from '~/api/types/payments.types'
import type { PaginationMeta } from '~/api/types/auth.types'
import {
  parsePaymentGatewayAdminDetailResponse,
  parsePaymentOrdersListResponse,
} from '~/api/utils/api-response'
import AppPagination from '~/components/AppPagination.vue'
import { getApiErrorMessage } from '~/utils/api-error'
import {
  formatPaymentOrderDate,
  formatPaymentOrderStatus,
  getPaymentOrderStatusClass,
  PAYMENT_ORDER_STATUS_OPTIONS,
} from '~/utils/payments'
import { formatWalletAmount } from '~/utils/wallet'

const PAGE_SIZE = 15
const route = useRoute()

const gatewayTitle = ref('')
const orders = ref<PaymentOrder[]>([])
const statusFilter = ref('')
const pagination = ref<PaginationMeta>({
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  total_items: 0,
  next: null,
  previous: null,
})

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref('')

const statusOptions = PAYMENT_ORDER_STATUS_OPTIONS
const gatewayId = () => String(route.params.id || '')

async function fetchGatewayTitle() {
  try {
    const response = await paymentsService.getAdminGateway(gatewayId())
    gatewayTitle.value = parsePaymentGatewayAdminDetailResponse(response)?.title || ''
  } catch {
    gatewayTitle.value = ''
  }
}

async function fetchOrders(page = pagination.value.page) {
  isFetching.value = true
  loadError.value = ''
  try {
    const response = await paymentsService.listAdminGatewayOrders(gatewayId(), {
      page,
      page_size: PAGE_SIZE,
      status: (statusFilter.value || undefined) as PaymentOrderStatus | undefined,
    })
    const parsed = parsePaymentOrdersListResponse(response)
    if (!parsed) {
      loadError.value = 'پاسخ سرور نامعتبر است.'
      return
    }
    orders.value = parsed.orders
    pagination.value = parsed.pagination
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت سفارش‌ها')
  } finally {
    isInitialLoading.value = false
    isFetching.value = false
  }
}

function goToPage(page: number) {
  pagination.value.page = page
  fetchOrders(page)
}

onMounted(async () => {
  await fetchGatewayTitle()
  await fetchOrders(1)
})
</script>
