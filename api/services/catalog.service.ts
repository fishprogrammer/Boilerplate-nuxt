import { apiClient } from '../client'
import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  AdminCatalogCategory,
  CreateAdminCatalogProductRequest,
  CreateCatalogReleaseRequest,
  ListCatalogProductsParams,
} from '~/types/catalog'
import type { AppLocale } from '~/utils/locale'

export class CatalogService extends BaseService {
  async listProducts(params: ListCatalogProductsParams): Promise<unknown> {
    const query: Record<string, string | number | boolean> = { locale: params.locale }
    if (params.page) query.page = params.page
    if (params.page_size) query.page_size = params.page_size
    if (params.search) query.search = params.search
    if (params.category) query.category = params.category
    if (params.category_slug) query.category_slug = params.category_slug
    if (params.product_type) query.product_type = params.product_type
    if (params.pricing_model) query.pricing_model = params.pricing_model
    if (params.is_featured !== undefined) query.is_featured = params.is_featured
    if (params.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.CATALOG.PRODUCTS, query)
  }

  async getProduct(slug: string, locale: AppLocale | string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.CATALOG.productBySlug(slug), { locale })
  }

  async listCategories(locale: AppLocale | string, params?: Record<string, string | number | boolean>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.CATALOG.CATEGORIES, { locale, ...params })
  }

  async getCategory(slug: string, locale: AppLocale | string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.CATALOG.categoryBySlug(slug), { locale })
  }

  async listCategoryProducts(
    slug: string,
    params: ListCatalogProductsParams,
  ): Promise<unknown> {
    const query: Record<string, string | number | boolean> = { locale: params.locale }
    if (params.page) query.page = params.page
    if (params.page_size) query.page_size = params.page_size
    if (params.search) query.search = params.search
    if (params.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.CATALOG.categoryProducts(slug), query)
  }

  async adminListProducts(params?: Record<string, string | number | boolean>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.CATALOG.ADMIN.PRODUCTS, params)
  }

  async adminGetProduct(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.CATALOG.ADMIN.productById(id))
  }

  async adminCreateProduct(data: CreateAdminCatalogProductRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.CATALOG.ADMIN.PRODUCTS, data)
  }

  async adminUpdateProduct(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.CATALOG.ADMIN.productById(id), data)
  }

  async adminDeleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATALOG.ADMIN.productById(id))
  }

  async adminCreateRelease(id: string, data: CreateCatalogReleaseRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.CATALOG.ADMIN.releases(id), data)
  }

  async adminPublishProduct(id: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.CATALOG.ADMIN.publish(id))
  }

  async adminUnpublishProduct(id: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.CATALOG.ADMIN.unpublish(id))
  }

  async adminDuplicatePlan(id: string, planId: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.CATALOG.ADMIN.duplicatePlan(id), { plan_id: planId })
  }

  async adminGenerateLicensingSecret(id: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.CATALOG.ADMIN.licensingSecret(id))
  }

  async adminListCategories(params?: Record<string, string | number | boolean>): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.CATALOG.ADMIN.CATEGORIES, params)
  }

  async adminCreateCategory(data: Partial<AdminCatalogCategory>): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.CATALOG.ADMIN.CATEGORIES, data)
  }

  async adminUpdateCategory(id: string, data: Partial<AdminCatalogCategory>): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.CATALOG.ADMIN.categoryById(id), data)
  }

  async adminDeleteCategory(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATALOG.ADMIN.categoryById(id))
  }
}

export const catalogService = new CatalogService()
