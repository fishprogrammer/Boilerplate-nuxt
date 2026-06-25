import { API_ENDPOINTS } from '../endpoints'
import { BaseService } from '../base.service'
import type { SubmitManualPaymentInput } from '../types/finance.types'

class FinanceService extends BaseService {
  submitManualPayment(data: SubmitManualPaymentInput) {
    return this.postRaw(API_ENDPOINTS.FINANCE.MANUAL_PAYMENTS, data)
  }

  listMySaleOrders(params?: Record<string, unknown>) {
    return this.getRaw(API_ENDPOINTS.FINANCE.MY_SALE_ORDERS, params)
  }

  getMySaleOrder(id: string) {
    return this.getRaw(API_ENDPOINTS.FINANCE.mySaleOrderById(id))
  }
}

export const financeService = new FinanceService()
