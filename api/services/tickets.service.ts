import { BaseService } from '../base.service'
import { apiClient } from '../client'
import { API_ENDPOINTS } from '../endpoints'
import type {
  AddTicketMessageRequest,
  CreateGuestTicketRequest,
  CreateTicketDepartmentRequest,
  CreateTicketRequest,
  CreateTicketTypeRequest,
  EscalateTicketRequest,
  GuestTrackRequestPayload,
  GuestTrackVerifyPayload,
  ListTicketsParams,
  ListPersonalRecipientsParams,
  ReferTicketRequest,
  UpdateDepartmentMembersRequest,
  UpdateDepartmentOperatorsRequest,
  UpdateDepartmentRolesRequest,
} from '../types/tickets.types'

function buildListQuery(params?: ListTicketsParams): Record<string, string | number> {
  const query: Record<string, string | number> = {}
  if (params?.page) query.page = params.page
  if (params?.page_size) query.page_size = params.page_size
  if (params?.status) query.status = params.status
  if (params?.priority) query.priority = params.priority
  if (params?.target_type) query.target_type = params.target_type
  if (params?.ticket_type) query.ticket_type = params.ticket_type
  if (params?.current_department) query.current_department = params.current_department
  if (params?.search) query.search = params.search
  if (params?.ordering) query.ordering = params.ordering
  return query
}

function guestHeaders(token: string) {
  return {
    Authorization: `GuestTicket ${token}`,
    'Accept-Language': 'fa',
  }
}

export class TicketsService extends BaseService {
  async listTickets(params?: ListTicketsParams): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.LIST, buildListQuery(params))
  }

  async listQueue(params?: ListTicketsParams): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.QUEUE, buildListQuery(params))
  }

  async getTicket(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.byId(id))
  }

  async createTicket(data: CreateTicketRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.LIST, data)
  }

  async addMessage(id: string, data: AddTicketMessageRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.messages(id), data)
  }

  async takeTicket(id: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.take(id))
  }

  async releaseTicket(id: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.release(id))
  }

  async referTicket(id: string, data: ReferTicketRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.refer(id), data)
  }

  async escalateTicket(id: string, data: EscalateTicketRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.escalate(id), data)
  }

  async closeTicket(id: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.close(id))
  }

  async listEvents(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.events(id))
  }

  async listAttachments(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.attachments(id))
  }

  async listTypes(params?: { page?: number; page_size?: number; is_active?: boolean; search?: string }): Promise<unknown> {
    const query: Record<string, string | number | boolean> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.is_active !== undefined) query.is_active = params.is_active
    if (params?.search) query.search = params.search
    return this.getRaw(API_ENDPOINTS.TICKETS.TYPES, query)
  }

  async getType(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.typeById(id))
  }

  async createType(data: CreateTicketTypeRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.TYPES, data)
  }

  async updateType(id: string, data: Partial<CreateTicketTypeRequest>): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.TICKETS.typeById(id), data)
  }

  async deleteType(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TICKETS.typeById(id))
  }

  async listDepartments(params?: { page?: number; page_size?: number; search?: string }): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    return this.getRaw(API_ENDPOINTS.TICKETS.DEPARTMENTS, query)
  }

  async listAvailableDepartments(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.DEPARTMENTS_AVAILABLE)
  }

  async getPersonalEligibility(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.PERSONAL_ELIGIBILITY)
  }

  async listPersonalRecipients(params?: ListPersonalRecipientsParams): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.search) query.search = params.search
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = Math.min(Math.max(params.page_size, 1), 50)
    return this.getRaw(API_ENDPOINTS.TICKETS.PERSONAL_RECIPIENTS, query)
  }

  async getDepartment(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.departmentById(id))
  }

  async createDepartment(data: CreateTicketDepartmentRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.TICKETS.DEPARTMENTS, data)
  }

  async updateDepartment(id: string, data: Partial<CreateTicketDepartmentRequest>): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.TICKETS.departmentById(id), data)
  }

  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TICKETS.departmentById(id))
  }

  async updateDepartmentRoles(id: string, data: UpdateDepartmentRolesRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.TICKETS.departmentRoles(id), data)
  }

  async updateDepartmentOperators(id: string, data: UpdateDepartmentOperatorsRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.TICKETS.departmentOperators(id), data)
  }

  async getDepartmentOperators(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.departmentOperators(id))
  }

  async updateDepartmentMembers(id: string, data: UpdateDepartmentMembersRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.TICKETS.departmentMembers(id), data)
  }

  async getDepartmentMembers(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.departmentMembers(id))
  }

  async deleteDepartmentMember(deptId: string, userId: number): Promise<unknown> {
    const response = await apiClient.delete(
      API_ENDPOINTS.TICKETS.departmentMemberByUserId(deptId, userId),
    )
    return response.data
  }

  async deleteDepartmentOperator(deptId: string, userId: number): Promise<unknown> {
    const response = await apiClient.delete(
      API_ENDPOINTS.TICKETS.departmentOperatorByUserId(deptId, userId),
    )
    return response.data
  }

  async getSettings(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.TICKETS.SETTINGS)
  }

  async patchSettings(data: Partial<Record<string, unknown>>): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.TICKETS.SETTINGS, data)
  }

  async createGuestTicket(data: CreateGuestTicketRequest): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.GUEST, data, {
      headers: { 'Accept-Language': 'fa' },
    })
    return response.data
  }

  async guestTrackRequest(data: GuestTrackRequestPayload): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.GUEST_TRACK_REQUEST, data, {
      headers: { 'Accept-Language': 'fa' },
    })
    return response.data
  }

  async guestTrackVerify(data: GuestTrackVerifyPayload): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.GUEST_TRACK_VERIFY, data, {
      headers: { 'Accept-Language': 'fa' },
    })
    return response.data
  }

  async getGuestTicket(token: string): Promise<unknown> {
    const response = await apiClient.get(API_ENDPOINTS.TICKETS.GUEST_ME, {
      headers: guestHeaders(token),
    })
    return response.data
  }

  async addGuestMessage(token: string, data: AddTicketMessageRequest): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.GUEST_MESSAGES, data, {
      headers: guestHeaders(token),
    })
    return response.data
  }

  async closeGuestTicket(token: string): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.TICKETS.GUEST_CLOSE, {}, {
      headers: guestHeaders(token),
    })
    return response.data
  }
}

export const ticketsService = new TicketsService()

