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
        <h1 class="text-2xl font-bold text-text-primary">ثبت‌نام در {{ appConfig.name }}</h1>
        <p class="mt-2 text-sm text-text-secondary">
          شماره موبایل خود را وارد کنید
        </p>
      </div>

      <form
        class="page-card shadow-xl shadow-gray-200/50 lg:p-8 dark:shadow-black/20"
        @submit.prevent="handleSubmit"
      >
        <div class="mb-6">
          <label for="mobile" class="mb-2 block text-sm font-medium text-text-secondary">
            شماره موبایل
          </label>
          <input
            id="mobile"
            v-model="mobile"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            maxlength="11"
            dir="ltr"
            class="w-full rounded-xl border border-border bg-surface-muted py-3 px-4 text-left text-base tracking-wide text-text-primary outline-none placeholder:text-text-muted input-focus focus:bg-surface"
            :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!fieldError }"
            @input="onMobileInput"
          />
          <p v-if="fieldError" class="mt-2 text-sm text-red-600 dark:text-red-400">
            {{ fieldError }}
          </p>

          <div class="mt-4">
            <CaptchaWidget
              ref="captchaWidgetRef"
              variant="auth"
              purpose="register"
              :answer="captchaAnswer"
              :error="captchaError"
              @update:answer="captchaAnswer = $event"
              @update:captcha-id="captchaId = $event"
              @clear-error="captchaError = ''"
            />
          </div>
        </div>

        <p v-if="debugCode" class="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <span class="font-semibold">Debug OTP:</span> {{ debugCode }}
        </p>
        <CaptchaLoadErrorAlert
          v-if="authError"
          :message="authError"
        />

        <button
          type="submit"
          :disabled="isLoading"
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
          {{ isLoading ? 'در حال ارسال...' : 'ثبت‌نام' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-text-secondary">
        <NuxtLink
          to="/login"
          class="font-semibold text-text-secondary hover:text-primary dark:text-secondary dark:hover:text-secondary"
        >
          قبلاً ثبت‌نام کرده‌اید؟ وارد شوید
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'Register',
  layout: 'blank',
  guest: true,
})

import { nextTick, ref } from 'vue'
import { appConfig } from '~/config/app'
import { authService } from '~/api/services/auth.service'
import { parseRegisterStepResponse, registerMissingIdMessage } from '~/api/utils/api-response'
import CaptchaLoadErrorAlert from '~/components/CaptchaLoadErrorAlert.vue'
import CaptchaWidget from '~/components/tickets/CaptchaWidget.vue'
import { extractApiFieldErrors, getApiErrorCode, getApiErrorMessage } from '~/utils/api-error'
import { CAPTCHA_NOT_LOADED_MESSAGE } from '~/utils/captcha'

const MOBILE_REGEX = /^09\d{9}$/

const router = useRouter()

const mobile = ref('')
const fieldError = ref('')
const captchaError = ref('')
const authError = ref<string | null>(null)
const isLoading = ref(false)

const captchaWidgetRef = ref<InstanceType<typeof CaptchaWidget> | null>(null)
const captchaId = ref('')
const captchaAnswer = ref('')
const debugCode = ref('')

const onMobileInput = () => {
  const wasIncomplete = mobile.value.length < 11
  mobile.value = mobile.value.replace(/\D/g, '').slice(0, 11)
  fieldError.value = ''
  if (wasIncomplete && MOBILE_REGEX.test(mobile.value)) {
    nextTick(() => captchaWidgetRef.value?.focusAnswer())
  }
}

async function refreshCaptcha() {
  captchaAnswer.value = ''
  captchaError.value = ''
  await captchaWidgetRef.value?.refresh()
}

function applyApiErrors(source: unknown) {
  authError.value = null
  captchaError.value = ''

  const fieldErrors = extractApiFieldErrors(source)
  const code = getApiErrorCode(source)

  if (fieldErrors.phone_number) {
    fieldError.value = fieldErrors.phone_number
  }

  const captchaFieldError = fieldErrors.captcha || fieldErrors.captcha_answer
  if (captchaFieldError || code === 'invalid_captcha' || code === 'captcha_required') {
    captchaError.value =
      captchaFieldError ||
      getApiErrorMessage(source, 'پاسخ کپچا نادرست است. دوباره تلاش کنید.')
    void refreshCaptcha()
  }

  const otherFieldMessages = Object.entries(fieldErrors)
    .filter(([key]) => !['phone_number', 'captcha', 'captcha_answer'].includes(key))
    .map(([, message]) => message)

  if (otherFieldMessages.length > 0) {
    authError.value = otherFieldMessages.join(' | ')
    return
  }

  if (!fieldErrors.phone_number && !captchaFieldError && code !== 'invalid_captcha' && code !== 'captcha_required') {
    authError.value = getApiErrorMessage(source, 'درخواست ثبت‌نام با خطا مواجه شد.')
  }
}

const validateMobile = (): boolean => {
  if (!mobile.value) {
    fieldError.value = 'شماره موبایل الزامی است'
    return false
  }
  if (!MOBILE_REGEX.test(mobile.value)) {
    fieldError.value = 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'
    return false
  }
  fieldError.value = ''
  return true
}

const handleSubmit = async () => {
  if (!validateMobile()) return
  if (!captchaId.value) {
    authError.value = CAPTCHA_NOT_LOADED_MESSAGE
    return
  }
  if (!captchaAnswer.value.trim()) {
    captchaError.value = 'لطفاً پاسخ کپچا را وارد کنید.'
    return
  }

  authError.value = null
  captchaError.value = ''
  isLoading.value = true

  try {
    const payload = {
      phone_number: mobile.value,
      captcha_id: captchaId.value,
      captcha_answer: captchaAnswer.value.trim(),
      ...(import.meta.dev ? { debug: true } : {}),
    }

    const response = await authService.register(payload)
    const parsed = parseRegisterStepResponse(response)

    if (!parsed.ok) {
      applyApiErrors(response)
      return
    }

    sessionStorage.setItem('register_phone_number', mobile.value)

    if (parsed.debugCode) {
      debugCode.value = parsed.debugCode
      sessionStorage.setItem('register_debug_code', parsed.debugCode)
    }

    if (!parsed.registerId) {
      authError.value = registerMissingIdMessage(parsed)
      return
    }

    sessionStorage.setItem('register_id', parsed.registerId)
    if (parsed.expiresAt) {
      sessionStorage.setItem('register_expires_at', parsed.expiresAt)
    } else {
      sessionStorage.removeItem('register_expires_at')
    }

    await router.replace({ name: 'RegisterVerify' })
  } catch (err: unknown) {
    applyApiErrors(err)
    console.error('Register error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>
