import type { AppLocale } from '~/utils/locale'

export const DEFAULT_LOCALE: AppLocale = 'fa'

export function localePrefix(locale: AppLocale): string {
  return locale === 'en' ? '/en' : ''
}

/** Build a localized app path. FA has no prefix; EN uses `/en`. */
export function localePath(locale: AppLocale, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const prefix = localePrefix(locale)

  if (!prefix) {
    return normalized
  }

  return normalized === '/' ? prefix : `${prefix}${normalized}`
}

export function stripLocalePrefix(path: string): string {
  if (path === '/en' || path.startsWith('/en/')) {
    return path === '/en' ? '/' : path.slice(3) || '/'
  }

  if (path === '/fa' || path.startsWith('/fa/')) {
    return path === '/fa' ? '/' : path.slice(3) || '/'
  }

  return path
}

export function resolveLocaleFromPath(path: string): AppLocale {
  if (path === '/en' || path.startsWith('/en/')) {
    return 'en'
  }

  return DEFAULT_LOCALE
}

export function switchLocalePath(path: string, targetLocale: AppLocale): string {
  return localePath(targetLocale, stripLocalePrefix(path))
}

export function absoluteSiteUrl(siteUrl: string, locale: AppLocale, path = '/'): string {
  const base = siteUrl.replace(/\/+$/, '')
  const localized = localePath(locale, path)
  return localized === '/' ? base : `${base}${localized}`
}

export function localeHreflang(siteUrl: string, path = '/') {
  return {
    fa: absoluteSiteUrl(siteUrl, 'fa', path),
    en: absoluteSiteUrl(siteUrl, 'en', path),
  } as const
}
