import type { PaginationMeta } from '~/api/types/auth.types'
import type { SeoPayload } from './seo'
import type { AppLocale } from '~/utils/locale'

export type ProductType = 'wordpress_plugin' | 'docker_app' | 'desktop' | 'other'
export type PricingModel = 'free' | 'one_time' | 'subscription'
export type LicenseType = 'per_domain' | 'per_server' | 'per_user' | 'lifetime'
export type CatalogProductStatus = 'draft' | 'published'

export interface MediaRef {
  id: string
  url: string | null
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
  locale: string
}

export interface ListCatalogProductsParams {
  locale: AppLocale | string
  page?: number
  page_size?: number
  search?: string
  category?: string
  category_slug?: string
  product_type?: ProductType
  pricing_model?: PricingModel
  is_featured?: boolean
  ordering?: string
}

export interface CatalogProductsListResult {
  products: CatalogProductListItem[]
  pagination: PaginationMeta
}

export interface CatalogCategoriesListResult {
  categories: CatalogCategory[]
  pagination: PaginationMeta
}

export interface AdminCatalogProductListItem extends CatalogProductListItem {
  status: CatalogProductStatus
  updated_at: number
}

export interface AdminCatalogProductsListResult {
  products: AdminCatalogProductListItem[]
  pagination: PaginationMeta
}

export interface AdminCatalogCategory {
  id: string
  slug: string
  name: string
  description: string
  locale: AppLocale
  parent: string | null
  is_active: boolean
  sort_order: number
  meta_title: string
  meta_description: string
  og_image: string | null
}

export interface CreateCatalogReleaseRequest {
  version: string
  artifact: string
  release_notes: string
  released_at: number
}

export interface AdminCatalogProductDetail extends CatalogProductDetail {
  status: CatalogProductStatus
}

export interface CreateAdminCatalogProductPlanInput {
  name: string
  pricing_model: PricingModel
  license_type: LicenseType
  price: number
  billing_interval?: 'month' | 'year' | null
  max_activations: number
  features?: string[]
  is_default: boolean
  is_active: boolean
  sort_order: number
}

export interface CreateAdminCatalogProductRequest {
  name: string
  slug: string
  category: string
  locale: AppLocale
  product_type: ProductType
  short_description: string
  description_html?: string
  status?: CatalogProductStatus
  is_featured?: boolean
  meta_title?: string
  meta_description?: string
  plans: CreateAdminCatalogProductPlanInput[]
}

export interface LicensingSecretResponse {
  api_secret: string
}
