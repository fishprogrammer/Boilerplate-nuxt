<template>
  <div
    class="flex min-h-screen items-center justify-center bg-linear-to-br from-secondary-muted via-surface to-primary/5 px-2 py-8 md:px-4 md:py-12 dark:from-brand-darker dark:via-brand-darker dark:to-brand-dark"
    dir="rtl"
  >
    <div class="w-full max-w-lg">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-text-primary">ثبت تیکت مهمان</h1>
        <p class="mt-2 text-sm text-text-secondary">بدون نیاز به ورود، تیکت پشتیبانی ثبت کنید</p>
      </div>

      <form class="page-card shadow-xl dark:shadow-black/20" @submit.prevent="handleSubmit">
        <div v-if="!hasConfig" class="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          شناسه موضوع و دپارتمان مهمان در env تنظیم نشده (`NUXT_PUBLIC_GUEST_TICKET_TYPE_ID`, `NUXT_PUBLIC_GUEST_DEPARTMENT_ID`).
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="guest-name" class="mb-1 block text-xs font-medium text-text-primary">نام</label>
            <input id="guest-name" v-model="guestName" type="text" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <div>
            <label for="guest-email" class="mb-1 block text-xs font-medium text-text-primary">ایمیل</label>
            <input id="guest-email" v-model="guestEmail" type="email" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <div>
            <label for="guest-phone" class="mb-1 block text-xs font-medium text-text-primary">موبایل</label>
            <input id="guest-phone" v-model="guestPhone" type="tel" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
        </div>

        <div class="mt-4">
          <label for="subject" class="mb-1 block text-xs font-medium text-text-primary">موضوع</label>
          <input id="subject" v-model="subject" type="text" maxlength="255" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>

        <div class="mt-4">
          <label for="body" class="mb-1 block text-xs font-medium text-text-primary">متن</label>
          <textarea id="body" v-model="body" rows="5" maxlength="5000" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>

        <div class="mt-4">
          <CaptchaWidget
            purpose="ticket"
            :answer="captchaAnswer"
            :error="fieldErrors.captcha_answer || fieldErrors.captcha"
            @update:answer="captchaAnswer = $event"
            @update:captcha-id="captchaId = $event"
            @clear-error="clearCaptchaError"
          />
        </div>

        <p v-if="submitError" class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{{ submitError }}</p>

        <div v-if="createdTrackingCode" class="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-4 dark:border-teal-900/40 dark:bg-teal-950/30">
          <p class="text-sm font-medium text-teal-800 dark:text-teal-200">تیکت ثبت شد.</p>
          <p class="mt-2 text-sm text-teal-700 dark:text-teal-300">کد پیگیری:</p>
          <p class="mt-1 text-lg font-bold tracking-widest text-teal-900 dir-ltr dark:text-teal-100">{{ createdTrackingCode }}</p>
          <RouterLink :to="{ name: 'guest-ticket-track' }" class="btn-action mt-4 inline-flex rounded-xl px-4 py-2 text-sm">
            پیگیری تیکت
          </RouterLink>
        </div>

        <button v-else type="submit" class="btn-action mt-5 w-full rounded-xl py-3 text-sm font-semibold" :disabled="isSubmitting || !hasConfig">
          {{ isSubmitting ? 'در حال ثبت...' : 'ثبت تیکت' }}
        </button>

        <p class="mt-4 text-center text-sm">
          <RouterLink :to="{ name: 'Login' }" class="text-secondary hover:underline">ورود کاربران</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'guest-ticket-create',
  layout: 'blank',
  standalone: true,
  title: 'ØªÛŒÚ©Øª Ù…Ù‡Ù…Ø§Ù†'
})

import { reactive, ref } from 'vue'
import CaptchaWidget from '~/components/tickets/CaptchaWidget.vue'
import { ticketsService } from '~/api/services/tickets.service'
import { isApiSuccess, parseGuestTicketCreateResponse } from '~/api/utils/api-response'
import { extractApiFieldErrors, getApiErrorMessage } from '~/utils/api-error'
import { getGuestTicketConfig, hasGuestTicketConfig } from '~/utils/guest-ticket'
import { bodyContainsUrl } from '~/utils/tickets'

const hasConfig = hasGuestTicketConfig()
const guestConfig = getGuestTicketConfig()

const guestName = ref('')
const guestEmail = ref('')
const guestPhone = ref('')
const subject = ref('')
const body = ref('')
const captchaId = ref('')
const captchaAnswer = ref('')
const fieldErrors = reactive<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)
const createdTrackingCode = ref('')

function clearCaptchaError() {
  delete fieldErrors.captcha
  delete fieldErrors.captcha_answer
}

async function handleSubmit() {
  submitError.value = ''
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key])

  if (!guestName.value.trim() || !guestPhone.value.trim() || !subject.value.trim() || !body.value.trim()) {
    submitError.value = 'فیلدهای الزامی را تکمیل کنید.'
    return
  }
  if (bodyContainsUrl(body.value)) {
    submitError.value = 'URL در پیام‌های تیکت مهمان مجاز نیست.'
    return
  }
  if (!captchaId.value || !captchaAnswer.value.trim()) {
    fieldErrors.captcha_answer = 'پاسخ کپچا الزامی است.'
    return
  }

  isSubmitting.value = true
  try {
    const response = await ticketsService.createGuestTicket({
      ticket_type: guestConfig.ticketTypeId,
      current_department: guestConfig.departmentId,
      guest_name: guestName.value.trim(),
      guest_email: guestEmail.value.trim(),
      guest_phone: guestPhone.value.trim(),
      subject: subject.value.trim(),
      body: body.value.trim(),
      priority: 'medium',
      captcha_id: captchaId.value,
      captcha_answer: captchaAnswer.value.trim(),
    })
    if (!isApiSuccess(response)) {
      Object.assign(fieldErrors, extractApiFieldErrors(response))
      submitError.value = getApiErrorMessage(response, 'ثبت تیکت ناموفق بود')
      return
    }
    const parsed = parseGuestTicketCreateResponse(response)
    createdTrackingCode.value = parsed.trackingCode
  } catch (err: unknown) {
    Object.assign(fieldErrors, extractApiFieldErrors(err))
    submitError.value = getApiErrorMessage(err, 'ثبت تیکت ناموفق بود')
  } finally {
    isSubmitting.value = false
  }
}
</script>
