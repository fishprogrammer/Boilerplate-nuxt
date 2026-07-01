export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || 'https://store.a4j.ir').replace(/\/+$/, '')

  const body = `User-agent: *
Allow: /
Disallow: /panel/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: ${siteUrl}/sitemap.xml
`

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return body
})
