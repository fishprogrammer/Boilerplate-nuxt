<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex items-center justify-between gap-3 border-b border-border/50 pb-4">
        <h1 class="text-xl font-semibold text-text-primary">جزئیات سفارش (ادمین)</h1>
        <BackIconButton />
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-else-if="!order" class="text-sm text-text-secondary">سفارش یافت نشد.</div>
      <div v-else class="space-y-4 text-sm">
        <p><strong>محصول:</strong> {{ order.lines[0]?.product_name || '—' }}</p>
        <p><strong>وضعیت:</strong> {{ formatOrderStatus(order.status) }}</p>
        <p><strong>مبلغ نهایی:</strong> {{ order.final_amount.toLocaleString('fa-IR') }} ریال</p>
        <p v-if="order.coupon_code"><strong>کوپن:</strong> {{ order.coupon_code }}</p>
        <p v-if="order.failure_reason"><strong>علت خطا:</strong> {{ order.failure_reason }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderDetail } from '~/types/commerce'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatOrderStatus } from '~/utils/commerce'

definePageMeta({
  name: 'admin-commerce-order-view',
  layout: 'dashboard',
})

const route = useRoute()
const { adminGetOrder } = useCommerce()

const order = ref<OrderDetail | null>(null)
const pending = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    order.value = await adminGetOrder(String(route.params.id))
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری سفارش ناموفق بود')
  } finally {
    pending.value = false
  }
})
</script>
