import moment from 'moment-jalaali'
import type { BlogCommentStatus } from '~/api/types/blog.types'
import { htmlToPlainText } from '~/utils/html'

export const BLOG_COMMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار بررسی' },
  { value: 'approved', label: 'تأیید شده' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'spam', label: 'اسپم' },
] as const

export const BLOG_COMMENT_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'created_at', label: 'قدیمی‌ترین' },
  { value: '-updated_at', label: 'آخرین به‌روزرسانی' },
] as const

const STATUS_LABELS = Object.fromEntries(
  BLOG_COMMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  approved: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  spam: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export function formatBlogCommentStatus(status: BlogCommentStatus | string): string {
  return STATUS_LABELS[status] || status || '—'
}

export function getBlogCommentStatusClass(status: BlogCommentStatus | string): string {
  return STATUS_CLASSES[status] || 'bg-surface-muted text-text-secondary'
}

export function formatBlogCommentDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function excerptBlogCommentBody(body: string, maxLength = 120): string {
  const normalized = htmlToPlainText(body)
  if (!normalized) return '—'
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength)}…`
}

export function formatBlogCommentAuthor(authorName: string, username: string): string {
  const name = authorName.trim()
  if (name) return name
  const user = username.trim()
  return user || '—'
}

export function shortenPostId(postId: string): string {
  const id = postId.trim()
  if (!id) return '—'
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…`
}

