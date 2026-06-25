import { BaseService } from '../base.service'
import { apiClient } from '../client'
import { API_ENDPOINTS } from '../endpoints'
import type { ListInboxParams, SendNotificationRequest } from '../types/inbox.types'

export class InboxService extends BaseService {
  async listNotifications(params?: ListInboxParams): Promise<unknown> {
    const query: Record<string, string | number | boolean> = {}
    if (params?.page) query.page = params.page
    if (params?.page_size) query.page_size = params.page_size
    if (params?.search) query.search = params.search
    if (params?.notification_type) query.notification_type = params.notification_type
    if (params?.priority) query.priority = params.priority
    if (params?.ordering) query.ordering = params.ordering
    if (params?.is_read !== undefined) query.is_read = params.is_read
    return this.getRaw(API_ENDPOINTS.INBOX.LIST, query)
  }

  async sendNotification(data: SendNotificationRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.INBOX.SEND, data)
  }

  async getNotification(id: string): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.INBOX.byId(id))
  }

  async markNotificationAsRead(id: string): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.INBOX.read(id))
  }

  async markAllNotificationsAsRead(): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.INBOX.READ_ALL)
  }

  async getUnreadCount(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.INBOX.UNREAD_COUNT)
  }

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INBOX.byId(id))
  }
}

export const inboxService = new InboxService()

