import type {
  AdminCatalogCategory,
  CatalogCategory,
  CatalogProductDetail,
  CreateCatalogReleaseRequest,
  ListCatalogProductsParams,
} from '~/types/catalog'
import type { PaginatedResult } from '~/types/api'
import type { PaginationMeta } from '~/api/types/auth.types'
import { catalogService } from '~/api/services/catalog.service'
import {
  parseAdminCatalogProductsListResponse,
  parseCatalogCategoriesListResponse,
  parseCatalogCategoryDetailResponse,
  parseCatalogProductDetailResponse,
  parseCatalogProductsListResponse,
} from '~/api/utils/api-response'
import {
  getMockCategories,
  getMockCategory,
  getMockProductDetail,
  getMockProducts,
} from '~/mocks/catalog'

function mapPagination(pagination: PaginationMeta): import('~/types/api').PaginationMeta {
  return {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    total_count: pagination.total_items,
    has_next: Boolean(pagination.next),
    has_previous: Boolean(pagination.previous),
  }
}
function emptyPagination(total: number): import('~/types/api').PaginationMeta {
  return {
    page: 1,
    page_size: total,
    total_pages: 1,
    total_count: total,
    has_next: false,
    has_previous: false,
  }
}

function filterMockProducts(locale: string, params?: ListCatalogProductsParams) {
  let items = getMockProducts(locale)
  if (params?.is_featured) items = items.filter((p) => p.is_featured)
  if (params?.category_slug) items = items.filter((p) => p.category?.slug === params.category_slug)
  if (params?.product_type) items = items.filter((p) => p.product_type === params.product_type)
  if (params?.pricing_model) items = items.filter((p) => p.pricing_model === params.pricing_model)
  if (params?.search) {
    const q = params.search.toLowerCase()
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    )
  }
  return items
}

export function useCatalog() {
  const config = useRuntimeConfig()

  const catalogApiLive = computed(
    () => String(config.public.catalogApiLive).toLowerCase() === 'true',
  )

  async function listProducts(
    params: ListCatalogProductsParams | string,
  ): Promise<PaginatedResult<import('~/types/catalog').CatalogProductListItem>> {
    const resolved: ListCatalogProductsParams =
      typeof params === 'string' ? { locale: params } : params

    if (!catalogApiLive.value) {
      const items = filterMockProducts(resolved.locale, resolved)
      return { items, pagination: emptyPagination(items.length) }
    }

    const raw = await catalogService.listProducts(resolved)
    const parsed = parseCatalogProductsListResponse(raw)
    return {
      items: parsed?.products ?? [],
      pagination: parsed?.pagination ? mapPagination(parsed.pagination) : emptyPagination(0),
    }
  }

  async function listCategoryProducts(
    categorySlug: string,
    params: ListCatalogProductsParams,
  ): Promise<PaginatedResult<import('~/types/catalog').CatalogProductListItem>> {
    if (!catalogApiLive.value) {
      const items = filterMockProducts(params.locale, { ...params, category_slug: categorySlug })
      return { items, pagination: emptyPagination(items.length) }
    }

    const raw = await catalogService.listCategoryProducts(categorySlug, params)
    const parsed = parseCatalogProductsListResponse(raw)
    return {
      items: parsed?.products ?? [],
      pagination: parsed?.pagination ? mapPagination(parsed.pagination) : emptyPagination(0),
    }
  }

  async function getProduct(slug: string, locale: string): Promise<CatalogProductDetail | null> {
    if (!catalogApiLive.value) {
      return getMockProductDetail(slug, locale)
    }

    try {
      const raw = await catalogService.getProduct(slug, locale)
      return parseCatalogProductDetailResponse(raw)
    } catch {
      return null
    }
  }

  async function listCategories(locale: string): Promise<CatalogCategory[]> {
    if (!catalogApiLive.value) {
      return getMockCategories(locale)
    }

    const raw = await catalogService.listCategories(locale)
    const parsed = parseCatalogCategoriesListResponse(raw)
    return parsed?.categories ?? []
  }

  async function getCategory(slug: string, locale: string): Promise<CatalogCategory | null> {
    if (!catalogApiLive.value) {
      return getMockCategory(slug, locale)
    }

    try {
      const raw = await catalogService.getCategory(slug, locale)
      return parseCatalogCategoryDetailResponse(raw)
    } catch {
      return null
    }
  }

  async function adminListProducts(params?: Record<string, string | number | boolean>) {
    const raw = await catalogService.adminListProducts(params)
    return parseAdminCatalogProductsListResponse(raw)
  }

  async function adminGetProduct(id: string) {
    const raw = await catalogService.adminGetProduct(id)
    return parseCatalogProductDetailResponse(raw)
  }

  async function adminCreateProduct(data: Record<string, unknown>) {
    return catalogService.adminCreateProduct(data)
  }

  async function adminUpdateProduct(id: string, data: Record<string, unknown>) {
    return catalogService.adminUpdateProduct(id, data)
  }

  async function adminDeleteProduct(id: string) {
    return catalogService.adminDeleteProduct(id)
  }

  async function adminCreateRelease(id: string, data: CreateCatalogReleaseRequest) {
    return catalogService.adminCreateRelease(id, data)
  }

  async function adminListCategories(params?: Record<string, string | number | boolean>) {
    const raw = await catalogService.adminListCategories(params)
    return parseCatalogCategoriesListResponse(raw)
  }

  async function adminCreateCategory(data: Partial<AdminCatalogCategory>) {
    return catalogService.adminCreateCategory(data)
  }

  async function adminUpdateCategory(id: string, data: Partial<AdminCatalogCategory>) {
    return catalogService.adminUpdateCategory(id, data)
  }

  async function adminDeleteCategory(id: string) {
    return catalogService.adminDeleteCategory(id)
  }

  return {
    catalogApiLive,
    listProducts,
    listCategoryProducts,
    getProduct,
    listCategories,
    getCategory,
    adminListProducts,
    adminGetProduct,
    adminCreateProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    adminCreateRelease,
    adminListCategories,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory,
  }
}
