import { paymentsService } from '~/api/services/payments.service'
import type { PaymentGatewayPublic, PaymentOrder, PaymentOrderStatus, PaymentRedirect } from '~/api/types/payments.types'
import { parsePaymentOrderDetailResponse } from '~/api/utils/api-response'
import { getAppPublicOrigin } from '~/config/app'
import { normalizeAmountDigits } from '~/utils/wallet'
import moment from 'moment-jalaali'

export const PENDING_PAYMENT_ORDER_KEY = 'pending_payment_order_id'
export const PENDING_PAYMENT_AMOUNT_KEY = 'pending_payment_amount'

export const PAYMENT_ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'redirected', label: 'هدایت به بانک' },
  { value: 'verifying', label: 'در حال تأیید' },
  { value: 'paid', label: 'پرداخت موفق' },
  { value: 'failed', label: 'ناموفق' },
  { value: 'cancelled', label: 'لغو شده' },
] as const

const STATUS_LABELS = Object.fromEntries(
  PAYMENT_ORDER_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const STATUS_CLASSES: Record<PaymentOrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  redirected: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  verifying: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
  paid: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export function savePendingPayment(orderId: string, amount: number): void {
  sessionStorage.setItem(PENDING_PAYMENT_ORDER_KEY, orderId)
  sessionStorage.setItem(PENDING_PAYMENT_AMOUNT_KEY, String(amount))
}

export function clearPendingPayment(): void {
  sessionStorage.removeItem(PENDING_PAYMENT_ORDER_KEY)
  sessionStorage.removeItem(PENDING_PAYMENT_AMOUNT_KEY)
}

export function getPendingPaymentOrderId(): string {
  return sessionStorage.getItem(PENDING_PAYMENT_ORDER_KEY) || ''
}

export function parseDepositAmountInput(value: string): number {
  const digits = normalizeAmountDigits(value)
  if (!digits) return 0
  const amount = Number.parseInt(digits, 10)
  return Number.isFinite(amount) ? amount : 0
}

export interface DepositAmountValidation {
  valid: boolean
  message?: string
}

export function validateDepositAmount(
  amount: number,
  gateway: PaymentGatewayPublic | null,
  globalMin?: number,
  globalMax?: number,
): DepositAmountValidation {
  if (!Number.isInteger(amount) || amount < 1) {
    return { valid: false, message: 'مبلغ باید عدد صحیح مثبت (ریال) باشد.' }
  }

  if (globalMin && globalMin > 0 && amount < globalMin) {
    return {
      valid: false,
      message: `حداقل مبلغ شارژ ${globalMin.toLocaleString('fa-IR')} ریال است.`,
    }
  }

  if (globalMax && globalMax > 0 && amount > globalMax) {
    return {
      valid: false,
      message: `حداکثر مبلغ شارژ ${globalMax.toLocaleString('fa-IR')} ریال است.`,
    }
  }

  if (gateway?.min_amount !== null && gateway?.min_amount !== undefined && amount < gateway.min_amount) {
    return {
      valid: false,
      message: `حداقل مبلغ این درگاه ${gateway.min_amount.toLocaleString('fa-IR')} ریال است.`,
    }
  }

  if (gateway?.max_amount !== null && gateway?.max_amount !== undefined && amount > gateway.max_amount) {
    return {
      valid: false,
      message: `حداکثر مبلغ این درگاه ${gateway.max_amount.toLocaleString('fa-IR')} ریال است.`,
    }
  }

  return { valid: true }
}

export function submitPaymentRedirect(redirect: PaymentRedirect): void {
  const method = redirect.method.toUpperCase()

  if (method === 'GET') {
    window.location.href = redirect.action
    return
  }

  if (method === 'POST') {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = redirect.action
    form.style.display = 'none'

    Object.entries(redirect.fields || {}).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
    return
  }

  throw new Error(`Unsupported redirect method: ${redirect.method}`)
}

export function isPaymentTerminalStatus(status: PaymentOrderStatus): boolean {
  return status === 'paid' || status === 'failed' || status === 'cancelled'
}

export async function pollPaymentOrder(
  orderId: string,
  opts: { intervalMs?: number; maxAttempts?: number } = {},
): Promise<PaymentOrder> {
  const intervalMs = opts.intervalMs ?? 2000
  const maxAttempts = opts.maxAttempts ?? 15

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await paymentsService.getOrder(orderId)
    const order = parsePaymentOrderDetailResponse(response)
    if (order && isPaymentTerminalStatus(order.status)) {
      return order
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Payment status timeout')
}

export function formatPaymentOrderStatus(status: PaymentOrderStatus | string): string {
  return STATUS_LABELS[status] || status || '—'
}

export function getPaymentOrderStatusClass(status: PaymentOrderStatus | string): string {
  return STATUS_CLASSES[status as PaymentOrderStatus] || 'bg-surface-muted text-text-secondary'
}

export function formatPaymentOrderDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function buildGatewayAmountHint(gateway: PaymentGatewayPublic | null): string {
  if (!gateway) return 'مبلغ به ریال (عدد صحیح)'

  const parts: string[] = ['مبلغ به ریال (عدد صحیح)']
  if (gateway.min_amount !== null && gateway.min_amount !== undefined) {
    parts.push(`حداقل ${gateway.min_amount.toLocaleString('fa-IR')}`)
  }
  if (gateway.max_amount !== null && gateway.max_amount !== undefined) {
    parts.push(`حداکثر ${gateway.max_amount.toLocaleString('fa-IR')}`)
  }
  return parts.join(' · ')
}

/** Query string placeholders for payment gateway return URLs. */
export const PAYMENT_RETURN_URL_QUERY = 'order_id={order_id}&status={status}'

export function buildSuggestedPaymentReturnUrl(path: string, origin?: string): string {
  const baseOrigin = (origin ?? getAppPublicOrigin()).replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseOrigin}${normalizedPath}?${PAYMENT_RETURN_URL_QUERY}`
}

