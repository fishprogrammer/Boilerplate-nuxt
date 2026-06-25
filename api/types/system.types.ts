export interface RoleDetail {
  id: number
  name: string
}

export interface GeneralSettings {
  language_code: string
  time_zone: string
  default_user_role: number | null
  default_user_role_detail: RoleDetail | null
  created_at: number
  updated_at: number
}

export type LanguageCode = 'fa' | 'en'

export interface UpdateGeneralSettingsRequest {
  language_code?: LanguageCode
  time_zone?: string
  default_user_role?: number | null
}

export interface SecuritySettings {
  captcha_enabled: boolean
  captcha_ttl_seconds: number
  login_max_attempts: number
  login_attempt_window_minutes: number
  login_block_minutes: number
  otp_lifetime_minutes: number
  created_at: number
  updated_at: number
}

export interface UpdateSecuritySettingsRequest {
  captcha_enabled?: boolean
  captcha_ttl_seconds?: number
  login_max_attempts?: number
  login_attempt_window_minutes?: number
  login_block_minutes?: number
  otp_lifetime_minutes?: number
}

export interface SmsProviderSettings {
  sender: string
  lookup_type: string
  api_key_env_name: string
  login_otp_template: string
  register_otp_template: string
  created_at: number
  updated_at: number
}

export interface UpdateSmsProviderSettingsRequest {
  sender?: string
  lookup_type?: string
  api_key_env_name?: string
  login_otp_template?: string
  register_otp_template?: string
}

export interface MediaSettings {
  allowed_extensions: string[]
  max_upload_size_mb: number
  thumbnail_width: number
  thumbnail_height: number
  created_at: number
  updated_at: number
}

export interface UpdateMediaSettingsRequest {
  allowed_extensions?: string[]
  max_upload_size_mb?: number
  thumbnail_width?: number
  thumbnail_height?: number
}

export interface DatabaseBackupSettings {
  backup_dir: string
  retention_days: number
  postgresql_bin_path: string
  created_at: number
  updated_at: number
}

export interface UpdateDatabaseBackupSettingsRequest {
  backup_dir?: string
  retention_days?: number
  postgresql_bin_path?: string
}

export interface SystemSettings {
  general: GeneralSettings
  security: SecuritySettings
  sms_provider: SmsProviderSettings
  media: MediaSettings
  database_backup: DatabaseBackupSettings
}

export interface SystemDiagnostics {
  debug: boolean
  sms_configured: boolean
  redis_available: boolean
  celery_available: boolean
  database_available: boolean
  cache_available: boolean
  logs?: string[]
  hints?: string[]
  [key: string]: string | boolean | string[] | number | undefined
}

