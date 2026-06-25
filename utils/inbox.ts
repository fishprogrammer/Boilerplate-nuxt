import moment from 'moment-jalaali'
import type { Notification, NotificationPriority, NotificationType } from '~/api/types/inbox.types'

/** Values accepted by POST /api/inbox/send/ and GET /api/inbox/ filters */
export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'system', label: 'پیام سیستمی' },
  { value: 'info', label: 'اطلاع‌رسانی' },
  { value: 'warning', label: 'هشدار' },
  { value: 'alert', label: 'هشدار فوری' },
  { value: 'promotion', label: 'پیشنهاد ویژه' },
] as const

export const NOTIFICATION_PRIORITY_OPTIONS = [
  { value: 'low', label: 'کم‌اهمیت' },
  { value: 'medium', label: 'معمولی' },
  { value: 'high', label: 'مهم' },
  { value: 'critical', label: 'فوری' },
] as const

export const DEFAULT_NOTIFICATION_TYPE = 'info' as const
export const DEFAULT_NOTIFICATION_PRIORITY = 'medium' as const

export const NOTIFICATION_TITLE_MAX_LENGTH = 255
export const NOTIFICATION_ACTION_URL_MAX_LENGTH = 500

const NOTIFICATION_TYPE_LABELS = Object.fromEntries(
  NOTIFICATION_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const PRIORITY_LABELS = Object.fromEntries(
  NOTIFICATION_PRIORITY_OPTIONS.map((option) => [option.value, option.label]),
)

const PRIORITY_CLASSES: Record<string, string> = {
  low: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  medium: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
  high: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
  critical: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300',
}

const TYPE_CLASSES: Record<string, string> = {
  system: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
  alert: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300',
  promotion: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300',
}

export function formatNotificationType(
  type: NotificationType | string,
  label?: string,
): string {
  return label?.trim() || NOTIFICATION_TYPE_LABELS[type] || type || '—'
}

export function formatNotificationPriority(
  priority: NotificationPriority | string,
  label?: string,
): string {
  return label?.trim() || PRIORITY_LABELS[priority] || priority || '—'
}

export function getNotificationPriorityClass(priority: NotificationPriority | string): string {
  return PRIORITY_CLASSES[priority] || PRIORITY_CLASSES.medium
}

export function getNotificationTypeClass(type: NotificationType | string): string {
  return TYPE_CLASSES[type] || TYPE_CLASSES.info
}

export function formatNotificationDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function isValidNotificationType(value: string): boolean {
  return NOTIFICATION_TYPE_OPTIONS.some((option) => option.value === value)
}

export function isValidNotificationPriority(value: string): boolean {
  return NOTIFICATION_PRIORITY_OPTIONS.some((option) => option.value === value)
}

function formatNotificationSenderRole(role: string): string {
  const normalized = role.trim().toLowerCase()
  if (normalized === 'admin' || normalized === 'administrator') return 'مدیر'
  if (normalized === 'user') return 'کاربر'
  if (normalized === 'staff') return 'کارمند'
  return role.trim()
}

export function formatNotificationSenderRoleLabel(role: string | undefined): string {
  if (!role?.trim()) return ''
  return formatNotificationSenderRole(role)
}

export function formatNotificationSender(
  notification: Pick<
    Notification,
    | 'sent_by_role'
    | 'sent_by_detail'
    | 'sent_by_username'
    | 'sent_by_first_name'
    | 'sent_by_last_name'
  >,
  options?: { includeRoles?: boolean },
): string | null {
  const includeRoles = options?.includeRoles !== false
  const sender = notification.sent_by_detail

  if (sender) {
    const name = [sender.first_name, sender.last_name].filter(Boolean).join(' ').trim()
    const display = name || sender.username?.trim() || ''
    const roleLabels = sender.roles
      ?.map((role) => role.display_name?.trim() || role.slug?.trim())
      .filter(Boolean)

    if (includeRoles && roleLabels?.length) {
      return display ? `${display} (${roleLabels.join('، ')})` : roleLabels.join('، ')
    }

    return display || 'سیستم'
  }

  const legacyName = [notification.sent_by_first_name, notification.sent_by_last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  if (legacyName) return legacyName
  if (notification.sent_by_username?.trim()) return notification.sent_by_username.trim()
  if (includeRoles && notification.sent_by_role?.trim()) {
    return formatNotificationSenderRoleLabel(notification.sent_by_role)
  }

  return null
}

function normalizeSearchText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[يی]/g, 'ی')
    .replace(/[كک]/g, 'ک')
}

export function matchesNotificationSearch(notification: Notification, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true

  const haystack = normalizeSearchText(
    [
      notification.title,
      notification.body,
      notification.notification_type_label,
      formatNotificationType(notification.notification_type),
      notification.priority_label,
      formatNotificationPriority(notification.priority),
      formatNotificationSender(notification, { includeRoles: false }),
      notification.sent_by_username,
    ]
      .filter(Boolean)
      .join(' '),
  )

  return haystack.includes(normalizedQuery)
}

export function formatNotificationSenderRoles(
  notification: Pick<Notification, 'sent_by_role' | 'sent_by_detail'>,
): string {
  const roles = notification.sent_by_detail?.roles ?? []
  if (roles.length > 0) {
    return roles.map((role) => role.display_name || role.slug).join('، ')
  }
  return formatNotificationSenderRoleLabel(notification.sent_by_role)
}

