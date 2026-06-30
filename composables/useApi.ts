import type { AxiosRequestConfig } from 'axios'
import { apiClient } from '~/api/client'
import { isApiSuccess } from '~/api/utils/api-response'
import type { ApiEnvelope, ApiError } from '~/types/api'
import { ApiClientError } from '~/types/api'
import { isAppLocale, type AppLocale } from '~/utils/locale'

export type ApiRequestOptions = Omit<AxiosRequestConfig, 'url' | 'headers'> & {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
}

function toApiClientError(payload: ApiError): ApiClientError {
  return new ApiClientError(payload)
}

function resolveAcceptLanguage(locale?: string): AppLocale {
  if (locale && isAppLocale(locale)) return locale
  return 'fa'
}

export function useApi() {
  const route = useRoute()
  const locale = computed(() => resolveAcceptLanguage(route.params.locale as string | undefined))

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
