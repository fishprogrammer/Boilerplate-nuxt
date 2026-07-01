<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">جزئیات سفارش</h1>
          <p v-if="order" class="mt-1 text-sm text-text-secondary">{{ order.lines[0]?.product_name || '—' }}</p>
        </div>
        <BackIconButton />
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>
      <div v-else-if="!order" class="text-sm text-text-secondary">سفارش یافت نشد.</div>
      <div v-else class="space-y-5">
        <div
          class="rounded-xl border px-4 py-4"
          :class="order.status === 'paid'
            ? 'border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/30'
            : order.status === 'failed'
              ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30'
              : 'border-border bg-surface-muted/40'"
        >
          <div class="flex flex-wrap items-center gap-3">
            <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="getOrderStatusClass(order.status)">
              {{ formatOrderStatus(order.status) }}
            </span>
            <span v-if="polling" class="text-xs text-text-secondary">در حال بررسی وضعیت پرداخت...</span>
          </div>
          <p v-if="order.failure_reason && order.status !== 'paid'" class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ order.failure_reason }}
          </p>
        </div>

        <div class="rounded-xl border border-border bg-surface p-4 text-sm">
          <div class="flex justify-between py-1"><span class="text-text-secondary">جمع</span><span>{{ order.subtotal_amount.toLocaleString('fa-IR') }} ریال</span></div>
          <div v-if="order.discount_amount" class="flex justify-between py-1 text-emerald-700 dark:text-emerald-300"><span>تخفیف</span><span>− {{ order.discount_amount.toLocaleString('fa-IR') }} ریال</span></div>
          <div class="flex justify-between border-t border-border pt-2 font-bold"><span>مبلغ نهایی</span><span>{{ order.final_amount.toLocaleString('fa-IR') }} ریال</span></div>
          <p v-if="order.coupon_code" class="mt-2 text-xs text-text-muted">کد تخفیف: {{ order.coupon_code }}</p>
        </div>

        <div v-if="order.lines.length" class="rounded-xl border border-border bg-surface p-4">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">اقلام سفارش</h2>
          <ul class="space-y-2 text-sm text-text-secondary">
            <li v-for="(line, index) in order.lines" :key="index">
              {{ line.product_name }} — {{ line.plan_name }} × {{ line.quantity }}
            </li>
          </ul>
        </div>

        <OrderLicensesCard v-if="order.licenses.length" :licenses="order.licenses" />
        <div
          v-else-if="order.status === 'paid'"
          class="rounded-xl border border-dashed border-border bg-surface-muted/30 p-4 text-sm text-text-secondary"
        >
          لایسنس پس از صدور در اینجا نمایش داده می‌شود.
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="{ name: 'panel-orders' }" class="btn-muted-sm">همه سفارش‌ها</NuxtLink>
          <NuxtLink
            v-if="order.lines[0]?.product_slug"
            :to="`/shop/${order.lines[0].product_slug}`"
            class="btn-action-sm"
          >
            مشاهده محصول
          </NuxtLink>
          <NuxtLink v-if="order.status === 'failed'" :to="{ name: 'panel-checkout', query: { plan: route.query.plan } }" class="btn-muted-sm">
            تلاش مجدد
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderDetail } from '~/types/commerce'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import {
  clearPendingCommerceOrder,
  formatOrderStatus,
  getOrderStatusClass,
  getPendingCommerceOrderId,
  isCommerceTerminalStatus,
} from '~/utils/commerce'

definePageMeta({
  name: 'panel-order-view',
  middleware: ['noindex', 'auth'],
  layout: 'dashboard',
})

const route = useRoute()
const authStore = useAuthStore()
const orderId = computed(() => String(route.params.id || ''))

const { fetchOrder, pollOrderUntilSettled } = useCommerce()

const order = ref<OrderDetail | null>(null)
const pending = ref(true)
const polling = ref(false)
const loadError = ref('')

async function loadOrder(pollIfPending = false) {
  pending.value = !order.value
  loadError.value = ''
  try {
    let detail = await fetchOrder(orderId.value)
    if (!detail) {
      loadError.value = 'سفارش یافت نشد.'
      return
    }

    const shouldPoll =
      pollIfPending &&
      (detail.status === 'pending_payment' || orderId.value === getPendingCommerceOrderId())

    if (shouldPoll && !isCommerceTerminalStatus(detail.status)) {
      polling.value = true
      detail = (await pollOrderUntilSettled(orderId.value)) ?? detail
      polling.value = false
      if (detail?.status === 'paid') {
        clearPendingCommerceOrder()
        await authStore.fetchCurrentUser()
      }
    }

    order.value = detail
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری سفارش ناموفق بود')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadOrder(true)
})

useHead({ meta: [{ name: 'robots', content: 'noindex,nofollow' }] })
</script>
