import type { LicenseStatus } from '~/types/licensing'

export const LICENSE_STATUS_OPTIONS = [
  { value: 'active', label: 'فعال' },
  { value: 'expired', label: 'منقضی' },
  { value: 'suspended', label: 'معلق' },
  { value: 'revoked', label: 'لغو شده' },
] as const

const STATUS_LABELS = Object.fromEntries(
  LICENSE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const STATUS_CLASSES: Record<LicenseStatus, string> = {
  active: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  expired: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  suspended: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  revoked: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
}

export function formatLicenseStatus(status: LicenseStatus | string): string {
  return STATUS_LABELS[status] || status || '—'
}

export function getLicenseStatusClass(status: LicenseStatus | string): string {
  return STATUS_CLASSES[status as LicenseStatus] || 'bg-surface-muted text-text-secondary'
}

export function formatLicenseType(type: string): string {
  const map: Record<string, string> = {
    per_domain: 'هر دامنه',
    per_server: 'هر سرور',
    per_user: 'هر کاربر',
    lifetime: 'مادام‌العمر',
  }
  return map[type] || type
}
