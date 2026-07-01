import { seoService } from '~/api/services/seo.service'
import {
  parseGscAnalyticsResponse,
  parseGscConnectResponse,
  parseGscIndexingIssuesResponse,
  parseGscPagesResponse,
  parseGscQueriesResponse,
  parseGscStatusResponse,
  parseGscSubmitSitemapResponse,
} from '~/api/utils/seo-response'

export function useGsc() {
  async function fetchStatus() {
    const raw = await seoService.gscStatus()
    return parseGscStatusResponse(raw)
  }

  async function connect() {
    const raw = await seoService.gscConnect()
    return parseGscConnectResponse(raw)
  }

  async function fetchAnalytics(days = 28) {
    const raw = await seoService.gscAnalytics(days)
    return parseGscAnalyticsResponse(raw) ?? []
  }

  async function fetchQueries(days = 28, limit = 50) {
    const raw = await seoService.gscQueries(days, limit)
    return parseGscQueriesResponse(raw) ?? []
  }

  async function fetchPages(days = 28, limit = 50) {
    const raw = await seoService.gscPages(days, limit)
    return parseGscPagesResponse(raw) ?? []
  }

  async function fetchIndexingIssues() {
    const raw = await seoService.gscIndexingIssues()
    return parseGscIndexingIssuesResponse(raw) ?? []
  }

  async function submitSitemap() {
    const raw = await seoService.gscSubmitSitemap()
    return parseGscSubmitSitemapResponse(raw)
  }

  return {
    fetchStatus,
    connect,
    fetchAnalytics,
    fetchQueries,
    fetchPages,
    fetchIndexingIssues,
    submitSitemap,
  }
}
