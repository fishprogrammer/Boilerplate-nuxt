/** Known API error codes — UI logic must branch on `code`, not `message`. */
export const API_ERROR_CODES = {
  MEDIA_STORAGE_ERROR: 'media_storage_error',
  SMS_UNAVAILABLE: 'sms_unavailable',
} as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

/** User-facing copy for Phase 0 operational errors (PHASE-0 §7). */
export const API_ERROR_UI_MESSAGES: Record<string, string> = {
  [API_ERROR_CODES.MEDIA_STORAGE_ERROR]:
    'فضای ذخیره‌سازی فایل در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.',
  [API_ERROR_CODES.SMS_UNAVAILABLE]:
    'ارسال پیامک در حال حاضر فعال نیست. لطفاً با پشتیبانی تماس بگیرید.',
}

export function getKnownApiErrorMessage(code: string): string | null {
  return API_ERROR_UI_MESSAGES[code] ?? null
}
