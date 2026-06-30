export type ApiSuccess<T> = {
  status: 'success'
  code: string
  message: string
  data: T
  meta: Record<string, unknown>
}

export type ApiError = {
  status: 'error'
  code: string
  message: string
  errors: Record<string, string | string[]> | null
  data: null
  meta: Record<string, unknown>
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError

export type PaginationMeta = {
  page: number
  page_size: number
  total_pages: number
  total_count: number
  has_next: boolean
  has_previous: boolean
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: PaginationMeta
}

export class ApiClientError extends Error {
  code: string
  errors: Record<string, string | string[]> | null

  constructor(payload: ApiError) {
    super(payload.message)
    this.name = 'ApiClientError'
    this.code = payload.code
    this.errors = payload.errors
  }
}
