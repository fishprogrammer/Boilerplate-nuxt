import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  UpdateDatabaseBackupSettingsRequest,
  UpdateGeneralSettingsRequest,
  UpdateMediaSettingsRequest,
  UpdateSecuritySettingsRequest,
  UpdateSmsProviderSettingsRequest,
} from '../types/system.types'

export class SystemService extends BaseService {
  async getSettings(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.SYSTEM.SETTINGS)
  }

  async patchGeneralSettings(data: UpdateGeneralSettingsRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.SYSTEM.GENERAL, data)
  }

  async patchSecuritySettings(data: UpdateSecuritySettingsRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.SYSTEM.SECURITY, data)
  }

  async patchSmsProviderSettings(data: UpdateSmsProviderSettingsRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.SYSTEM.SMS_PROVIDER, data)
  }

  async patchMediaSettings(data: UpdateMediaSettingsRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.SYSTEM.MEDIA, data)
  }

  async patchDatabaseBackupSettings(data: UpdateDatabaseBackupSettingsRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.SYSTEM.DATABASE_BACKUP, data)
  }

  async getDiagnostics(withLogs = false): Promise<unknown> {
    const params = withLogs ? { logs: 1 } : undefined
    return this.getRaw(API_ENDPOINTS.SYSTEM.DIAGNOSTICS, params)
  }
}

export const systemService = new SystemService()

