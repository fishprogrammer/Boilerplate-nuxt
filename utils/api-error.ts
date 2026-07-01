import { getKnownApiErrorMessage } from '~/constants/api-error-codes'
import { ApiClientError } from '~/types/api'

export const API_FIELD_LABELS: Record<string, string> = {
  username: 'نام کاربری',
  email: 'ایمیل',
  password: 'رمز عبور',
  first_name: 'نام',
  last_name: 'نام خانوادگی',
  phone_number: 'شماره موبایل',
  birth_date: 'تاریخ تولد',
  gender: 'جنسیت',
  is_active: 'حساب فعال',
  is_staff: 'کارمند',
  is_superuser: 'مدیر کل',
  ticket_type: 'موضوع / دسته',
  current_department: 'دپارتمان مقصد',
  target_type: 'مقصد',
  target_user: 'گیرنده',
  captcha: 'کپچا',
  captcha_answer: 'پاسخ کپچا',
  name: 'نام نقش',
  permissions: 'دسترسی‌ها',
  category: 'دسته‌بندی',
  locale: 'زبان',
  meta_title: 'عنوان SEO',
  meta_description: 'توضیح SEO',
  file: 'فایل',
  recipients: 'گیرندگان',
  send_to_all: 'ارسال به همه',
  title: 'عنوان',
  body: 'متن',
  slug: 'slug',
  status: 'وضعیت',
  published_at: 'زمان انتشار',
  author_name: 'نام',
  author_email: 'ایمیل',
  admin_reply: 'پاسخ مدیر',
  notification_type: 'نوع اعلان',
  priority: 'اولویت',
  gateway_id: 'درگاه پرداخت',
  amount: 'مبلغ',
  user_id: 'شناسه کاربر',
  reference: 'مرجع',
  description: 'توضیحات',
  frontend_success_url: 'URL موفقیت',
  frontend_failure_url: 'URL ناموفق',
  min_deposit_amount: 'حداقل مبلغ شارژ',
  max_deposit_amount: 'حداکثر مبلغ شارژ',
  deposits_enabled: 'فعال بودن شارژ',
  credentials: 'اعتبارنامه',
  driver: 'درایور',
  sort_order: 'ترتیب نمایش',
  is_sandbox: 'sandbox',
  action_url: 'لینک اقدام',
}

function normalizeErrorValue(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeErrorValue(item))
      .filter(Boolean)
      .join(', ')
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => normalizeErrorValue(item))
      .filter(Boolean)
      .join(', ')
  }
  return value == null ? '' : String(value)
}

function getErrorPayload(err: unknown): Record<string, unknown> | null {
  if (!err || typeof err !== 'object') return null

  const direct = err as Record<string, unknown>
  if (direct.errors && typeof direct.errors === 'object') return direct

  const axiosData = (err as { response?: { data?: unknown } }).response?.data
  if (axiosData && typeof axiosData === 'object' && !Array.isArray(axiosData)) {
    return axiosData as Record<string, unknown>
  }

  return null
}

/** Parse API `errors` object into field → message map */
export function extractApiFieldErrors(err: unknown): Record<string, string> {
  const payload = getErrorPayload(err)
  const errors = payload?.errors
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return {}

  const result: Record<string, string> = {}
  for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
    const message = normalizeErrorValue(value)
    if (message) result[field] = message
  }
  return result
}

/** Format API field errors like `رمز عبور: این رمز عبور بسیار رایج است.` */
export function formatApiFieldErrors(errors: unknown, withLabels = true): string {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return ''

  return Object.entries(errors as Record<string, unknown>)
    .map(([field, value]) => {
      const message = normalizeErrorValue(value)
      if (!message) return ''
      const label = withLabels ? (API_FIELD_LABELS[field] || field) : field
      return `${label}: ${message}`
    })
    .filter(Boolean)
    .join(' | ')
}

/** Axios / fetch failed without server response (offline, DNS, CORS block, etc.) */
export function isNetworkError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false

  const e = err as {
    code?: string
    message?: string
    response?: unknown
    request?: unknown
  }

  if (e.code === 'ERR_CANCELED' || e.code === 'CanceledError') return false
  if (typeof e.message === 'string' && /^canceled$/i.test(e.message.trim())) return false

  if (e.code === 'ERR_NETWORK') return true
  if (typeof e.message === 'string' && /network error/i.test(e.message)) return true
  if (e.request && !e.response) return true

  return false
}

export const NETWORK_ERROR_MESSAGE =
  'اتصال به اینترنت برقرار نیست. لطفاً اتصال خود را بررسی کنید.'

export function getApiResponseMessage(err: unknown, fallback = ''): string {
  const payload = getErrorPayload(err)
  return (typeof payload?.message === 'string' && payload.message) || fallback
}

export function getApiErrorCode(err: unknown): string {
  if (err instanceof ApiClientError) return err.code

  const payload = getErrorPayload(err)
  if (!payload) return ''
  if (typeof payload.code === 'string') return payload.code
  return ''
}

export function getApiErrorMessage(
  err: unknown,
  fallback = 'خطایی رخ داد',
): string {
  if (isNetworkError(err)) return NETWORK_ERROR_MESSAGE

  const code = getApiErrorCode(err)
  const knownMessage = code ? getKnownApiErrorMessage(code) : null
  if (knownMessage) return knownMessage

  const payload = getErrorPayload(err)
  const fieldErrors = formatApiFieldErrors(payload?.errors)
  if (fieldErrors) return fieldErrors

  if (typeof payload?.errors === 'string' && payload.errors.trim()) {
    return payload.errors.trim()
  }

  return getApiResponseMessage(err, (err as { message?: string })?.message || fallback)
}

