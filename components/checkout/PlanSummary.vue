<template>
  <div class="rounded-2xl border border-border bg-surface p-5">
    <h2 class="text-lg font-semibold text-text-primary">خلاصه سفارش</h2>
    <div v-if="plan" class="mt-4 space-y-2 text-sm">
      <p class="font-medium text-text-primary">{{ productName || plan.name }}</p>
      <p class="text-text-secondary">{{ plan.name }}</p>
      <p class="text-text-secondary">{{ licenseLabel }}</p>
      <div class="border-t border-border pt-3">
        <div class="flex justify-between text-text-secondary">
          <span>قیمت پلن</span>
          <span>{{ formatIrr(plan.price) }}</span>
        </div>
        <div v-if="(discountAmount ?? 0) > 0" class="mt-1 flex justify-between text-emerald-700 dark:text-emerald-300">
          <span>تخفیف</span>
          <span>− {{ formatIrr(discountAmount ?? 0) }}</span>
        </div>
        <div class="mt-2 flex justify-between text-base font-bold text-text-primary">
          <span>مبلغ قابل پرداخت</span>
          <span>{{ formatIrr(displayAmount) }}</span>
        </div>
      </div>
    </div>
    <p v-else class="mt-3 text-sm text-text-secondary">
      پلن انتخاب‌شده: <code class="dir-ltr">{{ planId }}</code>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PricingPlan } from '~/types/catalog'

const props = defineProps<{
  plan: PricingPlan | null
  planId: string
  productName?: string
  displayAmount: number
  discountAmount?: number
}>()

const licenseLabel = computed(() => {
  if (!props.plan) return ''
  const map: Record<string, string> = {
    per_domain: 'هر دامنه',
    per_server: 'هر سرور',
    per_user: 'هر کاربر',
    lifetime: 'مادام‌العمر',
  }
  return map[props.plan.license_type] || props.plan.license_type
})

function formatIrr(amount: number): string {
  if (amount === 0) return 'رایگان'
  return `${amount.toLocaleString('fa-IR')} ریال`
}
</script>
