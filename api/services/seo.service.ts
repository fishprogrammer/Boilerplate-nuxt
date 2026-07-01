import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type { SeoSettingsPatch } from '~/types/seo-admin'

export class SeoService extends BaseService {
  getPublicSettings() {
    return this.getRaw(API_ENDPOINTS.SEO.PUBLIC_SETTINGS)
  }

  getSettings() {
    return this.getRaw(API_ENDPOINTS.SEO.SETTINGS)
  }

  patchSettings(data: SeoSettingsPatch) {
    return this.patchRaw(API_ENDPOINTS.SEO.SETTINGS, data)
  }

  gscStatus() {
    return this.getRaw(API_ENDPOINTS.SEO.GSC.STATUS)
  }

  gscConnect() {
    return this.postRaw(API_ENDPOINTS.SEO.GSC.CONNECT)
  }

  gscAnalytics(days = 28) {
    return this.getRaw(API_ENDPOINTS.SEO.GSC.ANALYTICS, { days })
  }

  gscQueries(days = 28, limit = 50) {
    return this.getRaw(API_ENDPOINTS.SEO.GSC.QUERIES, { days, limit })
  }

  gscPages(days = 28, limit = 50) {
    return this.getRaw(API_ENDPOINTS.SEO.GSC.PAGES, { days, limit })
  }

  gscIndexingIssues() {
    return this.getRaw(API_ENDPOINTS.SEO.GSC.INDEXING_ISSUES)
  }

  gscSubmitSitemap() {
    return this.postRaw(API_ENDPOINTS.SEO.GSC.SUBMIT_SITEMAP)
  }
}

export const seoService = new SeoService()
