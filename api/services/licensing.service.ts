import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'

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

  async adminListInstallations(params?: Record<string, string | number>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.ADMIN.INSTALLATIONS, params)
  }

  async adminSearchLicenses(params?: Record<string, string | number>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.LICENSING.ADMIN.LICENSES, params)
  }
}

export const licensingService = new LicensingService()
