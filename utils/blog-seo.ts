import type { BlogPost } from '~/api/types/blog.types'
import type { SeoPayload } from '~/types/seo'
import { absoluteSiteUrl, localeHreflang } from '~/utils/locale-path'
import type { AppLocale } from '~/utils/locale'

export function resolveBlogPostSeo(
  post: BlogPost,
  locale: AppLocale,
  siteUrl: string,
): SeoPayload {
  if (post.seo) return post.seo

  const articlePath = `/blog/${post.slug || post.id}`
  const description = post.meta_description || post.body.replace(/<[^>]+>/g, '').slice(0, 160)
  const title = post.meta_title || post.title

  return {
    title,
    description,
    canonical: absoluteSiteUrl(siteUrl, locale, articlePath),
    robots: 'index,follow',
    og_title: title,
    og_description: description,
    og_image: post.og_image || `${siteUrl}/logo.png`,
    hreflang: localeHreflang(siteUrl, articlePath),
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      datePublished: post.published_at
        ? new Date(post.published_at * 1000).toISOString()
        : undefined,
    },
  }
}
