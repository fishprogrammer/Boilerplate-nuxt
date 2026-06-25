export type CheckStatus = 'ok' | 'degraded' | 'error' | 'skipped' | string

export type HealthCheckStatus = CheckStatus

export interface DatabaseHealthCheck {
  status: CheckStatus
  latency_ms?: number
  engine?: string
  name?: string
  host?: string
  port?: string
  detail?: string
}

export interface CacheHealthCheck {
  status: CheckStatus
  backend?: string
  detail?: string
}

export interface RedisHealthCheck {
  status: CheckStatus
  latency_ms?: number
  url?: string
  detail?: string
}

export interface CeleryScheduledJob {
  name: string
  task: string
}

export interface CeleryHealthCheck {
  status: CheckStatus
  broker_url?: string
  result_backend?: string
  task_always_eager?: boolean
  timezone?: string
  worker_count?: number
  workers?: string[]
  scheduled_jobs?: CeleryScheduledJob[]
  detail?: string
  note?: string
}

export interface HealthChecks {
  database: DatabaseHealthCheck
  cache?: CacheHealthCheck
  redis?: RedisHealthCheck
  celery?: CeleryHealthCheck
}

export interface SystemInfo {
  debug?: boolean
  django_version?: string
  language_code?: string
  time_zone?: string
  celery_timezone?: string
  database_engine?: string
  database_name?: string
  cache_backend?: string
  celery_task_always_eager?: boolean
}

export interface FullHealthCheck {
  status: CheckStatus
  checks: HealthChecks
  info?: SystemInfo
}

export interface HealthCheckResult {
  health: FullHealthCheck
  message: string
  httpStatus: number
  isHealthy: boolean
  isDegraded: boolean
}

export interface HealthProbeResult {
  message: string
  code: string
  data: string | null
  httpStatus: number
  isHealthy: boolean
}

export interface SmsDiagnostics {
  api_key_configured: boolean
  sender_configured: boolean
  login_otp_template_configured: boolean
  register_otp_template_configured: boolean
  ready_for_otp: boolean
}

export interface DebugPanelInfo {
  debug_mode: boolean
  otp_debug_code_in_responses: boolean
  sms_will_send: boolean
  visible_otp_response_fields: string[]
  notes: string[]
}

export interface DiagnosticsLogs {
  source: string | null
  lines: string[]
  hint: string
}

export interface ModulePhaseStatus {
  phase: number
  ready: boolean
}

export interface SystemDiagnosticsData {
  status: CheckStatus
  checks: HealthChecks
  info: SystemInfo
  sms: SmsDiagnostics
  debug_panel: DebugPanelInfo
  logs: DiagnosticsLogs
  modules: Record<string, ModulePhaseStatus>
}

export interface SystemDiagnosticsResult {
  data: SystemDiagnosticsData
  message: string
  httpStatus: number
}
