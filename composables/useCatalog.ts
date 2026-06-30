import type { CatalogCategory, CatalogProductDetail, CatalogProductListItem } from '~/types/catalog'
import type { PaginatedResult, PaginationMeta } from '~/types/api'
import {
  getMockCategories,
  getMockCategory,
  getMockProductDetail,
  getMockProducts,
} from '~/mocks/catalog'

function emptyPagination(total: number): PaginationMeta {
  return {
    page: 1,
    page_size: total,
    total_pages: 1,
    total_count: total,
    has_next: false,
    has_previous: false,
  }
}

export function useCatalog() {
  const config = useRuntimeConfig()

  const catalogApiLive = computed(
    () => String(config.public.catalogApiLive).toLowerCase() === 'true',
  )

  async function listProducts(locale: string): Promise<PaginatedResult<CatalogProductListItem>> {
    if (!catalogApiLive.value) {
      const items = getMockProducts(locale)
      return { items, pagination: emptyPagination(items.length) }
    }

    const { api } = useApi()
    const data = await api<CatalogProductListItem[]>('/api/catalog/products/', {
      params: { locale, page_size: 100 },
    })
    return { items: data, pagination: emptyPagination(data.length) }
  }

  async function getProduct(slug: string, locale: string): Promise<CatalogProductDetail | null> {
    if (!catalogApiLive.value) {
      return getMockProductDetail(slug, locale)
    }

    const { api } = useApi()
    return api<CatalogProductDetail>(`/api/catalog/products/${slug}/`, {
      params: { locale },
    })
  }

  async function listCategories(locale: string): Promise<CatalogCategory[]> {
    if (!catalogApiLive.value) {
      return getMockCategories(locale)
    }

    const { api } = useApi()
    return api<CatalogCategory[]>('/api/catalog/categories/', { params: { locale } })
  }

  async function getCategory(slug: string, locale: string): Promise<CatalogCategory | null> {
    if (!catalogApiLive.value) {
      return getMockCategory(slug, locale)
    }

    const { api } = useApi()
    return api<CatalogCategory>(`/api/catalog/categories/${slug}/`, { params: { locale } })
  }

  return {
    catalogApiLive,
    listProducts,
    getProduct,
    listCategories,
    getCategory,
  }
}
