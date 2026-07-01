<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/50" @click="close" />
        <div class="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" dir="rtl">
          <h2 class="text-lg font-bold text-text-primary">نمایش کلید لایسنس</h2>
          <p class="mt-2 text-sm text-text-secondary">
            کد تأیید به شماره موبایل شما ارسال می‌شود. کلید کامل فقط یک‌بار نمایش داده می‌شود.
          </p>

          <div v-if="!revealedKey" class="mt-4 space-y-3">
            <div v-if="step === 'request'">
              <button type="button" class="btn-action w-full" :disabled="loading" @click="requestOtp">
                {{ loading ? 'در حال ارسال...' : 'ارسال کد تأیید' }}
              </button>
            </div>
            <div v-else>
              <label class="mb-1 block text-xs font-medium">کد تأیید</label>
              <input
                v-model="otpCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                class="w-full rounded-lg border border-border bg-app-bg px-3 py-2 text-center text-lg tracking-widest outline-none input-focus dir-ltr"
              />
              <p v-if="debugCode" class="mt-2 text-xs text-amber-600">Debug OTP: {{ debugCode }}</p>
              <button type="button" class="btn-action mt-3 w-full" :disabled="loading || !otpCode.trim()" @click="verifyOtp">
                {{ loading ? 'در حال بررسی...' : 'نمایش کلید' }}
              </button>
            </div>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>

          <div v-else class="mt-4">
            <p class="mb-2 text-xs text-amber-700 dark:text-amber-300">این کلید دیگر نمایش داده نمی‌شود — همین حالا کپی کنید.</p>
            <div class="rounded-xl border border-border bg-surface-muted/40 p-3 font-mono text-sm dir-ltr break-all">
              {{ revealedKey }}
            </div>
            <button type="button" class="btn-action mt-3 w-full" @click="copyKey">
              {{ copied ? 'کپی شد' : 'کپی کلید' }}
            </button>
          </div>

          <button type="button" class="btn-muted mt-4 w-full" @click="close">بستن</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { getApiErrorMessage } from '~/utils/api-error'

const props = defineProps<{
  modelValue: boolean
  licenseId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { requestRevealOtp, verifyRevealOtp } = useLicensing()

const step = ref<'request' | 'verify'>('request')
const loading = ref(false)
const error = ref('')
const revealId = ref('')
const debugCode = ref('')
const otpCode = ref('')
const revealedKey = ref('')
const copied = ref(false)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) reset()
  },
)

function reset() {
  step.value = 'request'
  loading.value = false
  error.value = ''
  revealId.value = ''
  debugCode.value = ''
  otpCode.value = ''
  revealedKey.value = ''
  copied.value = false
}

function close() {
  emit('update:modelValue', false)
}

async function requestOtp() {
  loading.value = true
  error.value = ''
  try {
    const result = await requestRevealOtp(props.licenseId)
    if (!result?.reveal_id) {
      error.value = 'ارسال کد ناموفق بود'
      return
    }
    revealId.value = result.reveal_id
    debugCode.value = result.debug_code || ''
    step.value = 'verify'
  } catch (err) {
    error.value = getApiErrorMessage(err, 'محدودیت درخواست — کمی بعد تلاش کنید')
  } finally {
    loading.value = false
  }
}

async function verifyOtp() {
  loading.value = true
  error.value = ''
  try {
    const result = await verifyRevealOtp(props.licenseId, revealId.value, otpCode.value.trim())
    if (!result?.license_key) {
      error.value = 'کد تأیید نامعتبر است'
      return
    }
    revealedKey.value = result.license_key
  } catch (err) {
    error.value = getApiErrorMessage(err, 'تأیید ناموفق بود')
  } finally {
    loading.value = false
  }
}

async function copyKey() {
  try {
    await navigator.clipboard.writeText(revealedKey.value)
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>
