<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">دسته‌های کاتالوگ</h1>
          <p class="mt-1 text-sm text-text-secondary">دسته‌بندی محصولات فروشگاه</p>
        </div>
        <RouterLink :to="{ name: 'catalog-products' }" class="btn-muted-sm">محصولات</RouterLink>
      </div>

      <div v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="categories.length === 0" class="text-sm text-text-secondary">دسته‌ای یافت نشد.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[520px] text-sm">
          <thead>
            <tr class="border-b border-border text-right text-text-secondary">
              <th class="px-3 py-2 font-medium">نام</th>
              <th class="px-3 py-2 font-medium">slug</th>
              <th class="px-3 py-2 font-medium">زبان</th>
              <th class="px-3 py-2 font-medium">تعداد محصول</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id" class="border-b border-border/60">
              <td class="px-3 py-2 font-medium text-text-primary">{{ category.name }}</td>
              <td class="px-3 py-2 dir-ltr text-text-secondary">{{ category.slug }}</td>
              <td class="px-3 py-2">{{ category.locale }}</td>
              <td class="px-3 py-2">{{ category.product_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatalogCategory } from '~/types/catalog'
import { getApiErrorMessage } from '~/utils/api-error'

definePageMeta({
  name: 'catalog-categories',
  layout: 'dashboard',
})

const { adminListCategories } = useCatalog()

const categories = ref<CatalogCategory[]>([])
const loadError = ref('')
const pending = ref(true)

onMounted(async () => {
  try {
    const result = await adminListCategories({ page_size: 100 })
    categories.value = result?.categories ?? []
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری دسته‌ها ناموفق بود')
  } finally {
    pending.value = false
  }
})
</script>
