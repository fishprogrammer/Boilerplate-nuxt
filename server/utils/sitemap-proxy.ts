import type { H3Event } from 'h3'
import { API_ENDPOINTS } from '~/api/endpoints'

export async function proxyBackendXml(event: H3Event, apiPath: string): Promise<string> {
  const config = useRuntimeConfig()
  const targetOrigin = String(config.public.apiProxyTarget || 'https://api.store.a4j.ir').replace(
    /\/+$/,
    '',
  )

  try {
    const response = await fetch(`${targetOrigin}${apiPath}`)
    if (!response.ok) {
      throw new Error(`Upstream ${response.status}`)
    }
    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    return await response.text()
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Sitemap upstream unavailable' })
  }
}

export const SITEMAP_API_PATHS = {
  index: API_ENDPOINTS.SEO.SITEMAP,
  products: API_ENDPOINTS.SEO.SITEMAP_PRODUCTS,
  blog: API_ENDPOINTS.SEO.SITEMAP_BLOG,
} as const
