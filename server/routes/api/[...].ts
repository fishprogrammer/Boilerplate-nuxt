import { createError, getRequestURL, proxyRequest } from 'h3'

/**
 * Dev/preview API proxy: browser calls same-origin /api/... (no CORS).
 * Static Liara deploy has no Nitro server — production uses direct api.store.a4j.ir.
 */
export default defineEventHandler(async (event) => {
  if (import.meta.prerender) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const config = useRuntimeConfig()
  const targetOrigin = String(config.public.apiProxyTarget || 'https://api.store.a4j.ir').replace(
    /\/+$/,
    '',
  )
  const requestUrl = getRequestURL(event)

  return proxyRequest(event, `${targetOrigin}${requestUrl.pathname}${requestUrl.search}`)
})
