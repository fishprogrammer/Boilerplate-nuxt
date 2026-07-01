export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'revoked'

export interface LicenseSummary {
  id: string
  license_key_masked: string
  product_name: string
}

export interface RevealKeyRequestResponse {
  reveal_id: string
  expires_at: number
  debug_code?: string
}

export interface RevealKeyVerifyResponse {
  license_key: string
}

export interface License {
  id: string
  license_key_masked: string
  product: { slug: string; name: string }
  plan: { name: string; license_type: string }
  status: LicenseStatus
  expires_at: number | null
  max_activations: number
  activation_count: number
  created_at: number
}

export interface Activation {
  id: string
  label: string
  identifier: string
  status: 'active' | 'deactivated'
  activated_at: number
  last_seen_at: number | null
  product_version: string | null
}

export interface LicenseDetail extends License {
  activations: Activation[]
}

export interface DownloadItem {
  license_id: string
  product_slug: string
  product_name: string
  version: string
  filename: string
  download_url: string
  released_at: number
  changelog: string
}

export interface InstallationReport {
  activation_id: string
  product_slug: string
  domain_or_server: string
  version: string
  last_seen_at: number
  license_status: string
}
