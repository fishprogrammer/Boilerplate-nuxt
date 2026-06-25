import { ref, readonly } from 'vue'
import { extractApiFieldErrors, getApiErrorMessage } from '~/utils/api-error'

export interface UseRequestOptions<T> {
  /** Called on success with the resolved value */
  onSuccess?: (data: T) => void
  /** Called on error with the caught value */
  onError?: (err: unknown) => void
}

/**
 * Wraps any async function with reactive loading/error state.
 *
 * @example
 * const { execute, isLoading, error, fieldErrors } = useRequest(
 *   () => authService.login(payload),
 *   { onSuccess: () => router.push('/') }
 * )
 */
export function useRequest<T>(
  fn: () => Promise<T>,
  options: UseRequestOptions<T> = {},
) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string[]>>({})
  const data = ref<T | null>(null)

  const execute = async (): Promise<T | null> => {
    isLoading.value = true
    error.value = null
    fieldErrors.value = {}

    try {
      const result = await fn()
      data.value = result as typeof data.value
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const fe = extractApiFieldErrors(err)
      fieldErrors.value = Object.fromEntries(
        Object.entries(fe).map(([k, v]) => [k, [v]])
      )
      error.value = getApiErrorMessage(err)
      options.onError?.(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    execute,
    isLoading: readonly(isLoading),
    error: readonly(error),
    fieldErrors: readonly(fieldErrors),
    data: readonly(data),
  }
}

