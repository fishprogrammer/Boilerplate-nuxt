import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { AxiosInstance } from 'axios'
import { API_ENDPOINTS } from './endpoints'
import { parseRefreshResponse } from './utils/api-response'
import { isNetworkError } from '~/utils/api-error'
import { isAuthSessionTransitioning } from '~/utils/auth-session-transition'
import { isAccessTokenExpired } from '~/utils/jwt'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  migrateLegacyAuthStorage,
  setAccessToken,
  setRefreshToken,
} from '~/utils/auth-storage'
import { appConfig } from '~/config/app'

// Base URL from appConfig — defaults to https://api.store.a4j.ir (see config/app.ts).
const BASE_URL = appConfig.api.baseUrl.replace(/\/+$/, '')

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const LOGIN_PATH = '/login'

const AUTH_FLOW_URL_PARTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
] as const

function isAuthFlowRequest(url?: string): boolean {
  if (!url) return false
  return AUTH_FLOW_URL_PARTS.some((part) => url.includes(part))
}

function shouldAttachAccessToken(url?: string): boolean {
  if (!url || isAuthFlowRequest(url)) return false
  return true
}

function isLoginPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, '') === LOGIN_PATH
}

function redirectToLogin() {
  if (!import.meta.client) return
  if (isAuthSessionTransitioning() || isLoginPath(window.location.pathname)) return
  clearAuthTokens()
  window.location.href = LOGIN_PATH
}

function readErrorCode(data: Record<string, unknown>): string {
  if (typeof data.code === 'string') return data.code

  const nested = data.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const code = (nested as Record<string, unknown>).code
    if (typeof code === 'string') return code
  }

  return ''
}

function readErrorMessage(data: Record<string, unknown>): string {
  const parts: string[] = []

  for (const key of ['detail', 'message'] as const) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) {
      parts.push(value.trim())
    } else if (Array.isArray(value)) {
      parts.push(value.map(String).join(' '))
    }
  }

  return parts.join(' ')
}

function isTokenAuthError(status?: number, data?: unknown): boolean {
  if (status !== 401) return false
  if (!data || typeof data !== 'object') return true

  const root = data as Record<string, unknown>
  const code = readErrorCode(root)
  if (code === 'token_not_valid' || code === 'authentication_failed') return true

  const message = readErrorMessage(root)
  if (/token.*(expired|invalid)|not valid for any token type|token_not_valid/i.test(message)) {
    return true
  }

  return true
}

class ApiClient {
  private instance: AxiosInstance
  /** Separate client for refresh — no auth header, no response interceptor loop. */
  private refreshClient: AxiosInstance

  constructor() {
    migrateLegacyAuthStorage()

    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: appConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.refreshClient = axios.create({
      baseURL: BASE_URL,
      timeout: appConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.instance.interceptors.request.use(
      async (config) => {
        if (config.url) {
          const needsCredentials =
            config.url.includes('/auth/refresh') || config.url.includes('/auth/logout')
          config.withCredentials = !!needsCredentials
        }

        let accessToken = getAccessToken()
        const refreshToken = getRefreshToken()

        if (
          refreshToken &&
          shouldAttachAccessToken(config.url) &&
          (!accessToken || isAccessTokenExpired(accessToken))
        ) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed) accessToken = refreshed
        }

        if (accessToken && shouldAttachAccessToken(config.url)) {
          config.headers = config.headers || {}
          const existingAuth = config.headers.Authorization
          const hasGuestAuth =
            typeof existingAuth === 'string' && existingAuth.startsWith('GuestTicket ')
          if (!hasGuestAuth) {
            config.headers.Authorization = `Bearer ${accessToken}`
          }
        } else if (config.headers) {
          delete config.headers.Authorization
        }

        if (config.headers) {
          config.headers['Accept-Language'] = config.headers['Accept-Language'] || 'fa'
        }

        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type']
        }

        return config
      },
      (error) => Promise.reject(error),
    )

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleResponseError(error),
    )
  }

  private refreshPromise: Promise<string | null> | null = null

  private shouldAttemptRefresh(config?: AxiosRequestConfig): boolean {
    if (!config || (config as RetryAxiosRequestConfig)._retry) return false
    if (isAuthFlowRequest(config.url)) return false
    return !!getRefreshToken()
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null

    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshClient
        .post(API_ENDPOINTS.AUTH.REFRESH, { refresh: refreshToken })
        .then((res) => {
          const parsed = parseRefreshResponse(res.data)
          if (!parsed?.access) return null

          setAccessToken(parsed.access)
          if (parsed.refresh) {
            setRefreshToken(parsed.refresh)
          }
          return parsed.access
        })
        .catch(() => null)
        .finally(() => {
          this.refreshPromise = null
        })
    }

    return this.refreshPromise
  }

  /** Refresh when access is missing/expired but a refresh token exists. */
  async ensureValidAccessToken(): Promise<string | null> {
    const access = getAccessToken()
    if (access && !isAccessTokenExpired(access)) return access
    if (!getRefreshToken()) return access
    return this.refreshAccessToken()
  }

  private async handleResponseError(error: AxiosError) {
    if (isNetworkError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const responseData = error.response?.data
    const originalConfig = error.config as RetryAxiosRequestConfig | undefined
    const isUnauthorized = status === 401 && isTokenAuthError(status, responseData)

    if (isUnauthorized && !isAuthFlowRequest(originalConfig?.url)) {
      if (this.shouldAttemptRefresh(originalConfig)) {
        const newAccess = await this.refreshAccessToken()

        if (newAccess && originalConfig) {
          originalConfig._retry = true
          originalConfig.headers = originalConfig.headers || {}
          originalConfig.headers.Authorization = `Bearer ${newAccess}`
          return this.instance.request(originalConfig)
        }
      }

      redirectToLogin()
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.patch<T>(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete<T>(url, config)
  }
}

export const apiClient = new ApiClient()

export function refreshAccessTokenIfNeeded(): Promise<string | null> {
  return apiClient.ensureValidAccessToken()
}

