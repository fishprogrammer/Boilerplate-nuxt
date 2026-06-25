import moment from 'moment-jalaali'
import type { BlogPostStatus } from '~/api/types/blog.types'
import { htmlToPlainText } from '~/utils/html'

export const BLOG_POST_STATUS_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'published', label: 'منتشر شده' },
] as const

export const BLOG_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'created_at', label: 'قدیمی‌ترین' },
  { value: '-updated_at', label: 'آخرین ویرایش' },
  { value: '-published_at', label: 'جدیدترین انتشار' },
] as const

const STATUS_LABELS = Object.fromEntries(
  BLOG_POST_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  published: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
}

export function formatBlogPostStatus(status: BlogPostStatus | string): string {
  return STATUS_LABELS[status] || status || '—'
}

export function getBlogPostStatusClass(status: BlogPostStatus | string): string {
  return STATUS_CLASSES[status] || 'bg-surface-muted text-text-secondary'
}

export function formatBlogPostDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function excerptBlogBody(body: string, maxLength = 100): string {
  const normalized = htmlToPlainText(body)
  if (!normalized) return '—'
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength)}…`
}

/** English-only URL slug: lowercase letters, numbers, hyphens. */
const ENGLISH_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeEnglishSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidEnglishSlug(slug: string): boolean {
  const normalized = normalizeEnglishSlug(slug)
  return normalized.length > 0 && ENGLISH_SLUG_PATTERN.test(normalized)
}

export function validateEnglishSlug(slug: string): string | null {
  const normalized = normalizeEnglishSlug(slug)
  if (!normalized) return 'اسلاگ الزامی است.'
  if (!ENGLISH_SLUG_PATTERN.test(normalized)) {
    return 'اسلاگ باید فقط شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد.'
  }
  return null
}

/** API blog slug: letters, numbers, hyphens, underscores. */
const BLOG_SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/

export function normalizeBlogSlug(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateBlogSlug(slug: string): string | null {
  const normalized = normalizeBlogSlug(slug)
  if (!normalized) return 'اسلاگ الزامی است.'
  if (!BLOG_SLUG_PATTERN.test(normalized)) {
    return 'اسلاگ باید فقط شامل حروف انگلیسی، اعداد، خط تیره و زیرخط باشد.'
  }
  return null
}

/** Open blog post preview in a new tab (standalone route, no dashboard chrome). */
export function openBlogPreview(id: string): void {
  const path = `/blog/p/${encodeURIComponent(id)}`
  window.open(path, '_blank', 'noopener,noreferrer')
}

/** @deprecated Use normalizeEnglishSlug for blog slugs. */
export function slugifyBlogTitle(title: string): string {
  return normalizeEnglishSlug(title)
}

/** Slug for API: explicit English slug only. */
export function resolveBlogSlug(_title: string, slug?: string): string {
  return normalizeEnglishSlug(slug || '')
}

