import type {
  CacheHealthCheck,
  CeleryHealthCheck,
  CeleryScheduledJob,
  CheckStatus,
  DatabaseHealthCheck,
  DebugPanelInfo,
  DiagnosticsLogs,
  FullHealthCheck,
  HealthCheckResult,
  HealthChecks,
  HealthProbeResult,
  ModulePhaseStatus,
  RedisHealthCheck,
  SmsDiagnostics,
  SystemDiagnosticsData,
  SystemDiagnosticsResult,
  SystemInfo,
} from '../types/health.types'
import { getApiPayload, isApiSuccess } from './api-response'

function asRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw as Record<string, unknown>
}

function pickString(obj: Record<string, unknown>, key: string, fallback = ''): string {
  const value = obj[key]
  return typeof value === 'string' ? value : fallback
}

function pickBool(obj: Record<string, unknown>, key: string, fallback = false): boolean {
  const value = obj[key]
  if (typeof value === 'boolean') return value
  return fallback
}

function pickNullableNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const value = obj[key]
  if (value === null || value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeCheckStatus(value: unknown): CheckStatus {
  return typeof value === 'string' && value.length > 0 ? value : 'unknown'
}

function normalizeDatabaseCheck(raw: unknown): DatabaseHealthCheck {
  const item = asRecord(raw)
  return {
    status: normalizeCheckStatus(item.status),
    latency_ms: pickNullableNumber(item, 'latency_ms'),
    engine: pickString(item, 'engine') || undefined,
    name: pickString(item, 'name') || undefined,
    host: pickString(item, 'host') || undefined,
    port: pickString(item, 'port') || undefined,
    detail: pickString(item, 'detail') || undefined,
  }
}

function normalizeCacheCheck(raw: unknown): CacheHealthCheck | undefined {
  const item = asRecord(raw)
  if (!item.status && !item.backend) return undefined
  return {
    status: normalizeCheckStatus(item.status),
    backend: pickString(item, 'backend') || undefined,
    detail: pickString(item, 'detail') || undefined,
  }
}

function normalizeRedisCheck(raw: unknown): RedisHealthCheck | undefined {
  const item = asRecord(raw)
  if (!item.status && !item.url) return undefined
  return {
    status: normalizeCheckStatus(item.status),
    latency_ms: pickNullableNumber(item, 'latency_ms'),
    url: pickString(item, 'url') || undefined,
    detail: pickString(item, 'detail') || undefined,
  }
}

function normalizeScheduledJobs(raw: unknown): CeleryScheduledJob[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      name: pickString(item, 'name'),
      task: pickString(item, 'task'),
    }))
    .filter((item) => item.name || item.task)
}

function normalizeCeleryCheck(raw: unknown): CeleryHealthCheck | undefined {
  const item = asRecord(raw)
  if (!item.status && item.worker_count === undefined && !item.scheduled_jobs) return undefined
  const workersRaw = item.workers
  return {
    status: normalizeCheckStatus(item.status),
    broker_url: pickString(item, 'broker_url') || undefined,
    result_backend: pickString(item, 'result_backend') || undefined,
    task_always_eager: pickBool(item, 'task_always_eager'),
    timezone: pickString(item, 'timezone') || undefined,
    worker_count: pickNullableNumber(item, 'worker_count'),
    workers: Array.isArray(workersRaw) ? workersRaw.map(String) : undefined,
    scheduled_jobs: normalizeScheduledJobs(item.scheduled_jobs),
    detail: pickString(item, 'detail') || undefined,
    note: pickString(item, 'note') || undefined,
  }
}

function normalizeHealthChecks(raw: unknown): HealthChecks {
  const item = asRecord(raw)
  return {
    database: normalizeDatabaseCheck(item.database),
    cache: normalizeCacheCheck(item.cache),
    redis: normalizeRedisCheck(item.redis),
    celery: normalizeCeleryCheck(item.celery),
  }
}

function normalizeSystemInfo(raw: unknown): SystemInfo | undefined {
  const item = asRecord(raw)
  if (!Object.keys(item).length) return undefined
  return {
    debug: pickBool(item, 'debug'),
    django_version: pickString(item, 'django_version') || undefined,
    language_code: pickString(item, 'language_code') || undefined,
    time_zone: pickString(item, 'time_zone') || undefined,
    celery_timezone: pickString(item, 'celery_timezone') || undefined,
    database_engine: pickString(item, 'database_engine') || undefined,
    database_name: pickString(item, 'database_name') || undefined,
    cache_backend: pickString(item, 'cache_backend') || undefined,
    celery_task_always_eager: item.celery_task_always_eager === true,
  }
}

function normalizeFullHealthCheck(raw: unknown): FullHealthCheck | null {
  const item = asRecord(raw)
  if (!item.status || !item.checks) return null
  return {
    status: normalizeCheckStatus(item.status),
    checks: normalizeHealthChecks(item.checks),
    info: normalizeSystemInfo(item.info),
  }
}

function hasDegradedChecks(checks: HealthChecks): boolean {
  const items = [checks.database, checks.cache, checks.redis, checks.celery]
  return items.some((item) => item?.status === 'degraded')
}

function evaluateHealth(httpStatus: number, health: FullHealthCheck): { isHealthy: boolean; isDegraded: boolean } {
  const dbOk = health.checks.database.status === 'ok'
  const isHealthy = httpStatus === 200 && dbOk
  const isDegraded =
    httpStatus === 200 &&
    dbOk &&
    (health.status === 'degraded' || hasDegradedChecks(health.checks))
  return { isHealthy, isDegraded }
}

/** GET /api/health/ — also accepts 503 with health payload */
export function parseFullHealthCheckResponse(
  response: unknown,
  httpStatus: number,
): HealthCheckResult | null {
  const root = asRecord(response)
  const payload = getApiPayload(response)
  const health = normalizeFullHealthCheck(payload)
  if (!health) return null

  const message = pickString(root, 'message')
  const { isHealthy, isDegraded } = evaluateHealth(httpStatus, health)

  return {
    health,
    message,
    httpStatus,
    isHealthy,
    isDegraded,
  }
}

function extractProbeData(response: unknown): string | null {
  const root = asRecord(response)
  const data = root.data

  if (typeof data === 'string' && data.length > 0) return data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const payload = data as Record<string, unknown>
    if (typeof payload.status === 'string' && payload.status.length > 0) return payload.status
    if (typeof payload.message === 'string' && payload.message.length > 0) return payload.message
  }

  return null
}

function parseHealthProbeResponse(response: unknown, httpStatus: number): HealthProbeResult | null {
  if (!response || typeof response !== 'object') return null

  const root = response as Record<string, unknown>
  const message = typeof root.message === 'string' ? root.message : ''
  const code = typeof root.code === 'string' ? root.code : ''
  const data = extractProbeData(response)
  const isHealthy = httpStatus === 200 && isApiSuccess(response)

  return {
    message,
    code,
    data,
    httpStatus,
    isHealthy,
  }
}

/** GET /api/health/live/ */
export function parseLivenessProbeResponse(
  response: unknown,
  httpStatus: number,
): HealthProbeResult | null {
  return parseHealthProbeResponse(response, httpStatus)
}

/** GET /api/health/ready/ — also accepts 503 with probe payload */
export function parseReadinessProbeResponse(
  response: unknown,
  httpStatus: number,
): HealthProbeResult | null {
  return parseHealthProbeResponse(response, httpStatus)
}

function normalizeSmsDiagnostics(raw: unknown): SmsDiagnostics {
  const item = asRecord(raw)
  return {
    api_key_configured: pickBool(item, 'api_key_configured'),
    sender_configured: pickBool(item, 'sender_configured'),
    login_otp_template_configured: pickBool(item, 'login_otp_template_configured'),
    register_otp_template_configured: pickBool(item, 'register_otp_template_configured'),
    ready_for_otp: pickBool(item, 'ready_for_otp'),
  }
}

function normalizeDebugPanel(raw: unknown): DebugPanelInfo {
  const item = asRecord(raw)
  const fieldsRaw = item.visible_otp_response_fields
  const notesRaw = item.notes
  return {
    debug_mode: pickBool(item, 'debug_mode'),
    otp_debug_code_in_responses: pickBool(item, 'otp_debug_code_in_responses'),
    sms_will_send: pickBool(item, 'sms_will_send'),
    visible_otp_response_fields: Array.isArray(fieldsRaw) ? fieldsRaw.map(String) : [],
    notes: Array.isArray(notesRaw) ? notesRaw.map(String) : [],
  }
}

function normalizeDiagnosticsLogs(raw: unknown): DiagnosticsLogs {
  const item = asRecord(raw)
  const linesRaw = item.lines
  return {
    source: pickString(item, 'source') || null,
    lines: Array.isArray(linesRaw) ? linesRaw.map(String) : [],
    hint: pickString(item, 'hint'),
  }
}

function normalizeModules(raw: unknown): Record<string, ModulePhaseStatus> {
  const item = asRecord(raw)
  const modules: Record<string, ModulePhaseStatus> = {}
  for (const [key, value] of Object.entries(item)) {
    const row = asRecord(value)
    modules[key] = {
      phase: pickNullableNumber(row, 'phase') ?? 0,
      ready: pickBool(row, 'ready'),
    }
  }
  return modules
}

function normalizeSystemDiagnosticsData(raw: unknown): SystemDiagnosticsData | null {
  const item = asRecord(raw)
  if (!item.checks) return null

  return {
    status: normalizeCheckStatus(item.status),
    checks: normalizeHealthChecks(item.checks),
    info: normalizeSystemInfo(item.info) ?? {},
    sms: normalizeSmsDiagnostics(item.sms),
    debug_panel: normalizeDebugPanel(item.debug_panel),
    logs: normalizeDiagnosticsLogs(item.logs),
    modules: normalizeModules(item.modules),
  }
}

/** GET /api/system/diagnostics/ */
export function parseSystemDiagnosticsResponse(
  response: unknown,
  httpStatus: number,
): SystemDiagnosticsResult | null {
  if (!isApiSuccess(response)) return null

  const root = asRecord(response)
  const payload = getApiPayload(response)
  const data = normalizeSystemDiagnosticsData(payload)
  if (!data) return null

  return {
    data,
    message: pickString(root, 'message'),
    httpStatus,
  }
}
