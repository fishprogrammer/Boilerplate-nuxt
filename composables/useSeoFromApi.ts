import type { SeoPayload } from '~/types/seo'
import { localeDir, type AppLocale } from '~/utils/locale'

export function useSeoFromApi(seo: SeoPayload, locale: AppLocale = 'fa') {
  const hreflangLinks = Object.entries(seo.hreflang).map(([lang, href]) => ({
    rel: 'alternate',
    hreflang: lang,
    href,
  }))

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.og_title,
    ogDescription: seo.og_description,
    ogImage: seo.og_image || undefined,
    twitterCard: 'summary_large_image',
    robots: seo.robots,
  })

  useHead({
    htmlAttrs: {
      lang: locale,
      dir: localeDir(locale),
    },
    link: [{ rel: 'canonical', href: seo.canonical }, ...hreflangLinks],
    script: seo.json_ld
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(seo.json_ld),
          },
        ]
      : [],
  })
}
