import type { PaginationMeta } from './auth.types'

export type NotificationType = 'system' | 'info' | 'warning' | 'alert' | 'promotion'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

export interface NotificationSenderRole {
  slug: string
  display_name: string
}

export interface NotificationSender {
  id: number
  username: string
  first_name: string
  last_name: string
  roles: NotificationSenderRole[]
}

export interface Notification {
  id: string
  title: string
  body: string
  notification_type: NotificationType
  notification_type_label?: string
  priority: NotificationPriority
  priority_label?: string
  is_read: boolean
  read_at: number
  action_url: string
  sent_by: number
  sent_by_username: string
  sent_by_first_name?: string
  sent_by_last_name?: string
  sent_by_role?: string
  sent_by_detail?: NotificationSender | null
  created_at: number
}

export interface ListInboxParams {
  page?: number
  page_size?: number
  search?: string
  is_read?: boolean
  notification_type?: string
  priority?: string
  ordering?: string
}

export interface InboxListResult {
  items: Notification[]
  pagination: PaginationMeta
}

export type SendNotificationMode = 'all' | 'recipients' | 'roles'

export interface SendNotificationInput {
  send_to_all?: boolean
  recipients?: number[]
  roles?: string[]
  title: string
  body: string
  notification_type?: NotificationType
  priority?: NotificationPriority
  action_url?: string
}

export interface SendNotificationRequest {
  send_to_all?: boolean
  recipients?: number[]
  roles?: string[]
  title: string
  body: string
  notification_type: NotificationType
  priority: NotificationPriority
  action_url?: string
}

