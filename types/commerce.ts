import type { LicenseSummary } from './licensing'

export type OrderStatus = 'pending_payment' | 'paid' | 'failed' | 'refunded'
export type DiscountType = 'percent' | 'fixed_amount'
export type CommerceOrderLicense = LicenseSummary

export interface PaymentRedirect {
  action: string
  method: 'GET' | 'POST'
  fields: Record<string, string>
}

export interface CreateOrderRequest {
  plan_id: string
  coupon_code?: string
  pay_with_wallet?: boolean
  gateway_id?: string
}

export interface CreateOrderResponse {
  order_id: string
  status: OrderStatus
  amount: number
  payment: PaymentRedirect | null
  licenses: CommerceOrderLicense[]
}

export interface CouponValidateRequest {
  code: string
  plan_id: string
}

export interface CouponValidateResponse {
  valid: boolean
  code: string
  discount_type: DiscountType
  discount_value: number
  discount_amount: number
  final_amount: number
  message: string
}

export interface CouponAdmin {
  id: string
  code: string
  discount_type: DiscountType
  discount_value: number
  products: string[]
  plans: string[]
  max_uses: number | null
  max_uses_per_user: number
  used_count: number
  valid_from: number
  valid_until: number
  is_active: boolean
  min_order_amount: number | null
  first_purchase_only: boolean
}

export interface CreateCouponRequest {
  code: string
  discount_type: DiscountType
  discount_value: number
  products?: string[]
  plans?: string[]
  max_uses?: number | null
  max_uses_per_user?: number
  valid_from?: number
  valid_until?: number
  is_active?: boolean
  min_order_amount?: number | null
  first_purchase_only?: boolean
}

export type UpdateCouponRequest = Partial<CreateCouponRequest>

export interface OrderListItem {
  id: string
  status: OrderStatus
  subtotal_amount: number
  discount_amount: number
  final_amount: number
  currency: 'IRR'
  product_name: string
  product_slug: string
  paid_at: number | null
  created_at: number
}

export interface OrderLineItem {
  product_name: string
  product_slug: string
  plan_name: string
  license_type: string
  pricing_model: string
  unit_price: number
  quantity: number
}

export interface OrderDetail {
  id: string
  status: OrderStatus
  subtotal_amount: number
  discount_amount: number
  final_amount: number
  currency: 'IRR'
  coupon_code: string | null
  failure_reason: string | null
  paid_at: number | null
  created_at: number
  lines: OrderLineItem[]
  licenses: CommerceOrderLicense[]
}

export interface ListCommerceOrdersParams {
  page?: number
  page_size?: number
  ordering?: string
}

export interface ListAdminCommerceOrdersParams extends ListCommerceOrdersParams {
  status?: OrderStatus
  paid_from?: number
  paid_to?: number
  user?: string
}

export interface BulkGenerateCouponsRequest {
  count: number
  prefix?: string
  discount_type: DiscountType
  discount_value: number
  valid_from?: number
  valid_until?: number
  products?: string[]
  plans?: string[]
  max_uses?: number | null
  max_uses_per_user?: number
  min_order_amount?: number | null
  first_purchase_only?: boolean
}

export interface BulkGenerateCouponsResponse {
  codes: string[]
}

export interface CommerceOrdersListResult {
  orders: OrderListItem[]
  pagination: import('~/api/types/auth.types').PaginationMeta
}

export interface CommerceCouponsListResult {
  coupons: CouponAdmin[]
  pagination: import('~/api/types/auth.types').PaginationMeta
}
