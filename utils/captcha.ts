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

