import type { PaginationMeta } from './auth.types'
import type { TransactionSource, WalletTransaction } from './wallet.types'

export type PaymentRedirectMethod = 'GET' | 'POST'

export interface PaymentRedirect {
  action: string
  method: PaymentRedirectMethod
  fields: Record<string, string>
}

export type PaymentOrderStatus =
  | 'pending'
  | 'redirected'
  | 'verifying'
  | 'paid'
  | 'failed'
  | 'cancelled'

export interface PaymentGatewayPublic {
  id: string
  title: string
  min_amount: number | null
  max_amount: number | null
  sort_order: number
}

export interface PaymentGatewayAdmin extends PaymentGatewayPublic {
  driver: string
  is_active: boolean
  is_sandbox: boolean
  credentials: Record<string, unknown>
  created_at: number
  updated_at: number
}

export interface PaymentOrder {
  id: string
  gateway_id: string
  gateway_title: string
  amount: number
  status: PaymentOrderStatus
  reference_id: string
  failure_reason: string
  transaction_source: TransactionSource | null
  created_at: number
  updated_at: number
}

export interface DepositInitData {
  order_id: string
  redirect: PaymentRedirect
}

export interface InitDepositRequest {
  gateway_id: string
  amount: number
}

export interface PaymentSettings {
  deposits_enabled: boolean
  min_deposit_amount: number
  max_deposit_amount: number
  frontend_success_url: string
  frontend_failure_url: string
  updated_at?: number
}

export interface UpdatePaymentSettingsRequest {
  deposits_enabled?: boolean
  min_deposit_amount?: number
  max_deposit_amount?: number
  frontend_success_url?: string
  frontend_failure_url?: string
}

export interface PaymentDriver {
  code: string
  title: string
  credential_fields?: PaymentDriverCredentialField[]
}

export interface PaymentDriverCredentialField {
  key: string
  label: string
  type?: string
  required?: boolean
  secret?: boolean
}

export interface CreatePaymentGatewayRequest {
  driver: string
  title: string
  is_active?: boolean
  is_sandbox?: boolean
  credentials?: Record<string, unknown>
  min_amount?: number | null
  max_amount?: number | null
  sort_order?: number
}

export interface UpdatePaymentGatewayRequest {
  title?: string
  is_active?: boolean
  is_sandbox?: boolean
  credentials?: Record<string, unknown>
  min_amount?: number | null
  max_amount?: number | null
  sort_order?: number
}

export interface ManualDepositRequest {
  user_id: number
  amount: number
  description?: string
  reference?: string
}

export interface ListPaymentOrdersParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  status?: PaymentOrderStatus
}

export interface PaymentOrdersListResult {
  orders: PaymentOrder[]
  pagination: PaginationMeta
}

export interface PaymentGatewaysListResult {
  gateways: PaymentGatewayAdmin[]
  pagination: PaginationMeta
}

export interface ManualDepositResult {
  transaction: WalletTransaction | null
}

