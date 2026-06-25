import type { CheckStatus, HealthCheckStatus } from '~/api/types/health.types'

const CHECK_LABELS: Record<string, string> = {
  database: 'پایگاه داده',
  cache: 'کش',
  redis: 'Redis',
  celery: 'Celery',
}

const STATUS_LABELS: Record<string, string> = {
  ok: 'سالم',
  degraded: 'تخریب‌شده',
  error: 'خطا',
  skipped: 'رد شده',
  unknown: 'نامشخص',
}

export function formatHealthCheckLabel(key: string): string {
  return CHECK_LABELS[key] || key
}

export function formatHealthStatus(status: HealthCheckStatus): string {
  return STATUS_LABELS[status] || status
}

export function formatLatencyMs(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return `${value.toFixed(2)} ms`
}

export function formatHttpStatus(status: number): string {
  if (status === 200) return '200 — موفق'
  if (status === 403) return '403 — دسترسی ممنوع'
  if (status === 503) return '503 — سرویس در دسترس نیست'
  return String(status)
}

export function checkStatusClass(status: CheckStatus): string {
  if (status === 'ok') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
  }
  if (status === 'degraded') {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
  }
  if (status === 'skipped') {
    return 'bg-surface-muted text-text-muted'
  }
  return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
}

export function overallHealthBadgeClass(isHealthy: boolean, isDegraded: boolean): string {
  if (isHealthy && !isDegraded) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
  }
  if (isDegraded) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
  }
  return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
}

export function overallHealthLabel(isHealthy: boolean, isDegraded: boolean): string {
  if (isHealthy && !isDegraded) return 'سالم'
  if (isDegraded) return 'تخریب‌شده'
  return 'ناسالم'
}

export function isCeleryHealthy(celery?: { worker_count?: number; task_always_eager?: boolean; status?: CheckStatus }): boolean {
  if (!celery) return false
  if (celery.task_always_eager) return true
  return (celery.worker_count ?? 0) > 0
}

export function formatModuleLabel(key: string): string {
  const labels: Record<string, string> = {
    marketing: 'مارکتینگ',
    crm: 'CRM',
    catalog: 'کاتالوگ',
    finance: 'مالی',
    reports: 'گزارش‌ها',
  }
  return labels[key] || key
}
