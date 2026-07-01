<template>
  <div
    class="flex min-h-screen items-center justify-center bg-linear-to-br from-secondary-muted via-surface to-primary/5 px-2 py-8 md:px-4 md:py-12 dark:from-brand-darker dark:via-brand-darker dark:to-brand-dark"
    dir="rtl"
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div
        class="mx-auto mb-4 flex h-16 w-16  items-center justify-center overflow-hidden"
        >
          <img src="/logo.png" :alt="`لوگوی ${appConfig.name}`" class="size-full object-contain p-1.5" />
        </div>
        <h1 class="text-2xl font-bold text-text-primary">تایید کد</h1>
        <p class="mt-2 text-sm text-text-secondary">
          کد ۶ رقمی ارسال‌شده را وارد کنید
        </p>
        <p
          v-if="phoneNumber"
          dir="ltr"
          class="mt-2 text-base font-semibold tracking-wide text-text-primary"
        >
          {{ maskedPhoneNumber }}
        </p>
      </div>

      <form
        class="page-card shadow-xl shadow-gray-200/50 lg:p-8 dark:shadow-black/20"
        @submit.prevent="handleSubmit"
      >
        <div class="mb-6">
          <label class="mb-4 block text-sm font-medium text-text-secondary">
            کد تایید
          </label>
          <div class="grid grid-cols-6 gap-1.5 sm:gap-2" dir="ltr">
            <input
              v-for="(_digit, index) in otpDigits"
              :key="index"
              v-model="otpDigits[index]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              :ref="(el) => setOtpRef(el, index)"
              class="h-11 w-full rounded-lg border border-border bg-surface-muted text-center text-xl font-semibold text-text-primary outline-none input-focus focus:bg-surface sm:h-14 sm:rounded-xl sm:text-2xl"
              :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!verifyError }"
              @input="onOtpInput(index)"
              @keydown="onOtpKeydown($event, index)"
              @paste="onOtpPaste"
            />
          </div>
          <p v-if="verifyError" class="mt-3 text-sm text-red-600 dark:text-red-400">
            {{ verifyError }}
          </p>
        </div>

        <p v-if="authError" class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {{ authError }}
        </p>

        <button
          type="submit"
          :disabled="isLoading || !isOtpComplete"
          class="btn-action w-full rounded-xl py-3.5 text-sm font-semibold shadow-sm"
        >
          <svg v-if="isLoading" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isLoading ? 'در حال تایید...' : 'تایید کد' }}
        </button>

        <button
          v-if="resendTimer <= 0"
          type="button"
          @click="goBack"
          class="btn-muted mt-4 w-full rounded-xl py-3 text-sm font-semibold"
        >
          بازگشت
        </button>
      </form>

      <div v-if="resendTimer > 0" class="mt-4 text-center text-sm text-text-secondary">
        می‌توانید در {{ resendTimer }} ثانیه دیگر دوباره درخواست کنید
      </div>
      <button
        v-else-if="loginId"
        type="button"
        @click="resendOtp"
        :disabled="isResending"
        class="mt-4 w-full cursor-pointer text-sm font-semibold text-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-60 dark:text-secondary"
      >
        ارسال دوباره کد
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'Verify',
  layout: 'blank',
  guest: true
})

import { ref, computed, onMounted } from 'vue'
import { appConfig } from '~/config/app'
import { useRouter } from 'vue-router'
import type { ComponentPublicInstance } from 'vue'
import { authService } from '~/api/services/auth.service'
import { buildVerifyOtpPayload } from '~/api/utils/api-response'
import { hydrateUserSession } from '~/composables/useSession'
import { STORAGE_KEYS } from '~/constants/storage'

const router = useRouter()

const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const isLoading = ref(false)
const isResending = ref(false)
const verifyError = ref('')
const authError = ref<string | null>(null)
const resendTimer = ref(0)
const loginId = ref('')
const phoneNumber = ref('')

const isOtpComplete = computed(() => otpDigits.value.every((d) => d !== ''))

const maskedPhoneNumber = computed(() => {
  const digits = phoneNumber.value.replace(/\D/g, '')
  if (digits.length < 8) return '****'
  return `${digits.slice(0, 4)}***${digits.slice(-4)}`
})

const setOtpRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el instanceof HTMLInputElement) {
    otpInputs.value[index] = el
  }
}

const onOtpInput = (index: number) => {
  otpDigits.value[index] = otpDigits.value[index].replace(/\D/g, '')
  if (otpDigits.value[index] && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }
  verifyError.value = ''
}

const onOtpKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowLeft' && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }
}

const onOtpPaste = (event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6)
  if (!pasted) return
  event.preventDefault()
  otpDigits.value = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
  verifyError.value = ''
  otpInputs.value[Math.min(pasted.length, 5)]?.focus()
}

const handleSubmit = async () => {
  if (!loginId.value) {
    authError.value = 'شناسه ورود یافت نشد. لطفاً از صفحه ورود دوباره اقدام کنید.'
    return
  }
  if (!isOtpComplete.value) {
    verifyError.value = 'لطفاً تمام رقم‌های کد را وارد کنید'
    return
  }

  authError.value = null
  verifyError.value = ''
  isLoading.value = true

  try {
    const code = otpDigits.value.join('')
    const payload = buildVerifyOtpPayload(loginId.value, code)

    const response = await authService.verifyOtp(payload) as {
      status: string
      message?: string
      data?: { access?: string; refresh?: string; user?: { id?: number | string } }
    }

    if (response.status === 'success' && response.data) {
      const { access, refresh, user } = response.data

      if (access) localStorage.setItem(STORAGE_KEYS.TOKEN, access)
      if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
      if (user?.id != null) localStorage.setItem(STORAGE_KEYS.USER_ID, String(user.id))

      sessionStorage.removeItem('login_id')
      sessionStorage.removeItem('login_expires_at')
      sessionStorage.removeItem('debug_code')
      sessionStorage.removeItem('phone_number')

      await hydrateUserSession()
      await router.replace('/panel')
    } else {
      authError.value = response.message || 'تایید کد ناموفق بود'
    }
  } catch (err: any) {
    if (err.errors && typeof err.errors === 'object' && Object.keys(err.errors).length > 0) {
      const errorMessages = Object.values(err.errors).filter((msg): msg is string => typeof msg === 'string')
      authError.value = errorMessages.join(' | ') || err?.message || 'خطا در تایید کد'
    } else {
      authError.value = err?.message || 'خطا در تایید کد'
    }
    console.error('Verify error:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = async () => {
  sessionStorage.removeItem('login_id')
  sessionStorage.removeItem('login_expires_at')
  sessionStorage.removeItem('debug_code')
  sessionStorage.removeItem('phone_number')
  await router.push('/login')
}

const resendOtp = async () => {
  if (!loginId.value || isResending.value) return

  isResending.value = true
  try {
    await authService.resendOtp(loginId.value)
    authError.value = null
    verifyError.value = ''
    otpDigits.value = ['', '', '', '', '', '']

    resendTimer.value = 60
    const timer = setInterval(() => {
      resendTimer.value--
      if (resendTimer.value <= 0) clearInterval(timer)
    }, 1000)

    otpInputs.value[0]?.focus()
  } catch (err: any) {
    authError.value = err?.message || 'خطا در ارسال دوباره کد'
    console.error('Resend error:', err)
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  loginId.value = sessionStorage.getItem('login_id') || ''
  phoneNumber.value = sessionStorage.getItem('phone_number') || ''

  if (!phoneNumber.value || !loginId.value) {
    router.replace({ name: 'Login' })
    return
  }

  const storedDebugCode = sessionStorage.getItem('debug_code')
  if (storedDebugCode) {
    otpDigits.value = storedDebugCode
      .replace(/\D/g, '')
      .slice(0, 6)
      .split('')
      .concat(Array(6).fill(''))
      .slice(0, 6)
  }

  resendTimer.value = 60
  const timer = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) clearInterval(timer)
  }, 1000)

  setTimeout(() => {
    if (!storedDebugCode) otpInputs.value[0]?.focus()
  }, 100)
})
</script>
