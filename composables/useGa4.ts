import { seoService } from '~/api/services/seo.service'
import { parsePublicSeoSettingsResponse } from '~/api/utils/seo-response'

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

let measurementId: string | null = null
let scriptInjected = false

function injectGtag(id: string) {
  if (scriptInjected || typeof window === 'undefined') return
  scriptInjected = true
  measurementId = id

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}

export function useGa4() {
  const config = useRuntimeConfig()

  async function loadMeasurementId(): Promise<string> {
    if (measurementId) return measurementId

    let id = String(config.public.ga4Id || '').trim()
    try {
      const raw = await seoService.getPublicSettings()
      const parsed = parsePublicSeoSettingsResponse(raw)
      if (parsed?.ga4_measurement_id) {
        id = parsed.ga4_measurement_id.trim()
      }
    } catch {
      // fallback to env
    }

    if (id) injectGtag(id)
    return id
  }

  function trackPageView(path?: string) {
    if (!window.gtag || !measurementId) return
    const pagePath = path ?? useRoute().fullPath
    window.gtag('event', 'page_view', { page_path: pagePath })
  }

  function trackPurchase(payload: { transaction_id: string; value: number; currency?: string }) {
    if (!window.gtag || !measurementId) return
    window.gtag('event', 'purchase', {
      transaction_id: payload.transaction_id,
      value: payload.value,
      currency: payload.currency || 'IRR',
    })
  }

  function trackAddToCart(payload: { value: number; items?: Array<{ item_id: string; item_name: string }> }) {
    if (!window.gtag || !measurementId) return
    window.gtag('event', 'add_to_cart', {
      value: payload.value,
      currency: 'IRR',
      items: payload.items,
    })
  }

  function trackSignUp(method = 'otp') {
    if (!window.gtag || !measurementId) return
    window.gtag('event', 'sign_up', { method })
  }

  return {
    loadMeasurementId,
    trackPageView,
    trackPurchase,
    trackAddToCart,
    trackSignUp,
  }
}
