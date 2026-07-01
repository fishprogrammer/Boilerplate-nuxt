<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">کوپن‌های تخفیف</h1>
          <p class="mt-1 text-sm text-text-secondary">مدیریت کدهای تخفیف فروشگاه</p>
        </div>
        <RouterLink
          v-if="hasPermission(PERMISSIONS.COMMERCE.VIEW_ORDER)"
          :to="{ name: 'admin-commerce-orders' }"
          class="btn-muted-sm"
        >
          سفارش‌ها
        </RouterLink>
      </div>

      <form
        v-if="hasPermission(PERMISSIONS.COMMERCE.ADD_COUPON)"
        class="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-surface-muted/20 p-3 md:grid-cols-4"
        @submit.prevent="createCoupon"
      >
        <input v-model="form.code" type="text" placeholder="کد" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        <select v-model="form.discount_type" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
          <option value="percent">درصدی</option>
          <option value="fixed_amount">مبلغ ثابت</option>
        </select>
        <input v-model.number="form.discount_value" type="number" min="0" placeholder="مقدار تخفیف" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        <button type="submit" class="btn-action-sm" :disabled="isCreating">{{ isCreating ? '...' : 'افزودن کوپن' }}</button>
      </form>

      <details v-if="hasPermission(PERMISSIONS.COMMERCE.ADD_COUPON)" class="mb-4 rounded-xl border border-border/70 bg-surface-muted/20 p-3">
        <summary class="cursor-pointer text-sm font-medium text-text-primary">تولید دسته‌ای کوپن (حداکثر ۱۰۰)</summary>
        <form class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4" @submit.prevent="bulkGenerate">
          <input v-model.number="bulkForm.count" type="number" min="1" max="100" placeholder="تعداد" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          <input v-model="bulkForm.prefix" type="text" placeholder="پیشوند (اختیاری)" dir="ltr" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          <select v-model="bulkForm.discount_type" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
            <option value="percent">درصدی</option>
            <option value="fixed_amount">مبلغ ثابت</option>
          </select>
          <input v-model.number="bulkForm.discount_value" type="number" min="0" placeholder="مقدار" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          <button type="submit" class="btn-action-sm md:col-span-4 w-fit" :disabled="bulkPending">{{ bulkPending ? '...' : 'تولید کدها' }}</button>
        </form>
        <div v-if="generatedCodes.length" class="mt-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs text-text-secondary">{{ generatedCodes.length }} کد تولید شد</span>
            <button type="button" class="text-xs text-primary" @click="copyAllCodes">کپی همه</button>
          </div>
          <div class="max-h-40 overflow-y-auto rounded-lg border border-border bg-surface p-2 font-mono text-xs dir-ltr">
            <div v-for="code in generatedCodes" :key="code">{{ code }}</div>
          </div>
        </div>
      </details>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="coupons.length === 0" class="text-sm text-text-secondary">کوپنی ثبت نشده است.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr class="border-b border-border text-right text-text-secondary">
              <th class="px-3 py-2">کد</th>
              <th class="px-3 py-2">نوع</th>
              <th class="px-3 py-2">مقدار</th>
              <th class="px-3 py-2">استفاده</th>
              <th class="px-3 py-2">وضعیت</th>
              <th class="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in coupons" :key="coupon.id" class="border-b border-border/60">
              <td class="px-3 py-2 font-medium dir-ltr">{{ coupon.code }}</td>
              <td class="px-3 py-2">{{ formatDiscountType(coupon.discount_type) }}</td>
              <td class="px-3 py-2">{{ coupon.discount_value }}</td>
              <td class="px-3 py-2">{{ coupon.used_count }}</td>
              <td class="px-3 py-2">
                <span class="rounded-md px-2 py-0.5 text-xs" :class="coupon.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'">
                  {{ coupon.is_active ? 'فعال' : 'غیرفعال' }}
                </span>
              </td>
              <td class="px-3 py-2">
                <button
                  v-if="hasPermission(PERMISSIONS.COMMERCE.DELETE_COUPON)"
                  type="button"
                  class="text-xs text-red-600"
                  @click="removeCoupon(coupon.id)"
                >
                  حذف
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CouponAdmin } from '~/types/commerce'
import { PERMISSIONS } from '~/constants/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatDiscountType } from '~/utils/commerce'
import { showToast } from '~/composables/useToast'

definePageMeta({
  name: 'admin-commerce-coupons',
  layout: 'dashboard',
})

const { hasPermission } = usePermissions()
const { adminListCoupons, adminCreateCoupon, adminDeleteCoupon, adminBulkGenerateCoupons } = useCommerce()

const coupons = ref<CouponAdmin[]>([])
const pending = ref(true)
const loadError = ref('')
const isCreating = ref(false)
const bulkPending = ref(false)
const generatedCodes = ref<string[]>([])
const form = reactive({
  code: '',
  discount_type: 'percent' as 'percent' | 'fixed_amount',
  discount_value: 10,
})
const bulkForm = reactive({
  count: 10,
  prefix: 'PROMO',
  discount_type: 'percent' as 'percent' | 'fixed_amount',
  discount_value: 15,
})

async function loadCoupons() {
  pending.value = true
  loadError.value = ''
  try {
    const result = await adminListCoupons({ page_size: 100 })
    coupons.value = result?.coupons ?? []
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری کوپن‌ها ناموفق بود')
  } finally {
    pending.value = false
  }
}

async function createCoupon() {
  if (!form.code.trim() || isCreating.value) return
  isCreating.value = true
  try {
    await adminCreateCoupon({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      is_active: true,
    })
    form.code = ''
    showToast({ message: 'کوپن ایجاد شد', variant: 'success' })
    await loadCoupons()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'ایجاد کوپن ناموفق بود'), variant: 'error' })
  } finally {
    isCreating.value = false
  }
}

async function removeCoupon(id: string) {
  try {
    await adminDeleteCoupon(id)
    showToast({ message: 'کوپن حذف شد', variant: 'success' })
    await loadCoupons()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'حذف کوپن ناموفق بود'), variant: 'error' })
  }
}

async function bulkGenerate() {
  if (bulkPending.value || bulkForm.count < 1) return
  bulkPending.value = true
  try {
    const result = await adminBulkGenerateCoupons({
      count: Math.min(bulkForm.count, 100),
      prefix: bulkForm.prefix.trim() || undefined,
      discount_type: bulkForm.discount_type,
      discount_value: bulkForm.discount_value,
    })
    generatedCodes.value = result?.codes ?? []
    showToast({ message: `${generatedCodes.value.length} کد تولید شد`, variant: 'success' })
    await loadCoupons()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'تولید دسته‌ای ناموفق بود'), variant: 'error' })
  } finally {
    bulkPending.value = false
  }
}

async function copyAllCodes() {
  try {
    await navigator.clipboard.writeText(generatedCodes.value.join('\n'))
    showToast({ message: 'کدها کپی شدند', variant: 'success' })
  } catch {
    showToast({ message: 'کپی ناموفق بود', variant: 'error' })
  }
}

onMounted(() => {
  void loadCoupons()
})
</script>
