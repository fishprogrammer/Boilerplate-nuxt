import type {
  CouponValidateResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetail,
  OrderListItem,
} from '~/types/commerce'
import type { PaginatedResult } from '~/types/api'
import { mockOrderDetail, mockOrders, validateMockCoupon } from '~/mocks/commerce'

export function useCommerce() {
  const config = useRuntimeConfig()

  const commerceApiLive = computed(
    () => String(config.public.commerceApiLive).toLowerCase() === 'true',
  )

  async function validateCoupon(code: string, planId: string): Promise<CouponValidateResponse> {
    if (!commerceApiLive.value) {
      return validateMockCoupon(code, planId)
    }

    const { api } = useApi()
    return api<CouponValidateResponse>('/api/commerce/coupons/validate/', {
      method: 'POST',
      data: { code, plan_id: planId },
    })
  }

  async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    if (!commerceApiLive.value) {
      throw new Error('Commerce API is not live yet. Enable NUXT_PUBLIC_COMMERCE_API_LIVE.')
    }

    const { api } = useApi()
    return api<CreateOrderResponse>('/api/commerce/orders/', {
      method: 'POST',
      data: payload,
    })
  }

  async function listOrders(): Promise<PaginatedResult<OrderListItem>> {
    if (!commerceApiLive.value) {
      return {
        items: mockOrders,
        pagination: {
          page: 1,
          page_size: 10,
          total_pages: 1,
          total_count: mockOrders.length,
          has_next: false,
          has_previous: false,
        },
      }
    }

    const { api } = useApi()
    const items = await api<OrderListItem[]>('/api/commerce/orders/')
    return {
      items,
      pagination: {
        page: 1,
        page_size: items.length,
        total_pages: 1,
        total_count: items.length,
        has_next: false,
        has_previous: false,
      },
    }
  }

  async function getOrder(id: string): Promise<OrderDetail> {
    if (!commerceApiLive.value) {
      return mockOrderDetail
    }

    const { api } = useApi()
    return api<OrderDetail>(`/api/commerce/orders/${id}/`)
  }

  return {
    commerceApiLive,
    validateCoupon,
    createOrder,
    listOrders,
    getOrder,
  }
}
