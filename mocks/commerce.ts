import type { CouponValidateResponse, OrderDetail, OrderListItem } from '~/types/commerce'

export const mockCouponValid: CouponValidateResponse = {
  valid: true,
  code: 'LAUNCH20',
  discount_type: 'percent',
  discount_value: 20,
  discount_amount: 598_000,
  final_amount: 2_392_000,
  message: 'کد تخفیف با موفقیت اعمال شد.',
}

export const mockOrders: OrderListItem[] = [
  {
    id: 'ord-mock-1',
    status: 'paid',
    subtotal_amount: 2_990_000,
    discount_amount: 0,
    final_amount: 2_990_000,
    currency: 'IRR',
    product_name: 'Woo Sync Pro',
    product_slug: 'woo-sync-pro',
    paid_at: Math.floor(Date.now() / 1000) - 86_400,
    created_at: Math.floor(Date.now() / 1000) - 86_400,
  },
]

export const mockOrderDetail: OrderDetail = {
  id: 'ord-mock-1',
  status: 'paid',
  subtotal_amount: 2_990_000,
  discount_amount: 0,
  final_amount: 2_990_000,
  currency: 'IRR',
  coupon_code: null,
  failure_reason: null,
  paid_at: Math.floor(Date.now() / 1000) - 86_400,
  created_at: Math.floor(Date.now() / 1000) - 86_400,
  lines: [
    {
      product_name: 'Woo Sync Pro',
      product_slug: 'woo-sync-pro',
      plan_name: 'پلن سالانه',
      license_type: 'per_domain',
      pricing_model: 'subscription',
      unit_price: 2_990_000,
      quantity: 1,
    },
  ],
  licenses: [],
}

export function validateMockCoupon(code: string, _planId: string): CouponValidateResponse {
  if (code.toUpperCase() === 'LAUNCH20') {
    return { ...mockCouponValid, code: code.toUpperCase() }
  }
  return {
    valid: false,
    code,
    discount_type: 'percent',
    discount_value: 0,
    discount_amount: 0,
    final_amount: 0,
    message: 'کد تخفیف نامعتبر یا منقضی است.',
  }
}
