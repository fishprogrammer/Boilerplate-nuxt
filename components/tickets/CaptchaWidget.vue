<template>
  <!-- Auth login / register / referral — full-width row: captcha + answer + refresh -->
  <div v-if="variant === 'auth'" class="w-full space-y-2">
    <div dir="ltr" class="flex w-full items-stretch gap-2">
      <div class="flex min-w-0 flex-1 items-stretch">
        <div
          v-if="loading && !imageUrl"
          class="h-14 min-w-0 flex-[1.15_1_0%] animate-pulse rounded-l-xl rounded-r-none border border-border border-r-0 bg-[#f6f8fa] dark:bg-surface"
          :class="{ 'border-red-400': !!error }"
          aria-hidden="true"
        />
        <div
          v-else-if="imageUrl"
          class="flex h-14 min-w-0 flex-[1.15_1_0%] items-center justify-center overflow-hidden rounded-l-xl rounded-r-none border border-border border-r-0 bg-[#f6f8fa] px-1 dark:bg-surface"
          :class="{ 'border-red-400': !!error }"
        >
          <img
            :src="imageUrl"
            alt=""
            class="max-h-full max-w-full object-contain"
          />
        </div>
        <div
          v-else
          class="flex h-14 min-w-0 flex-[1.15_1_0%] items-center rounded-l-xl rounded-r-none border border-border border-r-0 bg-surface-muted px-2"
          :class="{ 'border-red-400': !!error }"
        >
          <CaptchaLoadErrorAlert
            :message="CAPTCHA_LOAD_FAILED_MESSAGE"
            show-retry
            variant="compact"
            :loading="loading"
            @retry="refresh"
          />
        </div>

        <input
          ref="answerInputRef"
          :value="answerModel"
          type="tel"
          inputmode="numeric"
          pattern="[0-9]*"
          dir="ltr"
          autocomplete="off"
          placeholder="پاسخ کپچا"
          class="h-14 min-w-0 flex-1 rounded-l-none rounded-r-xl border border-border border-l-0 bg-surface-muted px-3 text-center text-base tracking-wide text-text-primary outline-none placeholder:text-text-muted input-focus focus:bg-surface"
          :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!error }"
          @input="onAnswerInput"
        />
      </div>

      <button
        v-if="imageUrl || loading"
        type="button"
        class="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-muted text-text-muted outline-none transition-colors hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-secondary"
        :class="{ 'border-red-400': !!error }"
        :disabled="loading"
        aria-label="بارگذاری مجدد کپچا"
        v-tooltip="'بارگذاری مجدد'"
        @click="refresh"
      >
        <svg
          :class="{ 'animate-spin': loading }"
          class="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </div>

  <!-- Default — guest tickets, referral funnel, etc. -->
  <div v-else class="rounded-xl border border-border bg-surface-muted p-4">
    <div class="mb-3 flex items-center justify-end">
      <button
        type="button"
        class="flex size-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-secondary"
        :disabled="loading"
        aria-label="بارگذاری مجدد کپچا"
        v-tooltip="'بارگذاری مجدد'"
        @click="refresh"
      >
        <svg
          :class="{ 'animate-spin': loading }"
          class="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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

    <div v-if="loading && !imageUrl" class="py-8 text-center text-sm text-text-muted">
      در حال بارگذاری...
    </div>

    <div v-else-if="imageUrl" class="flex flex-col gap-3">
      <img
        :src="imageUrl"
        alt=""
        class="mx-auto max-h-16 rounded-lg border border-border bg-white object-contain"
      />
      <input
        ref="answerInputRef"
        :value="answerModel"
        type="tel"
        inputmode="numeric"
        pattern="[0-9]*"
        dir="ltr"
        autocomplete="off"
        placeholder="کد امنیتی"
        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
        :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!error }"
        @input="onAnswerInput"
      />
      <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <CaptchaLoadErrorAlert
      v-else
      :message="CAPTCHA_LOAD_FAILED_MESSAGE"
      show-retry
      variant="muted"
      :loading="loading"
      @retry="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { authService } from '~/api/services/auth.service'
import type { CaptchaPurpose } from '~/api/types/auth.types'
import CaptchaLoadErrorAlert from '~/components/CaptchaLoadErrorAlert.vue'
import { CAPTCHA_LOAD_FAILED_MESSAGE, parseCaptchaChallenge } from '~/utils/captcha'

const props = withDefaults(
  defineProps<{
    purpose: CaptchaPurpose | string
    answer: string
    error?: string
    variant?: 'default' | 'auth'
  }>(),
  {
    error: '',
    variant: 'default',
  },
)

const emit = defineEmits<{
  'update:answer': [value: string]
  'update:captcha-id': [value: string]
  'clear-error': []
}>()

const loading = ref(false)
const captchaId = ref('')
const imageUrl = ref('')
const answerInputRef = ref<HTMLInputElement | null>(null)
let objectUrl: string | null = null

const answerModel = computed(() => props.answer)

function onAnswerInput(event: Event) {
  const target = event.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  if (target.value !== digits) {
    target.value = digits
  }
  emit('update:answer', digits)
  emit('clear-error')
}

function revokeImageUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

async function loadImage(challenge: { captcha_id: string; image_url: string }) {
  revokeImageUrl()
  try {
    const blob = challenge.image_url
      ? await authService.getCaptchaImageByUrl(challenge.image_url)
      : await authService.getCaptchaImage(challenge.captcha_id)
    objectUrl = URL.createObjectURL(blob)
    imageUrl.value = objectUrl
  } catch {
    imageUrl.value = ''
  }
}

function focusAnswer() {
  answerInputRef.value?.focus()
}

async function refresh() {
  loading.value = true
  emit('update:answer', '')
  emit('clear-error')
  try {
    const response = await authService.getCaptcha(props.purpose as CaptchaPurpose)
    const challenge = parseCaptchaChallenge(response)
    if (!challenge) {
      captchaId.value = ''
      imageUrl.value = ''
      emit('update:captcha-id', '')
      return
    }

    captchaId.value = challenge.captcha_id
    emit('update:captcha-id', captchaId.value)
    await loadImage(challenge)
  } catch {
    captchaId.value = ''
    imageUrl.value = ''
    emit('update:captcha-id', '')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.purpose,
  () => {
    refresh()
  },
)

onMounted(() => {
  refresh()
})

onBeforeUnmount(() => {
  revokeImageUrl()
})

defineExpose({ refresh, focusAnswer })
</script>
