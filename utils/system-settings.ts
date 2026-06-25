import moment from 'moment-jalaali'

export const SMS_LOOKUP_TYPE_OPTIONS = [
  { value: 'sms', label: 'پیامک (sms)' },
  { value: 'call', label: 'تماس (call)' },
] as const

export const LANGUAGE_CODE_OPTIONS = [
  { value: 'fa', label: 'فارسی' },
  { value: 'en', label: 'English' },
] as const

const LANGUAGE_LABELS = Object.fromEntries(
  LANGUAGE_CODE_OPTIONS.map((option) => [option.value, option.label]),
)

export function formatSettingBoolean(value: boolean): string {
  return value ? 'فعال' : 'غیرفعال'
}

export function formatSettingText(value: string | number | null | undefined, emptyLabel = '—'): string {
  if (value === null || value === undefined) return emptyLabel
  const text = String(value).trim()
  return text || emptyLabel
}

export function formatLanguageCode(code: string): string {
  return LANGUAGE_LABELS[code] || code || '—'
}

export function formatRoleLabel(role: { id?: number; name?: string } | null | undefined): string {
  if (!role?.name) return role?.id ? `نقش #${role.id}` : '—'
  const normalized = role.name.toLowerCase()
  if (normalized === 'admin' || normalized === 'administrator') return 'مدیر'
  if (normalized === 'user') return 'کاربر'
  return role.name
}

export function formatSettingTimestamp(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function formatAllowedExtensionsLabel(extensions: string[]): string {
  if (extensions.length === 0) return 'همه'
  return extensions.map((ext) => `.${ext}`).join(', ')
}

export function parseAllowedExtensionsInput(value: string): string[] {
  if (!value.trim()) return []
  return value
    .split(/[,\s]+/)
    .map((item) => item.trim().replace(/^\./, '').toLowerCase())
    .filter(Boolean)
}

export function formatAllowedExtensionsInput(extensions: string[]): string {
  return extensions.join(', ')
}

export function formatSecondsAsMinutes(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  if (seconds % 60 === 0) return `${seconds / 60} دقیقه`
  return `${seconds} ثانیه`
}

