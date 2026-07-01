import type {
  BulkGenerateCouponsRequest,
  CouponValidateResponse,
  CreateCouponRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  ListCommerceOrdersParams,
  OrderDetail,
  UpdateCouponRequest,
} from '~/types/commerce'
import type { PaginatedResult } from '~/types/api'
import type { PaginationMeta } from '~/api/types/auth.types'
import { commerceService } from '~/api/services/commerce.service'
import {
  parseCommerceCouponDetailResponse,
  parseCommerceCouponsListResponse,
  parseCommerceOrderDetailResponse,
  parseCommerceOrdersListResponse,
  parseCouponValidateResponse,
  parseCreateOrderResponse,
} from '~/api/utils/api-response'
import { parseBulkGenerateCouponsResponse } from '~/api/utils/finance-dashboard-response'
import { mockOrderDetail, mockOrders, validateMockCoupon } from '~/mocks/commerce'
import { isCommerceTerminalStatus } from '~/utils/commerce'

function mapPagination(pagination: PaginationMeta): import('~/types/api').PaginationMeta {
  return {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    total_count: pagination.total_items,
    has_next: Boolean(pagination.next),
    has_previous: Boolean(pagination.previous),
  }
}

function emptyPagination(total: number): import('~/types/api').PaginationMeta {
  return {
    page: 1,
    page_size: total,
    total_pages: 1,
    total_count: total,
    has_next: false,
    has_previous: false,
  }
}

export function useCommerce() {
  const config = useRuntimeConfig()

  const commerceApiLive = computed(
    () => String(config.public.commerceApiLive).toLowerCase() === 'true',
  )

  async function validateCoupon(code: string, planId: string): Promise<CouponValidateResponse> {
    if (!commerceApiLive.value) {
      return validateMockCoupon(code, planId)
    }

    const raw = await commerceService.validateCoupon(code, planId)
    return parseCouponValidateResponse(raw) ?? validateMockCoupon(code, planId)
  }

  async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    if (!commerceApiLive.value) {
      throw new Error('Commerce API is not live yet. Enable NUXT_PUBLIC_COMMERCE_API_LIVE.')
    }

    const raw = await commerceService.createOrder(payload)
    const parsed = parseCreateOrderResponse(raw)
    if (!parsed?.order_id) {
      throw new Error('Invalid create order response')
    }
    return parsed
  }

  async function fetchOrders(
    params?: ListCommerceOrdersParams,
  ): Promise<PaginatedResult<import('~/types/commerce').OrderListItem>> {
    if (!commerceApiLive.value) {
      return { items: mockOrders, pagination: emptyPagination(mockOrders.length) }
    }

    const raw = await commerceService.listOrders(params)
    const parsed = parseCommerceOrdersListResponse(raw)
    return {
      items: parsed?.orders ?? [],
      pagination: parsed?.pagination ? mapPagination(parsed.pagination) : emptyPagination(0),
    }
  }

  async function fetchOrder(id: string): Promise<OrderDetail | null> {
    if (!commerceApiLive.value) {
      return id === mockOrderDetail.id ? mockOrderDetail : null
    }

    try {
      const raw = await commerceService.getOrder(id)
      return parseCommerceOrderDetailResponse(raw)
    } catch {
      return null
    }
  }

  async function pollOrderUntilSettled(
    id: string,
    opts: { intervalMs?: number; timeoutMs?: number } = {},
  ): Promise<OrderDetail | null> {
    const intervalMs = opts.intervalMs ?? 2000
    const timeoutMs = opts.timeoutMs ?? 60_000
    const started = Date.now()

    while (Date.now() - started < timeoutMs) {
      const order = await fetchOrder(id)
      if (order && isCommerceTerminalStatus(order.status)) {
        return order
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    return fetchOrder(id)
  }

  async function adminListCoupons(params?: Record<string, string | number | boolean>) {
    const raw = await commerceService.adminListCoupons(params)
    return parseCommerceCouponsListResponse(raw)
  }

  async function adminGetCoupon(id: string) {
    const raw = await commerceService.adminGetCoupon(id)
    return parseCommerceCouponDetailResponse(raw)
  }

  async function adminCreateCoupon(data: CreateCouponRequest) {
    return commerceService.adminCreateCoupon(data)
  }

  async function adminUpdateCoupon(id: string, data: UpdateCouponRequest) {
    return commerceService.adminUpdateCoupon(id, data)
  }

  async function adminDeleteCoupon(id: string) {
    return commerceService.adminDeleteCoupon(id)
  }

  async function adminListOrders(params?: Record<string, string | number | boolean>) {
    const raw = await commerceService.adminListOrders(params)
    return parseCommerceOrdersListResponse(raw)
  }

  async function adminGetOrder(id: string) {
    const raw = await commerceService.adminGetOrder(id)
    return parseCommerceOrderDetailResponse(raw)
  }

  async function adminBulkGenerateCoupons(data: BulkGenerateCouponsRequest) {
    const raw = await commerceService.adminBulkGenerateCoupons(data)
    return parseBulkGenerateCouponsResponse(raw)
  }

  return {
    commerceApiLive,
    validateCoupon,
    createOrder,
    fetchOrders,
    fetchOrder,
    pollOrderUntilSettled,
    listOrders: fetchOrders,
    getOrder: fetchOrder,
    adminListCoupons,
    adminGetCoupon,
    adminCreateCoupon,
    adminUpdateCoupon,
    adminDeleteCoupon,
    adminListOrders,
    adminGetOrder,
    adminBulkGenerateCoupons,
  }
}
