import type { CatalogCategory, CatalogProductDetail, CatalogProductListItem } from '~/types/catalog'
import type { SeoPayload } from '~/types/seo'
import { absoluteSiteUrl, localeHreflang } from '~/utils/locale-path'

const siteUrl = 'https://store.a4j.ir'

function seoFor(
  locale: string,
  path: string,
  title: string,
  description: string,
): SeoPayload {
  const canonical = absoluteSiteUrl(siteUrl, locale as 'fa' | 'en', path)
  return {
    title,
    description,
    canonical,
    robots: 'index,follow',
    og_title: title,
    og_description: description,
    og_image: `${siteUrl}/logo.png`,
    hreflang: localeHreflang(siteUrl, path),
    json_ld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonical,
    },
  }
}

export const mockProductsFa: CatalogProductListItem[] = [
  {
    id: 'prod-woo-sync',
    slug: 'woo-sync-pro',
    name: 'Woo Sync Pro',
    short_description: 'همگام‌سازی پیشرفته ووکامرس با انبار و حسابداری',
    product_type: 'wordpress_plugin',
    pricing_model: 'subscription',
    price_from: 2_990_000,
    currency: 'IRR',
    thumbnail_url: '/logo.png',
    is_featured: true,
    category: { slug: 'wordpress-plugins', name: 'افزونه‌های وردپرس' },
    locale: 'fa',
  },
  {
    id: 'prod-docker-crm',
    slug: 'docker-crm-suite',
    name: 'Docker CRM Suite',
    short_description: 'CRM آماده استقرار روی VPS با داکر',
    product_type: 'docker_app',
    pricing_model: 'one_time',
    price_from: 15_000_000,
    currency: 'IRR',
    thumbnail_url: '/logo.png',
    is_featured: true,
    category: { slug: 'docker-apps', name: 'اپلیکیشن‌های داکر' },
    locale: 'fa',
  },
  {
    id: 'prod-free-helper',
    slug: 'wp-helper-free',
    name: 'WP Helper Free',
    short_description: 'ابزار رایگان بهینه‌سازی وردپرس',
    product_type: 'wordpress_plugin',
    pricing_model: 'free',
    price_from: 0,
    currency: 'IRR',
    thumbnail_url: '/logo.png',
    is_featured: false,
    category: { slug: 'wordpress-plugins', name: 'افزونه‌های وردپرس' },
    locale: 'fa',
  },
]

export const mockProductsEn: CatalogProductListItem[] = mockProductsFa.map((p) => ({
  ...p,
  locale: 'en',
  name: p.slug === 'woo-sync-pro' ? 'Woo Sync Pro' : p.slug === 'docker-crm-suite' ? 'Docker CRM Suite' : 'WP Helper Free',
  short_description:
    p.slug === 'woo-sync-pro'
      ? 'Advanced WooCommerce sync for inventory and accounting'
      : p.slug === 'docker-crm-suite'
        ? 'Docker-ready CRM for your VPS'
        : 'Free WordPress optimization toolkit',
  category: p.category
    ? {
        slug: p.category.slug,
        name: p.category.slug === 'wordpress-plugins' ? 'WordPress Plugins' : 'Docker Apps',
      }
    : null,
}))

export function getMockProductDetail(
  slug: string,
  locale: string,
): CatalogProductDetail | null {
  const list = locale === 'en' ? mockProductsEn : mockProductsFa
  const item = list.find((p) => p.slug === slug)
  if (!item) return null

  const path = `/shop/${slug}`
  const title = item.name
  const description = item.short_description

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    short_description: item.short_description,
    description_html: `<p>${item.short_description}</p><p>${locale === 'fa' ? 'توضیحات کامل محصول از API کاتالوگ بارگذاری می‌شود.' : 'Full product description will load from the catalog API.'}</p>`,
    product_type: item.product_type,
    screenshots: [
      { id: 'ss-1', url: '/logo.png', thumbnail_url: '/logo.png', alt: item.name },
    ],
    video_url: null,
    changelog_summary: locale === 'fa' ? 'نسخه 1.2.0 — بهبود پایداری' : 'v1.2.0 — stability improvements',
    current_version: '1.2.0',
    plans: [
      {
        id: `plan-${item.id}-default`,
        name: locale === 'fa' ? 'پلن پیش‌فرض' : 'Default plan',
        pricing_model: item.pricing_model,
        license_type: item.product_type === 'docker_app' ? 'per_server' : 'per_domain',
        price: item.price_from ?? 0,
        billing_interval: item.pricing_model === 'subscription' ? 'year' : null,
        max_activations: 1,
        features:
          locale === 'fa'
            ? ['پشتیبانی ایمیل', 'به‌روزرسانی یک‌ساله', 'فعال‌سازی دامنه']
            : ['Email support', 'One-year updates', 'Domain activation'],
        is_default: true,
      },
    ],
    seo: seoFor(locale, path, title, description),
    faqs: [
      {
        question: locale === 'fa' ? 'چگونه لایسنس را فعال کنم؟' : 'How do I activate the license?',
        answer:
          locale === 'fa'
            ? 'پس از خرید، کلید لایسنس در پنل کاربری نمایش داده می‌شود.'
            : 'After purchase, your license key appears in the customer panel.',
      },
    ],
    related_products: list.filter((p) => p.slug !== slug).slice(0, 2),
    locale,
  }
}

export const mockCategoriesFa: CatalogCategory[] = [
  {
    id: 'cat-wp',
    slug: 'wordpress-plugins',
    name: 'افزونه‌های وردپرس',
    description: 'افزونه‌های حرفه‌ای برای فروشگاه وردپرس',
    parent_slug: null,
    product_count: 2,
    locale: 'fa',
    seo: seoFor('fa', '/shop/category/wordpress-plugins', 'افزونه‌های وردپرس', 'فروش افزونه وردپرس'),
  },
  {
    id: 'cat-docker',
    slug: 'docker-apps',
    name: 'اپلیکیشن‌های داکر',
    description: 'نرم‌افزار آماده استقرار با Docker',
    parent_slug: null,
    product_count: 1,
    locale: 'fa',
    seo: seoFor('fa', '/shop/category/docker-apps', 'اپلیکیشن‌های داکر', 'اپ داکر برای VPS'),
  },
]

export const mockCategoriesEn: CatalogCategory[] = mockCategoriesFa.map((c) => ({
  ...c,
  locale: 'en',
  name: c.slug === 'wordpress-plugins' ? 'WordPress Plugins' : 'Docker Apps',
  description:
    c.slug === 'wordpress-plugins'
      ? 'Professional plugins for WooCommerce stores'
      : 'Docker-ready applications for your server',
  seo: seoFor('en', `/shop/category/${c.slug}`, c.slug === 'wordpress-plugins' ? 'WordPress Plugins' : 'Docker Apps', c.description),
}))

export function getMockProducts(locale: string): CatalogProductListItem[] {
  return locale === 'en' ? mockProductsEn : mockProductsFa
}

export function getMockCategories(locale: string): CatalogCategory[] {
  return locale === 'en' ? mockCategoriesEn : mockCategoriesFa
}

export function getMockCategory(slug: string, locale: string): CatalogCategory | null {
  return getMockCategories(locale).find((c) => c.slug === slug) ?? null
}
