export type ManualPaymentPurpose = 'sale_order_payment' | 'wallet_deposit' | 'prepayment_at_sale'

export type PaymentMode = 'cash' | 'installment'
export type SaleOrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'
  | string

export interface SaleOrder {
  id: string
  order_number: string
  status: SaleOrderStatus
  total_amount: number
  payment_mode: PaymentMode
  enrollment_start: string
}

export interface SaleOrdersListResult {
  orders: SaleOrder[]
}

export interface SubmitManualPaymentInput {
  purpose?: ManualPaymentPurpose
  sale_order_id?: string
  installment_id?: string
  amount?: number
  receipt_media_id: string
}
