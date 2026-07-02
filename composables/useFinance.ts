import type {
  CouponImpactRow,
  FinanceDashboard,
  ForecastDataPoint,
  ForecastScenario,
  MrrDataPoint,
  RevenueByProductRow,
} from '~/types/finance'
import { financeService } from '~/api/services/finance.service'
import {
  parseCouponsImpactResponse,
  parseFinanceDashboardResponse,
  parseForecastSeriesResponse,
  parseMrrSeriesResponse,
  parseRevenueByProductResponse,
} from '~/api/utils/finance-dashboard-response'
import { isApiModuleLive } from '~/utils/api-module-live'
import {
  getMockForecastSeries,
  getMockMrrSeries,
  mockCouponsImpact,
  mockFinanceDashboard,
  mockRevenueByProduct,
} from '~/mocks/finance'

export function useFinance() {
  const config = useRuntimeConfig()

  const financeApiLive = computed(() =>
    isApiModuleLive(config.public.financeApiLive, String(config.public.apiBaseUrl)),
  )

  async function fetchDashboard(): Promise<FinanceDashboard> {
    if (!financeApiLive.value) return mockFinanceDashboard
    const raw = await financeService.getDashboard()
    return parseFinanceDashboardResponse(raw) ?? mockFinanceDashboard
  }

  async function fetchMrr(months = 12): Promise<MrrDataPoint[]> {
    if (!financeApiLive.value) return getMockMrrSeries(months)
    const raw = await financeService.getMrr(months)
    return parseMrrSeriesResponse(raw) ?? []
  }

  async function fetchForecast(months = 12, scenario: ForecastScenario = 'realistic'): Promise<ForecastDataPoint[]> {
    if (!financeApiLive.value) return getMockForecastSeries(months, scenario)
    const raw = await financeService.getForecast(months, scenario)
    return parseForecastSeriesResponse(raw) ?? []
  }

  async function fetchRevenueByProduct(): Promise<RevenueByProductRow[]> {
    if (!financeApiLive.value) return mockRevenueByProduct
    const raw = await financeService.getRevenueByProduct()
    return parseRevenueByProductResponse(raw) ?? []
  }

  async function fetchCouponsImpact(): Promise<CouponImpactRow[]> {
    if (!financeApiLive.value) return mockCouponsImpact
    const raw = await financeService.getCouponsImpact()
    return parseCouponsImpactResponse(raw) ?? []
  }

  return {
    financeApiLive,
    fetchDashboard,
    fetchMrr,
    fetchForecast,
    fetchRevenueByProduct,
    fetchCouponsImpact,
  }
}
