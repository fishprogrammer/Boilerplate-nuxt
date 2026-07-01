<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">سفارش‌های من</h1>
          <p class="mt-1 text-sm text-text-secondary">خریدهای نرم‌افزاری از فروشگاه</p>
        </div>
        <BackIconButton />
      </div>

      <p v-if="!commerceApiLive" class="mb-4 text-xs text-amber-600">نمایش داده نمونه — API تجارت غیرفعال است.</p>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>
      <div v-else-if="orders.length === 0" class="rounded-xl border border-dashed border-border px-4 py-16 text-center text-sm text-text-secondary">
        هنوز سفارشی ثبت نشده است.
      </div>
      <ul v-else class="space-y-3">
        <li
          v-for="order in orders"
          :key="order.id"
          class="cursor-pointer rounded-xl border border-border bg-surface transition hover:border-primary/30"
          @click="openOrder(order.id)"
        >
          <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <p class="font-medium text-text-primary">{{ order.product_name }}</p>
              <p class="mt-1 text-xs text-text-muted dir-ltr">{{ order.product_slug }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="getOrderStatusClass(order.status)">
                {{ formatOrderStatus(order.status) }}
              </span>
              <span class="text-sm font-semibold">{{ order.final_amount.toLocaleString('fa-IR') }} ریال</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderListItem } from '~/types/commerce'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatOrderStatus, getOrderStatusClass } from '~/utils/commerce'

definePageMeta({
  name: 'panel-orders',
  middleware: ['noindex', 'auth'],
  layout: 'dashboard',
})

const router = useRouter()
const { fetchOrders, commerceApiLive } = useCommerce()

const orders = ref<OrderListItem[]>([])
const pending = ref(true)
const loadError = ref('')

async function loadOrders() {
  pending.value = true
  loadError.value = ''
  try {
    const result = await fetchOrders({ page_size: 50, ordering: '-created_at' })
    orders.value = result.items
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری سفارش‌ها ناموفق بود')
  } finally {
    pending.value = false
  }
}

function openOrder(id: string) {
  void router.push({ name: 'panel-order-view', params: { id } })
}

onMounted(() => {
  void loadOrders()
})

useHead({ meta: [{ name: 'robots', content: 'noindex,nofollow' }] })
</script>
