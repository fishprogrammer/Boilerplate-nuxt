import moment from 'moment-jalaali'
import type {
  CompactUser,
  TargetType,
  Ticket,
  TicketAttachment,
  TicketEvent,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from '~/api/types/tickets.types'
import { PERMISSIONS } from '~/constants/permissions'
import { hasPermission, type PermissionCheckContext } from '~/utils/permissions'
import { apiPath } from '~/utils/api-url'

/** Staff with ticket create permission — personal target in create form (non-staff still needs eligibility). */
export function canStaffUsePersonalTicketTarget(ctx: PermissionCheckContext): boolean {
  if (ctx.isStaff !== true && ctx.isSuperuser !== true) return false
  return hasPermission(PERMISSIONS.TICKETS.ADD, ctx)
}

export function canShowPersonalTicketTarget(
  eligibilityLoaded: boolean,
  canSendPersonal: boolean,
  ctx: PermissionCheckContext,
): boolean {
  if (!eligibilityLoaded) return false
  return canSendPersonal || canStaffUsePersonalTicketTarget(ctx)
}

export function canSearchPersonalRecipients(canSendPersonal: boolean, ctx: PermissionCheckContext): boolean {
  return canSendPersonal || canStaffUsePersonalTicketTarget(ctx)
}

export const TICKET_STATUS_OPTIONS = [
  { value: 'open', label: 'باز' },
  { value: 'in_progress', label: 'در حال بررسی' },
  { value: 'answered', label: 'پاسخ داده‌شده' },
  { value: 'closed', label: 'بسته' },
] as const

export const TICKET_PRIORITY_OPTIONS = [
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'بالا' },
  { value: 'urgent', label: 'فوری' },
] as const

export const TICKET_TARGET_TYPE_OPTIONS = [
  { value: 'department', label: 'دپارتمان' },
  { value: 'user', label: 'کاربر' },
] as const

/** Labels for create-ticket target selector (matches API doc UX) */
export const CREATE_TICKET_TARGET_OPTIONS = [
  { value: 'department', label: 'دپارتمان' },
  { value: 'user', label: 'ارسال به کاربر' },
] as const

export const TICKET_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'created_at', label: 'قدیمی‌ترین' },
  { value: '-updated_at', label: 'آخرین بروزرسانی' },
  { value: 'department_received_at', label: 'قدیمی‌ترین در صف' },
] as const

const STATUS_LABELS = Object.fromEntries(TICKET_STATUS_OPTIONS.map((item) => [item.value, item.label]))
const PRIORITY_LABELS = Object.fromEntries(TICKET_PRIORITY_OPTIONS.map((item) => [item.value, item.label]))
const TARGET_LABELS = Object.fromEntries(TICKET_TARGET_TYPE_OPTIONS.map((item) => [item.value, item.label]))

const STATUS_CLASSES: Record<TicketStatus, string> = {
  open: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  answered: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const PRIORITY_CLASSES: Record<TicketPriority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
}

const EVENT_LABELS: Record<string, string> = {
  created: 'ایجاد',
  message: 'پیام',
  taken: 'برداشت',
  released: 'آزادسازی',
  referred: 'ارجاع',
  escalated: 'ارتقا به بخش',
  closed: 'بستن',
  status_changed: 'تغییر وضعیت',
}

export function formatTicketDate(timestamp: number | null | undefined): string {
  if (!Number.isFinite(timestamp) || !timestamp || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function formatTicketStatus(status: TicketStatus | string): string {
  return STATUS_LABELS[status as TicketStatus] || status || '—'
}

export function getTicketStatusClass(status: TicketStatus | string): string {
  return STATUS_CLASSES[status as TicketStatus] || 'bg-surface-muted text-text-secondary'
}

export function formatTicketPriority(priority: TicketPriority | string): string {
  return PRIORITY_LABELS[priority as TicketPriority] || priority || '—'
}

export function getTicketPriorityClass(priority: TicketPriority | string): string {
  return PRIORITY_CLASSES[priority as TicketPriority] || 'bg-surface-muted text-text-secondary'
}

export function formatTargetType(targetType: TargetType | string): string {
  return TARGET_LABELS[targetType as TargetType] || targetType || '—'
}

export function formatCompactUser(user: CompactUser | null | undefined): string {
  if (!user) return '—'
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return fullName || user.username || String(user.id)
}

export function formatPersonalRecipientLabel(
  recipient: Pick<CompactUser, 'first_name' | 'last_name' | 'username'> & {
    full_name?: string
    departments?: string[]
  },
): string {
  const name =
    recipient.full_name?.trim() ||
    formatCompactUser(recipient as CompactUser)
  const depts = recipient.departments?.filter(Boolean) ?? []
  if (!depts.length) return name
  return `${name} (${depts.join('، ')})`
}

export function buildTicketThread(
  ticket: Ticket,
  events: TicketEvent[] = [],
  extraMessages: TicketMessage[] = [],
): TicketMessage[] {
  const initial = buildInitialTicketMessage(ticket)
  const fromEvents: TicketMessage[] = []

  for (const event of events) {
    if (event.event_type !== 'message') continue
    const detail = event.detail || {}
    const body = typeof detail.body === 'string' ? detail.body : ''
    if (!body) continue
    const attachmentsRaw = Array.isArray(detail.attachments) ? detail.attachments : []
    fromEvents.push({
      id: String(detail.message_id || detail.id || event.id),
      body,
      author: event.actor,
      is_staff_reply: Boolean(detail.is_staff_reply),
      attachments: attachmentsRaw
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          id: String(item.id || ''),
          media_id: String(item.media_id || item.id || ''),
          message_id: String(detail.message_id || detail.id || event.id) || null,
          original_name: String(item.original_name || ''),
          file_type: String(item.file_type || ''),
          mime_type: String(item.mime_type || ''),
          file_url: String(item.file_url || ''),
          download_url: String(item.download_url || ''),
          thumbnail_url: String(item.thumbnail_url || ''),
          size: Number(item.size) || 0,
          created_at: Number(item.created_at) || event.created_at,
        })),
      created_at: Number(detail.created_at) || event.created_at,
    })
  }

  return sortTicketMessages([initial, ...fromEvents, ...extraMessages])
}

function dedupeTicketAttachments(attachments: TicketAttachment[]): TicketAttachment[] {
  const seen = new Set<string>()
  return attachments.filter((attachment) => {
    if (!attachment.id || seen.has(attachment.id)) return false
    seen.add(attachment.id)
    return true
  })
}

export function mergeTicketMessageAttachments(
  messages: TicketMessage[],
  attachments: TicketAttachment[],
  ticketId: string,
): TicketMessage[] {
  if (!attachments.length || !messages.length) return messages

  const byMessageId = new Map<string, TicketAttachment[]>()
  const unassigned: TicketAttachment[] = []

  for (const attachment of attachments) {
    const messageId = attachment.message_id?.trim()
    if (messageId) {
      const list = byMessageId.get(messageId) ?? []
      list.push(attachment)
      byMessageId.set(messageId, list)
    } else {
      unassigned.push(attachment)
    }
  }

  const merged = messages.map((message) => {
    const linked = byMessageId.get(message.id)
    if (!linked?.length) return message
    return {
      ...message,
      attachments: dedupeTicketAttachments([...message.attachments, ...linked]),
    }
  })

  if (unassigned.length) {
    const initialId = `initial-${ticketId}`
    const targetIndex = merged.findIndex((message) => message.id === initialId)
    const index = targetIndex >= 0 ? targetIndex : 0
    merged[index] = {
      ...merged[index],
      attachments: dedupeTicketAttachments([...merged[index].attachments, ...unassigned]),
    }
  }

  return merged
}

function resolveAttachmentMediaUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return apiPath(trimmed)
}

export function getTicketAttachmentFileUrl(attachment: TicketAttachment): string {
  return resolveAttachmentMediaUrl(attachment.file_url)
}

export function getTicketAttachmentThumbnailUrl(attachment: TicketAttachment): string {
  return resolveAttachmentMediaUrl(attachment.thumbnail_url)
}

export function getTicketAttachmentDownloadUrl(attachment: TicketAttachment): string {
  return resolveAttachmentMediaUrl(attachment.download_url || '')
}

/** @deprecated Use getTicketAttachmentFileUrl */
export function getTicketAttachmentUrl(attachment: TicketAttachment): string {
  return getTicketAttachmentFileUrl(attachment)
}

export function hasTicketAttachmentFile(attachment: TicketAttachment): boolean {
  return Boolean(getTicketAttachmentFileUrl(attachment))
}

export function hasTicketAttachmentPreview(attachment: TicketAttachment): boolean {
  return Boolean(getTicketAttachmentThumbnailUrl(attachment))
}

export function isTicketAttachmentImage(attachment: TicketAttachment): boolean {
  if (attachment.file_type === 'image') return true
  if (attachment.mime_type.startsWith('image/')) return true
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(attachment.original_name)
}

export function formatTicketEventType(eventType: string): string {
  return EVENT_LABELS[eventType] || eventType || '—'
}

export function isTicketClosed(ticket: Pick<Ticket, 'status'> | null | undefined): boolean {
  return ticket?.status === 'closed'
}

export function mapTicketActionUrl(actionUrl: string): { name: string; params: { id: string } } | null {
  const trimmed = actionUrl.trim()
  if (!trimmed) return null

  const match = trimmed.match(/\/tickets\/([0-9a-f-]{36})/i)
  if (match?.[1]) {
    return { name: 'view-ticket', params: { id: match[1] } }
  }

  return null
}

export function buildInitialTicketMessage(ticket: Ticket): TicketMessage {
  return {
    id: `initial-${ticket.id}`,
    body: ticket.body,
    author: ticket.requester,
    is_staff_reply: false,
    attachments: [],
    created_at: ticket.created_at,
  }
}

export function sortTicketMessages(messages: TicketMessage[]): TicketMessage[] {
  return [...messages].sort((a, b) => a.created_at - b.created_at)
}

export function bodyContainsUrl(body: string): boolean {
  return /https?:\/\/|www\./i.test(body)
}

export function canShowTakeAction(
  ticket: Ticket,
  _currentUserId?: number | string | null | undefined,
): boolean {
  if (ticket.target_type !== 'department' || isTicketClosed(ticket)) return false
  return !ticket.assigned_to
}

/** Show take button (enabled or disabled when already assigned to current user) */
export function canShowTakeButton(
  ticket: Ticket,
  currentUserId: number | string | null | undefined,
): boolean {
  if (ticket.target_type !== 'department' || isTicketClosed(ticket)) return false
  if (!ticket.assigned_to) return true
  return ticket.assigned_to.id === Number(currentUserId)
}

export function isTakeActionDisabled(
  ticket: Ticket,
  currentUserId: number | string | null | undefined,
): boolean {
  if (!ticket.assigned_to) return false
  return ticket.assigned_to.id === Number(currentUserId)
}

export function canShowReleaseAction(
  ticket: Ticket,
  currentUserId: number | string | null | undefined,
): boolean {
  if (isTicketClosed(ticket)) return false
  return ticket.assigned_to?.id === Number(currentUserId)
}

export function canShowReferAction(ticket: Ticket): boolean {
  return ticket.target_type === 'department' && !isTicketClosed(ticket)
}

export function canShowEscalateAction(ticket: Ticket): boolean {
  return ticket.target_type === 'user' && !isTicketClosed(ticket)
}

export function formatTicketEventDetail(event: TicketEvent): string {
  const detail = event.detail || {}
  const fromDept =
    typeof detail.from_department === 'string'
      ? detail.from_department
      : detail.from_department?.name || ''
  const toDept =
    typeof detail.to_department === 'string'
      ? detail.to_department
      : detail.to_department?.name || ''
  const department =
    typeof detail.department === 'string'
      ? detail.department
      : detail.department?.name || ''

  switch (event.event_type) {
    case 'message':
      return detail.body || ''
    case 'referred':
      if (fromDept && toDept) return `${fromDept} → ${toDept}`
      return toDept || fromDept
    case 'taken':
      return detail.assigned_to ? formatCompactUser(detail.assigned_to) : ''
    case 'created':
      return detail.subject || detail.body || ''
    case 'escalated':
      return department
    case 'closed':
      return detail.body || ''
    default:
      if (fromDept && toDept) return `${fromDept} → ${toDept}`
      if (toDept) return toDept
      if (department) return department
      return ''
  }
}

/** New tickets use 8-digit numeric codes; legacy alphanumeric codes may still work on track. */
export const TRACKING_CODE_NUMERIC_REGEX = /^\d{8}$/
export const TRACKING_CODE_LEGACY_REGEX = /^[A-Z0-9]{6,10}$/

export function normalizeTrackingCodeInput(value: string): string {
  return value.trim().replace(/\s+/g, '')
}

export function isValidTrackingCode(value: string): boolean {
  const normalized = normalizeTrackingCodeInput(value)
  return TRACKING_CODE_NUMERIC_REGEX.test(normalized) || TRACKING_CODE_LEGACY_REGEX.test(normalized.toUpperCase())
}

export function formatTrackingCodeForApi(value: string): string {
  const normalized = normalizeTrackingCodeInput(value)
  return TRACKING_CODE_NUMERIC_REGEX.test(normalized) ? normalized : normalized.toUpperCase()
}

