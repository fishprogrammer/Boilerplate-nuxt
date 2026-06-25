<template>
  <div
    class="min-h-screen bg-linear-to-br from-secondary-muted via-surface to-primary/5 px-2 py-6 md:px-4 md:py-8 dark:from-brand-darker dark:via-brand-darker dark:to-brand-dark"
    dir="rtl"
  >
    <div class="page-shell mx-auto max-w-3xl">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">تیکت مهمان</h1>
          <p v-if="ticket" class="mt-1 text-sm text-text-secondary">{{ ticket.subject }}</p>
        </div>
        <RouterLink :to="{ name: 'guest-ticket-track' }" class="btn-muted-sm">خروج / پیگیری جدید</RouterLink>
      </div>

      <div v-if="!guestToken" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
        نشست مهمان یافت نشد.
        <RouterLink :to="{ name: 'guest-ticket-track' }" class="mr-2 font-medium underline">ورود با کد پیگیری</RouterLink>
      </div>

      <template v-else>
        <div v-if="isLoading" class="py-12 text-center text-sm text-text-secondary">در حال بارگذاری...</div>
        <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {{ loadError }}
        </div>

        <div v-else-if="ticket" class="page-card">
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <TicketStatusBadge :status="ticket.status" />
            <span class="text-xs text-text-muted dir-ltr">{{ ticket.tracking_code }}</span>
          </div>

          <TicketChat :messages="messages" :media-auth="guestMediaAuth" />

          <form v-if="!isClosed" class="mt-6 space-y-3 border-t border-border/50 pt-5" @submit.prevent="sendMessage">
            <textarea
              v-model="replyBody"
              rows="4"
              maxlength="5000"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus"
              placeholder="پیام شما..."
            />
            <p v-if="replyError" class="text-sm text-red-600 dark:text-red-400">{{ replyError }}</p>
            <div class="flex flex-wrap gap-2">
              <button type="submit" class="btn-action rounded-xl px-5 py-2.5 text-sm" :disabled="isSending || !replyBody.trim()">
                {{ isSending ? 'در حال ارسال...' : 'ارسال پیام' }}
              </button>
              <button type="button" class="btn-muted-sm" :disabled="isClosing" @click="closeTicket">
                {{ isClosing ? 'در حال بستن...' : 'بستن تیکت' }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'guest-ticket-view',
  layout: 'blank',
  standalone: true,
  title: 'ØªÛŒÚ©Øª Ù…Ù‡Ù…Ø§Ù†'
})

import { computed, onMounted, ref } from 'vue'
import { ticketsService } from '~/api/services/tickets.service'
import type { Ticket, TicketMessage } from '~/api/types/tickets.types'
import {
  buildAddTicketMessagePayload,
  parseTicketActionResponse,
  parseTicketDetailResponse,
  parseTicketMessageResponse,
} from '~/api/utils/api-response'
import TicketChat from '~/components/tickets/TicketChat.vue'
import TicketStatusBadge from '~/components/tickets/TicketStatusBadge.vue'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import { clearGuestTicketToken, getGuestTicketToken } from '~/utils/guest-ticket'
import { getGuestTicketMediaAuth } from '~/utils/protected-media'
import { buildInitialTicketMessage, bodyContainsUrl, isTicketClosed } from '~/utils/tickets'

const guestToken = ref(getGuestTicketToken())
const guestMediaAuth = computed(() => getGuestTicketMediaAuth(guestToken.value || ''))
const ticket = ref<Ticket | null>(null)
const messages = ref<TicketMessage[]>([])
const isLoading = ref(true)
const loadError = ref('')
const replyBody = ref('')
const replyError = ref('')
const isSending = ref(false)
const isClosing = ref(false)

const isClosed = computed(() => isTicketClosed(ticket.value))

async function fetchGuestTicket() {
  if (!guestToken.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = ''
  try {
    const response = await ticketsService.getGuestTicket(guestToken.value)
    const parsed = parseTicketDetailResponse(response)
    if (!parsed) {
      loadError.value = 'دریافت تیکت ناموفق بود.'
      clearGuestTicketToken()
      guestToken.value = ''
      return
    }
    ticket.value = parsed
    messages.value = [buildInitialTicketMessage(parsed)]
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت تیکت')
  } finally {
    isLoading.value = false
  }
}

async function sendMessage() {
  if (!guestToken.value || !replyBody.value.trim() || isSending.value) return
  if (bodyContainsUrl(replyBody.value)) {
    replyError.value = 'URL در پیام‌های تیکت مهمان مجاز نیست.'
    return
  }

  isSending.value = true
  replyError.value = ''
  try {
    const response = await ticketsService.addGuestMessage(
      guestToken.value,
      buildAddTicketMessagePayload(replyBody.value),
    )
    const message = parseTicketMessageResponse(response)
    if (message) messages.value.push(message)
    const updated = parseTicketActionResponse(response) || parseTicketDetailResponse(response)
    if (updated) ticket.value = updated
    replyBody.value = ''
  } catch (err: unknown) {
    replyError.value = getApiErrorMessage(err, 'ارسال پیام ناموفق بود')
  } finally {
    isSending.value = false
  }
}

async function closeTicket() {
  if (!guestToken.value || isClosing.value) return
  isClosing.value = true
  try {
    const response = await ticketsService.closeGuestTicket(guestToken.value)
    const updated = parseTicketActionResponse(response) || parseTicketDetailResponse(response)
    if (updated) ticket.value = updated
    showToast({ message: 'تیکت بسته شد.', variant: 'success' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'بستن تیکت ناموفق بود'), variant: 'error' })
  } finally {
    isClosing.value = false
  }
}

onMounted(() => {
  fetchGuestTicket()
})
</script>
