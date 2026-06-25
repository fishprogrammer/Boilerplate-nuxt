const FINANCE_ERROR_MESSAGES: Record<string, string> = {
  insufficient_balance: 'موجودی کیف پول کافی نیست.',
  nothing_to_pay: 'مانده قابل پرداخت وجود ندارد.',
  wallet_inactive: 'کیف پول شما غیرفعال است. با پشتیبانی تماس بگیرید.',
  manual_payment_failed: 'ارسال فیش ناموفق بود. ممکن است فیش تکراری در انتظار تأیید باشد.',
}

const SALE_ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'پیش‌نویس',
  pending_payment: 'در انتظار پرداخت',
  partially_paid: 'پرداخت جزئی',
  paid: 'پرداخت شده',
  cancelled: 'لغو شده',
}

const SALE_ORDER_STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-surface-muted text-text-muted',
  pending_payment: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  partially_paid: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
  cancelled: 'bg-surface-muted text-text-muted',
}

export function formatSaleOrderStatus(status: string): string {
  return SALE_ORDER_STATUS_LABELS[status] || status || '—'
}

export function getSaleOrderStatusClass(status: string): string {
  return SALE_ORDER_STATUS_CLASSES[status] || 'bg-surface-muted text-text-primary'
}

export function formatPaymentMode(mode: string): string {
  return mode === 'installment' ? 'قسطی' : 'نقد'
}

export function getFinanceErrorMessage(code: string | undefined, fallback: string): string {
  if (!code) return fallback
  return FINANCE_ERROR_MESSAGES[code] || fallback
}
