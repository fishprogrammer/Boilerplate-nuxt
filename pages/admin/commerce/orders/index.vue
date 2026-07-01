<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">سفارش‌های تجارت</h1>
          <p class="mt-1 text-sm text-text-secondary">فیلتر، مشاهده و خروجی CSV</p>
        </div>
        <RouterLink :to="{ name: 'admin-commerce-coupons' }" class="btn-muted-sm">کوپن‌ها</RouterLink>
      </div>

      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs font-medium">وضعیت</label>
          <select v-model="statusFilter" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
            <option value="">همه</option>
            <option value="paid">پرداخت‌شده</option>
            <option value="pending_payment">در انتظار</option>
            <option value="failed">ناموفق</option>
            <option value="refunded">مسترد</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs font-medium">از تاریخ پرداخت</label>
          <input v-model="paidFrom" type="date" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs font-medium">تا تاریخ پرداخت</label>
          <input v-model="paidTo" type="date" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div class="md:col-span-3">
          <label class="mb-1 block text-xs font-medium">کاربر</label>
          <input v-model="userFilter" type="text" placeholder="username یا email" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div class="flex items-end gap-2 md:col-span-3">
          <button type="button" class="btn-action-sm" :disabled="pending" @click="loadOrders">اعمال</button>
          <button type="button" class="btn-muted-sm" :disabled="exporting" @click="exportCsv">
            {{ exporting ? '...' : 'خروجی CSV' }}
          </button>
        </div>
      </div>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
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
import { downloadCommerceOrdersExport } from '~/utils/commerce-export'
import { formatEpochSeconds } from '~/utils/locale'
import { showToast } from '~/composables/useToast'

definePageMeta({
  name: 'admin-commerce-orders',
  layout: 'dashboard',
})

const { adminListOrders } = useCommerce()

const orders = ref<OrderListItem[]>([])
const pending = ref(true)
const exporting = ref(false)
const loadError = ref('')
const statusFilter = ref('')
const paidFrom = ref('')
const paidTo = ref('')
const userFilter = ref('')

function formatDate(ts: number): string {
  return formatEpochSeconds(ts, 'fa')
}

function dateToUnixStart(date: string): number | undefined {
  if (!date) return undefined
  const d = new Date(`${date}T00:00:00`)
  return Math.floor(d.getTime() / 1000)
}

function dateToUnixEnd(date: string): number | undefined {
  if (!date) return undefined
  const d = new Date(`${date}T23:59:59`)
  return Math.floor(d.getTime() / 1000)
}

function buildFilters() {
  const params: Record<string, string | number> = { page_size: 100, ordering: '-created_at' }
  if (statusFilter.value) params.status = statusFilter.value
  const from = dateToUnixStart(paidFrom.value)
  const to = dateToUnixEnd(paidTo.value)
  if (from) params.paid_from = from
  if (to) params.paid_to = to
  if (userFilter.value.trim()) params.user = userFilter.value.trim()
  return params
}

async function loadOrders() {
  pending.value = true
  loadError.value = ''
  try {
    const result = await adminListOrders(buildFilters())
    orders.value = result?.orders ?? []
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری سفارش‌ها ناموفق بود')
  } finally {
    pending.value = false
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    await downloadCommerceOrdersExport({
      status: statusFilter.value || undefined,
      paid_from: dateToUnixStart(paidFrom.value),
      paid_to: dateToUnixEnd(paidTo.value),
      user: userFilter.value.trim() || undefined,
    })
    showToast({ message: 'فایل CSV دانلود شد', variant: 'success' })
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'خروجی CSV ناموفق بود'), variant: 'error' })
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  void loadOrders()
})
</script>
