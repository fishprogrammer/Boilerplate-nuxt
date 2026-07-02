<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">محصولات کاتالوگ</h1>
          <p class="mt-1 text-sm text-text-secondary">مدیریت محصولات فروشگاه</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <RouterLink
            v-if="hasPermission(PERMISSIONS.CATALOG.ADD_PRODUCT)"
            :to="{ name: 'catalog-product-create' }"
            class="btn-action-sm"
          >
            محصول جدید
          </RouterLink>
          <RouterLink
            v-if="hasPermission(PERMISSIONS.CATALOG.VIEW_CATEGORY)"
            :to="{ name: 'catalog-categories' }"
            class="btn-muted-sm"
          >
            دسته‌ها
          </RouterLink>
        </div>
      </div>

      <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div class="md:col-span-3">
          <label for="catalog-locale" class="mb-1 block text-xs font-medium">زبان</label>
          <select id="catalog-locale" v-model="localeFilter" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
            <option value="">همه</option>
            <option value="fa">فارسی</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="md:col-span-3">
          <label for="catalog-status" class="mb-1 block text-xs font-medium">وضعیت</label>
          <select id="catalog-status" v-model="statusFilter" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus">
            <option value="">همه</option>
            <option value="published">منتشر شده</option>
            <option value="draft">پیش‌نویس</option>
          </select>
        </div>
        <div class="flex items-end md:col-span-3">
          <button type="button" class="btn-action" :disabled="isFetching" @click="loadProducts">اعمال</button>
        </div>
      </div>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>

      <div v-if="isInitialLoading" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="products.length === 0" class="text-sm text-text-secondary">محصولی یافت نشد.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-sm">
          <thead>
            <tr class="border-b border-border text-right text-text-secondary">
              <th class="px-3 py-2 font-medium">نام</th>
              <th class="px-3 py-2 font-medium">slug</th>
              <th class="px-3 py-2 font-medium">زبان</th>
              <th class="px-3 py-2 font-medium">وضعیت</th>
              <th class="px-3 py-2 font-medium">قیمت از</th>
              <th class="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" class="border-b border-border/60">
              <td class="px-3 py-2 font-medium text-text-primary">{{ product.name }}</td>
              <td class="px-3 py-2 dir-ltr text-text-secondary">{{ product.slug }}</td>
              <td class="px-3 py-2">{{ product.locale }}</td>
              <td class="px-3 py-2">
                <span class="rounded-md px-2 py-0.5 text-xs" :class="product.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'">
                  {{ product.status === 'published' ? 'منتشر شده' : 'پیش‌نویس' }}
                </span>
              </td>
              <td class="px-3 py-2">{{ product.price_from ?? '—' }}</td>
              <td class="px-3 py-2">
                <RouterLink
                  v-if="hasPermission(PERMISSIONS.CATALOG.CHANGE_PRODUCT)"
                  :to="{ name: 'catalog-product-view', params: { id: product.id } }"
                  class="text-xs text-primary"
                >
                  مدیریت
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
import type { AdminCatalogProductListItem } from '~/types/catalog'
import { PERMISSIONS } from '~/constants/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { getApiErrorMessage } from '~/utils/api-error'

definePageMeta({
  name: 'catalog-products',
  layout: 'dashboard',
})

const { hasPermission } = usePermissions()
const { adminListProducts } = useCatalog()

const products = ref<AdminCatalogProductListItem[]>([])
const localeFilter = ref('')
const statusFilter = ref('')
const loadError = ref('')
const isInitialLoading = ref(true)
const isFetching = ref(false)

async function loadProducts() {
  isFetching.value = true
  loadError.value = ''
  try {
    const params: Record<string, string | number> = { page_size: 50 }
    if (localeFilter.value) params.locale = localeFilter.value
    if (statusFilter.value) params.status = statusFilter.value
    const result = await adminListProducts(params)
    products.value = result?.products ?? []
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری محصولات ناموفق بود')
  } finally {
    isInitialLoading.value = false
    isFetching.value = false
  }
}

onMounted(() => {
  void loadProducts()
})
</script>
