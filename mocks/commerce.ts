import type { CouponValidateResponse, OrderDetail, OrderListItem } from '~/types/commerce'
import type { LicenseSummary } from '~/types/licensing'

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
    amount: 2_990_000,
    created_at: Math.floor(Date.now() / 1000) - 86_400,
    product_name: 'Woo Sync Pro',
    plan_name: 'پلن سالانه',
  },
]

export const mockOrderDetail: OrderDetail = {
  ...mockOrders[0]!,
  line_items: [
    {
      product_name: 'Woo Sync Pro',
      plan_name: 'پلن سالانه',
      quantity: 1,
      unit_price: 2_990_000,
    },
  ],
  license_ids: ['lic-mock-1'],
}

export const mockOrderLicenses: LicenseSummary[] = [
  {
    id: 'lic-mock-1',
    license_key_masked: 'XXXX-XXXX-XXXX-1234',
    product_name: 'Woo Sync Pro',
  },
]

export function validateMockCoupon(code: string, planId: string): CouponValidateResponse {
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
