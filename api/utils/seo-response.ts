import type {
  GscAnalyticsRow,
  GscConnectResponse,
  GscIndexingIssue,
  GscPageRow,
  GscQueryRow,
  GscStatus,
  GscSubmitResult,
  SeoPublicSettings,
  SeoSettings,
} from '~/types/seo-admin'
import { getApiPayload, isApiSuccess } from './api-response'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

export function parsePublicSeoSettingsResponse(response: unknown): SeoPublicSettings | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw) return null
  return {
    ga4_measurement_id: String(raw.ga4_measurement_id || ''),
  }
}

export function parseSeoSettingsResponse(response: unknown): SeoSettings | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw) return null
  return {
    ga4_measurement_id: String(raw.ga4_measurement_id || ''),
    storefront_base_url: String(raw.storefront_base_url || ''),
    api_public_base_url: String(raw.api_public_base_url || ''),
    nuxt_revalidate_url: String(raw.nuxt_revalidate_url || ''),
    nuxt_revalidate_secret_masked: String(raw.nuxt_revalidate_secret_masked || ''),
    gsc_client_id: String(raw.gsc_client_id || ''),
    gsc_client_secret_masked: String(raw.gsc_client_secret_masked || ''),
    gsc_redirect_uri: String(raw.gsc_redirect_uri || ''),
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

export function parseGscStatusResponse(response: unknown): GscStatus | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw) return null
  return {
    connected: Boolean(raw.connected),
    configured: Boolean(raw.configured),
    property_url: raw.property_url ? String(raw.property_url) : null,
    last_sync_at:
      raw.last_sync_at === null || raw.last_sync_at === undefined
        ? null
        : Number(raw.last_sync_at) || 0,
  }
}

export function parseGscConnectResponse(response: unknown): GscConnectResponse | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw?.auth_url) return null
  return { auth_url: String(raw.auth_url) }
}

function parseAnalyticsRow(raw: Record<string, unknown>): GscAnalyticsRow {
  return {
    date: String(raw.date || ''),
    clicks: Number(raw.clicks) || 0,
    impressions: Number(raw.impressions) || 0,
    ctr: Number(raw.ctr) || 0,
    position: Number(raw.position) || 0,
  }
}

export function parseGscAnalyticsResponse(response: unknown): GscAnalyticsRow[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => parseAnalyticsRow(item))
}

export function parseGscQueriesResponse(response: unknown): GscQueryRow[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      query: String(item.query || ''),
      clicks: Number(item.clicks) || 0,
      impressions: Number(item.impressions) || 0,
      ctr: Number(item.ctr) || 0,
      position: Number(item.position) || 0,
    }))
}

export function parseGscPagesResponse(response: unknown): GscPageRow[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      page: String(item.page || ''),
      clicks: Number(item.clicks) || 0,
      impressions: Number(item.impressions) || 0,
      position: Number(item.position) || 0,
    }))
}

export function parseGscIndexingIssuesResponse(response: unknown): GscIndexingIssue[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      url: String(item.url || ''),
      issue: String(item.issue || ''),
      severity: String(item.severity || ''),
      count: Number(item.count) || 0,
    }))
}

export function parseGscSubmitSitemapResponse(response: unknown): GscSubmitResult | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw) return null
  return {
    property_url: String(raw.property_url || ''),
    feedpath: String(raw.feedpath || ''),
    submitted_at: Number(raw.submitted_at) || 0,
  }
}
