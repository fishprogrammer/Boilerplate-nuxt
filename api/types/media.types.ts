import type { PaginationMeta } from './auth.types'

export type MediaFileType = 'image' | 'document' | 'video' | 'audio' | 'other'

export interface MediaFile {
  id: string
  original_name: string
  file_type: MediaFileType
  mime_type: string
  size: number
  width: number | null
  height: number | null
  file_url: string | null
  download_url: string | null
  thumbnail_url: string | null
  uploaded_by: number
  uploaded_by_username: string
  created_at: number
}

export interface ListMediaParams {
  page?: number
  page_size?: number
  search?: string
  extension?: string
  file_type?: MediaFileType | ''
  ordering?: string
}

export interface MediaListResult {
  items: MediaFile[]
  pagination: PaginationMeta
}

