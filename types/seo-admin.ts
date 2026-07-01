export interface SeoPublicSettings {
  ga4_measurement_id: string
}

export interface SeoSettings {
  ga4_measurement_id: string
  storefront_base_url: string
  api_public_base_url: string
  nuxt_revalidate_url: string
  nuxt_revalidate_secret_masked: string
  gsc_client_id: string
  gsc_client_secret_masked: string
  gsc_redirect_uri: string
  created_at: number
  updated_at: number
}

export type SeoSettingsPatch = Partial<{
  ga4_measurement_id: string
  storefront_base_url: string
  api_public_base_url: string
  nuxt_revalidate_url: string
  nuxt_revalidate_secret: string
  gsc_client_id: string
  gsc_client_secret: string
  gsc_redirect_uri: string
}>

export interface GscStatus {
  connected: boolean
  configured: boolean
  property_url: string | null
  last_sync_at: number | null
}

export interface GscConnectResponse {
  auth_url: string
}

export interface GscAnalyticsRow {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GscQueryRow {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GscPageRow {
  page: string
  clicks: number
  impressions: number
  position: number
}

export interface GscIndexingIssue {
  url: string
  issue: string
  severity: string
  count: number
}

export interface GscSubmitResult {
  property_url: string
  feedpath: string
  submitted_at: number
}
