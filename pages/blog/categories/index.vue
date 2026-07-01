<template>
  <div class="page-shell">
    <div class="page-card md:p-5">
      <div class="mb-4 border-b border-border/50 pb-3">
        <h1 class="text-lg font-semibold text-text-primary md:text-xl">دسته‌بندی‌های بلاگ</h1>
        <p class="mt-0.5 text-xs text-text-secondary md:text-sm">مدیریت دسته‌های وبلاگ عمومی (fa/en)</p>
      </div>

      <form
        class="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-surface-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-5"
        @submit.prevent="createCategory"
      >
        <input
          v-model="newCategory.name"
          type="text"
          placeholder="نام"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus"
        />
        <input
          v-model="newCategory.slug"
          type="text"
          placeholder="slug"
          dir="ltr"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus"
        />
        <select v-model="newCategory.locale" class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus">
          <option value="fa">فارسی</option>
          <option value="en">English</option>
        </select>
        <input
          v-model="newCategory.description"
          type="text"
          placeholder="توضیح (اختیاری)"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus"
        />
        <button type="submit" class="btn-action-sm w-full" :disabled="isCreating">
          {{ isCreating ? 'در حال افزودن…' : 'افزودن دسته' }}
        </button>
      </form>

      <div v-if="isLoading" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div
        v-else-if="loadError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ loadError }}
      </div>
      <div v-else-if="!categories.length" class="rounded-xl border border-border px-4 py-10 text-center text-sm text-text-secondary">
        دسته‌ای ثبت نشده است.
      </div>
      <div v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <article
          v-for="category in categories"
          :key="category.id"
          class="flex items-start justify-between gap-2 rounded-xl border border-border bg-surface-muted/15 p-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p class="text-sm font-semibold text-text-primary">{{ category.name }}</p>
              <span class="rounded-md bg-surface px-2 py-0.5 text-[0.6875rem] text-text-muted">{{ category.locale }}</span>
              <span
                class="inline-flex shrink-0 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
                :class="category.is_active ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300' : 'bg-surface-muted text-text-muted'"
              >
                {{ category.is_active ? 'فعال' : 'غیرفعال' }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-xs text-text-muted dir-ltr">{{ category.slug }}</p>
            <p v-if="category.description" class="mt-1 line-clamp-2 text-xs text-text-secondary">{{ category.description }}</p>
          </div>
          <button
            type="button"
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            aria-label="حذف"
            @click="openDeleteModal(category)"
          >
            ×
          </button>
        </article>
      </div>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف دسته"
      :message="deleteModalMessage"
      confirm-label="بله، حذف"
      cancel-label="انصراف"
      variant="danger"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'blog-categories',
  layout: 'dashboard',
})

import { computed, onMounted, ref } from 'vue'
import { blogService } from '~/api/services/blog.service'
import type { BlogCategory } from '~/api/types/blog.types'
import { isApiSuccess, parseBlogCategoriesListResponse } from '~/api/utils/api-response'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { showToast } from '~/composables/useToast'
import type { AppLocale } from '~/utils/locale'
import { getApiErrorMessage } from '~/utils/api-error'
import { normalizeEnglishSlug } from '~/utils/blog'

const categories = ref<BlogCategory[]>([])
const isLoading = ref(true)
const isCreating = ref(false)
const isDeleting = ref(false)
const loadError = ref('')
const showDeleteModal = ref(false)
const deleteTarget = ref<BlogCategory | null>(null)

const newCategory = ref({
  name: '',
  slug: '',
  locale: 'fa' as AppLocale,
  description: '',
})

const deleteModalMessage = computed(() =>
  deleteTarget.value ? `دسته «${deleteTarget.value.name}» حذف شود؟` : '',
)

async function fetchCategories() {
  isLoading.value = true
  loadError.value = ''
  try {
    const response = await blogService.listCategories({ page_size: 200, ordering: 'sort_order' })
    categories.value = parseBlogCategoriesListResponse(response)?.categories ?? []
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در بارگذاری دسته‌ها')
  } finally {
    isLoading.value = false
  }
}

async function createCategory() {
  if (isCreating.value || !newCategory.value.name.trim() || !newCategory.value.slug.trim()) return
  isCreating.value = true
  try {
    const response = await blogService.createCategory({
      name: newCategory.value.name.trim(),
      slug: normalizeEnglishSlug(newCategory.value.slug),
      locale: newCategory.value.locale,
      description: newCategory.value.description.trim(),
      is_active: true,
    })
    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'افزودن دسته ناموفق بود'), variant: 'error' })
      return
    }
    newCategory.value = { name: '', slug: '', locale: newCategory.value.locale, description: '' }
    showToast({ message: 'دسته اضافه شد.', variant: 'success' })
    await fetchCategories()
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'افزودن دسته ناموفق بود'), variant: 'error' })
  } finally {
    isCreating.value = false
  }
}

function openDeleteModal(category: BlogCategory) {
  deleteTarget.value = category
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value || isDeleting.value) return
  isDeleting.value = true
  try {
    await blogService.deleteCategory(deleteTarget.value.id)
    showToast({ message: 'دسته حذف شد.', variant: 'success' })
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchCategories()
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'حذف ناموفق بود'), variant: 'error' })
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchCategories)
</script>
