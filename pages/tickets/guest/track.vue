<template>
  <div
    class="flex min-h-screen items-center justify-center bg-linear-to-br from-secondary-muted via-surface to-primary/5 px-2 py-8 md:px-4 md:py-12 dark:from-brand-darker dark:via-brand-darker dark:to-brand-dark"
    dir="rtl"
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-text-primary">پیگیری تیکت مهمان</h1>
        <p class="mt-2 text-sm text-text-secondary">کد پیگیری و موبایل را وارد کنید</p>
      </div>

      <form v-if="step === 'request'" class="page-card shadow-xl dark:shadow-black/20" @submit.prevent="requestOtp">
        <div class="space-y-4">
          <div>
            <label for="tracking-code" class="mb-1 block text-xs font-medium text-text-primary">کد پیگیری</label>
            <input id="tracking-code" v-model="trackingCode" type="text" inputmode="numeric" maxlength="10" dir="ltr" placeholder="۸ رقم" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
            <p v-if="fieldErrors.tracking_code" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.tracking_code }}</p>
          </div>
          <div>
            <label for="guest-phone" class="mb-1 block text-xs font-medium text-text-primary">موبایل</label>
            <input id="guest-phone" v-model="guestPhone" type="tel" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <CaptchaWidget
            purpose="ticket_track"
            :answer="captchaAnswer"
            :error="fieldErrors.captcha_answer"
            @update:answer="captchaAnswer = $event"
            @update:captcha-id="captchaId = $event"
            @clear-error="clearCaptchaError"
          />
        </div>
        <p v-if="submitError" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ submitError }}</p>
        <button type="submit" class="btn-action mt-5 w-full rounded-xl py-3 text-sm font-semibold" :disabled="isSubmitting">
          {{ isSubmitting ? 'در حال ارسال...' : 'دریافت کد' }}
        </button>
      </form>

      <form v-else class="page-card shadow-xl dark:shadow-black/20" @submit.prevent="verifyOtp">
        <p class="mb-4 text-sm text-text-secondary">کد ارسال‌شده را وارد کنید.</p>
        <div class="grid grid-cols-6 gap-1.5" dir="ltr">
          <input
            v-for="(_digit, index) in otpDigits"
            :key="index"
            v-model="otpDigits[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="h-11 w-full rounded-lg border border-border bg-surface-muted text-center text-xl font-semibold outline-none input-focus"
          />
        </div>
        <p v-if="debugCode" class="mt-3 text-xs text-amber-600 dark:text-amber-400">Debug OTP: {{ debugCode }}</p>
        <p v-if="submitError" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ submitError }}</p>
        <button type="submit" class="btn-action mt-5 w-full rounded-xl py-3 text-sm font-semibold" :disabled="isSubmitting">
          {{ isSubmitting ? 'در حال تایید...' : 'تایید و ورود' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm">
        <RouterLink :to="{ name: 'guest-ticket-create' }" class="text-secondary hover:underline">ثبت تیکت جدید</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'guest-ticket-track',
  layout: 'blank',
  standalone: true,
  title: 'Ù¾ÛŒÚ¯ÛŒØ±ÛŒ ØªÛŒÚ©Øª'
})

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CaptchaWidget from '~/components/tickets/CaptchaWidget.vue'
import { ticketsService } from '~/api/services/tickets.service'
import { isApiSuccess, parseGuestTrackRequestResponse, parseGuestTrackVerifyResponse } from '~/api/utils/api-response'
import { extractApiFieldErrors, getApiErrorMessage } from '~/utils/api-error'
import { formatTrackingCodeForApi, isValidTrackingCode } from '~/utils/tickets'
import { setGuestTicketToken } from '~/utils/guest-ticket'

const router = useRouter()

const step = ref<'request' | 'verify'>('request')
const trackingCode = ref('')
const guestPhone = ref('')
const captchaId = ref('')
const captchaAnswer = ref('')
const trackRequestId = ref('')
const debugCode = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const fieldErrors = reactive<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)

function clearCaptchaError() {
  delete fieldErrors.captcha_answer
}

async function requestOtp() {
  submitError.value = ''
  clearCaptchaError()
  delete fieldErrors.tracking_code

  if (!isValidTrackingCode(trackingCode.value)) {
    fieldErrors.tracking_code = 'کد پیگیری باید ۸ رقم عددی باشد (کدهای قدیمی نیز پذیرفته می‌شوند).'
    return
  }

  isSubmitting.value = true
  try {
    const response = await ticketsService.guestTrackRequest({
      tracking_code: formatTrackingCodeForApi(trackingCode.value),
      guest_phone: guestPhone.value.trim(),
      captcha_id: captchaId.value,
      captcha_answer: captchaAnswer.value.trim(),
    })
    if (!isApiSuccess(response)) {
      Object.assign(fieldErrors, extractApiFieldErrors(response))
      submitError.value = getApiErrorMessage(response, 'درخواست پیگیری ناموفق بود')
      return
    }
    const parsed = parseGuestTrackRequestResponse(response)
    trackRequestId.value = parsed.trackRequestId
    debugCode.value = parsed.debugCode || ''
    step.value = 'verify'
  } catch (err: unknown) {
    submitError.value = getApiErrorMessage(err, 'درخواست پیگیری ناموفق بود')
  } finally {
    isSubmitting.value = false
  }
}

async function verifyOtp() {
  submitError.value = ''
  isSubmitting.value = true
  try {
    const response = await ticketsService.guestTrackVerify({
      track_request_id: trackRequestId.value,
      code: otpDigits.value.join(''),
    })
    if (!isApiSuccess(response)) {
      submitError.value = getApiErrorMessage(response, 'تایید کد ناموفق بود')
      return
    }
    const parsed = parseGuestTrackVerifyResponse(response)
    setGuestTicketToken(parsed.guestToken)
    router.push({ name: 'guest-ticket-view' })
  } catch (err: unknown) {
    submitError.value = getApiErrorMessage(err, 'تایید کد ناموفق بود')
  } finally {
    isSubmitting.value = false
  }
}
</script>
