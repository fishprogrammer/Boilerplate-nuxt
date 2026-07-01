import type {
  CouponImpactRow,
  FinanceDashboard,
  ForecastDataPoint,
  ForecastScenario,
  MrrDataPoint,
  RevenueByProductRow,
} from '~/types/finance'

export const mockFinanceDashboard: FinanceDashboard = {
  mrr: 48_500_000,
  arr: 582_000_000,
  active_subscriptions: 142,
  revenue_mtd: 126_400_000,
  revenue_ytd: 892_300_000,
  churn_rate_percent: 2.4,
  new_orders_mtd: 38,
}

function buildMockMrrSeries(months: number): MrrDataPoint[] {
  const now = new Date()
  const points: MrrDataPoint[] = []
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const base = 32_000_000 + (months - i) * 1_350_000
    points.push({ month: label, mrr: base })
  }
  return points
}

export function getMockMrrSeries(months: number): MrrDataPoint[] {
  return buildMockMrrSeries(months)
}

export function getMockForecastSeries(months: number, scenario: ForecastScenario): ForecastDataPoint[] {
  const factor = scenario === 'optimistic' ? 1.12 : scenario === 'pessimistic' ? 0.88 : 1
  const last = buildMockMrrSeries(months)
  const tail = last[last.length - 1]?.mrr ?? mockFinanceDashboard.mrr
  const points: ForecastDataPoint[] = []
  const now = new Date()
  for (let i = 1; i <= months; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    points.push({ month: label, mrr: Math.round(tail * factor ** i) })
  }
  return points
}

export const mockRevenueByProduct: RevenueByProductRow[] = [
  { product_slug: 'woo-sync-pro', product_name: 'Woo Sync Pro', revenue: 412_000_000, orders_count: 128 },
  { product_slug: 'docker-deploy-kit', product_name: 'Docker Deploy Kit', revenue: 198_500_000, orders_count: 54 },
  { product_slug: 'desktop-backup', product_name: 'Desktop Backup', revenue: 86_200_000, orders_count: 31 },
]

export const mockCouponsImpact: CouponImpactRow[] = [
  {
    coupon_code: 'LAUNCH20',
    times_used: 42,
    total_discount_amount: 58_400_000,
    orders_count: 42,
    revenue_after_discount: 233_600_000,
  },
  {
    coupon_code: 'WELCOME10',
    times_used: 18,
    total_discount_amount: 12_100_000,
    orders_count: 18,
    revenue_after_discount: 108_900_000,
  },
]
