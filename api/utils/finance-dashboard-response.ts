import type {
  CouponImpactRow,
  FinanceDashboard,
  ForecastDataPoint,
  MrrDataPoint,
  RevenueByProductRow,
} from '~/types/finance'
import type { AdminLicenseSearchItem, AdminLicenseDetail } from '~/types/licensing'
import type { BulkGenerateCouponsResponse } from '~/types/commerce'
import type { LicensingSecretResponse } from '~/types/catalog'
import { isApiSuccess, getApiPayload } from './api-response'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

export function parseFinanceDashboardResponse(response: unknown): FinanceDashboard | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw) return null
  return {
    mrr: Number(raw.mrr) || 0,
    arr: Number(raw.arr) || 0,
    active_subscriptions: Number(raw.active_subscriptions) || 0,
    revenue_mtd: Number(raw.revenue_mtd) || 0,
    revenue_ytd: Number(raw.revenue_ytd) || 0,
    churn_rate_percent: Number(raw.churn_rate_percent) || 0,
    new_orders_mtd: Number(raw.new_orders_mtd) || 0,
  }
}

function parseMrrPoint(raw: Record<string, unknown>): MrrDataPoint {
  return {
    month: String(raw.month || ''),
    mrr: Number(raw.mrr) || 0,
  }
}

export function parseMrrSeriesResponse(response: unknown): MrrDataPoint[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => parseMrrPoint(item))
}

export function parseForecastSeriesResponse(response: unknown): ForecastDataPoint[] | null {
  return parseMrrSeriesResponse(response)
}

export function parseRevenueByProductResponse(response: unknown): RevenueByProductRow[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      product_slug: String(item.product_slug || ''),
      product_name: String(item.product_name || ''),
      revenue: Number(item.revenue) || 0,
      orders_count: Number(item.orders_count) || 0,
    }))
}

export function parseCouponsImpactResponse(response: unknown): CouponImpactRow[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      coupon_code: String(item.coupon_code || ''),
      times_used: Number(item.times_used) || 0,
      total_discount_amount: Number(item.total_discount_amount) || 0,
      orders_count: Number(item.orders_count) || 0,
      revenue_after_discount: Number(item.revenue_after_discount) || 0,
    }))
}

export function parseBulkGenerateCouponsResponse(response: unknown): BulkGenerateCouponsResponse | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw) return null
  const codesRaw = raw.codes
  const codes = Array.isArray(codesRaw) ? codesRaw.map((c) => String(c)) : []
  return { codes }
}

export function parseLicensingSecretResponse(response: unknown): LicensingSecretResponse | null {
  if (!isApiSuccess(response)) return null
  const raw = asRecord(getApiPayload(response))
  if (!raw) return null
  const secret = String(raw.api_secret || '')
  if (!secret) return null
  return { api_secret: secret }
}

function normalizeAdminLicenseSearchItem(raw: Record<string, unknown>): AdminLicenseSearchItem {
  const statusRaw = String(raw.status || 'active')
  const status =
    statusRaw === 'expired' || statusRaw === 'suspended' || statusRaw === 'revoked'
      ? statusRaw
      : 'active'
  return {
    id: String(raw.id || ''),
    license_key_masked: String(raw.license_key_masked || ''),
    owner_username: String(raw.owner_username || raw.username || ''),
    owner_email: raw.owner_email ? String(raw.owner_email) : null,
    product_name: String(raw.product_name || ''),
    product_slug: String(raw.product_slug || ''),
    status,
    activation_count: Number(raw.activation_count) || 0,
    order_id: raw.order_id ? String(raw.order_id) : null,
    created_at: Number(raw.created_at) || 0,
  }
}

export function parseAdminLicensesSearchResponse(response: unknown): AdminLicenseSearchItem[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  const items = Array.isArray(data) ? data : null
  if (!items) return null
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeAdminLicenseSearchItem(item))
}

export function parseAdminLicenseDetailResponse(response: unknown): AdminLicenseDetail | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  if (!payload || typeof payload !== 'object') return null
  const raw = payload as Record<string, unknown>
  const base = normalizeAdminLicenseSearchItem({
    ...raw,
    owner_username: raw.username ?? raw.owner_username,
  })
  const activationsRaw = raw.activations
  const activations = Array.isArray(activationsRaw)
    ? activationsRaw
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          id: String(item.id || ''),
          label: String(item.label || ''),
          identifier: String(item.identifier || ''),
          status: item.status === 'deactivated' ? 'deactivated' as const : 'active' as const,
          activated_at: Number(item.activated_at) || 0,
          last_seen_at:
            item.last_seen_at === null || item.last_seen_at === undefined
              ? null
              : Number(item.last_seen_at) || 0,
          product_version: item.product_version ? String(item.product_version) : null,
        }))
    : []
  return {
    id: base.id,
    license_key_masked: base.license_key_masked,
    product: {
      slug: base.product_slug,
      name: base.product_name,
    },
    plan: {
      name: String(raw.plan_name || (raw.plan as Record<string, unknown> | undefined)?.name || ''),
      license_type: String(
        raw.license_type || (raw.plan as Record<string, unknown> | undefined)?.license_type || '',
      ),
    },
    status: base.status,
    expires_at: raw.expires_at === null || raw.expires_at === undefined ? null : Number(raw.expires_at) || 0,
    max_activations: Number(raw.max_activations) || 0,
    activation_count: base.activation_count,
    created_at: base.created_at,
    activations,
    username: base.owner_username,
    user_id: String(raw.user_id || ''),
    order_id: base.order_id,
  }
}
