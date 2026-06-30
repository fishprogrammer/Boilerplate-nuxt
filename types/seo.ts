export interface SeoPayload {
  title: string
  description: string
  canonical: string
  robots: string
  og_title: string
  og_description: string
  og_image: string | null
  hreflang: Record<string, string>
  json_ld: Record<string, unknown>
}
