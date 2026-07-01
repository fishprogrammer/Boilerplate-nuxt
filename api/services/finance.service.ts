import { API_ENDPOINTS } from '../endpoints'
import { BaseService } from '../base.service'
import type { SubmitManualPaymentInput } from '../types/finance.types'
import type { ForecastScenario } from '~/types/finance'

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

  getDashboard() {
    return this.getRaw(API_ENDPOINTS.FINANCE.DASHBOARD)
  }

  getMrr(months = 12) {
    return this.getRaw(API_ENDPOINTS.FINANCE.MRR, { months })
  }

  getForecast(months = 12, scenario: ForecastScenario = 'realistic') {
    return this.getRaw(API_ENDPOINTS.FINANCE.FORECAST, { months, scenario })
  }

  getRevenueByProduct() {
    return this.getRaw(API_ENDPOINTS.FINANCE.REVENUE_BY_PRODUCT)
  }

  getCouponsImpact() {
    return this.getRaw(API_ENDPOINTS.FINANCE.COUPONS_IMPACT)
  }
}

export const financeService = new FinanceService()
