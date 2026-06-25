import moment from 'moment-jalaali'
import type { Wallet, WalletTransactionStatus, WalletTransactionType, TransactionSource } from '~/api/types/wallet.types'

export const WALLET_TRANSACTION_TYPE_OPTIONS = [
  { value: 'deposit', label: 'واریز' },
  { value: 'withdrawal', label: 'برداشت' },
  { value: 'transfer', label: 'انتقال' },
  { value: 'refund', label: 'بازگشت وجه' },
  { value: 'adjustment', label: 'تعدیل' },
] as const

export const WALLET_TRANSACTION_STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار بررسی' },
  { value: 'completed', label: 'تکمیل‌شده' },
  { value: 'failed', label: 'ناموفق' },
  { value: 'reversed', label: 'برگشت‌خورده' },
] as const

export const WALLET_TRANSACTION_SOURCE_OPTIONS = [
  { value: 'online_gateway', label: 'درگاه آنلاین' },
  { value: 'manual', label: 'دستی' },
  { value: 'system', label: 'سیستمی' },
] as const

export const WALLET_TRANSACTION_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'created_at', label: 'قدیمی‌ترین' },
  { value: '-amount', label: 'بیشترین مبلغ' },
  { value: 'amount', label: 'کمترین مبلغ' },
] as const

export const WALLET_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'created_at', label: 'قدیمی‌ترین' },
  { value: '-balance', label: 'بیشترین موجودی' },
  { value: 'balance', label: 'کمترین موجودی' },
] as const

const TYPE_LABELS = Object.fromEntries(
  WALLET_TRANSACTION_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const STATUS_LABELS = Object.fromEntries(
  WALLET_TRANSACTION_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const SOURCE_LABELS = Object.fromEntries(
  WALLET_TRANSACTION_SOURCE_OPTIONS.map((option) => [option.value, option.label]),
)

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  completed: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  reversed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const TYPE_CLASSES: Record<string, string> = {
  deposit: 'text-teal-700 dark:text-teal-300',
  refund: 'text-teal-700 dark:text-teal-300',
  withdrawal: 'text-red-700 dark:text-red-400',
  transfer: 'text-secondary',
  adjustment: 'text-text-primary',
}

export function parseWalletAmount(value: number | string | undefined | null): number {
  if (value === undefined || value === null) return 0
  const num = Number(normalizeAmountDigits(String(value)))
  return Number.isFinite(num) ? Math.trunc(num) : 0
}

export function normalizeAmountDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '')
}

export function formatAmountInput(value: string): string {
  const digits = normalizeAmountDigits(value)
  if (!digits) return ''
  return formatWalletAmount(digits)
}

export function parseOptionalAmount(value: string | number | null | undefined): number | null {
  if (value === '' || value === null || value === undefined) return null
  const digits = normalizeAmountDigits(String(value))
  if (!digits) return null
  const num = Number.parseInt(digits, 10)
  return Number.isFinite(num) ? num : null
}

export function formatWalletAmount(value: number | string | undefined | null): string {
  return parseWalletAmount(value).toLocaleString('fa-IR')
}

export function formatWalletTransactionType(type: WalletTransactionType | string): string {
  return TYPE_LABELS[type] || type || '—'
}

export function formatWalletTransactionStatus(status: WalletTransactionStatus | string): string {
  return STATUS_LABELS[status] || status || '—'
}

export function formatWalletTransactionSource(source: TransactionSource | string): string {
  return SOURCE_LABELS[source] || source || '—'
}

export function getWalletTransactionStatusClass(status: WalletTransactionStatus | string): string {
  return STATUS_CLASSES[status] || 'bg-surface-muted text-text-secondary'
}

export function getWalletTransactionTypeClass(type: WalletTransactionType | string): string {
  return TYPE_CLASSES[type] || 'text-text-primary'
}

export function formatWalletOwnerDisplay(wallet: Pick<Wallet, 'owner' | 'owner_display_name' | 'owner_first_name' | 'owner_last_name'>): string {
  const display = wallet.owner_display_name?.trim()
  if (display) return display
  const fullName = [wallet.owner_first_name, wallet.owner_last_name].map((part) => part?.trim()).filter(Boolean).join(' ')
  if (fullName) return fullName
  return wallet.owner ? String(wallet.owner) : '—'
}

export function formatWalletTransactionDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function formatSignedWalletAmount(
  type: WalletTransactionType | string,
  amount: number | string,
): string {
  const value = parseWalletAmount(amount)
  const formatted = formatWalletAmount(value)

  if (type === 'withdrawal') return `−${formatted}`
  if (type === 'deposit' || type === 'refund') return `+${formatted}`
  return formatted
}

