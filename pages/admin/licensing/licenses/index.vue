<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">جستجوی لایسنس (ادمین)</h1>
          <p class="mt-1 text-sm text-text-secondary">جستجو بر اساس کاربر یا بخشی از کلید</p>
        </div>
        <RouterLink :to="{ name: 'admin-licensing-installations' }" class="btn-muted-sm">نصب‌ها</RouterLink>
      </div>

      <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input v-model="searchFilter" type="text" placeholder="نام کاربری / email" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        <input v-model="keyFilter" type="text" placeholder="بخشی از کلید" dir="ltr" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        <button type="button" class="btn-action-sm" :disabled="pending" @click="searchLicenses">جستجو</button>
      </div>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="!searched" class="text-sm text-text-secondary">فیلتر را وارد کنید و جستجو را بزنید.</div>
      <div v-else-if="items.length === 0" class="text-sm text-text-secondary">موردی یافت نشد.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-sm">
          <thead>
            <tr class="border-b border-border text-right text-text-secondary">
              <th class="px-3 py-2">کلید (ماسک)</th>
              <th class="px-3 py-2">مالک</th>
              <th class="px-3 py-2">محصول</th>
              <th class="px-3 py-2">وضعیت</th>
              <th class="px-3 py-2">فعال‌سازی</th>
              <th class="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id" class="border-b border-border/60">
              <td class="px-3 py-2 font-mono dir-ltr">{{ row.license_key_masked }}</td>
              <td class="px-3 py-2">{{ row.owner_username }}</td>
              <td class="px-3 py-2">{{ row.product_name }}</td>
              <td class="px-3 py-2">
                <span class="rounded-md px-2 py-0.5 text-xs" :class="getLicenseStatusClass(row.status)">
                  {{ formatLicenseStatus(row.status) }}
                </span>
              </td>
              <td class="px-3 py-2">{{ row.activation_count }}</td>
              <td class="px-3 py-2">
                <RouterLink
                  :to="{ name: 'admin-licensing-license-view', params: { id: row.id } }"
                  class="text-xs text-primary"
                >
                  جزئیات
                </RouterLink>
                <RouterLink
                  v-if="row.order_id"
                  :to="{ name: 'admin-commerce-order-view', params: { id: row.order_id } }"
                  class="ms-2 text-xs text-primary"
                >
                  سفارش
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminLicenseSearchItem } from '~/types/licensing'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatLicenseStatus, getLicenseStatusClass } from '~/utils/licensing'

definePageMeta({
  name: 'admin-licensing-licenses',
  layout: 'dashboard',
})

const { adminSearchLicenses } = useLicensing()

const items = ref<AdminLicenseSearchItem[]>([])
const pending = ref(false)
const searched = ref(false)
const loadError = ref('')
const searchFilter = ref('')
const keyFilter = ref('')

async function searchLicenses() {
  if (!searchFilter.value.trim() && !keyFilter.value.trim()) {
    loadError.value = 'حداقل یک فیلتر جستجو وارد کنید.'
    return
  }
  pending.value = true
  searched.value = true
  loadError.value = ''
  try {
    items.value = await adminSearchLicenses({
      search: searchFilter.value.trim() || undefined,
      key: keyFilter.value.trim() || undefined,
    })
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'جستجو ناموفق بود')
  } finally {
    pending.value = false
  }
}
</script>
