import { apiClient } from './client'
import type { AxiosResponse } from 'axios'

export class BaseService {
  protected async getRaw<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await apiClient.get<T>(url, { params })
    return response.data
  }

  protected async postRaw<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(url, data)
    return response.data
  }

  protected async putRaw<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(url, data)
    return response.data
  }

  protected async patchRaw<T>(url: string, data?: unknown, isFormData = false): Promise<T> {
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    const response: AxiosResponse<T> = await apiClient.patch(url, data, config)
    return response.data
  }

  protected async deleteRaw<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(url)
    return response.data
  }
}

