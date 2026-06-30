export const SUPPORTED_LOCALES = ['fa', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function localeDir(locale: AppLocale): 'rtl' | 'ltr' {
  return locale === 'fa' ? 'rtl' : 'ltr'
}

export function formatIRR(amount: number, locale: AppLocale): string {
  const formatted = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount)
  return formatted + (locale === 'fa' ? ' ریال' : ' IRR')
}

export function formatEpochSeconds(epoch: number, locale: AppLocale): string {
  const date = new Date(epoch * 1000)
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
