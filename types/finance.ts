export interface FinanceDashboard {
  mrr: number
  arr: number
  active_subscriptions: number
  revenue_mtd: number
  revenue_ytd: number
  churn_rate_percent: number
  new_orders_mtd: number
}

export interface MrrDataPoint {
  month: string
  mrr: number
}

export type ForecastScenario = 'realistic' | 'optimistic' | 'pessimistic'

export interface ForecastDataPoint {
  month: string
  mrr: number
}

export interface RevenueByProductRow {
  product_slug: string
  product_name: string
  revenue: number
  orders_count: number
}

export interface CouponImpactRow {
  coupon_code: string
  times_used: number
  total_discount_amount: number
  orders_count: number
  revenue_after_discount: number
}
