<template>
  <div class="grid gap-4">
    <div
      v-for="plan in plans"
      :key="plan.id"
      class="rounded-2xl border p-5"
      :class="plan.is_default ? 'border-primary bg-primary/5' : 'border-border bg-surface'"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-text-primary">{{ plan.name }}</h3>
          <p class="mt-1 text-sm text-text-secondary">
            {{ licenseTypeLabel(plan.license_type) }}
          </p>
        </div>
        <p class="text-xl font-bold text-primary">{{ formatPlanPrice(plan) }}</p>
      </div>
      <ul v-if="plan.features.length" class="mt-4 space-y-2 text-sm text-text-secondary">
        <li v-for="feature in plan.features" :key="feature" class="flex gap-2">
          <span aria-hidden="true">✓</span>
          <span>{{ feature }}</span>
        </li>
      </ul>
      <div class="mt-5">
        <NuxtLink
          :to="checkoutUrl(plan.id)"
          class="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {{ ctaLabel(plan) }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PricingPlan, LicenseType } from '~/types/catalog'
import { formatIRR, type AppLocale } from '~/utils/locale'

const props = defineProps<{
  plans: PricingPlan[]
  locale: AppLocale
}>()

function formatPlanPrice(plan: PricingPlan): string {
  if (plan.price === 0) return props.locale === 'fa' ? 'رایگان' : 'Free'
  return formatIRR(plan.price, props.locale)
}

function licenseTypeLabel(type: LicenseType): string {
  const labels: Record<LicenseType, { fa: string; en: string }> = {
    per_domain: { fa: 'هر دامنه', en: 'Per domain' },
    per_server: { fa: 'هر سرور', en: 'Per server' },
    per_user: { fa: 'هر کاربر', en: 'Per user' },
    lifetime: { fa: 'مادام‌العمر', en: 'Lifetime' },
  }
  return labels[type][props.locale]
}

function ctaLabel(plan: PricingPlan): string {
  if (plan.price === 0) return props.locale === 'fa' ? 'دریافت رایگان' : 'Get free'
  return props.locale === 'fa' ? 'خرید' : 'Buy now'
}

function checkoutUrl(planId: string): string {
  return `/panel/checkout?plan=${planId}`
}
</script>
