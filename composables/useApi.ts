import type { AxiosRequestConfig } from 'axios'
import { apiClient } from '~/api/client'
import { isApiSuccess } from '~/api/utils/api-response'
import type { ApiEnvelope, ApiError } from '~/types/api'
import { ApiClientError } from '~/types/api'

export type ApiRequestOptions = Omit<AxiosRequestConfig, 'url' | 'headers'> & {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
}

function toApiClientError(payload: ApiError): ApiClientError {
  return new ApiClientError(payload)
}

export function useApi() {
  const locale = useAppLocale()

  async function api<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const method = options.method ?? 'GET'
    const headers = {
      'Accept-Language': locale.value,
      ...options.headers,
    }
    const config: AxiosRequestConfig = {
      params: options.params,
      headers,
    }

    let response
    switch (method) {
      case 'POST':
        response = await apiClient.post<ApiEnvelope<T>>(path, options.data, config)
        break
      case 'PUT':
        response = await apiClient.put<ApiEnvelope<T>>(path, options.data, config)
        break
      case 'PATCH':
        response = await apiClient.patch<ApiEnvelope<T>>(path, options.data, config)
        break
      case 'DELETE':
        response = await apiClient.delete<ApiEnvelope<T>>(path, config)
        break
      default:
        response = await apiClient.get<ApiEnvelope<T>>(path, config)
    }

    const body = response.data
    if (!isApiSuccess(body)) {
      throw toApiClientError(body as ApiError)
    }

    return body.data as T
  }

  return {
    api,
    locale,
  }
}
