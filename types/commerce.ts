import type { LicenseSummary } from './licensing'

export type OrderStatus = 'pending_payment' | 'paid' | 'failed' | 'refunded'

export interface PaymentRedirect {
  action: string
  method: 'GET' | 'POST'
  fields: Record<string, string>
}

export interface CreateOrderRequest {
  plan_id: string
  coupon_code?: string
  pay_with_wallet?: boolean
}

export interface CreateOrderResponse {
  order_id: string
  status: OrderStatus
  amount: number
  payment: PaymentRedirect | null
  licenses: LicenseSummary[]
}

export interface CouponValidateRequest {
  code: string
  plan_id: string
}

export interface CouponValidateResponse {
  valid: boolean
  code: string
  discount_type: 'percent' | 'fixed_amount'
  discount_value: number
  discount_amount: number
  final_amount: number
  message: string
}

export interface CouponAdmin {
  id: string
  code: string
  discount_type: 'percent' | 'fixed_amount'
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

export interface OrderListItem {
  id: string
  status: OrderStatus
  amount: number
  created_at: number
  product_name: string
  plan_name: string
}

export interface OrderDetail extends OrderListItem {
  line_items: {
    product_name: string
    plan_name: string
    quantity: number
    unit_price: number
  }[]
  license_ids: string[]
}
