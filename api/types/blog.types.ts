import type { PaginationMeta } from './auth.types'
import type { SeoPayload } from '~/types/seo'
import type { AppLocale } from '~/utils/locale'

export type BlogPostStatus = 'draft' | 'published'

export interface BlogCategoryBrief {
  id: string
  name: string
  slug: string
  locale: AppLocale
}

export interface BlogCategory extends BlogCategoryBrief {
  description: string
  is_active: boolean
  sort_order: number
  created_at: number
  updated_at: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  body: string
  status: BlogPostStatus
  locale: AppLocale
  category: BlogCategoryBrief | null
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
  category_slug?: string
  locale?: AppLocale | ''
  status?: BlogPostStatus | ''
  ordering?: string
}

export interface BlogPostsListResult {
  posts: BlogPost[]
  pagination: PaginationMeta
}

export interface ListBlogCategoriesParams {
  page?: number
  page_size?: number
  locale?: AppLocale | ''
  search?: string
  is_active?: boolean
  ordering?: string
}

export interface BlogCategoriesListResult {
  categories: BlogCategory[]
  pagination: PaginationMeta
}

export interface CreateBlogCategoryRequest {
  name: string
  slug: string
  locale: AppLocale
  description?: string
  is_active?: boolean
  sort_order?: number
}

export interface UpdateBlogCategoryRequest extends CreateBlogCategoryRequest {}

export interface CreateBlogPostRequest {
  title: string
  slug?: string
  body: string
  status?: BlogPostStatus
  published_at?: number
  locale?: AppLocale
  category: string
  meta_title?: string
  meta_description?: string
  og_image?: string | null
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
  locale: AppLocale
  category: string
  meta_title: string
  meta_description: string
  og_image: string | null
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

