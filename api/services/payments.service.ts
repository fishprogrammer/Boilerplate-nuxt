import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  CreatePaymentGatewayRequest,
  InitDepositRequest,
  ListPaymentOrdersParams,
  ManualDepositRequest,
  UpdatePaymentGatewayRequest,
  UpdatePaymentSettingsRequest,
} from '../types/payments.types'

function buildListQuery(params?: ListPaymentOrdersParams): Record<string, string | number> {
  const query: Record<string, string | number> = {}
  if (params?.page) query.page = params.page
  if (params?.page_size) query.page_size = params.page_size
  if (params?.search) query.search = params.search
  if (params?.ordering) query.ordering = params.ordering
  if (params?.status) query.status = params.status
  return query
}

export class PaymentsService extends BaseService {
  async listGateways(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.PAYMENTS.GATEWAYS)
  }

  async initDeposit(data: InitDepositRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.PAYMENTS.DEPOSIT, data)
  }

  async listOrders(params?: ListPaymentOrdersParams): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.PAYMENTS.ORDERS, buildListQuery(params))
  }

  async getOrder(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.PAYMENTS.orderById(id))
  }

  buildGatewayCallbackUrl(orderId: string, token: string): string {
    return API_ENDPOINTS.PAYMENTS.callback(orderId, token)
  }

  async getAdminSettings(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.PAYMENTS.ADMIN.SETTINGS)
  }

  async patchAdminSettings(data: UpdatePaymentSettingsRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.PAYMENTS.ADMIN.SETTINGS, data)
  }

  async listAdminGateways(params?: { page?: number; page_size?: number }): Promise<unknown> {
    const query: Record<string, number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    return this.getRaw(API_ENDPOINTS.PAYMENTS.ADMIN.GATEWAYS, query)
  }

  async createAdminGateway(data: CreatePaymentGatewayRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.PAYMENTS.ADMIN.GATEWAYS, data)
  }

  async getAdminGateway(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.PAYMENTS.ADMIN.gatewayById(id))
  }

  async patchAdminGateway(id: string, data: UpdatePaymentGatewayRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.PAYMENTS.ADMIN.gatewayById(id), data)
  }

  async deleteAdminGateway(id: string): Promise<unknown> {
    return this.deleteRaw(API_ENDPOINTS.PAYMENTS.ADMIN.gatewayById(id))
  }

  async listAdminGatewayOrders(gatewayId: string, params?: ListPaymentOrdersParams): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.PAYMENTS.ADMIN.gatewayOrders(gatewayId), buildListQuery(params))
  }

  async manualDeposit(data: ManualDepositRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.PAYMENTS.ADMIN.MANUAL_DEPOSIT, data)
  }

  async listDrivers(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.PAYMENTS.ADMIN.DRIVERS)
  }
}

export const paymentsService = new PaymentsService()

