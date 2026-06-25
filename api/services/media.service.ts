import { BaseService } from '../base.service'
import { apiClient } from '../client'
import { API_ENDPOINTS } from '../endpoints'
import type { ListMediaParams } from '../types/media.types'

export class MediaService extends BaseService {
  async listMedia(params?: ListMediaParams): Promise<unknown> {
    const query: Record<string, string | number> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.extension) query.extension = params.extension
    if (params?.file_type) query.file_type = params.file_type
    if (params?.ordering) query.ordering = params.ordering
    return this.getRaw(API_ENDPOINTS.MEDIA.LIST, query)
  }

  async uploadMedia(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<unknown> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(API_ENDPOINTS.MEDIA.LIST, formData, {
      onUploadProgress: (event) => {
        if (!onProgress) return
        if (!event.total) {
          onProgress(0)
          return
        }
        const percent = Math.min(100, Math.round((event.loaded * 100) / event.total))
        onProgress(percent)
      },
    })
    return response.data
  }

  async deleteMedia(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.MEDIA.byId(id))
  }

  async downloadFile(id: string, guestToken?: string): Promise<Blob> {
    const headers: Record<string, string> = {}
    if (guestToken) {
      headers.Authorization = `GuestTicket ${guestToken}`
    }
    const response = await apiClient.get<Blob>(API_ENDPOINTS.MEDIA.file(id), {
      responseType: 'blob',
      headers,
    })
    return response.data
  }

  async fetchPreview(id: string, guestToken?: string): Promise<Blob> {
    const headers: Record<string, string> = {}
    if (guestToken) {
      headers.Authorization = `GuestTicket ${guestToken}`
    }
    const response = await apiClient.get<Blob>(API_ENDPOINTS.MEDIA.preview(id), {
      responseType: 'blob',
      headers,
    })
    return response.data
  }
}

export const mediaService = new MediaService()

