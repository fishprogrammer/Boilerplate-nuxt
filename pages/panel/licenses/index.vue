<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">لایسنس‌های من</h1>
          <p class="mt-1 text-sm text-text-secondary">کلیدهای محصولات خریداری‌شده</p>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="{ name: 'panel-downloads' }" class="btn-muted-sm">مرکز دانلود</NuxtLink>
          <BackIconButton />
        </div>
      </div>

      <p v-if="!licensingApiLive" class="mb-4 text-xs text-amber-600">نمایش داده نمونه — API لایسنس غیرفعال است.</p>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-else-if="licenses.length === 0" class="rounded-xl border border-dashed border-border px-4 py-16 text-center text-sm text-text-secondary">
        لایسنس فعالی ندارید.
      </div>
      <ul v-else class="space-y-3">
        <li
          v-for="license in licenses"
          :key="license.id"
          class="cursor-pointer rounded-xl border border-border bg-surface p-4 transition hover:border-primary/30"
          @click="openLicense(license.id)"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium text-text-primary">{{ license.product.name }}</p>
              <p class="mt-1 font-mono text-xs text-text-secondary dir-ltr">{{ license.license_key_masked }}</p>
              <p class="mt-1 text-xs text-text-muted">{{ license.plan.name }} · {{ formatLicenseType(license.plan.license_type) }}</p>
            </div>
            <span class="w-fit rounded-md px-2 py-0.5 text-xs font-medium" :class="getLicenseStatusClass(license.status)">
              {{ formatLicenseStatus(license.status) }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { License } from '~/types/licensing'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatLicenseStatus, formatLicenseType, getLicenseStatusClass } from '~/utils/licensing'

definePageMeta({
  name: 'panel-licenses',
  middleware: ['noindex', 'auth'],
  layout: 'dashboard',
})

const router = useRouter()
const { fetchLicenses, licensingApiLive } = useLicensing()

const licenses = ref<License[]>([])
const pending = ref(true)
const loadError = ref('')

function openLicense(id: string) {
  void router.push({ name: 'panel-license-view', params: { id } })
}

onMounted(async () => {
  try {
    licenses.value = await fetchLicenses()
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری لایسنس‌ها ناموفق بود')
  } finally {
    pending.value = false
  }
})

useHead({ meta: [{ name: 'robots', content: 'noindex,nofollow' }] })
</script>
