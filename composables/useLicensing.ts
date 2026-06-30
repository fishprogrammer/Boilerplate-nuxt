import type { DownloadItem, License, LicenseDetail } from '~/types/licensing'
import { mockDownloads, mockLicenseDetail, mockLicenses } from '~/mocks/licensing'

export function useLicensing() {
  const config = useRuntimeConfig()

  const licensingApiLive = computed(
    () => String(config.public.licensingApiLive).toLowerCase() === 'true',
  )

  async function listLicenses(): Promise<License[]> {
    if (!licensingApiLive.value) {
      return mockLicenses
    }

    const { api } = useApi()
    return api<License[]>('/api/licensing/licenses/')
  }

  async function getLicense(id: string): Promise<LicenseDetail> {
    if (!licensingApiLive.value) {
      return mockLicenseDetail
    }

    const { api } = useApi()
    return api<LicenseDetail>(`/api/licensing/licenses/${id}/`)
  }

  async function listDownloads(): Promise<DownloadItem[]> {
    if (!licensingApiLive.value) {
      return mockDownloads
    }

    const { api } = useApi()
    return api<DownloadItem[]>('/api/licensing/downloads/')
  }

  async function deactivateActivation(licenseId: string, activationId: string): Promise<void> {
    if (!licensingApiLive.value) {
      return
    }

    const { api } = useApi()
    await api<null>(`/api/licensing/licenses/${licenseId}/deactivate/`, {
      method: 'POST',
      data: { activation_id: activationId },
    })
  }

  return {
    licensingApiLive,
    listLicenses,
    getLicense,
    listDownloads,
    deactivateActivation,
  }
}
