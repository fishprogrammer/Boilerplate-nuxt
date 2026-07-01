import type { PaginationMeta } from './auth.types'

export type TicketStatus = 'open' | 'in_progress' | 'answered' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TargetType = 'department' | 'user'

export interface CompactUser {
  id: number
  username: string
  first_name: string
  last_name: string
}

export interface Ticket {
  id: string
  tracking_code: string
  ticket_type: string
  ticket_type_name: string
  target_type: TargetType
  requester: CompactUser | null
  target_user: CompactUser | null
  current_department: string | null
  current_department_name: string | null
  assigned_to: CompactUser | null
  subject: string
  body: string
  product_slug: string | null
  status: TicketStatus
  priority: TicketPriority
  is_guest: boolean
  guest_name: string
  guest_email: string
  guest_phone: string
  department_received_at: number | null
  taken_at: number | null
  closed_at: number | null
  created_at: number
  updated_at: number
}

export interface TicketMessage {
  id: string
  body: string
  author: CompactUser | null
  is_staff_reply: boolean
  attachments: TicketAttachment[]
  created_at: number
}

export interface TicketAttachment {
  id: string
  media_id: string
  message_id: string | null
  original_name: string
  file_type: 'image' | 'document' | 'video' | 'audio' | 'other' | string
  mime_type: string
  file_url: string
  download_url: string
  thumbnail_url: string
  size: number
  created_at: number
}

export interface DepartmentBrief {
  id: string
  name: string
}

export interface TicketEventDetail {
  from_department?: DepartmentBrief | string
  to_department?: DepartmentBrief | string
  department?: DepartmentBrief | string
  message_id?: string
  id?: string
  body?: string
  is_staff_reply?: boolean
  subject?: string
  assigned_to?: CompactUser
  created_at?: number
  attachments?: unknown[]
}

export interface TicketEvent {
  id: string
  event_type: string
  actor: CompactUser | null
  detail: TicketEventDetail
  created_at: number
}

export interface TicketType {
  id: string
  name: string
  slug: string
  description: string
  is_active: boolean
  sort_order: number
  created_at: number
  updated_at: number
}

export interface TicketDepartment {
  id: string
  name: string
  slug: string
  description: string
  is_active: boolean
  members?: CompactUser[]
  operators?: CompactUser[]
  created_at: number
  updated_at: number
}

export interface TicketSettings {
  allowed_extensions: string[]
  max_files_per_message: number
  max_upload_size_mb: number
  max_body_length: number
  allow_urls_in_body: boolean
  guest_rate_limit_per_hour: number
  updated_at: number
}

export interface ListTicketsParams {
  page?: number
  page_size?: number
  status?: TicketStatus | ''
  priority?: TicketPriority | ''
  target_type?: TargetType | ''
  ticket_type?: string
  current_department?: string
  search?: string
  ordering?: string
}

export interface TicketsListResult {
  tickets: Ticket[]
  pagination: PaginationMeta
}

export interface TicketTypesListResult {
  types: TicketType[]
  pagination: PaginationMeta
}

export interface TicketDepartmentsListResult {
  departments: TicketDepartment[]
  pagination: PaginationMeta
}

export interface CreateTicketRequest {
  ticket_type: string
  target_type: TargetType
  current_department?: string
  target_user?: number
  subject: string
  body: string
  product_slug?: string | null
  priority?: TicketPriority
  media_ids?: string[]
}

export interface CreateGuestTicketRequest {
  ticket_type: string
  current_department: string
  guest_name: string
  guest_email: string
  guest_phone: string
  subject: string
  body: string
  priority?: TicketPriority
  captcha_id: string
  captcha_answer: string
  media_ids?: string[]
}

export interface GuestTrackRequestPayload {
  tracking_code: string
  guest_phone: string
  captcha_id: string
  captcha_answer: string
}

export interface GuestTrackVerifyPayload {
  track_request_id: string
  code: string
}

export interface AddTicketMessageRequest {
  body: string
  media_ids?: string[]
}

export interface ReferTicketRequest {
  department: string
}

export interface EscalateTicketRequest {
  department: string
}

export interface CreateTicketTypeRequest {
  name: string
  slug: string
  description?: string
  is_active?: boolean
  sort_order?: number
}

export interface CreateTicketDepartmentRequest {
  name: string
  slug: string
  description?: string
  is_active?: boolean
}

export interface UpdateDepartmentRolesRequest {
  group_ids: number[]
}

export interface UpdateDepartmentOperatorsRequest {
  user_ids: number[]
}

export interface UpdateDepartmentMembersRequest {
  user_ids: number[]
}

export interface PersonalTicketRecipient {
  id: number
  username: string
  first_name: string
  last_name: string
  full_name: string
  phone_number: string
  departments: string[]
}

export interface PersonalTicketEligibility {
  can_send_personal: boolean
  member_department_ids: string[]
}

export interface ListPersonalRecipientsParams {
  search?: string
  page?: number
  page_size?: number
}

export interface PersonalRecipientsListResult {
  recipients: PersonalTicketRecipient[]
  pagination: PaginationMeta
  /** Guide message when data is empty (e.g. user not in any department) */
  message?: string
}

export interface DepartmentIdsResult {
  user_ids: number[]
}

export interface ParsedGuestTicketCreate {
  ok: boolean
  ticket: Ticket | null
  trackingCode: string
  message?: string
}

export interface ParsedGuestTrackRequest {
  ok: boolean
  trackRequestId: string
  expiresAt: number
  debugCode?: string
  message?: string
}

export interface ParsedGuestTrackVerify {
  ok: boolean
  guestToken: string
  expiresAt: number
  ticket: Ticket | null
  message?: string
}

