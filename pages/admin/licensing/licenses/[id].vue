<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">جزئیات لایسنس</h1>
          <p class="mt-1 font-mono text-sm text-text-secondary dir-ltr">{{ license?.license_key_masked }}</p>
        </div>
        <div class="flex gap-2">
          <RouterLink :to="{ name: 'admin-licensing-licenses' }" class="btn-muted-sm">بازگشت</RouterLink>
          <RouterLink
            v-if="license?.order_id"
            :to="{ name: 'admin-commerce-order-view', params: { id: license.order_id } }"
            class="btn-muted-sm"
          >
            سفارش
          </RouterLink>
        </div>
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-else-if="!license" class="text-sm text-text-secondary">لایسنس یافت نشد.</div>
      <div v-else class="space-y-6">
        <section class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-border bg-surface p-4">
            <h2 class="text-sm font-semibold text-text-primary">مالک</h2>
            <p class="mt-2 text-sm">{{ license.username }}</p>
            <p class="text-xs text-text-muted dir-ltr">{{ license.user_id }}</p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-4">
            <h2 class="text-sm font-semibold text-text-primary">محصول</h2>
            <p class="mt-2 text-sm">{{ license.product.name }}</p>
            <p class="text-xs text-text-muted dir-ltr">{{ license.product.slug }}</p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-4">
            <h2 class="text-sm font-semibold text-text-primary">وضعیت</h2>
            <p class="mt-2">
              <span class="rounded-md px-2 py-0.5 text-xs" :class="getLicenseStatusClass(license.status)">
                {{ formatLicenseStatus(license.status) }}
              </span>
            </p>
            <p class="mt-2 text-xs text-text-secondary">
              فعال‌سازی: {{ license.activation_count }} / {{ license.max_activations }}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-4">
            <h2 class="text-sm font-semibold text-text-primary">پلن</h2>
            <p class="mt-2 text-sm">{{ license.plan.name }}</p>
            <p class="text-xs text-text-muted">{{ license.plan.license_type }}</p>
          </div>
        </section>

        <section v-if="license.activations.length" class="rounded-xl border border-border bg-surface p-4">
          <h2 class="text-sm font-semibold text-text-primary">فعال‌سازی‌ها</h2>
          <ul class="mt-3 space-y-2">
            <li
              v-for="activation in license.activations"
              :key="activation.id"
              class="rounded-lg border border-border/70 px-3 py-2 text-sm"
            >
              <p class="font-medium">{{ activation.label || activation.identifier }}</p>
              <p class="text-xs text-text-muted dir-ltr">{{ activation.identifier }}</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminLicenseDetail } from '~/types/licensing'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatLicenseStatus, getLicenseStatusClass } from '~/utils/licensing'

definePageMeta({
  name: 'admin-licensing-license-view',
  middleware: ['noindex', 'staff'],
  layout: 'dashboard',
})

const route = useRoute()
const { adminFetchLicense } = useLicensing()

const license = ref<AdminLicenseDetail | null>(null)
const pending = ref(true)
const loadError = ref('')

onMounted(async () => {
  const id = String(route.params.id || '')
  if (!id) {
    loadError.value = 'شناسه لایسنس نامعتبر است.'
    pending.value = false
    return
  }
  try {
    license.value = await adminFetchLicense(id)
    if (!license.value) loadError.value = 'لایسنس یافت نشد.'
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری جزئیات لایسنس ناموفق بود')
  } finally {
    pending.value = false
  }
})
</script>
