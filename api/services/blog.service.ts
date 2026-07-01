import { apiClient } from '../client'
import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  CreateBlogCategoryRequest,
  CreateBlogCommentRequest,
  CreateBlogPostRequest,
  ListBlogCategoriesParams,
  ListBlogCommentsParams,
  ListBlogPostsParams,
  ReplyBlogCommentRequest,
  UpdateBlogCategoryRequest,
  UpdateBlogCommentRequest,
  UpdateBlogPostRequest,
} from '../types/blog.types'
import { parseBlogPostsListResponse, parseBlogCategoriesListResponse } from '../utils/api-response'
import type { AppLocale } from '~/utils/locale'

export class BlogService extends BaseService {
  async listPosts(params?: ListBlogPostsParams): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.slug) query.slug = params.slug
    if (params?.category_slug) query.category_slug = params.category_slug
    if (params?.locale) query.locale = params.locale
    if (params?.status) query.status = params.status
    if (params?.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.BLOG.POSTS, query)
  }

  async getPost(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.BLOG.postById(id))
  }

  async getPublishedPostBySlug(slug: string, locale: AppLocale): Promise<unknown> {
    const listRaw = await this.listPosts({
      locale,
      status: 'published',
      slug,
      page_size: 5,
    })
    const parsed = parseBlogPostsListResponse(listRaw)
    const match = parsed?.posts.find((item) => item.slug === slug)
    if (!match) return null
    return this.getPost(match.id)
  }

  async createPost(data: CreateBlogPostRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.BLOG.POSTS, data)
  }

  async updatePost(id: string, data: UpdateBlogPostRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.BLOG.postById(id), data)
  }

  async patchPost(id: string, data: UpdateBlogPostRequest): Promise<unknown> {
    return this.patchRaw(API_ENDPOINTS.BLOG.postById(id), data)
  }

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.BLOG.postById(id))
  }

  async listCategories(params?: ListBlogCategoriesParams): Promise<unknown> {
    const query: Record<string, string | number | boolean> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.locale) query.locale = params.locale
    if (params?.is_active !== undefined) query.is_active = params.is_active
    if (params?.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.BLOG.CATEGORIES, query)
  }

  async getCategory(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.BLOG.categoryById(id))
  }

  async getCategoryBySlug(slug: string, locale: AppLocale): Promise<unknown> {
    const listRaw = await this.listCategories({ locale, page_size: 100 })
    const parsed = parseBlogCategoriesListResponse(listRaw)
    const match = parsed?.categories.find((item) => item.slug === slug)
    if (!match) return null
    return this.getCategory(match.id)
  }

  async createCategory(data: CreateBlogCategoryRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.BLOG.CATEGORIES, data)
  }

  async updateCategory(id: string, data: UpdateBlogCategoryRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.BLOG.categoryById(id), data)
  }

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.BLOG.categoryById(id))
  }

  async listComments(params?: ListBlogCommentsParams): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.status) query.status = params.status
    if (params?.post) query.post = params.post
    if (params?.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.BLOG.COMMENTS, query)
  }

  async getComment(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.BLOG.commentById(id))
  }

  async replyComment(id: string, data: ReplyBlogCommentRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.BLOG.commentReply(id), data)
  }

  async updateComment(id: string, data: UpdateBlogCommentRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.BLOG.commentById(id), data)
  }

  async deleteComment(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.BLOG.commentById(id))
  }

  async createComment(data: CreateBlogCommentRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.BLOG.COMMENTS, data)
  }
}

export const blogService = new BlogService()

