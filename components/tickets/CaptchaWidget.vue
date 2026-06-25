<template>
  <div class="rounded-xl border border-border bg-surface-muted p-4">
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="text-sm font-medium text-text-secondary">کپچا</p>
      <button
        type="button"
        class="text-xs font-medium text-secondary hover:text-secondary-dark"
        :disabled="loading"
        @click="refresh"
      >
        تصویر جدید
      </button>
    </div>

    <div v-if="loading && !imageUrl" class="py-8 text-center text-sm text-text-muted">
      در حال بارگذاری کپچا...
    </div>

    <div v-else-if="imageUrl" class="flex flex-col gap-3">
      <img
        :src="imageUrl"
        alt="کپچا"
        class="mx-auto max-h-16 rounded-lg border border-border bg-white"
      />
      <input
        :value="answerModel"
        type="tel"
        inputmode="numeric"
        pattern="[0-9]*"
        dir="ltr"
        autocomplete="off"
        placeholder="پاسخ کپچا"
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
import { isApiSuccess } from '~/api/utils/api-response'
import CaptchaLoadErrorAlert from '~/components/CaptchaLoadErrorAlert.vue'
import { CAPTCHA_LOAD_FAILED_MESSAGE } from '~/utils/captcha'

const props = defineProps<{
  purpose: string
  answer: string
  error?: string
}>()

const emit = defineEmits<{
  'update:answer': [value: string]
  'update:captcha-id': [value: string]
  'clear-error': []
}>()

const loading = ref(false)
const captchaId = ref('')
const imageUrl = ref('')
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

async function loadImage(id: string) {
  revokeImageUrl()
  try {
    const blob = await authService.getCaptchaImage(id)
    objectUrl = URL.createObjectURL(blob)
    imageUrl.value = objectUrl
  } catch {
    imageUrl.value = ''
  }
}

async function refresh() {
  loading.value = true
  emit('update:answer', '')
  emit('clear-error')
  try {
    const response = await authService.getCaptcha(props.purpose)
    const payload = isApiSuccess(response)
      ? ((response as { data?: { captcha_id?: string } }).data ?? response)
      : response
    const record = payload as { captcha_id?: string }
    captchaId.value = record.captcha_id || ''
    emit('update:captcha-id', captchaId.value)
    if (captchaId.value) {
      await loadImage(captchaId.value)
    } else {
      imageUrl.value = ''
    }
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

defineExpose({ refresh })
</script>

