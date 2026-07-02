import type {
  DownloadItem,
  License,
  LicenseDetail,
  RevealKeyRequestResponse,
  RevealKeyVerifyResponse,
  AdminLicenseDetail,
} from '~/types/licensing'
import { licensingService } from '~/api/services/licensing.service'
import {
  parseDownloadsListResponse,
  parseInstallationsListResponse,
  parseLicenseDetailResponse,
  parseLicensesListResponse,
  parseRevealKeyRequestResponse,
  parseRevealKeyVerifyResponse,
} from '~/api/utils/api-response'
import { parseAdminLicenseDetailResponse, parseAdminLicensesSearchResponse } from '~/api/utils/finance-dashboard-response'
import { mockDownloads, mockLicenseDetail, mockLicenses } from '~/mocks/licensing'

export function useLicensing() {
  const config = useRuntimeConfig()

  const licensingApiLive = computed(
    () => String(config.public.licensingApiLive).toLowerCase() === 'true',
  )

  async function fetchLicenses(): Promise<License[]> {
    if (!licensingApiLive.value) {
      return mockLicenses
    }

    const raw = await licensingService.listLicenses()
    return parseLicensesListResponse(raw) ?? []
  }

  async function fetchLicense(id: string): Promise<LicenseDetail | null> {
    if (!licensingApiLive.value) {
      return id === mockLicenseDetail.id ? mockLicenseDetail : null
    }

    try {
      const raw = await licensingService.getLicense(id)
      return parseLicenseDetailResponse(raw)
    } catch {
      return null
    }
  }

  async function fetchDownloads(): Promise<DownloadItem[]> {
    if (!licensingApiLive.value) {
      return mockDownloads
    }

    const raw = await licensingService.listDownloads()
    return parseDownloadsListResponse(raw) ?? []
  }

  async function deactivateActivation(licenseId: string, activationId: string): Promise<void> {
    if (!licensingApiLive.value) return
    await licensingService.deactivateActivation(licenseId, activationId)
  }

  async function requestRevealOtp(licenseId: string): Promise<RevealKeyRequestResponse | null> {
    if (!licensingApiLive.value) {
      return { reveal_id: 'mock-reveal', expires_at: Math.floor(Date.now() / 1000) + 300, debug_code: '123456' }
    }

    const raw = await licensingService.revealKeyRequest(licenseId)
    return parseRevealKeyRequestResponse(raw)
  }

  async function verifyRevealOtp(
    licenseId: string,
    revealId: string,
    code: string,
  ): Promise<RevealKeyVerifyResponse | null> {
    if (!licensingApiLive.value) {
      return code === '123456' ? { license_key: 'MOCK-KEY-ABCD-EFGH' } : null
    }

    const raw = await licensingService.revealKeyVerify(licenseId, revealId, code)
    return parseRevealKeyVerifyResponse(raw)
  }

  async function adminFetchInstallations(filters?: { product?: string; version?: string }) {
    const params: Record<string, string> = {}
    if (filters?.product) params.product = filters.product
    if (filters?.version) params.version = filters.version
    const raw = await licensingService.adminListInstallations(params)
    return parseInstallationsListResponse(raw) ?? []
  }

  async function adminSearchLicenses(filters?: { search?: string; key?: string }) {
    const params: Record<string, string> = {}
    if (filters?.search) params.search = filters.search
    if (filters?.key) params.key = filters.key
    const raw = await licensingService.adminSearchLicenses(params)
    return parseAdminLicensesSearchResponse(raw) ?? []
  }

  async function adminFetchLicense(id: string): Promise<AdminLicenseDetail | null> {
    if (!licensingApiLive.value) return null
    try {
      const raw = await licensingService.adminGetLicense(id)
      return parseAdminLicenseDetailResponse(raw)
    } catch {
      return null
    }
  }

  async function downloadRelease(token: string, filename: string) {
    const blob = await licensingService.downloadRelease(token)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename || 'download'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return {
    licensingApiLive,
    fetchLicenses,
    fetchLicense,
    fetchDownloads,
    deactivateActivation,
    requestRevealOtp,
    verifyRevealOtp,
    adminFetchInstallations,
    adminSearchLicenses,
    adminFetchLicense,
    downloadRelease,
    listLicenses: fetchLicenses,
    getLicense: fetchLicense,
    listDownloads: fetchDownloads,
  }
}
