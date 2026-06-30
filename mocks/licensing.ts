import type { DownloadItem, License, LicenseDetail } from '~/types/licensing'

export const mockLicenses: License[] = [
  {
    id: 'lic-mock-1',
    license_key_masked: 'XXXX-XXXX-XXXX-1234',
    product: { slug: 'woo-sync-pro', name: 'Woo Sync Pro' },
    plan: { name: 'پلن سالانه', license_type: 'per_domain' },
    status: 'active',
    expires_at: Math.floor(Date.now() / 1000) + 31_536_000,
    max_activations: 1,
    activation_count: 1,
    created_at: Math.floor(Date.now() / 1000) - 86_400,
  },
]

export const mockLicenseDetail: LicenseDetail = {
  ...mockLicenses[0]!,
  activations: [
    {
      id: 'act-mock-1',
      label: 'example.com',
      identifier: 'example.com',
      status: 'active',
      activated_at: Math.floor(Date.now() / 1000) - 43_200,
      last_seen_at: Math.floor(Date.now() / 1000) - 3600,
      product_version: '1.2.0',
    },
  ],
}

export const mockDownloads: DownloadItem[] = [
  {
    license_id: 'lic-mock-1',
    product_slug: 'woo-sync-pro',
    product_name: 'Woo Sync Pro',
    version: '1.2.0',
    filename: 'woo-sync-pro-1.2.0.zip',
    download_url: '#mock-download',
    released_at: Math.floor(Date.now() / 1000) - 604_800,
    changelog: 'بهبود پایداری و رفع باگ‌های گزارش‌شده',
  },
]
