import { internalService } from '~/api/services/internal.service'
import { isApiSuccess } from '~/api/utils/api-response'
import { getApiErrorMessage } from '~/utils/api-error'

export function useInternal() {
  async function triggerStorefrontRevalidate(paths: string[]) {
    const normalized = paths.filter((path) => path.startsWith('/'))
    if (!normalized.length) {
      throw new Error('paths required')
    }
    const response = await internalService.triggerRevalidate(normalized)
    if (!isApiSuccess(response)) {
      throw new Error(getApiErrorMessage(response, 'Revalidate failed'))
    }
    return response
  }

  return { triggerStorefrontRevalidate }
}
