import { apiClient } from '../client'
import { BaseService } from '../base.service'
import { API_ENDPOINTS } from '../endpoints'
import type {
  CreateBlogCommentRequest,
  CreateBlogPostRequest,
  ListBlogCommentsParams,
  ListBlogPostsParams,
  ReplyBlogCommentRequest,
  UpdateBlogCommentRequest,
  UpdateBlogPostRequest,
} from '../types/blog.types'

export class BlogService extends BaseService {
  async listPosts(params?: ListBlogPostsParams): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.status) query.status = params.status
    if (params?.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.BLOG.POSTS, query)
  }

  async getPost(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.BLOG.postById(id))
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

