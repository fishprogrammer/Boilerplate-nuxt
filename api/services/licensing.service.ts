import { apiClient } from '../client'
import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  PluginActivateRequest,
  PluginHeartbeatRequest,
  PluginHmacHeaders,
  PluginValidateRequest,
} from '../types/licensing-plugin.types'

function pluginHeaders(hmac: PluginHmacHeaders) {
  return {
    'X-Product-Slug': hmac.productSlug,
    'X-Product-Secret': hmac.productSecret,
    'X-Product-Signature': hmac.signature,
  }
}

export class LicensingService extends BaseService {
  async listLicenses(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.LICENSES)
  }

  async getLicense(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.licenseById(id))
  }

  async deactivateActivation(licenseId: string, activationId: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.LICENSING.deactivate(licenseId), {
      activation_id: activationId,
    })
  }

  async revealKeyRequest(licenseId: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.LICENSING.revealKey(licenseId), { action: 'request' })
  }

  async revealKeyVerify(licenseId: string, revealId: string, code: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.LICENSING.revealKey(licenseId), {
      action: 'verify',
      reveal_id: revealId,
      code,
    })
  }

  async listDownloads(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.DOWNLOADS)
  }

  async downloadRelease(token: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(API_ENDPOINTS.LICENSING.downloadByToken, {
      params: { token },
      responseType: 'blob',
    })
    return response.data
  }

  async pluginActivate(data: PluginActivateRequest, hmac: PluginHmacHeaders): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.LICENSING.ACTIVATE, data, {
      headers: pluginHeaders(hmac),
    })
    return response.data
  }

  async pluginHeartbeat(data: PluginHeartbeatRequest, hmac: PluginHmacHeaders): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.LICENSING.HEARTBEAT, data, {
      headers: pluginHeaders(hmac),
    })
    return response.data
  }

  async pluginValidate(data: PluginValidateRequest, hmac: PluginHmacHeaders): Promise<unknown> {
    const response = await apiClient.post(API_ENDPOINTS.LICENSING.VALIDATE, data, {
      headers: pluginHeaders(hmac),
    })
    return response.data
  }

  async adminListInstallations(params?: Record<string, string | number>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.ADMIN.INSTALLATIONS, params)
  }

  async adminSearchLicenses(params?: Record<string, string | number>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.ADMIN.LICENSES, params)
  }

  async adminGetLicense(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.ADMIN.licenseById(id))
  }
}

export const licensingService = new LicensingService()
