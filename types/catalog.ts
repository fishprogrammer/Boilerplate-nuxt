import type { SeoPayload } from './seo'

export type ProductType = 'wordpress_plugin' | 'docker_app' | 'desktop' | 'other'
export type PricingModel = 'free' | 'one_time' | 'subscription'
export type LicenseType = 'per_domain' | 'per_server' | 'per_user' | 'lifetime'

export interface MediaRef {
  id: string
  url: string
  thumbnail_url: string | null
  alt: string
}

export interface PricingPlan {
  id: string
  name: string
  pricing_model: PricingModel
  license_type: LicenseType
  price: number
  billing_interval: 'month' | 'year' | null
  max_activations: number
  features: string[]
  is_default: boolean
}

export interface CatalogProductListItem {
  id: string
  slug: string
  name: string
  short_description: string
  product_type: ProductType
  pricing_model: PricingModel
  price_from: number | null
  currency: 'IRR'
  thumbnail_url: string | null
  is_featured: boolean
  category: { slug: string; name: string } | null
  locale: string
}

export interface CatalogProductDetail {
  id: string
  slug: string
  name: string
  short_description: string
  description_html: string
  product_type: ProductType
  screenshots: MediaRef[]
  video_url: string | null
  changelog_summary: string | null
  current_version: string | null
  plans: PricingPlan[]
  seo: SeoPayload
  faqs: { question: string; answer: string }[]
  related_products: CatalogProductListItem[]
  locale: string
}

export interface CatalogCategory {
  id: string
  slug: string
  name: string
  description: string
  parent_slug: string | null
  product_count: number
  seo: SeoPayload
}
