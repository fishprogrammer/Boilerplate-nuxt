<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 border-b border-border/50 pb-4">
        <h1 class="text-xl font-semibold text-text-primary">داشبورد مالی</h1>
        <p class="mt-1 text-sm text-text-secondary">MRR · پیش‌بینی · درآمد محصول · اثر کوپن‌ها</p>
      </div>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="dashboard" class="space-y-6">
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div v-for="card in kpiCards" :key="card.label" class="rounded-xl border border-border bg-surface p-4">
            <p class="text-xs text-text-secondary">{{ card.label }}</p>
            <p class="mt-1 text-lg font-semibold text-text-primary">{{ card.value }}</p>
          </div>
        </div>

        <section>
          <h2 class="mb-3 text-sm font-semibold text-text-primary">روند MRR (۱۲ ماه)</h2>
          <MrrLineChart :points="mrrSeries" />
        </section>

        <section class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-text-primary">پیش‌بینی MRR</h2>
            <select v-model="forecastScenario" class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus" @change="loadForecast">
              <option value="realistic">واقع‌بینانه</option>
              <option value="optimistic">خوش‌بینانه</option>
              <option value="pessimistic">محتاطانه</option>
            </select>
          </div>
          <MrrLineChart :points="forecastSeries" />
        </section>

        <section class="rounded-xl border border-border bg-surface p-4">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">درآمد به تفکیک محصول</h2>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[640px] text-sm">
              <thead>
                <tr class="border-b border-border text-right text-text-secondary">
                  <th class="px-3 py-2">محصول</th>
                  <th class="px-3 py-2">درآمد</th>
                  <th class="px-3 py-2">تعداد سفارش</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in revenueRows" :key="row.product_slug" class="border-b border-border/60">
                  <td class="px-3 py-2">{{ row.product_name }}</td>
                  <td class="px-3 py-2">{{ formatMoney(row.revenue) }}</td>
                  <td class="px-3 py-2">{{ row.orders_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="rounded-xl border border-border bg-surface p-4">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">اثر کوپن‌ها</h2>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-sm">
              <thead>
                <tr class="border-b border-border text-right text-text-secondary">
                  <th class="px-3 py-2">کد</th>
                  <th class="px-3 py-2">استفاده</th>
                  <th class="px-3 py-2">تخفیف کل</th>
                  <th class="px-3 py-2">درآمد پس از تخفیف</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in couponRows" :key="row.coupon_code" class="border-b border-border/60">
                  <td class="px-3 py-2 font-mono dir-ltr">{{ row.coupon_code }}</td>
                  <td class="px-3 py-2">{{ row.times_used }}</td>
                  <td class="px-3 py-2">{{ formatMoney(row.total_discount_amount) }}</td>
                  <td class="px-3 py-2">{{ formatMoney(row.revenue_after_discount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CouponImpactRow, FinanceDashboard, ForecastScenario, MrrDataPoint, RevenueByProductRow } from '~/types/finance'
import { getApiErrorMessage } from '~/utils/api-error'

definePageMeta({
  name: 'admin-finance-dashboard',
  layout: 'dashboard',
})

const {
  fetchDashboard,
  fetchMrr,
  fetchForecast,
  fetchRevenueByProduct,
  fetchCouponsImpact,
} = useFinance()

const dashboard = ref<FinanceDashboard | null>(null)
const mrrSeries = ref<MrrDataPoint[]>([])
const forecastSeries = ref<MrrDataPoint[]>([])
const revenueRows = ref<RevenueByProductRow[]>([])
const couponRows = ref<CouponImpactRow[]>([])
const forecastScenario = ref<ForecastScenario>('realistic')
const pending = ref(true)
const loadError = ref('')

function formatMoney(value: number): string {
  return `${value.toLocaleString('fa-IR')} ریال`
}

const kpiCards = computed(() => {
  if (!dashboard.value) return []
  const d = dashboard.value
  return [
    { label: 'MRR', value: formatMoney(d.mrr) },
    { label: 'ARR', value: formatMoney(d.arr) },
    { label: 'اشتراک فعال', value: d.active_subscriptions.toLocaleString('fa-IR') },
    { label: 'درآمد ماه جاری', value: formatMoney(d.revenue_mtd) },
    { label: 'درآمد سال جاری', value: formatMoney(d.revenue_ytd) },
    { label: 'Churn %', value: `${d.churn_rate_percent}%` },
    { label: 'سفارش جدید (ماه)', value: d.new_orders_mtd.toLocaleString('fa-IR') },
  ]
})

async function loadForecast() {
  forecastSeries.value = await fetchForecast(12, forecastScenario.value)
}

async function loadAll() {
  pending.value = true
  loadError.value = ''
  try {
    const [dash, mrr, forecast, revenue, coupons] = await Promise.all([
      fetchDashboard(),
      fetchMrr(12),
      fetchForecast(12, forecastScenario.value),
      fetchRevenueByProduct(),
      fetchCouponsImpact(),
    ])
    dashboard.value = dash
    mrrSeries.value = mrr
    forecastSeries.value = forecast
    revenueRows.value = revenue
    couponRows.value = coupons
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری داشبورد مالی ناموفق بود')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadAll()
})
</script>
