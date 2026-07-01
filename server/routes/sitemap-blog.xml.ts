import { proxyBackendXml, SITEMAP_API_PATHS } from '../utils/sitemap-proxy'

export default defineEventHandler((event) => proxyBackendXml(event, SITEMAP_API_PATHS.blog))
