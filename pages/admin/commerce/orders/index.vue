<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">سفارش‌های تجارت</h1>
          <p class="mt-1 text-sm text-text-secondary">مشاهده سفارش‌های فروشگاه (فقط خواندنی)</p>
        </div>
        <RouterLink :to="{ name: 'admin-commerce-coupons' }" class="btn-muted-sm">کوپن‌ها</RouterLink>
      </div>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="orders.length === 0" class="text-sm text-text-secondary">سفارشی یافت نشد.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-sm">
          <thead>
            <tr class="border-b border-border text-right text-text-secondary">
              <th class="px-3 py-2">محصول</th>
              <th class="px-3 py-2">وضعیت</th>
              <th class="px-3 py-2">مبلغ</th>
              <th class="px-3 py-2">تاریخ</th>
              <th class="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id" class="border-b border-border/60">
              <td class="px-3 py-2">{{ order.product_name }}</td>
              <td class="px-3 py-2">
                <span class="rounded-md px-2 py-0.5 text-xs" :class="getOrderStatusClass(order.status)">
                  {{ formatOrderStatus(order.status) }}
                </span>
              </td>
              <td class="px-3 py-2">{{ order.final_amount.toLocaleString('fa-IR') }}</td>
              <td class="px-3 py-2">{{ formatDate(order.created_at) }}</td>
              <td class="px-3 py-2">
                <RouterLink :to="{ name: 'admin-commerce-order-view', params: { id: order.id } }" class="text-primary text-xs">
                  جزئیات
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderListItem } from '~/types/commerce'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatOrderStatus, getOrderStatusClass } from '~/utils/commerce'
import { formatEpochSeconds } from '~/utils/locale'

definePageMeta({
  name: 'admin-commerce-orders',
  layout: 'dashboard',
})

const { adminListOrders } = useCommerce()

const orders = ref<OrderListItem[]>([])
const pending = ref(true)
const loadError = ref('')

function formatDate(ts: number): string {
  return formatEpochSeconds(ts, 'fa')
}

async function loadOrders() {
  pending.value = true
  loadError.value = ''
  try {
    const result = await adminListOrders({ page_size: 100, ordering: '-created_at' })
    orders.value = result?.orders ?? []
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری سفارش‌ها ناموفق بود')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadOrders()
})
</script>
