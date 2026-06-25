import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  ListWalletTransactionsParams,
  ListWalletsParams,
  WalletOperationRequest,
} from '../types/wallet.types'

export class WalletService extends BaseService {
  async getMyWallet(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.WALLET.ME)
  }

  async listMyTransactions(params?: ListWalletTransactionsParams): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.ordering) query.ordering = params.ordering
    if (params?.status) query.status = params.status
    if (params?.transaction_type) query.transaction_type = params.transaction_type
    if (params?.source) query.source = params.source
    return this.getRaw(API_ENDPOINTS.WALLET.TRANSACTIONS, query)
  }

  async listWallets(params?: ListWalletsParams): Promise<unknown> {
    const query: Record<string, string | number | boolean> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.ordering) query.ordering = params.ordering
    if (params?.is_active !== undefined) query.is_active = params.is_active
    return this.getRaw(API_ENDPOINTS.WALLET.LIST, query)
  }

  async getWallet(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.WALLET.byId(id))
  }

  async deposit(id: string, data: WalletOperationRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.WALLET.deposit(id), data)
  }

  async withdraw(id: string, data: WalletOperationRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.WALLET.withdraw(id), data)
  }
}

export const walletService = new WalletService()

