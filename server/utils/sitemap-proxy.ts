import type { H3Event } from 'h3'
import { API_ENDPOINTS } from '~/api/endpoints'

function rewriteSitemapXml(xml: string, siteUrl: string, apiOrigin: string): string {
  const site = siteUrl.replace(/\/+$/, '')
  const api = apiOrigin.replace(/\/+$/, '')

  return xml
    .replaceAll(`${api}/api/sitemap-products.xml`, `${site}/sitemap-products.xml`)
    .replaceAll(`${api}/api/sitemap-blog.xml`, `${site}/sitemap-blog.xml`)
    .replace(/https?:\/\/localhost(?::\d+)?/gi, site)
}

export async function proxyBackendXml(event: H3Event, apiPath: string): Promise<string> {
  const config = useRuntimeConfig()
  const targetOrigin = String(config.public.apiProxyTarget || 'https://api.store.a4j.ir').replace(
    /\/+$/,
    '',
  )
  const siteUrl = String(config.public.siteUrl || 'https://boilerplate-store.liara.run').replace(
    /\/+$/,
    '',
  )

  try {
    const response = await fetch(`${targetOrigin}${apiPath}`)
    if (!response.ok) {
      throw new Error(`Upstream ${response.status}`)
    }
    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    const xml = await response.text()
    return rewriteSitemapXml(xml, siteUrl, targetOrigin)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Sitemap upstream unavailable' })
  }
}

export const SITEMAP_API_PATHS = {
  index: API_ENDPOINTS.SEO.SITEMAP,
  products: API_ENDPOINTS.SEO.SITEMAP_PRODUCTS,
  blog: API_ENDPOINTS.SEO.SITEMAP_BLOG,
} as const
