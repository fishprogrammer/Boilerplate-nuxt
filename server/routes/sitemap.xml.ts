export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || 'https://store.a4j.ir').replace(/\/+$/, '')

  const urls = [`${siteUrl}/fa/shop`, `${siteUrl}/en/shop`, `${siteUrl}/fa/blog`, `${siteUrl}/en/blog`]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return body
})
