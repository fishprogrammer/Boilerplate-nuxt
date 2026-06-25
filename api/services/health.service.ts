import type { AxiosError } from 'axios'
import { apiClient } from '../client'
import { API_ENDPOINTS } from '../endpoints'

export interface HealthApiResponse {
  response: unknown
  httpStatus: number
}

export class HealthService {
  async getFullHealth(): Promise<HealthApiResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH.FULL)
      return { response: response.data, httpStatus: response.status }
    } catch (error) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status
      const data = axiosError.response?.data

      if (status === 503 && data) {
        return { response: data, httpStatus: 503 }
      }

      throw error
    }
  }

  async getLiveHealth(): Promise<HealthApiResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH.LIVE)
      return { response: response.data, httpStatus: response.status }
    } catch (error) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status
      const data = axiosError.response?.data

      if (status && data) {
        return { response: data, httpStatus: status }
      }

      throw error
    }
  }

  async getReadyHealth(): Promise<HealthApiResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH.READY)
      return { response: response.data, httpStatus: response.status }
    } catch (error) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status
      const data = axiosError.response?.data

      if (status === 503 && data) {
        return { response: data, httpStatus: 503 }
      }

      if (status && data) {
        return { response: data, httpStatus: status }
      }

      throw error
    }
  }
}

export const healthService = new HealthService()

