import type { PaginationMeta } from './auth.types'
import type { SeoPayload } from '~/types/seo'
import type { AppLocale } from '~/utils/locale'

export type BlogPostStatus = 'draft' | 'published'

export interface BlogPost {
  id: string
  title: string
  slug: string
  body: string
  status: BlogPostStatus
  locale: AppLocale
  meta_title: string
  meta_description: string
  og_image: string | null
  seo: SeoPayload | null
  created_at: number
  updated_at: number
  published_at: number
  owner: number
}

export interface ListBlogPostsParams {
  page?: number
  page_size?: number
  search?: string
  slug?: string
  locale?: AppLocale | ''
  status?: BlogPostStatus | ''
  ordering?: string
}

export interface BlogPostsListResult {
  posts: BlogPost[]
  pagination: PaginationMeta
}

export interface CreateBlogPostRequest {
  title: string
  slug?: string
  body: string
  status?: BlogPostStatus
  published_at?: number
}

export type CreateBlogPostInput = CreateBlogPostRequest

export interface UpdateBlogPostInput extends CreateBlogPostInput {
  previousStatus?: BlogPostStatus
  previousPublishedAt?: number
}

export interface UpdateBlogPostRequest {
  title: string
  slug: string
  body: string
  status: BlogPostStatus
  published_at: number
}

export type BlogCommentStatus = 'pending' | 'approved' | 'rejected' | 'spam'

export interface BlogComment {
  id: string
  post: string
  user: number
  username: string
  author_name: string
  author_email: string
  body: string
  status: BlogCommentStatus
  admin_reply: string
  replied_by: number
  replied_by_username: string
  replied_at: number
  created_at: number
  updated_at: number
}

export interface ListBlogCommentsParams {
  page?: number
  page_size?: number
  search?: string
  status?: BlogCommentStatus | ''
  post?: string
  ordering?: string
}

export interface BlogCommentsListResult {
  comments: BlogComment[]
  pagination: PaginationMeta
}

export interface CreateBlogCommentRequest {
  post: string
  body: string
  captcha_id: string
  captcha_answer: string
  author_name?: string
  author_email?: string
}

export interface ReplyBlogCommentRequest {
  admin_reply: string
}

export interface UpdateBlogCommentRequest {
  status: BlogCommentStatus
}

