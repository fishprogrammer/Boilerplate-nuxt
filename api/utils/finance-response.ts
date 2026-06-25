import type { SaleOrder, SaleOrdersListResult } from '../types/finance.types'
import { getApiPayload, isApiSuccess } from './api-response'

function pickString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key]
  return typeof value === 'string' ? value : ''
}

function pickNumber(obj: Record<string, unknown>, key: string, fallback = 0): number {
  const value = obj[key]
  if (value === null || value === undefined || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parsePagination(root: Record<string, unknown>, fallbackLength: number) {
  const meta =
    root.meta && typeof root.meta === 'object' && !Array.isArray(root.meta)
      ? (root.meta as Record<string, unknown>)
      : null
  const paginationRaw =
    meta?.pagination && typeof meta.pagination === 'object' && !Array.isArray(meta.pagination)
      ? (meta.pagination as Record<string, unknown>)
      : null

  return {
    page: Number(paginationRaw?.page) || 1,
    page_size: Number(paginationRaw?.page_size) || fallbackLength || 20,
    total_pages: Number(paginationRaw?.total_pages) || 1,
    total_items: Number(paginationRaw?.total_items) || fallbackLength,
    next: typeof paginationRaw?.next === 'string' ? paginationRaw.next : null,
    previous: typeof paginationRaw?.previous === 'string' ? paginationRaw.previous : null,
  }
}

function parseListResponse<T>(
  response: unknown,
  mapItem: (raw: Record<string, unknown>) => T,
): { items: T[]; pagination: ReturnType<typeof parsePagination> } | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  if (!Array.isArray(data)) return null

  const items = data
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map(mapItem)

  return { items, pagination: parsePagination(root, items.length) }
}

export function parseSaleOrder(raw: Record<string, unknown>): SaleOrder {
  return {
    id: pickString(raw, 'id'),
    order_number: pickString(raw, 'order_number'),
    status: pickString(raw, 'status') || 'pending_payment',
    total_amount: pickNumber(raw, 'total_amount'),
    payment_mode: (pickString(raw, 'payment_mode') || 'cash') as SaleOrder['payment_mode'],
    enrollment_start: pickString(raw, 'enrollment_start'),
  }
}

export function parseMySaleOrdersListResponse(response: unknown): SaleOrdersListResult | null {
  const parsed = parseListResponse(response, parseSaleOrder)
  if (!parsed) return null
  return { orders: parsed.items }
}

export function parseSaleOrderDetailResponse(response: unknown): SaleOrder | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  return parseSaleOrder(payload as Record<string, unknown>)
}
