<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">تیکت‌ها</h1>
          <p class="mt-1 text-sm text-text-secondary">مدیریت تیکت‌های ارسالی و دریافتی</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- <RouterLink :to="{ name: 'ticket-queue' }" class="btn-muted-sm">
            صف اپراتور
          </RouterLink> -->
          <RouterLink :to="{ name: 'create-ticket' }" class="btn-action-sm gap-1.5">
            <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            تیکت جدید
          </RouterLink>
        </div>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium"
          :class="activeTab === tab.value
            ? 'bg-secondary text-white'
            : 'bg-surface-muted text-text-secondary hover:bg-surface-hover'"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="mb-5 grid grid-cols-3 gap-3 lg:grid-cols-12">
        <div class="col-span-3 lg:col-span-4">
          <label for="ticket-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
          <input
            id="ticket-search"
            v-model="searchQuery"
            type="search"
            placeholder="موضوع یا کد پیگیری..."
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
            @keydown.enter.prevent="applyFilters"
          />
        </div>
        <div class="lg:col-span-2">
          <label for="ticket-status" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
          <select id="ticket-status" v-model="statusFilter" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus">
            <option value="">همه</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div class="lg:col-span-2">
          <label for="ticket-priority" class="mb-1 block text-xs font-medium text-text-primary">اولویت</label>
          <select id="ticket-priority" v-model="priorityFilter" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus">
            <option value="">همه</option>
            <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div class="lg:col-span-2">
          <label for="ticket-ordering" class="mb-1 block text-xs font-medium text-text-primary">مرتب‌سازی</label>
          <select id="ticket-ordering" v-model="ordering" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus">
            <option v-for="option in orderingOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
        <div class="col-span-3 flex items-end gap-2 lg:col-span-2">
          <button type="button" class="btn-action w-full" :disabled="isFetching" @click="applyFilters">اعمال</button>
        </div>
      </div>

      <TicketsListSkeleton v-if="isInitialLoading" :rows="8" />

      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>
      <template v-else>
        <div v-if="tickets.length === 0" class="rounded-xl border border-border px-4 py-12 text-center text-sm text-text-secondary">
          تیکتی یافت نشد.
        </div>
        <div v-else class="relative space-y-2.5">
          <div
            v-if="isFetching"
            class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
          >
            <TicketsListSkeleton :rows="Math.max(tickets.length, 6)" />
          </div>

          <article
            v-for="ticket in tickets"
            :key="ticket.id"
            class="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-secondary/35 hover:shadow-sm"
            @click="openTicket(ticket.id)"
          >
            <div
              class="absolute inset-y-0 right-0 w-1"
              :class="getStatusAccentClass(ticket.status)"
              aria-hidden="true"
            />

            <div class="flex items-center gap-3 p-3.5 pl-4 sm:p-4">
              <div class="min-w-0 flex-1">
                <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <TicketStatusBadge :status="ticket.status" />
                    <span
                      class="inline-flex rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
                      :class="getTicketPriorityClass(ticket.priority)"
                    >
                      {{ formatTicketPriority(ticket.priority) }}
                    </span>
                    <span class="inline-flex rounded-md bg-surface-muted px-2 py-0.5 text-[0.6875rem] text-text-secondary">
                      {{ formatTargetType(ticket.target_type) }}
                    </span>
                  </div>
                  <time class="shrink-0 text-[0.6875rem] leading-5 text-text-muted">
                    {{ formatTicketDate(ticket.updated_at || ticket.created_at) }}
                  </time>
                </div>

                <h2 class="line-clamp-1 text-sm font-semibold text-text-primary transition-colors group-hover:text-secondary">
                  {{ ticket.subject }}
                </h2>

                <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                  {{ ticket.body }}
                </p>

                <div class="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/50 pt-2 text-[0.6875rem] text-text-muted">
                  <span class="inline-flex max-w-full items-center gap-1">
                    <svg class="size-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="truncate">{{ ticket.ticket_type_name || '—' }}</span>
                  </span>
                  <span class="text-border" aria-hidden="true">·</span>
                  <span class="inline-flex max-w-full items-center gap-1">
                    <svg class="size-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="truncate">{{ ticketDestination(ticket) }}</span>
                  </span>
                  <template v-if="ticket.tracking_code">
                    <span class="text-border" aria-hidden="true">·</span>
                    <span class="dir-ltr font-medium">{{ ticket.tracking_code }}</span>
                  </template>
                </div>
              </div>

              <svg
                class="size-4 shrink-0 text-text-muted opacity-40 transition-opacity group-hover:opacity-100 sm:size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
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
  name: 'tickets',
  layout: 'dashboard'
})

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ticketsService } from '~/api/services/tickets.service'
import type { PaginationMeta } from '~/api/types/auth.types'
import type { Ticket } from '~/api/types/tickets.types'
import { parseTicketsListResponse } from '~/api/utils/api-response'
import AppPagination from '~/components/AppPagination.vue'
import TicketsListSkeleton from '~/components/skeleton/TicketsListSkeleton.vue'
import TicketStatusBadge from '~/components/tickets/TicketStatusBadge.vue'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import {
  TICKET_ORDERING_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
  formatCompactUser,
  formatTargetType,
  formatTicketDate,
  formatTicketPriority,
  getTicketPriorityClass,
} from '~/utils/tickets'

function getStatusAccentClass(status: string): string {
  const accents: Record<string, string> = {
    open: 'bg-amber-400 dark:bg-amber-500',
    in_progress: 'bg-blue-500',
    answered: 'bg-teal-500',
    closed: 'bg-slate-400 dark:bg-slate-500',
  }
  return accents[status] || 'bg-border'
}

function ticketDestination(ticket: Ticket): string {
  if (ticket.current_department_name) return ticket.current_department_name
  if (ticket.target_user) return formatCompactUser(ticket.target_user)
  return '—'
}

const PAGE_SIZE = 15
const router = useRouter()
const authStore = useAuthStore()

type TabValue = 'all' | 'sent' | 'received'

const tabs = [
  { value: 'all' as TabValue, label: 'همه' },
  { value: 'sent' as TabValue, label: 'ارسالی' },
  { value: 'received' as TabValue, label: 'دریافتی' },
]

const tickets = ref<Ticket[]>([])
const pagination = ref<PaginationMeta>({
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  total_items: 0,
  next: null,
  previous: null,
})

const activeTab = ref<TabValue>('all')
const searchQuery = ref('')
const appliedSearch = ref('')
const statusFilter = ref('')
const appliedStatus = ref('')
const priorityFilter = ref('')
const appliedPriority = ref('')
const ordering = ref('-created_at')
const appliedOrdering = ref('-created_at')

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)

const statusOptions = TICKET_STATUS_OPTIONS
const priorityOptions = TICKET_PRIORITY_OPTIONS
const orderingOptions = TICKET_ORDERING_OPTIONS

function switchTab(tab: TabValue) {
  activeTab.value = tab
  fetchTickets(1)
}

async function fetchTickets(page = 1) {
  const isFirstLoad = isInitialLoading.value
  isFetching.value = true
  if (!isFirstLoad) loadError.value = null

  try {
    const params: Record<string, string | number> = {
      page,
      page_size: PAGE_SIZE,
      ordering: appliedOrdering.value,
    }
    if (appliedSearch.value) params.search = appliedSearch.value
    if (appliedStatus.value) params.status = appliedStatus.value
    if (appliedPriority.value) params.priority = appliedPriority.value
    if (activeTab.value === 'received') params.target_type = 'user'

    const response = await ticketsService.listTickets(params)
    const parsed = parseTicketsListResponse(response)
    if (!parsed) {
      loadError.value = 'دریافت لیست تیکت‌ها با خطا مواجه شد.'
      tickets.value = []
      return
    }

    const currentUserId = Number(authStore.user?.id)
    tickets.value = parsed.tickets.filter((ticket) => {
      if (activeTab.value === 'sent') {
        return Number(ticket.requester?.id) === currentUserId
      }
      if (activeTab.value === 'received') {
        return ticket.target_type === 'user' && Number(ticket.target_user?.id) === currentUserId
      }
      return true
    })
    pagination.value = parsed.pagination
    loadError.value = null
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست تیکت‌ها')
    if (isFirstLoad) tickets.value = []
  } finally {
    isFetching.value = false
    isInitialLoading.value = false
  }
}

function applyFilters() {
  appliedSearch.value = searchQuery.value.trim()
  appliedStatus.value = statusFilter.value
  appliedPriority.value = priorityFilter.value
  appliedOrdering.value = ordering.value
  fetchTickets(1)
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.total_pages) return
  fetchTickets(page)
}

function openTicket(id: string) {
  router.push({ name: 'view-ticket', params: { id }, hash: '#conversation' })
}

onMounted(() => {
  fetchTickets()
})
</script>
