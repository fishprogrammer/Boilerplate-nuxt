<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">صف اپراتور</h1>
          <p class="mt-1 text-sm text-text-secondary">تیکت‌های دپارتمان — FIFO</p>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div class="md:col-span-4">
          <label for="queue-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
          <input
            id="queue-search"
            v-model="searchQuery"
            type="search"
            placeholder="موضوع..."
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
            @keydown.enter.prevent="applyFilters"
          />
        </div>
        <div class="md:col-span-3">
          <label for="queue-status" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
          <select id="queue-status" v-model="statusFilter" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus">
            <option value="">همه</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div class="flex items-end gap-2 md:col-span-2">
          <button type="button" class="btn-action w-full" :disabled="isFetching" @click="applyFilters">اعمال</button>
        </div>
      </div>

      <TicketQueueSkeleton v-if="isInitialLoading" :rows="8" />

      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>
      <template v-else>
        <div v-if="tickets.length === 0" class="rounded-xl border border-border px-4 py-12 text-center text-sm text-text-secondary">
          تیکتی در صف نیست.
        </div>
        <div v-else class="relative space-y-3">
          <div
            v-if="isFetching"
            class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
          >
            <TicketQueueSkeleton :rows="Math.max(tickets.length, 6)" />
          </div>

          <article
            v-for="ticket in tickets"
            :key="ticket.id"
            class="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-surface-muted/30 transition-all hover:border-secondary/35 hover:shadow-sm"
            @click="openTicket(ticket.id)"
          >
            <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0 flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <TicketStatusBadge :status="ticket.status" />
                  <span class="text-xs text-text-muted">{{ formatTicketDate(ticket.department_received_at || ticket.created_at) }}</span>
                </div>
                <h2 class="text-sm font-semibold text-text-primary transition-colors group-hover:text-secondary">{{ ticket.subject }}</h2>
                <p class="mt-1 text-sm text-text-secondary">{{ ticket.current_department_name || '—' }}</p>
                <p class="mt-1 text-xs text-text-muted">{{ formatCompactUser(ticket.requester) }}</p>
              </div>
              <div class="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  v-if="canShowTakeAction(ticket, currentUserId)"
                  type="button"
                  class="btn-muted-sm"
                  @click.stop="takeTicket(ticket.id)"
                >
                  برداشت
                </button>
                <svg
                  class="size-4 shrink-0 text-text-muted opacity-40 transition-opacity group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
          </article>
        </div>

        <AppPagination
          :page="pagination.page"
          :total-pages="pagination.total_pages"
          :disabled="isFetching"
          @update:page="goToPage"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'ticket-queue',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ticketsService } from '~/api/services/tickets.service'
import type { PaginationMeta } from '~/api/types/auth.types'
import type { Ticket } from '~/api/types/tickets.types'
import { parseTicketsListResponse } from '~/api/utils/api-response'
import AppPagination from '~/components/AppPagination.vue'
import TicketQueueSkeleton from '~/components/skeleton/TicketQueueSkeleton.vue'
import TicketStatusBadge from '~/components/tickets/TicketStatusBadge.vue'
import { showToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import {
  TICKET_STATUS_OPTIONS,
  canShowTakeAction,
  formatCompactUser,
  formatTicketDate,
} from '~/utils/tickets'

const PAGE_SIZE = 15
const router = useRouter()
const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id ?? null)

const tickets = ref<Ticket[]>([])
const pagination = ref<PaginationMeta>({
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  total_items: 0,
  next: null,
  previous: null,
})

const searchQuery = ref('')
const appliedSearch = ref('')
const statusFilter = ref('open')
const appliedStatus = ref('open')

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)

const statusOptions = TICKET_STATUS_OPTIONS

async function fetchQueue(page = 1) {
  const isFirstLoad = isInitialLoading.value
  isFetching.value = true
  if (!isFirstLoad) loadError.value = null

  try {
    const params: Record<string, string | number> = {
      page,
      page_size: PAGE_SIZE,
      ordering: 'department_received_at',
    }
    if (appliedSearch.value) params.search = appliedSearch.value
    if (appliedStatus.value) params.status = appliedStatus.value

    const response = await ticketsService.listQueue(params)
    const parsed = parseTicketsListResponse(response)
    if (!parsed) {
      loadError.value = 'دریافت صف اپراتور با خطا مواجه شد.'
      tickets.value = []
      return
    }

    tickets.value = parsed.tickets
    pagination.value = parsed.pagination
    loadError.value = null
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت صف اپراتور')
    if (isFirstLoad) tickets.value = []
  } finally {
    isFetching.value = false
    isInitialLoading.value = false
  }
}

function applyFilters() {
  appliedSearch.value = searchQuery.value.trim()
  appliedStatus.value = statusFilter.value
  fetchQueue(1)
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.total_pages) return
  fetchQueue(page)
}

function openTicket(id: string) {
  router.push({ name: 'view-ticket', params: { id }, hash: '#conversation' })
}

async function takeTicket(id: string) {
  try {
    await ticketsService.takeTicket(id)
    showToast({ message: 'تیکت برداشت شد.', variant: 'success' })
    router.push({ name: 'view-ticket', params: { id }, hash: '#conversation' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'برداشت تیکت ناموفق بود'), variant: 'error' })
  }
}

onMounted(() => {
  fetchQueue()
})
</script>
