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
        <h1 class="text-2xl font-bold text-text-primary">ورود به {{ appConfig.name }}</h1>
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
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </span>
            <input
              id="mobile"
              v-model="mobile"
              type="tel"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              maxlength="11"
              class="w-full rounded-xl border border-border bg-surface-muted py-3 pr-12 pl-4 text-left text-base tracking-wide text-text-primary outline-none placeholder:text-text-muted input-focus focus:bg-surface"
              :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!fieldError }"
              @input="onMobileInput"
            />
          </div>
          <p v-if="fieldError" class="mt-2 text-sm text-red-600 dark:text-red-400">
            {{ fieldError }}
          </p>
        </div>

        <div v-if="captcha && captchaImageUrl" class="mb-6 rounded-2xl border border-border bg-surface-muted p-4">
          <div class="relative mb-4">
            <img
              v-if="captchaImageUrl"
              :src="captchaImageUrl"
              alt="Captcha"
              class="h-32 w-full rounded-xl border border-border object-contain"
            />
            <button
              v-if="captchaImageUrl"
              type="button"
              @click="refreshCaptcha"
              :disabled="isRefreshing"
              class="absolute right-2 top-2 cursor-pointer rounded-lg bg-white/90 p-2 shadow-md hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800/90 dark:hover:bg-slate-800"
              title="کپچا را دوباره بارگذاری کن"
            >
              <svg
                :class="{ 'animate-spin': isRefreshing }"
                class="h-5 w-5 text-primary dark:text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <input
            v-model="captchaAnswer"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            dir="ltr"
            autocomplete="off"
            placeholder="پاسخ کپچا"
            class="w-full rounded-xl border border-border bg-surface py-3 px-4 text-base text-center text-text-primary outline-none placeholder:text-text-muted input-focus"
            :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!captchaError }"
            @input="onCaptchaInput"
          />
          <p v-if="captchaError" class="mt-2 text-sm text-red-600 dark:text-red-400">
            {{ captchaError }}
          </p>
        </div>
        <p v-if="debugCode" class="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <span class="font-semibold">Debug OTP:</span> {{ debugCode }}
        </p>
        <CaptchaLoadErrorAlert
          v-if="authError"
          :message="authError"
          :show-retry="captchaLoadFailed"
          :loading="isRefreshing"
          @retry="refreshCaptcha"
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
          {{ isLoading ? 'در حال ورود...' : 'ورود' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-text-secondary">
        <RouterLink
          to="/register"
          class="font-semibold text-text-secondary hover:text-primary dark:text-secondary dark:hover:text-secondary"
        >
        حساب کاربری ندارید؟ ثبت نام 
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'Login',
  layout: 'blank',
  guest: true
})

import { ref, onMounted } from 'vue'
import { appConfig } from '~/config/app'
import { useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import { loginMissingIdMessage, parseLoginStepResponse } from '~/api/utils/api-response'
import CaptchaLoadErrorAlert from '~/components/CaptchaLoadErrorAlert.vue'
import { hydrateUserSession } from '~/composables/useSession'
import { STORAGE_KEYS } from '~/constants/storage'
import { extractApiFieldErrors, getApiResponseMessage } from '~/utils/api-error'
import {
  CAPTCHA_IMAGE_LOAD_FAILED_MESSAGE,
  CAPTCHA_LOAD_FAILED_MESSAGE,
  CAPTCHA_NOT_LOADED_MESSAGE,
  shouldClearCaptchaLoadError,
} from '~/utils/captcha'

const MOBILE_REGEX = /^09\d{9}$/

const router = useRouter()

const mobile = ref('')
const fieldError = ref('')
const captchaError = ref('')
const authError = ref<string | null>(null)
const isLoading = ref(false)
const isRefreshing = ref(false)

const captcha = ref<any>(null)
const captchaId = ref('')
const captchaAnswer = ref('')
const captchaImageUrl = ref('')
const captchaLoadFailed = ref(false)
const debugCode = ref('')

function markCaptchaLoadFailed(message: string) {
  captchaLoadFailed.value = true
  authError.value = message
}

function clearCaptchaLoadError() {
  captchaLoadFailed.value = false
  if (shouldClearCaptchaLoadError(authError.value)) {
    authError.value = null
  }
}

const loadCaptchaImage = async (id: string) => {
  try {
    const blob = await authService.getCaptchaImage(id)
    if (captchaImageUrl.value) {
      URL.revokeObjectURL(captchaImageUrl.value)
    }
    captchaImageUrl.value = URL.createObjectURL(blob)
    clearCaptchaLoadError()
  } catch (err) {
    console.warn('Failed to fetch captcha image:', err)
    captchaImageUrl.value = ''
    markCaptchaLoadFailed(CAPTCHA_IMAGE_LOAD_FAILED_MESSAGE)
  }
}

const refreshCaptcha = async () => {
  if (isRefreshing.value) return
  try {
    isRefreshing.value = true
    clearCaptchaLoadError()
    const data = await authService.getCaptcha('login')
    captcha.value = (data as any).data ? (data as any).data : data
    captchaId.value = captcha.value?.captcha_id || ''
    captchaAnswer.value = ''

    if (captchaId.value) {
      await loadCaptchaImage(captchaId.value)
    } else {
      markCaptchaLoadFailed(CAPTCHA_LOAD_FAILED_MESSAGE)
    }
    console.debug('Captcha refreshed:', captcha.value)
  } catch (err) {
    console.warn('Failed to refresh captcha:', err)
    markCaptchaLoadFailed(CAPTCHA_LOAD_FAILED_MESSAGE)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  try {
    isRefreshing.value = true
    const data = await authService.getCaptcha('login')
    captcha.value = (data as any).data ? (data as any).data : data
    captchaId.value = captcha.value?.captcha_id || ''
    if (captchaId.value) {
      await loadCaptchaImage(captchaId.value)
    } else {
      markCaptchaLoadFailed(CAPTCHA_LOAD_FAILED_MESSAGE)
    }
  } catch (err) {
    console.warn('Failed to fetch captcha:', err)
    markCaptchaLoadFailed(CAPTCHA_LOAD_FAILED_MESSAGE)
  } finally {
    isRefreshing.value = false
  }
})

const onMobileInput = () => {
  mobile.value = mobile.value.replace(/\D/g, '').slice(0, 11)
  fieldError.value = ''
}

const onCaptchaInput = () => {
  captchaAnswer.value = captchaAnswer.value.replace(/\D/g, '')
  captchaError.value = ''
}

function applyApiErrors(source: unknown) {
  authError.value = null
  captchaError.value = ''

  const fieldErrors = extractApiFieldErrors(source)

  if (fieldErrors.phone_number) {
    fieldError.value = fieldErrors.phone_number
  }

  if (fieldErrors.captcha) {
    captchaError.value = fieldErrors.captcha
    void refreshCaptcha()
  }

  const otherFieldMessages = Object.entries(fieldErrors)
    .filter(([key]) => key !== 'phone_number' && key !== 'captcha')
    .map(([, message]) => message)

  if (otherFieldMessages.length > 0) {
    authError.value = otherFieldMessages.join(' | ')
    return
  }

  if (!fieldErrors.phone_number && !fieldErrors.captcha) {
    authError.value = getApiResponseMessage(source, 'درخواست ورود با خطا مواجه شد.')
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
  if (!captcha.value && !captchaId.value) {
    markCaptchaLoadFailed(CAPTCHA_NOT_LOADED_MESSAGE)
    return
  }
  if (!captchaAnswer.value) {
    authError.value = 'لطفاً پاسخ کپچا را وارد کنید.'
    return
  }

  authError.value = null
  captchaError.value = ''
  isLoading.value = true

  try {
    const payload = {
      phone_number: mobile.value,
      captcha_id: captchaId.value || captcha.value?.captcha_id,
      captcha_answer: captchaAnswer.value,
      debug: true,
    }

    const response = await authService.login(payload)
    const parsed = parseLoginStepResponse(response)

    if (!parsed.ok) {
      applyApiErrors(response)
      return
    }

    sessionStorage.setItem('phone_number', mobile.value)

    if (parsed.debugCode) {
      debugCode.value = parsed.debugCode
      sessionStorage.setItem('debug_code', parsed.debugCode)
    }

    // ورود مستقیم با توکن (بدون مرحله verify)
    if (parsed.access) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, parsed.access)
      if (parsed.refresh) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, parsed.refresh)
      }
      sessionStorage.removeItem('login_id')
      sessionStorage.removeItem('debug_code')
      sessionStorage.removeItem('phone_number')
      await hydrateUserSession()
      await router.replace('/')
      return
    }

    // Swagger: verify حتماً login_id می‌خواهد — data خالی = anti-enumeration یا حساب/دیباگ
    if (!parsed.loginId) {
      authError.value = loginMissingIdMessage(parsed)
      return
    }

    sessionStorage.setItem('login_id', parsed.loginId)
    if (parsed.expiresAt) {
      sessionStorage.setItem('login_expires_at', parsed.expiresAt)
    } else {
      sessionStorage.removeItem('login_expires_at')
    }

    await router.replace({ name: 'Verify' })
  } catch (err: unknown) {
    applyApiErrors(err)
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>
