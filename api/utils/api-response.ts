import type {
  CreateUserInput,
  CreateUserRequest,
  CreateRoleRequest,
  PaginationMeta,
  RefreshTokenResponse,
  UpdateProfileInput,
  UpdateProfileRequest,
  UpdateUserInput,
  UpdateUserRequest,
  UserProfile,
  UsersListResult,
  VerifyRegisterRequest,
  Permission,
  PermissionsListResult,
  Role,
  RolesListResult,
} from '../types/auth.types'
import type { MediaFile, MediaFileType, MediaListResult } from '../types/media.types'
import type {
  InboxListResult,
  Notification,
  NotificationPriority,
  NotificationSender,
  NotificationSenderRole,
  NotificationType,
  SendNotificationInput,
  SendNotificationRequest,
} from '../types/inbox.types'
import type { BlogComment, BlogCommentStatus, BlogCommentsListResult, BlogPost, BlogPostStatus, BlogPostsListResult, CreateBlogPostInput, CreateBlogPostRequest, UpdateBlogPostInput, UpdateBlogPostRequest } from '../types/blog.types'
import type {
  Wallet,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
  WalletTransactionsListResult,
  WalletsListResult,
  TransactionSource,
  WalletTransactionUser,
} from '../types/wallet.types'
import type {
  CompactUser,
  ParsedGuestTicketCreate,
  ParsedGuestTrackRequest,
  ParsedGuestTrackVerify,
  TargetType,
  Ticket,
  TicketAttachment,
  TicketEventDetail,
  DepartmentBrief,
  TicketDepartment,
  TicketDepartmentsListResult,
  TicketEvent,
  TicketMessage,
  TicketPriority,
  TicketSettings,
  TicketStatus,
  TicketType,
  TicketTypesListResult,
  TicketsListResult,
  CreateTicketRequest,
  PersonalTicketEligibility,
  PersonalTicketRecipient,
  PersonalRecipientsListResult,
  DepartmentIdsResult,
} from '../types/tickets.types'
import type {
  DepositInitData,
  ManualDepositResult,
  PaymentDriver,
  PaymentGatewayAdmin,
  PaymentGatewayPublic,
  PaymentGatewaysListResult,
  PaymentOrder,
  PaymentOrderStatus,
  PaymentOrdersListResult,
  PaymentRedirect,
  PaymentSettings,
} from '../types/payments.types'
import type {
  DatabaseBackupSettings,
  GeneralSettings,
  MediaSettings,
  RoleDetail,
  SecuritySettings,
  SmsProviderSettings,
  SystemSettings,
} from '../types/system.types'
import { normalizeBlogSlug, normalizeEnglishSlug } from '~/utils/blog'
import { birthDateToPickerValue } from '~/utils/date'
import { ensureVisualHtmlBody } from '~/utils/html'
import { normalizePermissions } from '~/utils/permissions'

/** Payload inside `{ status, code, data: { ... } }` API envelope */
export function getApiPayload(response: unknown): Record<string, unknown> {
  if (!response || typeof response !== 'object') return {}
  const root = response as Record<string, unknown>
  const inner = root.data
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>
  }
  return {}
}

export function isApiSuccess(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false
  const root = response as Record<string, unknown>
  return root.status === 'success'
}

function pickString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function isOtpSentResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false
  return (response as Record<string, unknown>).code === 'otp_sent'
}

export interface ParsedLoginStep {
  ok: boolean
  otpSent: boolean
  /** Required for POST /api/auth/login/verify/ */
  loginId?: string
  expiresAt?: string
  debugCode?: string
  access?: string
  refresh?: string
  message?: string
}

/** POST /api/auth/login/ — step 1 (Swagger: data.login_id, data.debug_code) */
export function parseLoginStepResponse(response: unknown): ParsedLoginStep {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const payload = getApiPayload(response)

  const loginId = pickString(payload, 'login_id')
  const expiresAt = pickString(payload, 'expires_at')
  const debugCode = pickString(payload, 'debug_code')
  const access = pickString(payload, 'access')
  const refresh = pickString(payload, 'refresh')
  const message = typeof root.message === 'string' ? root.message : undefined
  const otpSent = isOtpSentResponse(response)
  const ok = isApiSuccess(response)

  return { ok, otpSent, loginId, expiresAt, debugCode, access, refresh, message }
}

/** پیام وقتی otp_sent است ولی data خالی (anti-enumeration یا DEBUG خاموش روی سرور) */
export function loginMissingIdMessage(parsed: ParsedLoginStep): string {
  const base =
    parsed.message ||
    'اگر حسابی با این شماره وجود داشته باشد، کد ارسال شده است.'
  return `${base}`
}

/** POST /api/auth/login/verify/ */
export function buildVerifyOtpPayload(loginId: string, code: string) {
  return { login_id: loginId, code }
}

export interface ParsedRegisterStep {
  ok: boolean
  otpSent: boolean
  registerId?: string
  expiresAt?: string
  debugCode?: string
  message?: string
}

/** POST /api/auth/register/ — step 1 (Swagger: data.register_id, data.debug_code) */
export function parseRegisterStepResponse(response: unknown): ParsedRegisterStep {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const payload = getApiPayload(response)

  const registerId = pickString(payload, 'register_id')
  const expiresAt = pickString(payload, 'expires_at')
  const debugCode = pickString(payload, 'debug_code')
  const message = typeof root.message === 'string' ? root.message : undefined
  const otpSent = isOtpSentResponse(response)
  const ok = isApiSuccess(response)

  return { ok, otpSent, registerId, expiresAt, debugCode, message }
}

export function registerMissingIdMessage(parsed: ParsedRegisterStep): string {
  return (
    parsed.message ||
    'اگر این شماره قبلاً ثبت نشده باشد، کد ارسال شده است.'
  )
}

export interface RegisterVerifyProfile {
  first_name?: string
  last_name?: string
  email?: string
  gender?: string
  birth_date?: string
  national_id?: string
}

/** POST /api/auth/refresh/ — supports envelope `{ data: { access } }` and flat `{ access }`. */
export function parseRefreshResponse(response: unknown): RefreshTokenResponse | null {
  if (!response || typeof response !== 'object') return null

  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const nested = getApiPayload(response)
  const sources: Record<string, unknown>[] = []

  if (Object.keys(nested).length > 0) sources.push(nested)
  sources.push(root)

  for (const source of sources) {
    const access = pickString(source, 'access') ?? pickString(source, 'access_token')
    if (!access) continue

    const refresh =
      pickString(source, 'refresh') ??
      pickString(source, 'refresh_token') ??
      ''
    return { access, refresh }
  }

  return null
}

/** GET /api/auth/users/ */
export function parseUsersListResponse(response: unknown): UsersListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  if (!Array.isArray(data)) return null

  const meta =
    root.meta && typeof root.meta === 'object' && !Array.isArray(root.meta)
      ? (root.meta as Record<string, unknown>)
      : null
  const paginationRaw =
    meta?.pagination && typeof meta.pagination === 'object' && !Array.isArray(meta.pagination)
      ? (meta.pagination as Record<string, unknown>)
      : null

  const pagination: PaginationMeta = {
    page: Number(paginationRaw?.page) || 1,
    page_size: Number(paginationRaw?.page_size) || data.length || 15,
    total_pages: Number(paginationRaw?.total_pages) || 1,
    total_items:
      Number(paginationRaw?.total_items ?? paginationRaw?.total_count) || data.length,
    next: typeof paginationRaw?.next === 'string' ? paginationRaw.next : null,
    previous: typeof paginationRaw?.previous === 'string' ? paginationRaw.previous : null,
  }

  const users = data
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeUserListProfile(item))

  return { users, pagination }
}

function normalizeUserListProfile(raw: Record<string, unknown>): UserProfile {
  const roles = Array.isArray(raw.roles) ? raw.roles : []
  const walletRaw =
    raw.wallet && typeof raw.wallet === 'object' && !Array.isArray(raw.wallet)
      ? (raw.wallet as Record<string, unknown>)
      : null

  return {
    id: Number(raw.id) || 0,
    username: String(raw.username || ''),
    email: String(raw.email || ''),
    first_name: String(raw.first_name || ''),
    last_name: String(raw.last_name || ''),
    phone_number: String(raw.phone_number || ''),
    national_id:
      raw.national_id === null || raw.national_id === undefined
        ? null
        : String(raw.national_id),
    birth_date: raw.birth_date as string | number | undefined,
    gender: raw.gender === 'male' || raw.gender === 'female' ? raw.gender : undefined,
    roles: roles as UserProfile['roles'],
    wallet: walletRaw
      ? {
          balance:
            typeof walletRaw.balance === 'number' || typeof walletRaw.balance === 'string'
              ? walletRaw.balance
              : undefined,
          is_active: walletRaw.is_active !== false,
        }
      : undefined,
    is_active: raw.is_active !== false,
    is_staff: Boolean(raw.is_staff),
    is_superuser: Boolean(raw.is_superuser),
    profile_complete:
      typeof raw.profile_complete === 'boolean' ? raw.profile_complete : undefined,
    profile_missing_fields: Array.isArray(raw.profile_missing_fields)
      ? raw.profile_missing_fields.filter((f): f is string => typeof f === 'string')
      : undefined,
  }
}

/** GET /api/auth/permissions/ */
export function parsePermissionsListResponse(response: unknown): PermissionsListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  if (!Array.isArray(data)) return null

  const meta =
    root.meta && typeof root.meta === 'object' && !Array.isArray(root.meta)
      ? (root.meta as Record<string, unknown>)
      : null
  const paginationRaw =
    meta?.pagination && typeof meta.pagination === 'object' && !Array.isArray(meta.pagination)
      ? (meta.pagination as Record<string, unknown>)
      : null

  const pagination: PaginationMeta = {
    page: Number(paginationRaw?.page) || 1,
    page_size: Number(paginationRaw?.page_size) || data.length || 15,
    total_pages: Number(paginationRaw?.total_pages) || 1,
    total_items: Number(paginationRaw?.total_items) || data.length,
    next: typeof paginationRaw?.next === 'string' ? paginationRaw.next : null,
    previous: typeof paginationRaw?.previous === 'string' ? paginationRaw.previous : null,
  }

  return {
    permissions: data as Permission[],
    pagination,
  }
}

/** GET /api/auth/roles/ */
export function parseRolesListResponse(response: unknown): RolesListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const data = root.data
  if (!Array.isArray(data)) return null

  const meta =
    root.meta && typeof root.meta === 'object' && !Array.isArray(root.meta)
      ? (root.meta as Record<string, unknown>)
      : null
  const paginationRaw =
    meta?.pagination && typeof meta.pagination === 'object' && !Array.isArray(meta.pagination)
      ? (meta.pagination as Record<string, unknown>)
      : null

  const pagination: PaginationMeta = {
    page: Number(paginationRaw?.page) || 1,
    page_size: Number(paginationRaw?.page_size) || data.length || 15,
    total_pages: Number(paginationRaw?.total_pages) || 1,
    total_items: Number(paginationRaw?.total_items) || data.length,
    next: typeof paginationRaw?.next === 'string' ? paginationRaw.next : null,
    previous: typeof paginationRaw?.previous === 'string' ? paginationRaw.previous : null,
  }

  return {
    roles: data as Role[],
    pagination,
  }
}

const MEDIA_FILE_TYPES: MediaFileType[] = ['image', 'document', 'video', 'audio', 'other']

function isMediaFileLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.original_name === 'string'
}

function normalizeMediaFile(raw: Record<string, unknown>): MediaFile {
  const fileType = String(raw.file_type || 'other')
  const normalizedType = MEDIA_FILE_TYPES.includes(fileType as MediaFileType)
    ? (fileType as MediaFileType)
    : 'other'

  return {
    id: String(raw.id),
    original_name: String(raw.original_name || ''),
    file_type: normalizedType,
    mime_type: String(raw.mime_type || ''),
    size: Number(raw.size) || 0,
    width: raw.width === null || raw.width === undefined ? null : Number(raw.width) || 0,
    height: raw.height === null || raw.height === undefined ? null : Number(raw.height) || 0,
    file_url:
      raw.file_url === null || raw.file_url === undefined || raw.file_url === ''
        ? null
        : String(raw.file_url),
    download_url:
      raw.download_url === null || raw.download_url === undefined || raw.download_url === ''
        ? null
        : String(raw.download_url),
    thumbnail_url:
      raw.thumbnail_url === null || raw.thumbnail_url === undefined || raw.thumbnail_url === ''
        ? null
        : String(raw.thumbnail_url),
    uploaded_by: Number(raw.uploaded_by) || 0,
    uploaded_by_username: String(raw.uploaded_by_username || ''),
    created_at: Number(raw.created_at) || 0,
  }
}

function extractMediaItems(root: Record<string, unknown>): unknown[] | null {
  const data = root.data

  if (Array.isArray(data)) {
    if (data.length === 0) return []
    if (isMediaFileLike(data[0])) return data

    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const nested = (first as Record<string, unknown>).data
      if (Array.isArray(nested)) return nested
    }
    return data
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }

  return null
}

function extractPagination(root: Record<string, unknown>, fallbackLength: number): PaginationMeta {
  const meta =
    root.meta && typeof root.meta === 'object' && !Array.isArray(root.meta)
      ? (root.meta as Record<string, unknown>)
      : null

  let paginationRaw =
    meta?.pagination && typeof meta.pagination === 'object' && !Array.isArray(meta.pagination)
      ? (meta.pagination as Record<string, unknown>)
      : null

  if (!paginationRaw && Array.isArray(root.data) && root.data[0] && typeof root.data[0] === 'object') {
    const nestedMeta = (root.data[0] as Record<string, unknown>).meta
    if (nestedMeta && typeof nestedMeta === 'object' && !Array.isArray(nestedMeta)) {
      const nestedPagination = (nestedMeta as Record<string, unknown>).pagination
      if (nestedPagination && typeof nestedPagination === 'object' && !Array.isArray(nestedPagination)) {
        paginationRaw = nestedPagination as Record<string, unknown>
      }
    }
  }

  return {
    page: Number(paginationRaw?.page) || 1,
    page_size: Number(paginationRaw?.page_size) || fallbackLength || 24,
    total_pages: Number(paginationRaw?.total_pages) || 1,
    total_items: Number(paginationRaw?.total_items) || fallbackLength,
    next: typeof paginationRaw?.next === 'string' ? paginationRaw.next : null,
    previous: typeof paginationRaw?.previous === 'string' ? paginationRaw.previous : null,
  }
}

/** GET /api/media/ */
export function parseMediaListResponse(response: unknown): MediaListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractMediaItems(root)
  if (!rawItems) return null

  const items = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeMediaFile(item))

  const pagination = extractPagination(root, items.length)

  return { items, pagination }
}

function isNotificationLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.title === 'string'
}

function pickOptionalString(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = raw[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function normalizeNotificationSenderRole(raw: unknown): NotificationSenderRole | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  const slug = pickOptionalString(item, 'slug', 'name')
  if (!slug) return null
  return {
    slug,
    display_name: pickOptionalString(item, 'display_name', 'name') || slug,
  }
}

function normalizeNotificationSender(raw: unknown): NotificationSender | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  if (typeof item.id !== 'number') return null
  const rolesRaw = Array.isArray(item.roles) ? item.roles : []
  const roles = rolesRaw
    .map((role) => normalizeNotificationSenderRole(role))
    .filter((role): role is NotificationSenderRole => role !== null)
  return {
    id: item.id,
    username: String(item.username || ''),
    first_name: String(item.first_name || ''),
    last_name: String(item.last_name || ''),
    roles,
  }
}

function pickSenderRole(raw: Record<string, unknown>, sender?: Record<string, unknown> | null): string {
  const direct = pickOptionalString(
    raw,
    'sent_by_role',
    'sent_by_role_name',
    'sent_by_group',
    'sent_by_group_name',
  )
  if (direct) return direct

  if (!sender) return ''

  const nested = pickOptionalString(sender, 'role', 'role_name', 'group', 'group_name', 'name')
  if (nested) return nested

  const roles = sender.roles ?? sender.groups
  if (!Array.isArray(roles) || roles.length === 0) return ''

  const first = roles[0]
  if (typeof first === 'string') return first
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    const record = first as Record<string, unknown>
    return pickOptionalString(record, 'name', 'role', 'group')
  }

  return ''
}

function normalizeNotification(raw: Record<string, unknown>): Notification {
  const sender =
    raw.sent_by && typeof raw.sent_by === 'object' && !Array.isArray(raw.sent_by)
      ? (raw.sent_by as Record<string, unknown>)
      : null

  const sentByFirstName =
    pickOptionalString(raw, 'sent_by_first_name') ||
    (sender ? pickOptionalString(sender, 'first_name') : '')
  const sentByLastName =
    pickOptionalString(raw, 'sent_by_last_name') ||
    (sender ? pickOptionalString(sender, 'last_name') : '')
  const sentByRole = pickSenderRole(raw, sender)
  const sentByDetail = sender ? normalizeNotificationSender(sender) : null
  const sentById =
    typeof raw.sent_by === 'number'
      ? raw.sent_by
      : sentByDetail?.id ?? 0

  return {
    id: String(raw.id),
    title: String(raw.title || ''),
    body: String(raw.body || ''),
    notification_type: (String(raw.notification_type || 'info') as NotificationType),
    notification_type_label: pickOptionalString(raw, 'notification_type_label') || undefined,
    priority: (String(raw.priority || 'medium') as NotificationPriority),
    priority_label: pickOptionalString(raw, 'priority_label') || undefined,
    is_read: Boolean(raw.is_read),
    read_at: Number(raw.read_at) || 0,
    action_url: String(raw.action_url || ''),
    sent_by: sentById,
    sent_by_username:
      String(raw.sent_by_username || '') || sentByDetail?.username || '',
    sent_by_first_name: sentByFirstName || sentByDetail?.first_name || undefined,
    sent_by_last_name: sentByLastName || sentByDetail?.last_name || undefined,
    sent_by_role:
      sentByRole ||
      sentByDetail?.roles.map((role) => role.display_name).join('، ') ||
      undefined,
    sent_by_detail: sentByDetail,
    created_at: Number(raw.created_at) || 0,
  }
}

function extractInboxItems(root: Record<string, unknown>): unknown[] | null {
  const data = root.data

  if (Array.isArray(data)) {
    if (data.length === 0) return []
    if (isNotificationLike(data[0])) return data

    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const nested = (first as Record<string, unknown>).data
      if (Array.isArray(nested)) return nested
    }
    return data
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }

  return null
}

/** GET /api/inbox/ */
export function parseInboxListResponse(response: unknown): InboxListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractInboxItems(root)
  if (!rawItems) return null

  const items = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeNotification(item))

  const pagination = extractPagination(root, items.length)

  return { items, pagination }
}

function isBlogPostLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.title === 'string'
}

function normalizeSeoPayload(raw: unknown): import('~/types/seo').SeoPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  const hreflangRaw = item.hreflang
  const hreflang: Record<string, string> = {}
  if (hreflangRaw && typeof hreflangRaw === 'object' && !Array.isArray(hreflangRaw)) {
    for (const [key, value] of Object.entries(hreflangRaw)) {
      if (typeof value === 'string' && value) hreflang[key] = value
    }
  }

  const title = String(item.title || '')
  const canonical = String(item.canonical || '')
  if (!title && !canonical) return null

  return {
    title,
    description: String(item.description || ''),
    canonical,
    robots: String(item.robots || 'index,follow'),
    og_title: String(item.og_title || title),
    og_description: String(item.og_description || item.description || ''),
    og_image:
      item.og_image === null || item.og_image === undefined || item.og_image === ''
        ? null
        : String(item.og_image),
    hreflang,
    json_ld:
      item.json_ld && typeof item.json_ld === 'object' && !Array.isArray(item.json_ld)
        ? (item.json_ld as Record<string, unknown>)
        : {},
  }
}

function normalizeBlogPost(raw: Record<string, unknown>): BlogPost {
  const statusRaw = String(raw.status || 'draft')
  const status: BlogPostStatus = statusRaw === 'published' ? 'published' : 'draft'
  const localeRaw = String(raw.locale || 'fa')
  const locale = localeRaw === 'en' ? 'en' : 'fa'

  return {
    id: String(raw.id),
    title: String(raw.title || ''),
    slug: String(raw.slug || ''),
    body: String(raw.body || ''),
    status,
    locale,
    meta_title: String(raw.meta_title || ''),
    meta_description: String(raw.meta_description || ''),
    og_image:
      raw.og_image === null || raw.og_image === undefined || raw.og_image === ''
        ? null
        : String(raw.og_image),
    seo: normalizeSeoPayload(raw.seo),
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
    published_at: Number(raw.published_at) || 0,
    owner: Number(raw.owner) || 0,
  }
}

function extractBlogPosts(root: Record<string, unknown>): unknown[] | null {
  const data = root.data

  if (Array.isArray(data)) {
    if (data.length === 0) return []
    if (isBlogPostLike(data[0])) return data

    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const nested = (first as Record<string, unknown>).data
      if (Array.isArray(nested)) return nested
    }
    return data
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }

  return null
}

/** GET /api/blog/posts/ */
export function parseBlogPostsListResponse(response: unknown): BlogPostsListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractBlogPosts(root)
  if (!rawItems) return null

  const posts = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeBlogPost(item))

  const pagination = extractPagination(root, posts.length)

  return { posts, pagination }
}

function isBlogCommentLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.body === 'string'
}

function normalizeBlogCommentStatus(value: unknown): BlogCommentStatus {
  const status = String(value || 'pending').toLowerCase()
  if (status === 'approved' || status === 'rejected' || status === 'spam') return status
  return 'pending'
}

function normalizeBlogComment(raw: Record<string, unknown>): BlogComment {
  return {
    id: String(raw.id),
    post: String(raw.post || ''),
    user: Number(raw.user) || 0,
    username: String(raw.username || ''),
    author_name: String(raw.author_name || ''),
    author_email: String(raw.author_email || ''),
    body: String(raw.body || ''),
    status: normalizeBlogCommentStatus(raw.status),
    admin_reply: String(raw.admin_reply || ''),
    replied_by: Number(raw.replied_by) || 0,
    replied_by_username: String(raw.replied_by_username || ''),
    replied_at: Number(raw.replied_at) || 0,
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function extractBlogComments(root: Record<string, unknown>): unknown[] | null {
  const data = root.data

  if (Array.isArray(data)) {
    if (data.length === 0) return []
    if (isBlogCommentLike(data[0])) return data

    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const nested = (first as Record<string, unknown>).data
      if (Array.isArray(nested)) return nested
    }
    return data
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }

  return null
}

/** GET /api/blog/comments/ */
export function parseBlogCommentsListResponse(response: unknown): BlogCommentsListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractBlogComments(root)
  if (!rawItems) return null

  const comments = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeBlogComment(item))

  const pagination = extractPagination(root, comments.length)

  return { comments, pagination }
}

/** GET /api/blog/comments/{id}/ — POST/PUT /api/blog/comments/ — POST .../reply/ */
export function parseBlogCommentDetailResponse(response: unknown): BlogComment | null {
  if (!response || typeof response !== 'object') return null

  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  if (isBlogCommentLike(payload)) return normalizeBlogComment(payload)
  if (isBlogCommentLike(root)) return normalizeBlogComment(root)

  return null
}

/** GET /api/blog/posts/{id}/ */
export function parseBlogPostDetailResponse(response: unknown): BlogPost | null {
  if (!isApiSuccess(response)) return null

  const payload = getApiPayload(response)
  if (!isBlogPostLike(payload)) return null

  return normalizeBlogPost(payload)
}

/** POST /api/blog/posts/ */
export function buildCreateBlogPostPayload(fields: CreateBlogPostInput): CreateBlogPostRequest {
  const status = fields.status ?? 'draft'
  const payload: CreateBlogPostRequest = {
    title: fields.title.trim(),
    slug: normalizeEnglishSlug(fields.slug || ''),
    body: ensureVisualHtmlBody(fields.body),
    status,
  }

  if (status === 'published') {
    payload.published_at = fields.published_at ?? Math.floor(Date.now() / 1000)
  }

  return payload
}

/** PUT /api/blog/posts/{id}/ — replaces all editable fields */
export function buildUpdateBlogPostPayload(fields: UpdateBlogPostInput): UpdateBlogPostRequest {
  const status = fields.status ?? 'draft'
  let published_at = 0

  if (status === 'published') {
    const wasPublished = fields.previousStatus === 'published'
    const previousPublishedAt = fields.previousPublishedAt ?? 0
    if (wasPublished && previousPublishedAt > 0) {
      published_at = previousPublishedAt
    } else {
      published_at = fields.published_at ?? Math.floor(Date.now() / 1000)
    }
  }

  return {
    title: fields.title.trim(),
    slug: normalizeBlogSlug(fields.slug || ''),
    body: ensureVisualHtmlBody(fields.body),
    status,
    published_at,
  }
}

export function parseUpdateBlogPostResponse(response: unknown): {
  ok: boolean
  post: BlogPost | null
  message?: string
} {
  return parseCreateBlogPostResponse(response)
}

export function parseCreateBlogPostResponse(response: unknown): {
  ok: boolean
  post: BlogPost | null
  message?: string
} {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const ok = isApiSuccess(response)
  const message = typeof root.message === 'string' ? root.message : undefined
  const post = parseBlogPostDetailResponse(response)
  return { ok, post, message }
}

/** POST /api/inbox/send/ */
export function buildSendNotificationPayload(fields: SendNotificationInput): SendNotificationRequest {
  const payload: SendNotificationRequest = {
    title: fields.title.trim().slice(0, 255),
    body: fields.body.trim(),
    notification_type: fields.notification_type ?? 'info',
    priority: fields.priority ?? 'medium',
  }

  if (fields.send_to_all) {
    payload.send_to_all = true
  } else if (fields.roles?.length) {
    payload.roles = fields.roles
  } else if (fields.recipients?.length) {
    payload.recipients = fields.recipients
  }

  const actionUrl = fields.action_url?.trim()
  if (actionUrl) {
    payload.action_url = actionUrl.slice(0, 500)
  }

  return payload
}

export function parseSendNotificationResponse(response: unknown): { ok: boolean; message?: string; sent_to?: number } {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const ok = isApiSuccess(response)
  const message = typeof root.message === 'string' ? root.message : undefined
  const data = getApiPayload(response)
  const sentToRaw = data && typeof data === 'object' ? (data as Record<string, unknown>).sent_to : undefined
  const sent_to = typeof sentToRaw === 'number' ? sentToRaw : undefined
  return { ok, message, sent_to }
}

/** GET /api/inbox/{id}/ */
export function parseNotificationDetailResponse(response: unknown): Notification | null {
  if (!isApiSuccess(response)) return null

  const payload = getApiPayload(response)
  if (!isNotificationLike(payload)) return null

  return normalizeNotification(payload)
}

/** POST /api/inbox/{id}/read/ */
export function parseNotificationReadResponse(response: unknown): Notification | null {
  return parseNotificationDetailResponse(response)
}

function normalizeRoleDetail(raw: unknown): RoleDetail | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  if (item.id === undefined || item.id === null) return null
  return {
    id: Number(item.id) || 0,
    name: String(item.name || ''),
  }
}

function pickBoolean(obj: Record<string, unknown>, key: string, defaultValue = false): boolean {
  if (!(key in obj)) return defaultValue
  const value = obj[key]
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return defaultValue
}

function pickNonNegativeInt(obj: Record<string, unknown>, key: string, defaultValue = 0): number {
  const value = Number(obj[key])
  if (!Number.isFinite(value) || value < 0) return defaultValue
  return Math.trunc(value)
}

/** PATCH responses may return fields flat in `data` or nested under the section key. */
function getSystemSettingsSectionPayload(response: unknown, section: string): Record<string, unknown> {
  const payload = getApiPayload(response)
  const nested = payload[section]
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>
  }
  return payload
}

function hasSecuritySettingsFields(payload: Record<string, unknown>): boolean {
  return (
    'captcha_enabled' in payload ||
    'captcha_ttl_seconds' in payload ||
    'login_max_attempts' in payload ||
    'login_attempt_window_minutes' in payload ||
    'login_block_minutes' in payload ||
    'otp_lifetime_minutes' in payload
  )
}

function isSettingsPatchSuccessful(
  response: unknown,
  section: string,
  hasFields: (payload: Record<string, unknown>) => boolean,
): boolean {
  if (isApiSuccess(response)) return true
  if (!response || typeof response !== 'object') return false

  const root = response as Record<string, unknown>
  if (root.status === 'error') return false

  return hasFields(getSystemSettingsSectionPayload(response, section))
}

function normalizeDefaultUserRole(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : null
}

function normalizeGeneralSettings(raw: Record<string, unknown>): GeneralSettings {
  return {
    language_code: String(raw.language_code || ''),
    time_zone: String(raw.time_zone || ''),
    default_user_role: normalizeDefaultUserRole(raw.default_user_role),
    default_user_role_detail: normalizeRoleDetail(raw.default_user_role_detail),
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function normalizeSecuritySettings(raw: Record<string, unknown>): SecuritySettings {
  return {
    captcha_enabled: pickBoolean(raw, 'captcha_enabled'),
    captcha_ttl_seconds: pickNonNegativeInt(raw, 'captcha_ttl_seconds'),
    login_max_attempts: pickNonNegativeInt(raw, 'login_max_attempts'),
    login_attempt_window_minutes: pickNonNegativeInt(raw, 'login_attempt_window_minutes'),
    login_block_minutes: pickNonNegativeInt(raw, 'login_block_minutes'),
    otp_lifetime_minutes: pickNonNegativeInt(raw, 'otp_lifetime_minutes'),
    created_at: pickNonNegativeInt(raw, 'created_at'),
    updated_at: pickNonNegativeInt(raw, 'updated_at'),
  }
}

function normalizeSmsProviderSettings(raw: Record<string, unknown>): SmsProviderSettings {
  return {
    sender: String(raw.sender || ''),
    lookup_type: String(raw.lookup_type || ''),
    api_key_env_name: String(raw.api_key_env_name || ''),
    login_otp_template: String(raw.login_otp_template || ''),
    register_otp_template: String(raw.register_otp_template || ''),
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function hasMediaSettingsFields(payload: Record<string, unknown>): boolean {
  return (
    'allowed_extensions' in payload ||
    'max_upload_size_mb' in payload ||
    'thumbnail_width' in payload ||
    'thumbnail_height' in payload
  )
}

function normalizeMediaSettings(raw: Record<string, unknown>): MediaSettings {
  const extensions = raw.allowed_extensions
  const allowed_extensions = Array.isArray(extensions)
    ? extensions.map((item) => String(item).trim().replace(/^\./, '')).filter(Boolean)
    : typeof extensions === 'string'
      ? extensions.split(/[,\s]+/).map((item) => item.trim().replace(/^\./, '')).filter(Boolean)
      : []

  return {
    allowed_extensions,
    max_upload_size_mb: pickNonNegativeInt(raw, 'max_upload_size_mb'),
    thumbnail_width: pickNonNegativeInt(raw, 'thumbnail_width'),
    thumbnail_height: pickNonNegativeInt(raw, 'thumbnail_height'),
    created_at: pickNonNegativeInt(raw, 'created_at'),
    updated_at: pickNonNegativeInt(raw, 'updated_at'),
  }
}

function normalizeDatabaseBackupSettings(raw: Record<string, unknown>): DatabaseBackupSettings {
  return {
    backup_dir: String(raw.backup_dir || ''),
    retention_days: Number(raw.retention_days) || 0,
    postgresql_bin_path: String(raw.postgresql_bin_path || ''),
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function asSettingsSection(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw as Record<string, unknown>
}

/** GET /api/system/settings/ */
export function parseSystemSettingsResponse(response: unknown): SystemSettings | null {
  if (!isApiSuccess(response)) return null

  const payload = getApiPayload(response)
  if (!payload.general && !payload.security && !payload.sms_provider && !payload.media && !payload.database_backup) {
    return null
  }

  return {
    general: normalizeGeneralSettings(asSettingsSection(payload.general)),
    security: normalizeSecuritySettings(asSettingsSection(payload.security)),
    sms_provider: normalizeSmsProviderSettings(asSettingsSection(payload.sms_provider)),
    media: normalizeMediaSettings(asSettingsSection(payload.media)),
    database_backup: normalizeDatabaseBackupSettings(asSettingsSection(payload.database_backup)),
  }
}

/** PATCH /api/system/settings/general/ */
export function parseGeneralSettingsResponse(response: unknown): {
  ok: boolean
  settings: GeneralSettings | null
  message?: string
} {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const ok = isApiSuccess(response)
  const message = typeof root.message === 'string' ? root.message : undefined
  const payload = getApiPayload(response)

  if (!ok) {
    return { ok: false, settings: null, message }
  }

  return {
    ok: true,
    settings: normalizeGeneralSettings(payload),
    message,
  }
}

/** PATCH /api/system/settings/security/ */
export function parseSecuritySettingsResponse(response: unknown): {
  ok: boolean
  settings: SecuritySettings | null
  message?: string
} {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const message = typeof root.message === 'string' ? root.message : undefined
  const payload = getSystemSettingsSectionPayload(response, 'security')
  const ok = isSettingsPatchSuccessful(response, 'security', hasSecuritySettingsFields)

  if (!ok) {
    return { ok: false, settings: null, message }
  }

  return {
    ok: true,
    settings: normalizeSecuritySettings(payload),
    message,
  }
}

/** PATCH /api/system/settings/sms-provider/ */
export function parseSmsProviderSettingsResponse(response: unknown): {
  ok: boolean
  settings: SmsProviderSettings | null
  message?: string
} {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const ok = isApiSuccess(response)
  const message = typeof root.message === 'string' ? root.message : undefined
  const payload = getApiPayload(response)

  if (!ok) {
    return { ok: false, settings: null, message }
  }

  return {
    ok: true,
    settings: normalizeSmsProviderSettings(payload),
    message,
  }
}

/** PATCH /api/system/settings/media/ */
export function parseMediaSettingsResponse(response: unknown): {
  ok: boolean
  settings: MediaSettings | null
  message?: string
} {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const message = typeof root.message === 'string' ? root.message : undefined
  const payload = getSystemSettingsSectionPayload(response, 'media')
  const ok = isSettingsPatchSuccessful(response, 'media', hasMediaSettingsFields)

  if (!ok) {
    return { ok: false, settings: null, message }
  }

  return {
    ok: true,
    settings: normalizeMediaSettings(payload),
    message,
  }
}

/** PATCH /api/system/settings/database-backup/ */
export function parseDatabaseBackupSettingsResponse(response: unknown): {
  ok: boolean
  settings: DatabaseBackupSettings | null
  message?: string
} {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const ok = isApiSuccess(response)
  const message = typeof root.message === 'string' ? root.message : undefined
  const payload = getApiPayload(response)

  if (!ok) {
    return { ok: false, settings: null, message }
  }

  return {
    ok: true,
    settings: normalizeDatabaseBackupSettings(payload),
    message,
  }
}

/** POST /api/media/ — also used for GET /api/media/{id}/ */
export function parseMediaFileResponse(response: unknown): MediaFile | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  if (!isMediaFileLike(payload)) return null
  return normalizeMediaFile(payload)
}

/** POST /api/auth/roles/ */
export function parseCreateRoleResponse(response: unknown): Role | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  if (payload.id === undefined || payload.id === null) return null
  return payload as unknown as Role
}

/** GET /api/auth/roles/{id}/ */
export function parseRoleDetailResponse(response: unknown): Role | null {
  return parseCreateRoleResponse(response)
}

export function buildCreateRolePayload(name: string, permissionIds: number[]): CreateRoleRequest {
  return {
    name: name.trim(),
    permissions: permissionIds,
  }
}

/** GET /api/auth/me/ — also accepts partial profile payloads from PUT /api/auth/me/ */
export function parseMeResponse(response: unknown): UserProfile | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)

  const nestedUser =
    payload.user && typeof payload.user === 'object' && !Array.isArray(payload.user)
      ? (payload.user as Record<string, unknown>)
      : null

  const profileData = nestedUser ? { ...payload, ...nestedUser } : payload
  const { user: _user, ...normalized } = profileData as Record<string, unknown>

  const hasProfileFields = ['username', 'email', 'first_name', 'last_name', 'phone_number'].some(
    (key) => key in normalized,
  )
  if (!hasProfileFields && (normalized.id === undefined || normalized.id === null)) return null

  normalized.permissions = normalizePermissions(normalized.permissions)

  if (
    normalized.birth_date !== undefined &&
    normalized.birth_date !== null &&
    normalized.birth_date !== ''
  ) {
    const birthDate = birthDateToPickerValue(normalized.birth_date as string | number)
    if (birthDate) normalized.birth_date = birthDate
  }

  return normalized as unknown as UserProfile
}

/** POST /api/auth/users/ */
export function buildCreateUserPayload(fields: CreateUserInput): CreateUserRequest {
  const payload: CreateUserRequest = {
    username: fields.username.trim(),
    email: fields.email.trim(),
    password: fields.password,
    first_name: fields.first_name.trim(),
    last_name: fields.last_name.trim(),
    phone_number: fields.phone_number.trim(),
    is_active: fields.is_active,
    is_staff: fields.is_staff,
    is_superuser: fields.is_superuser,
  }

  if (fields.birth_date !== undefined && fields.birth_date !== null && fields.birth_date !== '') {
    const apiDate = birthDateToPickerValue(fields.birth_date)
    if (apiDate) payload.birth_date = apiDate
  }
  if (fields.gender === 'male' || fields.gender === 'female') payload.gender = fields.gender
  if (fields.national_id !== undefined) {
    const nationalId = fields.national_id?.trim()
    payload.national_id = nationalId ? nationalId : null
  }

  if (fields.groups !== undefined) payload.groups = fields.groups
  if (fields.user_permissions !== undefined) payload.user_permissions = fields.user_permissions

  return payload
}

export function parseCreateUserResponse(response: unknown): UserProfile | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  if (!payload.username && (payload.id === undefined || payload.id === null)) return null

  const profile = payload as unknown as UserProfile
  if (profile.birth_date !== undefined && profile.birth_date !== null && profile.birth_date !== '') {
    const normalized = birthDateToPickerValue(profile.birth_date)
    if (normalized) profile.birth_date = normalized
  }

  return profile
}

/** GET /api/auth/users/{id}/ */
export function parseUserDetailResponse(response: unknown): UserProfile | null {
  return parseCreateUserResponse(response)
}

/** PUT /api/auth/users/{id}/ */
export function buildUpdateUserPayload(fields: UpdateUserInput): UpdateUserRequest {
  const payload: UpdateUserRequest = {
    email: fields.email.trim(),
    first_name: fields.first_name.trim(),
    last_name: fields.last_name.trim(),
    phone_number: fields.phone_number.trim(),
    is_active: fields.is_active,
    is_staff: fields.is_staff,
    is_superuser: fields.is_superuser,
  }

  if (fields.password?.trim()) payload.password = fields.password.trim()

  if (fields.birth_date !== undefined && fields.birth_date !== null && fields.birth_date !== '') {
    const apiDate = birthDateToPickerValue(fields.birth_date)
    if (apiDate) payload.birth_date = apiDate
  }
  if (fields.gender === 'male' || fields.gender === 'female') payload.gender = fields.gender
  if (fields.national_id !== undefined) {
    const nationalId = fields.national_id?.trim()
    payload.national_id = nationalId ? nationalId : null
  }

  if (fields.groups !== undefined) payload.groups = fields.groups
  if (fields.user_permissions !== undefined) payload.user_permissions = fields.user_permissions

  return payload
}

/** PUT /api/auth/me/ */
export function buildUpdateMePayload(fields: UpdateProfileInput): UpdateProfileRequest {
  const payload: UpdateProfileRequest = {
    email: fields.email.trim(),
    first_name: fields.first_name.trim(),
    last_name: fields.last_name.trim(),
    phone_number: fields.phone_number.trim(),
  }

  if (fields.birth_date !== undefined && fields.birth_date !== null && fields.birth_date !== '') {
    const apiDate = birthDateToPickerValue(fields.birth_date)
    if (apiDate) payload.birth_date = apiDate
  }
  if (fields.gender === 'male' || fields.gender === 'female') payload.gender = fields.gender
  if (fields.national_id !== undefined) {
    const nationalId = fields.national_id?.trim()
    payload.national_id = nationalId ? nationalId : null
  }

  return payload
}

/** POST /api/auth/register/verify/ */
export function buildRegisterVerifyPayload(
  registerId: string,
  code: string,
  profile?: RegisterVerifyProfile,
): VerifyRegisterRequest {
  const payload: VerifyRegisterRequest = {
    register_id: registerId,
    code,
  }

  if (profile?.first_name?.trim()) payload.first_name = profile.first_name.trim()
  if (profile?.last_name?.trim()) payload.last_name = profile.last_name.trim()
  if (profile?.email?.trim()) payload.email = profile.email.trim()
  if (profile?.gender === 'male' || profile?.gender === 'female') payload.gender = profile.gender

  if (profile?.birth_date !== undefined && profile.birth_date !== null && profile.birth_date !== '') {
    const apiDate = birthDateToPickerValue(profile.birth_date)
    if (apiDate) payload.birth_date = apiDate
  }
  if (profile?.national_id?.trim()) payload.national_id = profile.national_id.trim()

  return payload
}

function isWalletLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && item.balance !== undefined
}

function isWalletTransactionLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.transaction_type === 'string'
}

function normalizeWalletTransactionType(value: unknown): WalletTransactionType {
  const type = String(value || 'deposit').toLowerCase()
  if (
    type === 'deposit'
    || type === 'withdrawal'
    || type === 'transfer'
    || type === 'refund'
    || type === 'adjustment'
  ) {
    return type
  }
  return 'deposit'
}

function normalizeWalletTransactionStatus(value: unknown): WalletTransactionStatus {
  const status = String(value || 'pending').toLowerCase()
  if (status === 'completed' || status === 'failed' || status === 'reversed') return status
  return 'pending'
}

function normalizeTransactionSource(value: unknown): TransactionSource {
  const source = String(value || 'system').toLowerCase()
  if (source === 'online_gateway' || source === 'manual') return source
  return 'system'
}

function normalizeWalletTransactionUser(raw: unknown): WalletTransactionUser | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  if (typeof item.id !== 'number') return null
  return {
    id: item.id,
    username: String(item.username || ''),
  }
}

function normalizeWallet(raw: Record<string, unknown>): Wallet {
  const ownerNationalId = raw.owner_national_id
  return {
    id: String(raw.id),
    owner: Number(raw.owner) || 0,
    owner_first_name: String(raw.owner_first_name || ''),
    owner_last_name: String(raw.owner_last_name || ''),
    owner_display_name: String(raw.owner_display_name || ''),
    owner_national_id:
      ownerNationalId === null || ownerNationalId === undefined || ownerNationalId === ''
        ? null
        : String(ownerNationalId),
    balance: Number(raw.balance) || 0,
    is_active: Boolean(raw.is_active),
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function normalizeWalletTransaction(raw: Record<string, unknown>): WalletTransaction {
  return {
    id: String(raw.id),
    transaction_type: normalizeWalletTransactionType(raw.transaction_type),
    amount: Number(raw.amount) || 0,
    balance_after: Number(raw.balance_after) || 0,
    status: normalizeWalletTransactionStatus(raw.status),
    source: normalizeTransactionSource(raw.source),
    description: String(raw.description || ''),
    reference: String(raw.reference || ''),
    created_by: normalizeWalletTransactionUser(raw.created_by),
    created_at: Number(raw.created_at) || 0,
  }
}

function extractWallets(root: Record<string, unknown>): unknown[] | null {
  const data = root.data

  if (Array.isArray(data)) {
    if (data.length === 0) return []
    if (isWalletLike(data[0])) return data

    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const nested = (first as Record<string, unknown>).data
      if (Array.isArray(nested)) return nested
    }
    return data
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }

  return null
}

function extractWalletTransactions(root: Record<string, unknown>): unknown[] | null {
  const data = root.data

  if (Array.isArray(data)) {
    if (data.length === 0) return []
    if (isWalletTransactionLike(data[0])) return data

    const first = data[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const nested = (first as Record<string, unknown>).data
      if (Array.isArray(nested)) return nested
    }
    return data
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }

  return null
}

/** GET /api/wallet/me/ — GET /api/wallet/{id}/ */
export function parseWalletDetailResponse(response: unknown): Wallet | null {
  if (!response || typeof response !== 'object') return null

  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  if (isWalletLike(payload)) return normalizeWallet(payload)
  if (isWalletLike(root)) return normalizeWallet(root)

  return null
}

/** GET /api/wallet/ */
export function parseWalletsListResponse(response: unknown): WalletsListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractWallets(root)
  if (!rawItems) return null

  const wallets = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeWallet(item))

  const pagination = extractPagination(root, wallets.length)

  return { wallets, pagination }
}

/** GET /api/wallet/transactions/ */
export function parseWalletTransactionsListResponse(response: unknown): WalletTransactionsListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractWalletTransactions(root)
  if (!rawItems) return null

  const transactions = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeWalletTransaction(item))

  const pagination = extractPagination(root, transactions.length)

  return { transactions, pagination }
}

/** POST /api/wallet/{id}/deposit/ — POST /api/wallet/{id}/withdraw/ */
export function parseWalletTransactionDetailResponse(response: unknown): WalletTransaction | null {
  if (!response || typeof response !== 'object') return null

  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  if (isWalletTransactionLike(payload)) return normalizeWalletTransaction(payload)
  if (isWalletTransactionLike(root)) return normalizeWalletTransaction(root)

  return null
}

export function buildWalletOperationPayload(
  amount: number,
  description?: string,
  reference?: string,
): { amount: number; description?: string; reference?: string } {
  const payload: { amount: number; description?: string; reference?: string } = {
    amount: Math.trunc(amount),
  }

  const desc = description?.trim()
  const ref = reference?.trim()
  if (desc) payload.description = desc
  if (ref) payload.reference = ref

  return payload
}

function normalizePaymentRedirect(raw: unknown): PaymentRedirect | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  const method = String(item.method || 'GET').toUpperCase()
  const fieldsRaw = item.fields
  const fields: Record<string, string> = {}
  if (fieldsRaw && typeof fieldsRaw === 'object' && !Array.isArray(fieldsRaw)) {
    for (const [key, value] of Object.entries(fieldsRaw as Record<string, unknown>)) {
      fields[key] = String(value ?? '')
    }
  }
  return {
    action: String(item.action || ''),
    method: method === 'POST' ? 'POST' : 'GET',
    fields,
  }
}

function normalizePaymentOrderStatus(value: unknown): PaymentOrderStatus {
  const status = String(value || 'pending').toLowerCase()
  if (
    status === 'redirected'
    || status === 'verifying'
    || status === 'paid'
    || status === 'failed'
    || status === 'cancelled'
  ) {
    return status
  }
  return 'pending'
}

function normalizePaymentGatewayPublic(raw: Record<string, unknown>): PaymentGatewayPublic {
  const minAmount = raw.min_amount
  const maxAmount = raw.max_amount
  return {
    id: String(raw.id),
    title: String(raw.title || ''),
    min_amount: minAmount === null || minAmount === undefined ? null : Number(minAmount) || 0,
    max_amount: maxAmount === null || maxAmount === undefined ? null : Number(maxAmount) || 0,
    sort_order: Number(raw.sort_order) || 0,
  }
}

function normalizePaymentGatewayAdmin(raw: Record<string, unknown>): PaymentGatewayAdmin {
  const credentials = raw.credentials
  return {
    ...normalizePaymentGatewayPublic(raw),
    driver: String(raw.driver || ''),
    is_active: raw.is_active !== false,
    is_sandbox: Boolean(raw.is_sandbox),
    credentials:
      credentials && typeof credentials === 'object' && !Array.isArray(credentials)
        ? (credentials as Record<string, unknown>)
        : {},
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function normalizePaymentOrder(raw: Record<string, unknown>): PaymentOrder {
  const transactionSource = raw.transaction_source
  return {
    id: String(raw.id),
    gateway_id: String(raw.gateway_id || ''),
    gateway_title: String(raw.gateway_title || ''),
    amount: Number(raw.amount) || 0,
    status: normalizePaymentOrderStatus(raw.status),
    reference_id: String(raw.reference_id || ''),
    failure_reason: String(raw.failure_reason || ''),
    transaction_source:
      transactionSource === null || transactionSource === undefined
        ? null
        : normalizeTransactionSource(transactionSource),
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function normalizePaymentSettings(raw: Record<string, unknown>): PaymentSettings {
  return {
    deposits_enabled: raw.deposits_enabled !== false,
    min_deposit_amount: Number(raw.min_deposit_amount) || 0,
    max_deposit_amount: Number(raw.max_deposit_amount) || 0,
    frontend_success_url: String(raw.frontend_success_url || ''),
    frontend_failure_url: String(raw.frontend_failure_url || ''),
    updated_at: Number(raw.updated_at) || undefined,
  }
}

function normalizePaymentDriver(raw: Record<string, unknown>): PaymentDriver {
  const fieldsRaw = Array.isArray(raw.credential_fields) ? raw.credential_fields : []
  const credentialFields = fieldsRaw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      key: String(item.key || ''),
      label: String(item.label || item.key || ''),
      type: item.type ? String(item.type) : undefined,
      required: item.required === true,
      secret: item.secret === true,
    }))
    .filter((item) => item.key)

  return {
    code: String(raw.code || raw.driver || ''),
    title: String(raw.title || raw.name || raw.code || ''),
    credential_fields: credentialFields.length > 0 ? credentialFields : undefined,
  }
}

function isPaymentGatewayLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && item.title !== undefined
}

function isPaymentOrderLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && item.amount !== undefined
}

function extractPaymentArray(root: Record<string, unknown>): unknown[] | null {
  const data = root.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>
    if (Array.isArray(nested.results)) return nested.results
    if (Array.isArray(nested.items)) return nested.items
    if (Array.isArray(nested.gateways)) return nested.gateways
    if (Array.isArray(nested.orders)) return nested.orders
    if (Array.isArray(nested.drivers)) return nested.drivers
  }
  return null
}

/** GET /api/payments/gateways/ */
export function parsePaymentGatewaysPublicResponse(response: unknown): PaymentGatewayPublic[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractPaymentArray(root)
  if (!rawItems) return null
  return rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizePaymentGatewayPublic(item))
}

/** POST /api/payments/deposit/ */
export function parseDepositInitResponse(response: unknown): DepositInitData | null {
  if (!response || typeof response !== 'object') return null
  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  const orderId = String(payload.order_id || payload.id || '')
  const redirect = normalizePaymentRedirect(payload.redirect)
  if (!orderId || !redirect?.action) return null

  return { order_id: orderId, redirect }
}

/** GET /api/payments/orders/ — GET /api/payments/orders/{id}/ */
export function parsePaymentOrderDetailResponse(response: unknown): PaymentOrder | null {
  if (!response || typeof response !== 'object') return null
  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  if (isPaymentOrderLike(payload)) return normalizePaymentOrder(payload)
  if (isPaymentOrderLike(root)) return normalizePaymentOrder(root)
  return null
}

/** GET /api/payments/orders/ — admin gateway orders */
export function parsePaymentOrdersListResponse(response: unknown): PaymentOrdersListResult | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractPaymentArray(root)
  if (!rawItems) return null

  const orders = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizePaymentOrder(item))

  const pagination = extractPagination(root, orders.length)
  return { orders, pagination }
}

/** GET/PATCH /api/payments/admin/settings/ */
export function parsePaymentSettingsResponse(response: unknown): PaymentSettings | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  if (!payload || typeof payload !== 'object') return null
  return normalizePaymentSettings(payload)
}

/** GET /api/payments/admin/gateways/ */
export function parsePaymentGatewaysAdminListResponse(response: unknown): PaymentGatewaysListResult | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractPaymentArray(root)
  if (!rawItems) return null

  const gateways = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizePaymentGatewayAdmin(item))

  const pagination = extractPagination(root, gateways.length)
  return { gateways, pagination }
}

/** GET/PATCH /api/payments/admin/gateways/{id}/ */
export function parsePaymentGatewayAdminDetailResponse(response: unknown): PaymentGatewayAdmin | null {
  if (!response || typeof response !== 'object') return null
  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  if (isPaymentGatewayLike(payload)) return normalizePaymentGatewayAdmin(payload)
  if (isPaymentGatewayLike(root)) return normalizePaymentGatewayAdmin(root)
  return null
}

/** GET /api/payments/admin/drivers/ */
export function parsePaymentDriversResponse(response: unknown): PaymentDriver[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractPaymentArray(root)
  if (!rawItems) return null
  return rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizePaymentDriver(item))
    .filter((item) => item.code)
}

/** POST /api/payments/admin/manual-deposit/ */
export function parseManualDepositResponse(response: unknown): ManualDepositResult | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  const transactionRaw = payload.transaction
  if (transactionRaw && typeof transactionRaw === 'object' && !Array.isArray(transactionRaw)) {
    return {
      transaction: normalizeWalletTransaction(transactionRaw as Record<string, unknown>),
    }
  }
  if (isWalletTransactionLike(payload)) {
    return { transaction: normalizeWalletTransaction(payload) }
  }
  return { transaction: null }
}

function normalizeCompactUser(raw: unknown): CompactUser | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  if (typeof item.id !== 'number') return null
  return {
    id: item.id,
    username: String(item.username || ''),
    first_name: String(item.first_name || ''),
    last_name: String(item.last_name || ''),
  }
}

function normalizeTicketStatus(value: unknown): TicketStatus {
  const status = String(value || 'open').toLowerCase()
  if (status === 'in_progress' || status === 'answered' || status === 'closed') return status
  return 'open'
}

function normalizeTicketPriority(value: unknown): TicketPriority {
  const priority = String(value || 'medium').toLowerCase()
  if (priority === 'low' || priority === 'high' || priority === 'urgent') return priority
  return 'medium'
}

function normalizeTargetType(value: unknown): TargetType {
  return String(value || 'department').toLowerCase() === 'user' ? 'user' : 'department'
}

function isTicketLike(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.subject === 'string'
}

export function normalizeTicket(raw: Record<string, unknown>): Ticket {
  return {
    id: String(raw.id),
    tracking_code: String(raw.tracking_code || ''),
    ticket_type: String(raw.ticket_type || ''),
    ticket_type_name: String(raw.ticket_type_name || ''),
    target_type: normalizeTargetType(raw.target_type),
    requester: normalizeCompactUser(raw.requester),
    target_user: normalizeCompactUser(raw.target_user),
    current_department: raw.current_department ? String(raw.current_department) : null,
    current_department_name: raw.current_department_name ? String(raw.current_department_name) : null,
    assigned_to: normalizeCompactUser(raw.assigned_to),
    subject: String(raw.subject || ''),
    body: String(raw.body || ''),
    product_slug: raw.product_slug ? String(raw.product_slug) : null,
    status: normalizeTicketStatus(raw.status),
    priority: normalizeTicketPriority(raw.priority),
    is_guest: Boolean(raw.is_guest),
    guest_name: String(raw.guest_name || ''),
    guest_email: String(raw.guest_email || ''),
    guest_phone: String(raw.guest_phone || ''),
    department_received_at: Number(raw.department_received_at) || null,
    taken_at: Number(raw.taken_at) || null,
    closed_at: Number(raw.closed_at) || null,
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function normalizeNullableUrl(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

function normalizeTicketAttachment(raw: Record<string, unknown>): TicketAttachment {
  return {
    id: String(raw.id),
    media_id: String(raw.media_id || raw.id || ''),
    message_id:
      raw.message_id === null || raw.message_id === undefined
        ? null
        : String(raw.message_id),
    original_name: String(raw.original_name || ''),
    file_type: String(raw.file_type || ''),
    mime_type: String(raw.mime_type || ''),
    size: Number(raw.size) || 0,
    file_url: String(raw.file_url || ''),
    download_url: String(raw.download_url || ''),
    thumbnail_url: String(raw.thumbnail_url || ''),
    created_at: Number(raw.created_at) || 0,
  }
}

function normalizeDepartmentBrief(raw: unknown): DepartmentBrief | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const item = raw as Record<string, unknown>
  if (!item.name) return undefined
  return {
    id: String(item.id || ''),
    name: String(item.name || ''),
  }
}

function normalizeTicketEventDetail(raw: unknown): TicketEventDetail {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const item = raw as Record<string, unknown>
  const detail: TicketEventDetail = {}

  const fromDepartment = normalizeDepartmentBrief(item.from_department)
  const toDepartment = normalizeDepartmentBrief(item.to_department)
  const department = normalizeDepartmentBrief(item.department)
  if (fromDepartment) detail.from_department = fromDepartment
  if (toDepartment) detail.to_department = toDepartment
  if (department) detail.department = department

  if (typeof item.body === 'string') detail.body = item.body
  if (typeof item.subject === 'string') detail.subject = item.subject
  if (typeof item.message_id === 'string') detail.message_id = item.message_id
  if (typeof item.id === 'string') detail.id = item.id
  if (item.is_staff_reply !== undefined) detail.is_staff_reply = Boolean(item.is_staff_reply)
  if (item.created_at !== undefined) detail.created_at = Number(item.created_at) || 0

  const assignedTo = normalizeCompactUser(item.assigned_to)
  if (assignedTo) detail.assigned_to = assignedTo

  if (Array.isArray(item.attachments)) detail.attachments = item.attachments

  return detail
}

function normalizeTicketMessage(raw: Record<string, unknown>): TicketMessage {
  const attachmentsRaw = Array.isArray(raw.attachments) ? raw.attachments : []
  return {
    id: String(raw.id),
    body: String(raw.body || ''),
    author: normalizeCompactUser(raw.author),
    is_staff_reply: Boolean(raw.is_staff_reply),
    attachments: attachmentsRaw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item) => normalizeTicketAttachment(item)),
    created_at: Number(raw.created_at) || 0,
  }
}

function normalizeTicketEvent(raw: Record<string, unknown>): TicketEvent {
  return {
    id: String(raw.id),
    event_type: String(raw.event_type || ''),
    actor: normalizeCompactUser(raw.actor),
    detail: normalizeTicketEventDetail(raw.detail),
    created_at: Number(raw.created_at) || 0,
  }
}

function normalizeTicketType(raw: Record<string, unknown>): TicketType {
  return {
    id: String(raw.id),
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
    description: String(raw.description || ''),
    is_active: raw.is_active !== false,
    sort_order: Number(raw.sort_order) || 0,
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function normalizeTicketDepartment(raw: Record<string, unknown>): TicketDepartment {
  const membersRaw = Array.isArray(raw.members) ? raw.members : []
  const operatorsRaw = Array.isArray(raw.operators) ? raw.operators : []
  const members = membersRaw
    .map((item) => normalizeCompactUser(item))
    .filter((item): item is CompactUser => item !== null)
  const operators = operatorsRaw
    .map((item) => normalizeCompactUser(item))
    .filter((item): item is CompactUser => item !== null)

  return {
    id: String(raw.id),
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
    description: String(raw.description || ''),
    is_active: raw.is_active !== false,
    members: members.length ? members : undefined,
    operators: operators.length ? operators : undefined,
    created_at: Number(raw.created_at) || 0,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function normalizeTicketSettings(raw: Record<string, unknown>): TicketSettings {
  const extensions = Array.isArray(raw.allowed_extensions)
    ? raw.allowed_extensions.map(String)
    : []
  return {
    allowed_extensions: extensions,
    max_files_per_message: Number(raw.max_files_per_message) || 3,
    max_upload_size_mb: Number(raw.max_upload_size_mb) || 5,
    max_body_length: Number(raw.max_body_length) || 5000,
    allow_urls_in_body: Boolean(raw.allow_urls_in_body),
    guest_rate_limit_per_hour: Number(raw.guest_rate_limit_per_hour) || 10,
    updated_at: Number(raw.updated_at) || 0,
  }
}

function extractTicketArray(root: Record<string, unknown>): unknown[] | null {
  const data = root.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>
    if (Array.isArray(nested.results)) return nested.results
    if (Array.isArray(nested.items)) return nested.items
    if (Array.isArray(nested.tickets)) return nested.tickets
    if (Array.isArray(nested.recipients)) return nested.recipients
  }
  return null
}

function getApiEnvelopeMessage(response: unknown): string | undefined {
  if (!response || typeof response !== 'object') return undefined
  const message = (response as Record<string, unknown>).message
  return typeof message === 'string' && message.trim() ? message.trim() : undefined
}

function extractTicketFromPayload(payload: Record<string, unknown>): Ticket | null {
  if (isTicketLike(payload)) return normalizeTicket(payload)
  const ticket = payload['ticket']
  if (isTicketLike(ticket)) return normalizeTicket(ticket)
  return null
}

/** GET /api/tickets/ — GET /api/tickets/queue/ */
export function parseTicketsListResponse(response: unknown): TicketsListResult | null {
  if (!isApiSuccess(response)) return null

  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractTicketArray(root)
  if (!rawItems) return null

  const tickets = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeTicket(item))

  const pagination = extractPagination(root, tickets.length)
  return { tickets, pagination }
}

/** GET /api/tickets/{id}/ */
export function parseTicketDetailResponse(response: unknown): Ticket | null {
  if (!response || typeof response !== 'object') return null
  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  const ticket = extractTicketFromPayload(payload)
  if (ticket) return ticket
  if (isTicketLike(root)) return normalizeTicket(root)
  return null
}

/** POST /api/tickets/ — action responses with nested ticket */
export function parseTicketActionResponse(response: unknown): Ticket | null {
  return parseTicketDetailResponse(response)
}

/** POST /api/tickets/{id}/messages/ — POST guest/messages/ */
export function parseTicketMessageResponse(response: unknown): TicketMessage | null {
  if (!response || typeof response !== 'object') return null
  const root = response as Record<string, unknown>
  if (root.status === 'error') return null

  const payload = getApiPayload(response)
  const messageRaw = payload.message
  if (messageRaw && typeof messageRaw === 'object' && !Array.isArray(messageRaw)) {
    return normalizeTicketMessage(messageRaw as Record<string, unknown>)
  }
  if (typeof payload.body === 'string') {
    return normalizeTicketMessage(payload)
  }
  return null
}

/** GET /api/tickets/{id}/events/ */
export function parseTicketEventsResponse(response: unknown): TicketEvent[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractTicketArray(root)
  if (!rawItems) return null
  return rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeTicketEvent(item))
}

/** GET /api/tickets/{id}/attachments/ */
export function parseTicketAttachmentsResponse(response: unknown): TicketAttachment[] | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractTicketArray(root)
  if (!rawItems) return null
  return rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeTicketAttachment(item))
}

/** GET /api/tickets/types/ */
export function parseTicketTypesListResponse(response: unknown): TicketTypesListResult | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractTicketArray(root)
  if (!rawItems) return null
  const types = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeTicketType(item))
  const pagination = extractPagination(root, types.length)
  return { types, pagination }
}

/** GET /api/tickets/departments/ — GET available */
export function parseTicketDepartmentsListResponse(response: unknown): TicketDepartmentsListResult | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractTicketArray(root)
  if (!rawItems) return null
  const departments = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizeTicketDepartment(item))
  const pagination = extractPagination(root, departments.length)
  return { departments, pagination }
}

function normalizePersonalRecipient(raw: Record<string, unknown>): PersonalTicketRecipient {
  const departments = Array.isArray(raw.departments) ? raw.departments.map(String) : []
  const firstName = String(raw.first_name || '')
  const lastName = String(raw.last_name || '')
  const fullName =
    pickOptionalString(raw, 'full_name') ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    String(raw.username || '')
  return {
    id: Number(raw.id) || 0,
    username: String(raw.username || ''),
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    phone_number: String(raw.phone_number || ''),
    departments,
  }
}

function parseApiBoolean(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  }
  return false
}

/** GET /api/tickets/personal/eligibility/ */
export function parsePersonalTicketEligibilityResponse(response: unknown): PersonalTicketEligibility | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  const memberIds = Array.isArray(payload.member_department_ids)
    ? payload.member_department_ids.map(String)
    : []
  const canSendPersonal = parseApiBoolean(payload.can_send_personal) || memberIds.length > 0
  return {
    can_send_personal: canSendPersonal,
    member_department_ids: memberIds,
  }
}

/** GET /api/tickets/personal/recipients/ */
export function parsePersonalRecipientsListResponse(response: unknown): PersonalRecipientsListResult | null {
  if (!isApiSuccess(response)) return null
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const rawItems = extractTicketArray(root)
  if (!rawItems) return null
  const recipients = rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizePersonalRecipient(item))
    .filter((item) => item.id > 0)
  const pagination = extractPagination(root, recipients.length)
  return {
    recipients,
    pagination,
    message: getApiEnvelopeMessage(response),
  }
}

/** PUT /api/tickets/departments/{id}/members|operators/ */
export function parseDepartmentUserIdsResponse(response: unknown): DepartmentIdsResult | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  const userIds = Array.isArray(payload.user_ids)
    ? payload.user_ids.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
    : []
  return { user_ids: userIds }
}

/** GET /api/tickets/settings/ */
export function parseTicketSettingsResponse(response: unknown): TicketSettings | null {
  if (!isApiSuccess(response)) return null
  const payload = getApiPayload(response)
  if (!payload || typeof payload !== 'object') return null
  return normalizeTicketSettings(payload)
}

/** POST /api/tickets/guest/ */
export function parseGuestTicketCreateResponse(response: unknown): ParsedGuestTicketCreate {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const payload = getApiPayload(response)
  const ok = isApiSuccess(response)
  const ticket = extractTicketFromPayload(payload)
  const trackingCode = String(payload.tracking_code || ticket?.tracking_code || '')
  const message = typeof root.message === 'string' ? root.message : undefined
  return { ok, ticket, trackingCode, message }
}

/** POST /api/tickets/guest/track/request/ */
export function parseGuestTrackRequestResponse(response: unknown): ParsedGuestTrackRequest {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const payload = getApiPayload(response)
  return {
    ok: isApiSuccess(response),
    trackRequestId: String(payload.track_request_id || ''),
    expiresAt: Number(payload.expires_at) || 0,
    debugCode: pickString(payload, 'debug_code'),
    message: typeof root.message === 'string' ? root.message : undefined,
  }
}

/** POST /api/tickets/guest/track/verify/ */
export function parseGuestTrackVerifyResponse(response: unknown): ParsedGuestTrackVerify {
  const root = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>
  const payload = getApiPayload(response)
  const ticket = extractTicketFromPayload(payload)
  return {
    ok: isApiSuccess(response),
    guestToken: String(payload.guest_token || ''),
    expiresAt: Number(payload.expires_at) || 0,
    ticket,
    message: typeof root.message === 'string' ? root.message : undefined,
  }
}

export function buildCreateTicketPayload(input: {
  ticket_type: string
  target_type: TargetType
  current_department?: string
  target_user?: number
  subject: string
  body: string
  product_slug?: string | null
  priority?: TicketPriority
  media_ids?: string[]
}): CreateTicketRequest {
  const mediaIds = (input.media_ids ?? []).filter(Boolean)
  const payload: CreateTicketRequest = {
    ticket_type: input.ticket_type,
    target_type: input.target_type,
    subject: input.subject.trim(),
    body: input.body.trim(),
    priority: input.priority || 'medium',
  }

  const productSlug = input.product_slug?.trim()
  if (productSlug) payload.product_slug = productSlug

  if (input.target_type === 'department') {
    if (input.current_department) payload.current_department = input.current_department
    if (mediaIds.length) payload.media_ids = mediaIds
    return payload
  }

  if (input.target_user) payload.target_user = input.target_user
  if (mediaIds.length) payload.media_ids = mediaIds
  return payload
}
export function buildAddTicketMessagePayload(body: string, mediaIds: string[] = []) {
  return {
    body: body.trim(),
    media_ids: mediaIds,
  }
}

export {
  parseFullHealthCheckResponse,
  parseLivenessProbeResponse,
  parseReadinessProbeResponse,
  parseSystemDiagnosticsResponse,
} from './health-response'

