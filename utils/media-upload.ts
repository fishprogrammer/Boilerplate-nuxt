import { API_ERROR_CODES } from '~/constants/api-error-codes'
import { showToast } from '~/composables/useToast'
import { getApiErrorCode, getApiErrorMessage } from '~/utils/api-error'

/** Map media upload failures; staff pages also get a toast for storage outages. */
export function handleMediaUploadFailure(
  err: unknown,
  options: { fallback?: string; toast?: boolean } = {},
): string {
  const fallback = options.fallback ?? 'خطا در آپلود فایل'
  const message = getApiErrorMessage(err, fallback)
  const shouldToast = options.toast ?? getApiErrorCode(err) === API_ERROR_CODES.MEDIA_STORAGE_ERROR
  if (shouldToast) {
    showToast({ message, variant: 'error' })
  }
  return message
}
