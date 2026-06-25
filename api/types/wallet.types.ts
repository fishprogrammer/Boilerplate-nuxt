import type { PaginationMeta } from './auth.types'

export type WalletTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'refund'
  | 'adjustment'

export type WalletTransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed'

export type TransactionSource = 'online_gateway' | 'manual' | 'system'

export interface WalletTransactionUser {
  id: number
  username: string
}

export interface Wallet {
  id: string
  owner: number
  owner_first_name?: string
  owner_last_name?: string
  owner_display_name?: string
  owner_national_id?: string | null
  balance: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface WalletTransaction {
  id: string
  transaction_type: WalletTransactionType
  amount: number
  balance_after: number
  status: WalletTransactionStatus
  source: TransactionSource
  description: string
  reference: string
  created_by: WalletTransactionUser | null
  created_at: number
}

export interface WalletOperationRequest {
  amount: number
  description?: string
  reference?: string
}

export interface ListWalletsParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  is_active?: boolean
}

export interface ListWalletTransactionsParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  status?: WalletTransactionStatus
  transaction_type?: WalletTransactionType
  source?: TransactionSource
}

export interface WalletsListResult {
  wallets: Wallet[]
  pagination: PaginationMeta
}

export interface WalletTransactionsListResult {
  transactions: WalletTransaction[]
  pagination: PaginationMeta
}

