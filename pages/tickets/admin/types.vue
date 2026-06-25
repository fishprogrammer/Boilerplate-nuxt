<template>
  <div class="page-shell">
    <div class="page-card md:p-5">
      <div class="mb-4 border-b border-border/50 pb-3">
        <h1 class="text-lg font-semibold text-text-primary md:text-xl">موضوعات تیکت</h1>
        <p class="mt-0.5 text-xs text-text-secondary md:text-sm">مدیریت دسته‌بندی موضوع/دسته</p>
      </div>

      <form
        class="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-surface-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4"
        @submit.prevent="createType"
      >
        <input
          v-model="newType.name"
          type="text"
          placeholder="نام"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus"
        />
        <input
          v-model="newType.slug"
          type="text"
          placeholder="slug"
          dir="ltr"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus"
        />
        <input
          v-model="newType.description"
          type="text"
          placeholder="توضیح (اختیاری)"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus sm:col-span-2 lg:col-span-1"
        />
        <button type="submit" class="btn-action-sm w-full sm:col-span-2 lg:col-span-1" :disabled="isCreating">
          {{ isCreating ? 'در حال افزودن…' : 'افزودن نوع' }}
        </button>
      </form>

      <TicketTypesSkeleton v-if="isLoading" :count="6" />

      <div
        v-else-if="loadError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ loadError }}
      </div>

      <div v-else-if="!types.length" class="rounded-xl border border-border px-4 py-10 text-center text-sm text-text-secondary">
        موضوعی ثبت نشده است.
      </div>

      <div v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <article
          v-for="type in types"
          :key="type.id"
          class="flex items-start justify-between gap-2 rounded-xl border border-border bg-surface-muted/15 p-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p class="text-sm font-semibold text-text-primary">{{ type.name }}</p>
              <span
                class="inline-flex shrink-0 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
                :class="type.is_active ? activeBadgeClass : inactiveBadgeClass"
              >
                {{ type.is_active ? 'فعال' : 'غیرفعال' }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-xs text-text-muted dir-ltr">{{ type.slug }}</p>
            <p v-if="type.description" class="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
              {{ type.description }}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            aria-label="حذف"
            title="حذف"
            @click="openDeleteModal(type)"
          >
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </article>
      </div>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف موضوع"
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
  name: 'ticket-types',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { ticketsService } from '~/api/services/tickets.service'
import type { TicketType } from '~/api/types/tickets.types'
import { isApiSuccess, parseTicketTypesListResponse } from '~/api/utils/api-response'
import ConfirmModal from '~/components/ConfirmModal.vue'
import TicketTypesSkeleton from '~/components/skeleton/TicketTypesSkeleton.vue'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage, isNetworkError } from '~/utils/api-error'

const activeBadgeClass =
  'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
const inactiveBadgeClass =
  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'

const types = ref<TicketType[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isCreating = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const typeToDelete = ref<TicketType | null>(null)
const newType = ref({ name: '', slug: '', description: '' })

const deleteModalMessage = computed(() => {
  const type = typeToDelete.value
  if (!type) return 'آیا از حذف این موضوع مطمئن هستید؟'
  return `آیا از حذف موضوع «${type.name}» مطمئن هستید؟`
})

function showActionError(err: unknown, fallback: string) {
  if (isNetworkError(err)) return
  showToast({ message: getApiErrorMessage(err, fallback), variant: 'error' })
}

async function fetchTypes() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await ticketsService.listTypes({ page_size: 100 })
    types.value = parseTicketTypesListResponse(response)?.types ?? []
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت انواع')
  } finally {
    isLoading.value = false
  }
}

async function createType() {
  if (!newType.value.name.trim() || !newType.value.slug.trim() || isCreating.value) return
  isCreating.value = true
  try {
    const response = await ticketsService.createType({
      name: newType.value.name.trim(),
      slug: newType.value.slug.trim(),
      description: newType.value.description.trim(),
      is_active: true,
    })
    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ایجاد نوع ناموفق بود'), variant: 'error' })
      return
    }
    newType.value = { name: '', slug: '', description: '' }
    await fetchTypes()
  } catch (err: unknown) {
    showActionError(err, 'ایجاد نوع ناموفق بود')
  } finally {
    isCreating.value = false
  }
}

function openDeleteModal(type: TicketType) {
  typeToDelete.value = type
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!typeToDelete.value || isDeleting.value) return

  isDeleting.value = true
  try {
    await ticketsService.deleteType(typeToDelete.value.id)
    types.value = types.value.filter((item) => item.id !== typeToDelete.value!.id)
    showDeleteModal.value = false
    typeToDelete.value = null
    showToast({ message: 'موضوع با موفقیت حذف شد.', variant: 'success' })
  } catch (err: unknown) {
    showActionError(err, 'حذف ناموفق بود')
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchTypes)
</script>
