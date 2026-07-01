import type { SeoSettings, SeoSettingsPatch } from '~/types/seo-admin'
import { seoService } from '~/api/services/seo.service'
import { parseSeoSettingsResponse } from '~/api/utils/seo-response'

export function useSeoSettings() {
  async function fetchSettings(): Promise<SeoSettings | null> {
    const raw = await seoService.getSettings()
    return parseSeoSettingsResponse(raw)
  }

  async function patchSettings(partial: SeoSettingsPatch): Promise<SeoSettings | null> {
    const body: SeoSettingsPatch = { ...partial }
    if (body.gsc_client_secret !== undefined && !String(body.gsc_client_secret).trim()) {
      delete body.gsc_client_secret
    }
    if (body.nuxt_revalidate_secret !== undefined && !String(body.nuxt_revalidate_secret).trim()) {
      delete body.nuxt_revalidate_secret
    }
    const raw = await seoService.patchSettings(body)
    return parseSeoSettingsResponse(raw)
  }

  return {
    fetchSettings,
    patchSettings,
  }
}
