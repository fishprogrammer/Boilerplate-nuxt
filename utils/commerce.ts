import type { OrderStatus } from '~/types/commerce'

export const PENDING_COMMERCE_ORDER_KEY = 'pending_commerce_order_id'

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'در انتظار پرداخت' },
  { value: 'paid', label: 'پرداخت شده' },
  { value: 'failed', label: 'ناموفق' },
  { value: 'refunded', label: 'مسترد شده' },
] as const

const STATUS_LABELS = Object.fromEntries(
  ORDER_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  paid: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export function savePendingCommerceOrder(orderId: string): void {
  sessionStorage.setItem(PENDING_COMMERCE_ORDER_KEY, orderId)
}

export function clearPendingCommerceOrder(): void {
  sessionStorage.removeItem(PENDING_COMMERCE_ORDER_KEY)
}

export function getPendingCommerceOrderId(): string {
  return sessionStorage.getItem(PENDING_COMMERCE_ORDER_KEY) || ''
}

export function isCommerceTerminalStatus(status: OrderStatus): boolean {
  return status === 'paid' || status === 'failed' || status === 'refunded'
}

export function formatOrderStatus(status: OrderStatus | string): string {
  return STATUS_LABELS[status] || status || '—'
}

export function getOrderStatusClass(status: OrderStatus | string): string {
  return STATUS_CLASSES[status as OrderStatus] || 'bg-surface-muted text-text-secondary'
}

export function formatDiscountType(type: string): string {
  if (type === 'percent') return 'درصدی'
  if (type === 'fixed_amount') return 'مبلغ ثابت'
  return type
}
