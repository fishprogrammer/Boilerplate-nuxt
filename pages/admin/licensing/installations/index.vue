<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">نصب‌های فعال (ادمین)</h1>
          <p class="mt-1 text-sm text-text-secondary">گزارش فعال‌سازی محصولات — فقط خواندنی</p>
        </div>
        <RouterLink :to="{ name: 'admin-licensing-licenses' }" class="btn-muted-sm">جستجوی لایسنس</RouterLink>
      </div>

      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input v-model="productFilter" type="text" placeholder="product slug" dir="ltr" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        <input v-model="versionFilter" type="text" placeholder="version" dir="ltr" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        <button type="button" class="btn-action-sm" :disabled="pending" @click="loadInstallations">اعمال فیلتر</button>
      </div>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="items.length === 0" class="text-sm text-text-secondary">موردی یافت نشد.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-sm">
          <thead>
            <tr class="border-b border-border text-right text-text-secondary">
              <th class="px-3 py-2">محصول</th>
              <th class="px-3 py-2">دامنه/سرور</th>
              <th class="px-3 py-2">نسخه</th>
              <th class="px-3 py-2">آخرین بازدید</th>
              <th class="px-3 py-2">وضعیت لایسنس</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.activation_id" class="border-b border-border/60">
              <td class="px-3 py-2 dir-ltr">{{ row.product_slug }}</td>
              <td class="px-3 py-2">{{ row.domain_or_server }}</td>
              <td class="px-3 py-2 dir-ltr">{{ row.version }}</td>
              <td class="px-3 py-2">{{ formatDate(row.last_seen_at) }}</td>
              <td class="px-3 py-2">{{ row.license_status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InstallationReport } from '~/types/licensing'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatEpochSeconds } from '~/utils/locale'

definePageMeta({
  name: 'admin-licensing-installations',
  layout: 'dashboard',
})

const { adminFetchInstallations } = useLicensing()

const items = ref<InstallationReport[]>([])
const pending = ref(true)
const loadError = ref('')
const productFilter = ref('')
const versionFilter = ref('')

function formatDate(ts: number): string {
  return formatEpochSeconds(ts, 'fa')
}

async function loadInstallations() {
  pending.value = true
  loadError.value = ''
  try {
    items.value = await adminFetchInstallations({
      product: productFilter.value.trim() || undefined,
      version: versionFilter.value.trim() || undefined,
    })
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری نصب‌ها ناموفق بود')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadInstallations()
})
</script>
