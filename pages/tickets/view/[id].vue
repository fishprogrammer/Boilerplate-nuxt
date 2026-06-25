<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h1 class="text-xl font-semibold text-text-primary">جزئیات تیکت</h1>
          <p v-if="ticket" class="mt-1 truncate text-sm text-text-secondary">{{ ticket.subject }}</p>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <TicketViewSkeleton v-if="isLoading" />

      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        {{ loadError }}
      </div>

      <template v-else-if="ticket">
        <div class="mb-5 overflow-hidden rounded-xl border border-border bg-surface-muted/20">
          <div class="flex flex-wrap items-center gap-3 border-b border-border/60 bg-surface-muted/35 px-3 py-2">
            <span class="inline-flex items-center gap-1.5">
              <span class="text-[11px] text-text-muted">وضعیت:</span>
              <TicketStatusBadge :status="ticket.status" />
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="text-[11px] text-text-muted">اولویت:</span>
              <span
                class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                :class="getTicketPriorityClass(ticket.priority)"
              >
                {{ formatTicketPriority(ticket.priority) }}
              </span>
            </span>
            <span class="hidden h-3 w-px shrink-0 bg-border sm:inline" aria-hidden="true" />
            <span class="rounded-md bg-surface px-2 py-0.5 text-xs text-text-secondary">
              {{ formatTargetType(ticket.target_type) }}
            </span>
            <span
              v-if="ticket.tracking_code"
              class="mr-auto truncate text-xs font-medium text-text-secondary dir-ltr"
              v-tooltip="ticket.tracking_code"
            >
              {{ ticket.tracking_code }}
            </span>
          </div>

          <dl class="flex flex-nowrap items-start gap-4 overflow-x-auto p-3">
            <div class="min-w-18 shrink-0">
              <dt class="whitespace-nowrap text-[11px] leading-tight text-text-muted">دسته</dt>
              <dd class="mt-0.5 truncate text-xs font-medium text-text-primary">{{ ticket.ticket_type_name || '—' }}</dd>
            </div>
            <div class="min-w-18 shrink-0">
              <dt class="whitespace-nowrap text-[11px] leading-tight text-text-muted">دپارتمان</dt>
              <dd class="mt-0.5 truncate text-xs font-medium text-text-primary">{{ ticket.current_department_name || '—' }}</dd>
            </div>
            <div v-if="ticket.target_user" class="min-w-18 shrink-0">
              <dt class="whitespace-nowrap text-[11px] leading-tight text-text-muted">گیرنده</dt>
              <dd class="mt-0.5 truncate text-xs font-medium text-text-primary">{{ formatCompactUser(ticket.target_user) }}</dd>
            </div>
            <div v-if="ticket.assigned_to" class="min-w-18 shrink-0">
              <dt class="whitespace-nowrap text-[11px] leading-tight text-text-muted">مسئول</dt>
              <dd class="mt-0.5 truncate text-xs font-medium text-text-primary">{{ formatCompactUser(ticket.assigned_to) }}</dd>
            </div>
            <div class="min-w-18 shrink-0">
              <dt class="whitespace-nowrap text-[11px] leading-tight text-text-muted">درخواست‌دهنده</dt>
              <dd class="mt-0.5 truncate text-xs font-medium text-text-primary">{{ ticket.requester ? formatCompactUser(ticket.requester) : '—' }}</dd>
            </div>
            <div class="min-w-18 shrink-0">
              <dt class="whitespace-nowrap text-[11px] leading-tight text-text-muted">ایجاد</dt>
              <dd class="mt-0.5 whitespace-nowrap text-xs font-medium text-text-primary">{{ formatTicketDate(ticket.created_at) }}</dd>
            </div>
            <div class="min-w-18 shrink-0">
              <dt class="whitespace-nowrap text-[11px] leading-tight text-text-muted">آخرین بروزرسانی</dt>
              <dd class="mt-0.5 whitespace-nowrap text-xs font-medium text-text-primary">
                {{ formatTicketDate(ticket.updated_at && ticket.updated_at !== ticket.created_at ? ticket.updated_at : ticket.created_at) }}
              </dd>
            </div>
          </dl>
        </div>

        <div v-if="showDepartmentOperatorActions" class="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <select
            v-if="canRefer"
            v-model="referDepartmentId"
            class="min-w-0 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus sm:max-w-xs sm:flex-1"
          >
            <option value="">انتخاب دپارتمان برای ارجاع</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
          </select>
          <button
            v-if="canRefer"
            type="button"
            class="btn-muted-sm shrink-0"
            :disabled="actionLoading || !referDepartmentId"
            @click="confirmRefer"
          >
            ارجاع
          </button>
          <button v-if="canRelease" type="button" class="btn-muted-sm" :disabled="actionLoading" @click="releaseTicket">
            آزادسازی
          </button>
          <button
            v-if="showTakeButton"
            type="button"
            :class="takeDisabled ? 'btn-muted-sm cursor-not-allowed opacity-60' : 'btn-action-sm'"
            :disabled="actionLoading || takeDisabled"
            @click="openTakeConfirmModal"
          >
            به عهده گرفتن تیکت
          </button>
        </div>

        <div v-if="canEscalate" class="mb-6 space-y-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select v-model="escalateDepartmentId" class="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus">
              <option value="">انتخاب دپارتمان برای ارتقا</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
            <button type="button" class="btn-muted-sm shrink-0" :disabled="actionLoading || !escalateDepartmentId" @click="confirmEscalate">ارتقا به دپارتمان</button>
          </div>
        </div>

        <section id="conversation" class="mb-6 scroll-mt-24">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">گفتگو</h2>
          <TicketChat :messages="messages" />
        </section>

        <form v-if="!isClosed" class="mb-6 space-y-3 border-t border-border/50 pt-5" @submit.prevent="sendMessage">
          <label for="reply-body" class="block text-sm font-medium text-text-primary">پاسخ</label>
          <textarea
            id="reply-body"
            v-model="replyBody"
            rows="4"
            maxlength="5000"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
          />

          <div>
            <input
              ref="replyFileInputRef"
              type="file"
              multiple
              class="sr-only"
              :disabled="isUploadingReplyFiles || replyFiles.length >= 3"
              @change="onReplyFilesSelected"
            />
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="btn-muted-sm gap-1.5"
                :disabled="isUploadingReplyFiles || replyFiles.length >= 3"
                @click="openReplyFilePicker"
              >
                <svg v-if="!isUploadingReplyFiles" class="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <svg v-else class="size-3.5 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ isUploadingReplyFiles ? 'در حال آپلود...' : 'پیوست (اختیاری)' }}
              </button>
              <span v-if="replyFiles.length >= 3" class="text-xs text-text-muted">حداکثر ۳ فایل</span>
            </div>
            <div v-if="replyFiles.length" class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="file in replyFiles"
                :key="file.id"
                class="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-surface-muted/60 px-2 py-0.5 text-xs text-text-primary"
              >
                <span class="truncate">{{ file.name }}</span>
                <button
                  type="button"
                  class="shrink-0 text-red-600 hover:text-red-700 dark:text-red-400"
                  aria-label="حذف پیوست"
                  @click="removeReplyFile(file.id)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <p v-if="replyError" class="text-sm text-red-600 dark:text-red-400">{{ replyError }}</p>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              class="btn-muted-sm text-red-600 dark:text-red-400"
              :disabled="actionLoading"
              @click="showCloseConfirmModal = true"
            >
              بستن تیکت
            </button>
            <button type="submit" class="btn-action-sm" :disabled="isSending || !replyBody.trim()">
              {{ isSending ? 'در حال ارسال...' : 'ارسال پیام' }}
            </button>
          </div>
        </form>
      </template>
    </div>

    <ConfirmModal
      v-model="showTakeConfirmModal"
      title="به عهده گرفتن تیکت"
      message="آیا می‌خواهید این تیکت را به عهده بگیرید؟ پس از تأیید، مسئولیت رسیدگی به شما واگذار می‌شود."
      confirm-label="بله، به عهده می‌گیرم"
      cancel-label="انصراف"
      :loading="actionLoading"
      @confirm="confirmTakeTicket"
    />

    <ConfirmModal
      v-model="showCloseConfirmModal"
      title="بستن تیکت"
      message="آیا از بستن این تیکت مطمئن هستید؟ پس از بستن، امکان ارسال پیام جدید وجود ندارد."
      confirm-label="بله، بستن تیکت"
      cancel-label="انصراف"
      variant="danger"
      :loading="actionLoading"
      @confirm="confirmCloseTicket"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'view-ticket',
  layout: 'dashboard',
})

import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mediaService } from '~/api/services/media.service'
import { ticketsService } from '~/api/services/tickets.service'
import type { Ticket, TicketAttachment, TicketDepartment, TicketEvent, TicketMessage } from '~/api/types/tickets.types'
import {
  buildAddTicketMessagePayload,
  parseTicketActionResponse,
  parseTicketAttachmentsResponse,
  parseTicketDepartmentsListResponse,
  parseTicketDetailResponse,
  parseTicketEventsResponse,
  parseTicketMessageResponse,
} from '~/api/utils/api-response'
import TicketChat from '~/components/tickets/TicketChat.vue'
import TicketStatusBadge from '~/components/tickets/TicketStatusBadge.vue'
import TicketViewSkeleton from '~/components/skeleton/TicketViewSkeleton.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import {
  buildTicketThread,
  canShowEscalateAction,
  canShowReferAction,
  canShowReleaseAction,
  canShowTakeButton,
  isTakeActionDisabled,
  formatCompactUser,
  formatTargetType,
  formatTicketDate,
  formatTicketPriority,
  getTicketPriorityClass,
  isTicketClosed,
  mergeTicketMessageAttachments,
} from '~/utils/tickets'

const route = useRoute()
const authStore = useAuthStore()
const { hasPermission, PERMISSIONS } = usePermissions()

const ticket = ref<Ticket | null>(null)
const messages = ref<TicketMessage[]>([])
const ticketAttachments = ref<TicketAttachment[]>([])
const events = ref<TicketEvent[]>([])
const departments = ref<TicketDepartment[]>([])

const isLoading = ref(true)
const loadError = ref('')
const replyBody = ref('')
const replyMediaIds = ref<string[]>([])
const replyFiles = ref<Array<{ id: string; name: string }>>([])
const replyFileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingReplyFiles = ref(false)
const replyError = ref('')
const isSending = ref(false)
const actionLoading = ref(false)
const referDepartmentId = ref('')
const escalateDepartmentId = ref('')
const showTakeConfirmModal = ref(false)
const showCloseConfirmModal = ref(false)

const currentUserId = computed(() => authStore.user?.id ?? null)
const isClosed = computed(() => isTicketClosed(ticket.value))
const canOperateTickets = computed(() => hasPermission(PERMISSIONS.TICKETS.CHANGE))
const showDepartmentOperatorActions = computed(
  () => ticket.value?.target_type === 'department' && canOperateTickets.value,
)
const showTakeButton = computed(() => ticket.value ? canShowTakeButton(ticket.value, currentUserId.value) : false)
const takeDisabled = computed(() => ticket.value ? isTakeActionDisabled(ticket.value, currentUserId.value) : false)
const canRelease = computed(() => ticket.value ? canShowReleaseAction(ticket.value, currentUserId.value) : false)
const canRefer = computed(() => ticket.value ? canShowReferAction(ticket.value) : false)
const canEscalate = computed(() => ticket.value ? canShowEscalateAction(ticket.value) : false)

function shouldFetchTicketEvents(): boolean {
  return canOperateTickets.value
}

function shouldFetchAvailableDepartments(t: Ticket): boolean {
  if (isTicketClosed(t)) return false
  if (canOperateTickets.value && t.target_type === 'department') return true
  return canShowEscalateAction(t)
}

function scrollToConversationIfNeeded() {
  if (route.hash !== '#conversation' || !ticket.value) return
  nextTick(() => {
    document.getElementById('conversation')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function rebuildMessages(extraMessages: TicketMessage[] = []) {
  if (!ticket.value) {
    messages.value = []
    return
  }
  messages.value = mergeTicketMessageAttachments(
    buildTicketThread(ticket.value, events.value, extraMessages),
    ticketAttachments.value,
    ticket.value.id,
  )
}

async function fetchTicket() {
  const id = String(route.params.id || '')
  if (!id) {
    loadError.value = 'شناسه تیکت نامعتبر است.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = ''
  events.value = []
  departments.value = []
  ticketAttachments.value = []

  try {
    const ticketRes = await ticketsService.getTicket(id)
    const parsedTicket = parseTicketDetailResponse(ticketRes)
    if (!parsedTicket) {
      loadError.value = 'تیکت یافت نشد یا دسترسی ندارید.'
      ticket.value = null
      return
    }
    ticket.value = parsedTicket

    const secondaryRequests: Promise<unknown>[] = [
      ticketsService.listAttachments(id),
    ]
    if (shouldFetchTicketEvents()) {
      secondaryRequests.push(ticketsService.listEvents(id))
    }
    if (shouldFetchAvailableDepartments(parsedTicket)) {
      secondaryRequests.push(ticketsService.listAvailableDepartments())
    }

    const secondaryResults = await Promise.all(secondaryRequests)
    let resultIndex = 0
    ticketAttachments.value = parseTicketAttachmentsResponse(secondaryResults[resultIndex++]) ?? []

    if (shouldFetchTicketEvents()) {
      events.value = parseTicketEventsResponse(secondaryResults[resultIndex++]) ?? []
    }
    if (shouldFetchAvailableDepartments(parsedTicket)) {
      departments.value = parseTicketDepartmentsListResponse(secondaryResults[resultIndex++])?.departments ?? []
    }

    rebuildMessages()
    scrollToConversationIfNeeded()
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } }
    loadError.value = axiosErr.response?.status === 404
      ? 'تیکت یافت نشد یا دسترسی ندارید.'
      : getApiErrorMessage(err, 'خطا در دریافت تیکت')
  } finally {
    isLoading.value = false
  }
}

async function onReplyFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (!files.length) return

  isUploadingReplyFiles.value = true
  replyError.value = ''
  try {
    for (const file of files.slice(0, 3 - replyMediaIds.value.length)) {
      try {
        const response = await mediaService.uploadMedia(file)
        const payload = (response as { data?: { id?: string; original_name?: string } })?.data ?? response
        const record = payload as { id?: string; original_name?: string }
        if (record.id) {
          replyMediaIds.value.push(record.id)
          replyFiles.value.push({ id: record.id, name: record.original_name || file.name })
        }
      } catch (err: unknown) {
        replyError.value = getApiErrorMessage(err, 'خطا در آپلود فایل')
      }
    }
  } finally {
    isUploadingReplyFiles.value = false
    input.value = ''
  }
}

function openReplyFilePicker() {
  replyFileInputRef.value?.click()
}

function removeReplyFile(id: string) {
  replyMediaIds.value = replyMediaIds.value.filter((mediaId) => mediaId !== id)
  replyFiles.value = replyFiles.value.filter((file) => file.id !== id)
}

async function sendMessage() {
  if (!ticket.value || !replyBody.value.trim() || isSending.value) return
  isSending.value = true
  replyError.value = ''
  try {
    const response = await ticketsService.addMessage(
      ticket.value.id,
      buildAddTicketMessagePayload(replyBody.value, replyMediaIds.value),
    )
    const updated = parseTicketActionResponse(response) || parseTicketDetailResponse(response)
    if (updated) ticket.value = updated

    if (shouldFetchTicketEvents()) {
      const eventsRes = await ticketsService.listEvents(ticket.value.id)
      events.value = parseTicketEventsResponse(eventsRes) ?? []
      const attachmentsRes = await ticketsService.listAttachments(ticket.value.id)
      ticketAttachments.value = parseTicketAttachmentsResponse(attachmentsRes) ?? []
      rebuildMessages()
    } else {
      const newMessage = parseTicketMessageResponse(response)
      if (newMessage) {
        rebuildMessages([newMessage])
      } else {
        const attachmentsRes = await ticketsService.listAttachments(ticket.value.id)
        ticketAttachments.value = parseTicketAttachmentsResponse(attachmentsRes) ?? []
        rebuildMessages()
      }
    }
    replyBody.value = ''
    replyMediaIds.value = []
    replyFiles.value = []
    showToast({ message: 'پیام ارسال شد.', variant: 'success' })
  } catch (err: unknown) {
    replyError.value = getApiErrorMessage(err, 'ارسال پیام ناموفق بود')
  } finally {
    isSending.value = false
  }
}

async function runAction(action: () => Promise<unknown>, successMessage: string) {
  if (!ticket.value || actionLoading.value) return
  actionLoading.value = true
  try {
    const response = await action()
    const updated = parseTicketActionResponse(response)
    if (updated) ticket.value = updated
    showToast({ message: successMessage, variant: 'success' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'عملیات ناموفق بود'), variant: 'error' })
  } finally {
    actionLoading.value = false
  }
}

function openTakeConfirmModal() {
  if (!ticket.value || takeDisabled.value) return
  showTakeConfirmModal.value = true
}

async function confirmTakeTicket() {
  if (!ticket.value || takeDisabled.value || actionLoading.value) return
  actionLoading.value = true
  try {
    const response = await ticketsService.takeTicket(ticket.value.id)
    const updated = parseTicketActionResponse(response)
    if (updated) ticket.value = updated
    showTakeConfirmModal.value = false
    showToast({ message: 'تیکت به عهده گرفته شد.', variant: 'success' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'به عهده گرفتن تیکت ناموفق بود'), variant: 'error' })
  } finally {
    actionLoading.value = false
  }
}

function releaseTicket() {
  if (!ticket.value) return
  runAction(() => ticketsService.releaseTicket(ticket.value!.id), 'تیکت آزاد شد.')
}

async function confirmCloseTicket() {
  if (!ticket.value || actionLoading.value) return
  actionLoading.value = true
  try {
    const response = await ticketsService.closeTicket(ticket.value.id)
    const updated = parseTicketActionResponse(response)
    if (updated) ticket.value = updated
    showCloseConfirmModal.value = false
    showToast({ message: 'تیکت بسته شد.', variant: 'success' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'بستن تیکت ناموفق بود'), variant: 'error' })
  } finally {
    actionLoading.value = false
  }
}

function confirmRefer() {
  if (!ticket.value || !referDepartmentId.value) return
  runAction(
    () => ticketsService.referTicket(ticket.value!.id, { department: referDepartmentId.value }),
    'تیکت ارجاع شد.',
  )
}

function confirmEscalate() {
  if (!ticket.value || !escalateDepartmentId.value) return
  runAction(
    () => ticketsService.escalateTicket(ticket.value!.id, { department: escalateDepartmentId.value }),
    'تیکت به دپارتمان ارجاع شد.',
  )
}

watch(
  () => route.params.id,
  () => {
    fetchTicket()
  },
)

watch(
  () => route.hash,
  () => {
    scrollToConversationIfNeeded()
  },
)

onMounted(() => {
  fetchTicket()
})
</script>
