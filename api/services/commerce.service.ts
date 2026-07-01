import { apiClient } from '../client'
import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  CreateCouponRequest,
  CreateOrderRequest,
  ListCommerceOrdersParams,
  UpdateCouponRequest,
} from '~/types/commerce'

export class CommerceService extends BaseService {
  async validateCoupon(code: string, planId: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.COMMERCE.COUPONS_VALIDATE, {
      code,
      plan_id: planId,
    })
  }

  async createOrder(data: CreateOrderRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.COMMERCE.ORDERS, data)
  }

  async listOrders(params?: ListCommerceOrdersParams): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.COMMERCE.ORDERS, query)
  }

  async getOrder(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.COMMERCE.orderById(id))
  }

  async adminListCoupons(params?: Record<string, string | number | boolean>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.COMMERCE.ADMIN.COUPONS, params)
  }

  async adminGetCoupon(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.COMMERCE.ADMIN.couponById(id))
  }

  async adminCreateCoupon(data: CreateCouponRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.COMMERCE.ADMIN.COUPONS, data)
  }

  async adminUpdateCoupon(id: string, data: UpdateCouponRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.COMMERCE.ADMIN.couponById(id), data)
  }

  async adminDeleteCoupon(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COMMERCE.ADMIN.couponById(id))
  }

  async adminListOrders(params?: Record<string, string | number | boolean>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.COMMERCE.ADMIN.ORDERS, params)
  }

  async adminGetOrder(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.COMMERCE.ADMIN.orderById(id))
  }
}

export const commerceService = new CommerceService()
