<template>
  <section class="mt-10 border-t border-border pt-8" dir="rtl">
    <header class="mb-6 flex flex-wrap items-baseline justify-between gap-2 gap-x-4">
      <h2 class="text-xl font-bold text-text-primary">نظرات</h2>
      <span v-if="!isLoadingComments && comments.length > 0" class="text-sm text-text-secondary">
        {{ comments.length }} نظر
      </span>
    </header>

    <div v-if="isLoadingComments" class="mb-6">
      <p class="text-sm text-text-secondary">در حال بارگذاری نظرات...</p>
    </div>

    <p v-else-if="commentsError" class="mb-6 text-sm text-red-600">
      {{ commentsError }}
    </p>

    <ul v-else-if="comments.length > 0" class="mb-8 flex list-none flex-col gap-4 p-0">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-lg border border-border bg-surface-muted px-4 py-4"
      >
        <div class="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <span class="text-sm font-semibold text-text-primary">
            {{ formatBlogCommentAuthor(comment.author_name, comment.username) }}
          </span>
          <time class="text-xs text-text-secondary">
            {{ formatBlogCommentDate(comment.created_at) }}
          </time>
        </div>
        <p class="m-0 whitespace-pre-wrap break-words text-sm leading-7 text-text-primary">
          {{ comment.body }}
        </p>
        <div
          v-if="comment.admin_reply"
          class="mt-3.5 rounded border-r-[3px] border-secondary bg-surface px-3.5 py-3"
        >
          <span class="mb-1.5 block text-xs font-semibold text-secondary">پاسخ مدیر</span>
          <p class="m-0 whitespace-pre-wrap text-sm leading-7 text-text-primary">
            {{ comment.admin_reply }}
          </p>
          <p
            v-if="comment.replied_at > 0"
            class="mt-2 text-xs text-text-muted"
          >
            {{ formatBlogCommentDate(comment.replied_at) }}
            <template v-if="comment.replied_by_username">
              · {{ comment.replied_by_username }}
            </template>
          </p>
        </div>
      </li>
    </ul>

    <p v-else class="mb-6 text-sm text-text-secondary">
      هنوز نظری ثبت نشده است. اولین نفر باشید!
    </p>

    <div class="rounded-lg border border-border bg-surface p-5">
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div v-if="!isAuthenticated" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col">
            <label for="comment-author-name" class="mb-1.5 text-xs font-medium text-text-secondary">
              نام
            </label>
            <input
              id="comment-author-name"
              v-model="authorName"
              type="text"
              autocomplete="name"
              placeholder="نام شما"
              :class="fieldInputClass('author_name')"
              @input="clearFieldError('author_name')"
            />
            <p v-if="fieldErrors.author_name" class="mt-1.5 text-xs text-red-600">
              {{ fieldErrors.author_name }}
            </p>
          </div>

          <div class="flex flex-col">
            <label for="comment-author-email" class="mb-1.5 text-xs font-medium text-text-secondary">
              ایمیل
            </label>
            <input
              id="comment-author-email"
              v-model="authorEmail"
              type="email"
              autocomplete="email"
              placeholder="user@example.com"
              dir="ltr"
              :class="[fieldInputClass('author_email'), 'text-left']"
              @input="clearFieldError('author_email')"
            />
            <p v-if="fieldErrors.author_email" class="mt-1.5 text-xs text-red-600">
              {{ fieldErrors.author_email }}
            </p>
          </div>
        </div>

        <div class="flex flex-col">
          <label for="comment-body" class="mb-1.5 text-xs font-medium text-text-secondary">
            متن نظر
          </label>
          <textarea
            id="comment-body"
            v-model="body"
            rows="4"
            placeholder="نظر خود را بنویسید..."
            :class="[fieldInputClass('body'), 'min-h-24 resize-y leading-relaxed']"
            @input="clearFieldError('body')"
          />
          <p v-if="fieldErrors.body" class="mt-1.5 text-xs text-red-600">
            {{ fieldErrors.body }}
          </p>
        </div>

        <div v-if="captchaImageUrl" class="flex flex-col gap-3">
          <div class="relative">
            <img
              :src="captchaImageUrl"
              alt="کپچا"
              class="block h-28 w-full rounded-lg border border-border bg-surface-muted object-contain"
            />
            <button
              type="button"
              class="absolute right-2 top-2 flex cursor-pointer items-center justify-center rounded-lg bg-surface/90 p-1.5 text-secondary shadow-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isRefreshingCaptcha"
              title="بارگذاری مجدد کپچا"
              @click="refreshCaptcha"
            >
              <svg
                :class="{ 'animate-spin': isRefreshingCaptcha }"
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
          <input
            v-model="captchaAnswer"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            dir="ltr"
            autocomplete="off"
            placeholder="پاسخ کپچا"
            :class="[fieldInputClass('captcha_answer'), 'text-center']"
            @input="onCaptchaInput"
          />
          <p
            v-if="fieldErrors.captcha || fieldErrors.captcha_answer"
            class="text-xs text-red-600"
          >
            {{ fieldErrors.captcha || fieldErrors.captcha_answer }}
          </p>
        </div>

        <CaptchaLoadErrorAlert
          v-if="submitError"
          :message="submitError"
          :show-retry="captchaLoadFailed"
          :loading="isRefreshingCaptcha"
          variant="compact"
          @retry="refreshCaptcha"
        />

        <p v-if="submitSuccess" class="text-sm text-green-700">
          {{ submitSuccess }}
        </p>

        <button
          type="submit"
          class="self-start rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-65"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'در حال ارسال...' : 'ارسال نظر' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { authService } from '~/api/services/auth.service'
import { blogService } from '~/api/services/blog.service'
import type { BlogComment, CreateBlogCommentRequest } from '~/api/types/blog.types'
import {
  parseBlogCommentDetailResponse,
  parseBlogCommentsListResponse,
} from '~/api/utils/api-response'
import CaptchaLoadErrorAlert from '~/components/CaptchaLoadErrorAlert.vue'
import { extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import {
  CAPTCHA_IMAGE_LOAD_FAILED_MESSAGE,
  CAPTCHA_LOAD_FAILED_MESSAGE,
  CAPTCHA_NOT_LOADED_MESSAGE,
  shouldClearCaptchaLoadError,
} from '~/utils/captcha'
import {
  formatBlogCommentAuthor,
  formatBlogCommentDate,
} from '~/utils/blog-comments'
import { getAccessToken } from '~/utils/auth-storage'

const props = defineProps<{
  postId: string
}>()

const comments = ref<BlogComment[]>([])
const isLoadingComments = ref(true)
const commentsError = ref<string | null>(null)

const authorName = ref('')
const authorEmail = ref('')
const body = ref('')
const captchaId = ref('')
const captchaAnswer = ref('')
const captchaImageUrl = ref('')
const captchaLoadFailed = ref(false)
const isRefreshingCaptcha = ref(false)

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const isAuthenticated = computed(() => !!getAccessToken())

const fieldInputBase =
  'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors input-focus'

function fieldInputClass(field: string) {
  return fieldErrors.value[field] || (field === 'captcha_answer' && fieldErrors.value.captcha)
    ? `${fieldInputBase} border-red-400`
    : fieldInputBase
}

let captchaObjectUrl: string | null = null

function revokeCaptchaUrl() {
  if (captchaObjectUrl) {
    URL.revokeObjectURL(captchaObjectUrl)
    captchaObjectUrl = null
  }
}

function markCaptchaLoadFailed(message: string) {
  captchaLoadFailed.value = true
  submitError.value = message
}

function clearCaptchaLoadError() {
  captchaLoadFailed.value = false
  if (shouldClearCaptchaLoadError(submitError.value)) {
    submitError.value = null
  }
}

async function loadCaptchaImage(id: string) {
  try {
    const blob = await authService.getCaptchaImage(id)
    revokeCaptchaUrl()
    captchaObjectUrl = URL.createObjectURL(blob)
    captchaImageUrl.value = captchaObjectUrl
    clearCaptchaLoadError()
  } catch {
    captchaImageUrl.value = ''
    markCaptchaLoadFailed(CAPTCHA_IMAGE_LOAD_FAILED_MESSAGE)
  }
}

async function refreshCaptcha() {
  if (isRefreshingCaptcha.value) return
  isRefreshingCaptcha.value = true
  captchaAnswer.value = ''
  clearCaptchaErrors()
  clearCaptchaLoadError()

  try {
    const response = await authService.getCaptcha('comment')
    const payload = (response as { data?: { captcha_id?: string } })?.data ?? response
    const record = payload as { captcha_id?: string }
    captchaId.value = record.captcha_id || ''

    if (captchaId.value) {
      await loadCaptchaImage(captchaId.value)
    } else {
      markCaptchaLoadFailed(CAPTCHA_LOAD_FAILED_MESSAGE)
    }
  } catch {
    captchaId.value = ''
    captchaImageUrl.value = ''
    markCaptchaLoadFailed(CAPTCHA_LOAD_FAILED_MESSAGE)
  } finally {
    isRefreshingCaptcha.value = false
  }
}

async function fetchComments() {
  if (!props.postId) return

  isLoadingComments.value = true
  commentsError.value = null

  try {
    const response = await blogService.listComments({
      post: props.postId,
      status: 'approved',
      ordering: 'created_at',
      page_size: 100,
    })
    const parsed = parseBlogCommentsListResponse(response)

    if (!parsed) {
      commentsError.value = getApiResponseMessage(response, 'خطا در بارگذاری نظرات')
      comments.value = []
      return
    }

    comments.value = parsed.comments
  } catch (err: unknown) {
    commentsError.value = getApiErrorMessage(err, 'خطا در بارگذاری نظرات')
    comments.value = []
  } finally {
    isLoadingComments.value = false
  }
}

function clearFieldError(key: string) {
  if (fieldErrors.value[key]) {
    const next = { ...fieldErrors.value }
    delete next[key]
    fieldErrors.value = next
  }
  submitError.value = null
}

function onCaptchaInput() {
  captchaAnswer.value = captchaAnswer.value.replace(/\D/g, '')
  clearCaptchaErrors()
}

function clearCaptchaErrors() {
  clearFieldError('captcha')
  clearFieldError('captcha_answer')
}

function applyApiErrors(source: unknown) {
  submitError.value = null
  const errors = extractApiFieldErrors(source)
  fieldErrors.value = { ...errors }

  if (errors.captcha || errors.captcha_answer) {
    void refreshCaptcha()
  }

  if (Object.keys(errors).length === 0) {
    submitError.value = getApiResponseMessage(source, 'ارسال نظر با خطا مواجه شد.')
  }
}

function validateForm(): boolean {
  fieldErrors.value = {}
  submitError.value = null

  if (!isAuthenticated.value) {
    if (!authorName.value.trim()) {
      fieldErrors.value = { ...fieldErrors.value, author_name: 'نام الزامی است' }
    }
    if (!authorEmail.value.trim()) {
      fieldErrors.value = { ...fieldErrors.value, author_email: 'ایمیل الزامی است' }
    }
  }

  if (!body.value.trim()) {
    fieldErrors.value = { ...fieldErrors.value, body: 'متن نظر الزامی است' }
  }

  if (!captchaId.value) {
    markCaptchaLoadFailed(CAPTCHA_NOT_LOADED_MESSAGE)
    return false
  }

  if (!captchaAnswer.value.trim()) {
    fieldErrors.value = { ...fieldErrors.value, captcha_answer: 'پاسخ کپچا الزامی است' }
  }

  return Object.keys(fieldErrors.value).length === 0 && !submitError.value
}

async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true
  submitError.value = null
  submitSuccess.value = null

  try {
    const payload: CreateBlogCommentRequest = {
      post: props.postId,
      body: body.value.trim(),
      captcha_id: captchaId.value,
      captcha_answer: captchaAnswer.value.trim(),
    }

    if (!isAuthenticated.value) {
      payload.author_name = authorName.value.trim()
      payload.author_email = authorEmail.value.trim()
    }

    const response = await blogService.createComment(payload)
    const created = parseBlogCommentDetailResponse(response)

    if (!created) {
      applyApiErrors(response)
      return
    }

    body.value = ''
    captchaAnswer.value = ''
    if (!isAuthenticated.value) {
      authorName.value = ''
      authorEmail.value = ''
    }

    submitSuccess.value = getApiResponseMessage(
      response,
      'نظر شما ثبت شد.',
    )

    await refreshCaptcha()
  } catch (err: unknown) {
    applyApiErrors(err)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchComments(), refreshCaptcha()])
})

watch(
  () => props.postId,
  (nextId, prevId) => {
    if (nextId && nextId !== prevId) {
      void fetchComments()
    }
  },
)

onBeforeUnmount(() => {
  revokeCaptchaUrl()
})
</script>

