import { isApiSuccess } from '~/api/utils/api-response'
import type { CaptchaPurpose, CaptchaResponse } from '~/api/types/auth.types'
import { normalizeApiPathSegment } from '~/utils/api-url'

export const CAPTCHA_LOAD_FAILED_MESSAGE = 'بارگذاری کپچا ناموفق بود.'
export const CAPTCHA_IMAGE_LOAD_FAILED_MESSAGE = 'بارگذاری تصویر کپچا ناموفق بود.'
export const CAPTCHA_NOT_LOADED_MESSAGE = 'کپچا بارگذاری نشد. دوباره تلاش کنید.'

const CAPTCHA_LOAD_ERROR_MESSAGES = new Set([
  CAPTCHA_LOAD_FAILED_MESSAGE,
  CAPTCHA_IMAGE_LOAD_FAILED_MESSAGE,
  CAPTCHA_NOT_LOADED_MESSAGE,
])

export function isCaptchaLoadErrorMessage(message: string | null | undefined): boolean {
  return Boolean(message && CAPTCHA_LOAD_ERROR_MESSAGES.has(message))
}

export function shouldClearCaptchaLoadError(message: string | null | undefined): boolean {
  return isCaptchaLoadErrorMessage(message)
}

/** Parse POST /api/auth/captcha/ success payload (data.captcha_id + data.image_url). */
export function parseCaptchaChallenge(response: unknown): CaptchaResponse | null {
  if (!response || typeof response !== 'object') return null

  const root = response as Record<string, unknown>
  const payload =
    isApiSuccess(response) && root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root

  const captcha_id = typeof payload.captcha_id === 'string' ? payload.captcha_id.trim() : ''
  const image_url = typeof payload.image_url === 'string' ? payload.image_url.trim() : ''
  const purposeRaw = typeof payload.purpose === 'string' ? payload.purpose.trim() : 'general'
  const expires_at =
    payload.expires_at != null && payload.expires_at !== ''
      ? String(payload.expires_at)
      : ''

  if (!captcha_id || !image_url) return null

  return {
    captcha_id,
    image_url,
    purpose: purposeRaw as CaptchaPurpose,
    expires_at,
  }
}

/** Normalize captcha image_url to a relative /api/ path for axios (baseURL is set on client). */
export function resolveCaptchaImageUrl(imageUrl: string): string {
  const trimmed = imageUrl.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('/')) {
    return normalizeApiPathSegment(trimmed)
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.pathname.startsWith('/api/')) {
      return normalizeApiPathSegment(`${parsed.pathname}${parsed.search}`)
    }
    return trimmed
  } catch {
    return normalizeApiPathSegment(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)
  }
}
