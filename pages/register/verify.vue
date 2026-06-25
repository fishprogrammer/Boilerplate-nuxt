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
        <h1 class="text-2xl font-bold text-text-primary">تایید ثبت‌نام</h1>
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

        <details
          :open="profileDetailsOpen"
          class="mb-6 rounded-xl border border-border bg-surface-muted"
          @toggle="onProfileDetailsToggle"
        >
          <summary class="cursor-pointer px-4 py-3 text-sm font-medium text-text-secondary">
            اطلاعات پروفایل (اختیاری)
          </summary>
          <div class="space-y-4 border-t border-border px-4 py-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="firstName" class="mb-1 block text-xs text-text-muted">نام</label>
                <input
                  id="firstName"
                  v-model="firstName"
                  type="text"
                  autocomplete="given-name"
                  :class="profileInputClass('first_name')"
                  @input="clearProfileFieldError('first_name')"
                />
                <p v-if="profileFieldErrors.first_name" class="mt-1 text-xs text-red-600 dark:text-red-400">
                  {{ profileFieldErrors.first_name }}
                </p>
              </div>
              <div>
                <label for="lastName" class="mb-1 block text-xs text-text-muted">نام خانوادگی</label>
                <input
                  id="lastName"
                  v-model="lastName"
                  type="text"
                  autocomplete="family-name"
                  :class="profileInputClass('last_name')"
                  @input="clearProfileFieldError('last_name')"
                />
                <p v-if="profileFieldErrors.last_name" class="mt-1 text-xs text-red-600 dark:text-red-400">
                  {{ profileFieldErrors.last_name }}
                </p>
              </div>
            </div>
            <div>
              <label for="email" class="mb-1 block text-xs text-text-muted">ایمیل</label>
              <input
                id="email"
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                dir="ltr"
                :class="[profileInputClass('email'), 'text-left']"
                @input="clearProfileFieldError('email')"
              />
              <p v-if="profileFieldErrors.email" class="mt-1 text-xs text-red-600 dark:text-red-400">
                {{ profileFieldErrors.email }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="gender" class="mb-1 block text-xs text-text-muted">جنسیت</label>
                <select
                  id="gender"
                  v-model="gender"
                  :class="profileInputClass('gender')"
                  @change="clearProfileFieldError('gender')"
                >
                  <option value="">—</option>
                  <option value="male">مرد</option>
                  <option value="female">زن</option>
                </select>
                <p v-if="profileFieldErrors.gender" class="mt-1 text-xs text-red-600 dark:text-red-400">
                  {{ profileFieldErrors.gender }}
                </p>
              </div>
              <div>
                <label class="mb-1 block text-xs text-text-muted">تاریخ تولد</label>
                <div
                  class="profile-date-picker"
                  :class="{ 'profile-date-picker--error': !!profileFieldErrors.birth_date }"
                >
                  <DatePicker
                    v-model="birthDate"
                    type="date"
                    format="YYYY-MM-DD"
                    display-format="jYYYY/jMM/jDD"
                    placeholder="انتخاب کنید"
                    input-class="profile-date-picker-input"
                    clearable
                    auto-submit
                    @change="clearProfileFieldError('birth_date')"
                  />
                </div>
                <p v-if="profileFieldErrors.birth_date" class="mt-1 text-xs text-red-600 dark:text-red-400">
                  {{ profileFieldErrors.birth_date }}
                </p>
              </div>
            </div>
          </div>
        </details>

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
          {{ isLoading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام' }}
        </button>
      </form>

      <div v-if="resendTimer > 0" class="mt-4 text-center text-sm text-text-secondary">
        تا {{ resendTimer }} ثانیه دیگر می‌توانید دوباره درخواست کنید
      </div>
      <button
        v-else
        type="button"
        class="mt-4 w-full cursor-pointer text-sm font-semibold text-primary hover:text-primary-dark dark:text-secondary dark:hover:text-secondary"
        @click="goBack"
      >
        ارسال مجدد
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'RegisterVerify',
  layout: 'blank',
  guest: true
})

import { ref, computed, reactive, onMounted } from 'vue'
import { appConfig } from '~/config/app'
import { useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import { buildRegisterVerifyPayload } from '~/api/utils/api-response'
import { hydrateUserSession } from '~/composables/useSession'
import { extractApiFieldErrors, getApiResponseMessage } from '~/utils/api-error'
import { STORAGE_KEYS } from '~/constants/storage'
import type { ComponentPublicInstance } from 'vue'

const PROFILE_FIELDS = ['first_name', 'last_name', 'email', 'gender', 'birth_date'] as const

const router = useRouter()

const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const isLoading = ref(false)
const verifyError = ref('')
const authError = ref<string | null>(null)
const resendTimer = ref(0)
const registerId = ref('')
const phoneNumber = ref('')

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const gender = ref<'male' | 'female' | ''>('')
const birthDate = ref('')
const profileDetailsOpen = ref(false)
const profileFieldErrors = reactive<Record<string, string>>({})

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
  const focusIndex = Math.min(pasted.length, 5)
  otpInputs.value[focusIndex]?.focus()
}

function clearProfileFieldErrors() {
  for (const key of Object.keys(profileFieldErrors)) {
    delete profileFieldErrors[key]
  }
}

function clearProfileFieldError(field: string) {
  delete profileFieldErrors[field]
}

function onProfileDetailsToggle(event: Event) {
  profileDetailsOpen.value = (event.target as HTMLDetailsElement).open
}

function profileInputClass(field: string): string {
  const base =
    'w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none input-focus'
  return profileFieldErrors[field]
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-500/20`
    : `${base} border-border`
}

function applyApiErrors(source: unknown) {
  authError.value = null
  verifyError.value = ''
  clearProfileFieldErrors()

  const fieldErrors = extractApiFieldErrors(source)

  if (fieldErrors.code) {
    verifyError.value = fieldErrors.code
  }

  let hasProfileError = false
  for (const field of PROFILE_FIELDS) {
    if (fieldErrors[field]) {
      profileFieldErrors[field] = fieldErrors[field]
      hasProfileError = true
    }
  }

  if (hasProfileError) {
    profileDetailsOpen.value = true
  }

  const handledFields = new Set<string>(['code', ...PROFILE_FIELDS])
  const otherFieldMessages = Object.entries(fieldErrors)
    .filter(([key]) => !handledFields.has(key))
    .map(([, message]) => message)

  if (otherFieldMessages.length > 0) {
    authError.value = otherFieldMessages.join(' | ')
    return
  }

  if (!verifyError.value && !hasProfileError) {
    authError.value = getApiResponseMessage(source, 'تایید ثبت‌نام ناموفق بود')
  }
}

const handleSubmit = async () => {
  if (!registerId.value) {
    authError.value = 'شناسه ثبت‌نام یافت نشد. لطفاً از صفحه ثبت‌نام دوباره اقدام کنید.'
    return
  }
  if (!isOtpComplete.value) {
    verifyError.value = 'لطفاً تمام رقم‌های کد را وارد کنید'
    return
  }

  authError.value = null
  verifyError.value = ''
  clearProfileFieldErrors()
  isLoading.value = true

  try {
    const code = otpDigits.value.join('')
    const payload = buildRegisterVerifyPayload(registerId.value, code, {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      gender: gender.value || undefined,
      birth_date: birthDate.value || undefined,
    })

    const response = await authService.verifyRegister(payload) as {
      status: string
      message?: string
      data?: { access?: string; refresh?: string; user?: { id?: number | string } }
    }

    if (response.status === 'success' && response.data) {
      const { access, refresh, user } = response.data

      if (access) localStorage.setItem(STORAGE_KEYS.TOKEN, access)
      if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
      if (user?.id != null) localStorage.setItem(STORAGE_KEYS.USER_ID, String(user.id))

      sessionStorage.removeItem('register_id')
      sessionStorage.removeItem('register_expires_at')
      sessionStorage.removeItem('register_debug_code')
      sessionStorage.removeItem('register_phone_number')

      await hydrateUserSession()
      await router.replace('/')
    } else {
      applyApiErrors(response)
    }
  } catch (err: unknown) {
    applyApiErrors(err)
    console.error('Register verify error:', err)
  } finally {
    isLoading.value = false
  }
}

const goBack = async () => {
  sessionStorage.removeItem('register_id')
  sessionStorage.removeItem('register_expires_at')
  sessionStorage.removeItem('register_debug_code')
  sessionStorage.removeItem('register_phone_number')
  await router.push('/register')
}

function startExpiryTimer(seconds = 60) {
  resendTimer.value = seconds
  const timer = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

onMounted(() => {
  registerId.value = sessionStorage.getItem('register_id') || ''
  phoneNumber.value = sessionStorage.getItem('register_phone_number') || ''

  if (!phoneNumber.value || !registerId.value) {
    router.replace({ name: 'Register' })
    return
  }

  const storedDebugCode = sessionStorage.getItem('register_debug_code')
  if (storedDebugCode) {
    otpDigits.value = storedDebugCode.replace(/\D/g, '').slice(0, 6).split('').concat(Array(6).fill('')).slice(0, 6)
  }

  startExpiryTimer(60)

  setTimeout(() => {
    if (!storedDebugCode) otpInputs.value[0]?.focus()
  }, 100)
})
</script>

<style scoped>
.profile-date-picker :deep(.vpd-main) {
  display: block;
  width: 100%;
}

.profile-date-picker :deep(.vpd-input-group) {
  height: 2.625rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--color-surface);
}

.profile-date-picker :deep(.vpd-input-group input),
.profile-date-picker :deep(.profile-date-picker-input) {
  height: 100%;
  border: 0;
  border-radius: 0;
  padding: 0 0.75rem;
  line-height: 1.25rem;
  font-size: 0.875rem;
}

.profile-date-picker--error :deep(.vpd-input-group) {
  border-color: rgb(248 113 113);
}

.profile-date-picker :deep(.vpd-icon-btn) {
  height: 100%;
  padding: 0 0.625rem;
}
</style>
