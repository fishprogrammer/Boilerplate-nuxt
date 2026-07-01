/** Django-style permission codenames from GET /api/auth/me/ → permissions */

export const PERMISSIONS = {
  USERS: {
    VIEW: 'users.view_user',
    ADD: 'users.add_user',
    CHANGE: 'users.change_user',
    DELETE: 'users.delete_user',
    EXPORT: 'users.export_user',
  },
  MEDIA: {
    VIEW: 'media.view_mediafile',
    ADD: 'media.add_mediafile',
    CHANGE: 'media.change_mediafile',
    DELETE: 'media.delete_mediafile',
  },
  BLOG: {
    VIEW: 'blog.view_post',
    ADD: 'blog.add_post',
    CHANGE: 'blog.change_post',
    DELETE: 'blog.delete_post',
    VIEW_COMMENT: 'blog.view_comment',
    CHANGE_COMMENT: 'blog.change_comment',
    DELETE_COMMENT: 'blog.delete_comment',
  },
  INBOX: {
    VIEW: 'inbox.view_notification',
    ADD: 'inbox.add_notification',
    CHANGE: 'inbox.change_notification',
    DELETE: 'inbox.delete_notification',
  },
  AUTH: {
    VIEW_GROUP: 'auth.view_group',
    ADD_GROUP: 'auth.add_group',
    CHANGE_GROUP: 'auth.change_group',
    DELETE_GROUP: 'auth.delete_group',
    VIEW_PERMISSION: 'auth.view_permission',
  },
  TICKETS: {
    VIEW: 'tickets.view_ticket',
    ADD: 'tickets.add_ticket',
    CHANGE: 'tickets.change_ticket',
    DELETE: 'tickets.delete_ticket',
  },
  SYSTEM: {
    VIEW_GENERAL: 'system.view_generalsettings',
    CHANGE_GENERAL: 'system.change_generalsettings',
    VIEW_SECURITY: 'system.view_securitysettings',
    CHANGE_SECURITY: 'system.change_securitysettings',
    VIEW_SMS: 'system.view_smsprovidersettings',
    CHANGE_SMS: 'system.change_smsprovidersettings',
    VIEW_MEDIA: 'system.view_mediasettings',
    CHANGE_MEDIA: 'system.change_mediasettings',
    VIEW_BACKUP: 'system.view_databasebackupsettings',
    CHANGE_BACKUP: 'system.change_databasebackupsettings',
  },
  PAYMENTS: {
    VIEW_SETTINGS: 'payments.view_paymentsettings',
    CHANGE_SETTINGS: 'payments.change_paymentsettings',
    VIEW_GATEWAY: 'payments.view_paymentgateway',
    ADD_GATEWAY: 'payments.add_paymentgateway',
    CHANGE_GATEWAY: 'payments.change_paymentgateway',
    DELETE_GATEWAY: 'payments.delete_paymentgateway',
    VIEW_ORDER: 'payments.view_paymentorder',
  },
  WALLET: {
    VIEW: 'wallet.view_wallet',
    CHANGE: 'wallet.change_wallet',
    MANUAL_DEPOSIT: 'wallet.manual_deposit',
  },
} as const

export const SYSTEM_VIEW_PERMISSIONS = [
  PERMISSIONS.SYSTEM.VIEW_GENERAL,
  PERMISSIONS.SYSTEM.VIEW_SECURITY,
  PERMISSIONS.SYSTEM.VIEW_SMS,
  PERMISSIONS.SYSTEM.VIEW_MEDIA,
  PERMISSIONS.SYSTEM.VIEW_BACKUP,
] as const

export type RouteAccessRule = {
  anyOf?: readonly string[]
  allOf?: readonly string[]
  staffOnly?: boolean
}

/** Route name → required access (empty = any authenticated user) */
export const ROUTE_ACCESS: Partial<Record<string, RouteAccessRule>> = {
  Index: {},
  Profile: {},
  wallet: {},
  'wallet-deposit': {},
  'wallet-deposit-result': {},
  'wallet-deposit-success': {},
  'wallet-deposit-failure': {},
  'my-sale-orders': {},
  'my-sale-order-view': {},
  'wallet-manage': {
    staffOnly: true,
    anyOf: [PERMISSIONS.WALLET.VIEW, PERMISSIONS.WALLET.CHANGE],
  },
  'view-wallet': {
    staffOnly: true,
    anyOf: [PERMISSIONS.WALLET.VIEW, PERMISSIONS.WALLET.CHANGE],
  },
  'payment-settings': {
    staffOnly: true,
    anyOf: [PERMISSIONS.PAYMENTS.VIEW_SETTINGS, PERMISSIONS.PAYMENTS.CHANGE_SETTINGS],
  },
  'payment-gateways': { staffOnly: true, anyOf: [PERMISSIONS.PAYMENTS.VIEW_GATEWAY] },
  'payment-gateway-create': { staffOnly: true, anyOf: [PERMISSIONS.PAYMENTS.ADD_GATEWAY] },
  'payment-gateway-edit': { staffOnly: true, anyOf: [PERMISSIONS.PAYMENTS.CHANGE_GATEWAY] },
  'payment-gateway-orders': { staffOnly: true, anyOf: [PERMISSIONS.PAYMENTS.VIEW_ORDER] },
  'payment-manual-deposit': { staffOnly: true, anyOf: [PERMISSIONS.WALLET.MANUAL_DEPOSIT] },
  users: { anyOf: [PERMISSIONS.USERS.VIEW] },
  'create-user': { anyOf: [PERMISSIONS.USERS.ADD] },
  'user-view': { anyOf: [PERMISSIONS.USERS.VIEW] },
  'user-edit': { anyOf: [PERMISSIONS.USERS.CHANGE] },
  media: { anyOf: [PERMISSIONS.MEDIA.VIEW] },
  notifications: {},
  'send-notification': { anyOf: [PERMISSIONS.INBOX.ADD] },
  'view-notification': {},
  roles: { anyOf: [PERMISSIONS.AUTH.VIEW_GROUP] },
  'create-role': { anyOf: [PERMISSIONS.AUTH.ADD_GROUP] },
  'edit-role': { anyOf: [PERMISSIONS.AUTH.CHANGE_GROUP] },
  permissions: { anyOf: [PERMISSIONS.AUTH.VIEW_PERMISSION] },
  blog: { anyOf: [PERMISSIONS.BLOG.VIEW] },
  'create-blog': { anyOf: [PERMISSIONS.BLOG.ADD] },
  'edit-blog': { anyOf: [PERMISSIONS.BLOG.CHANGE] },
  'blog-categories': { anyOf: [PERMISSIONS.BLOG.CHANGE] },
  'blog-comments': {
    anyOf: [
      PERMISSIONS.BLOG.VIEW_COMMENT,
      PERMISSIONS.BLOG.CHANGE_COMMENT,
      PERMISSIONS.BLOG.DELETE_COMMENT,
    ],
  },
  'view-blog-comment': {
    anyOf: [
      PERMISSIONS.BLOG.VIEW_COMMENT,
      PERMISSIONS.BLOG.CHANGE_COMMENT,
      PERMISSIONS.BLOG.DELETE_COMMENT,
    ],
  },
  'system-settings': { staffOnly: true, anyOf: SYSTEM_VIEW_PERMISSIONS },
  'system-health': { staffOnly: true, anyOf: SYSTEM_VIEW_PERMISSIONS },
  tickets: {},
  'create-ticket': {},
  'view-ticket': {},
  'ticket-queue': { staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
  'ticket-types': { staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
  'ticket-departments': { staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
  'ticket-settings': { staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
}

export type MenuAccessRule = {
  anyOf?: readonly string[]
  staffOnly?: boolean
}

export const MENU_ACCESS: Partial<Record<string, MenuAccessRule>> = {
  home: {},
  users: { anyOf: [PERMISSIONS.USERS.VIEW] },
  profile: {},
  media: { anyOf: [PERMISSIONS.MEDIA.VIEW] },
  notifications: {},
  roles: {
    anyOf: [
      PERMISSIONS.AUTH.VIEW_GROUP,
      PERMISSIONS.AUTH.ADD_GROUP,
      PERMISSIONS.AUTH.VIEW_PERMISSION,
    ],
  },
  blog: {
    anyOf: [
      PERMISSIONS.BLOG.VIEW,
      PERMISSIONS.BLOG.VIEW_COMMENT,
      PERMISSIONS.BLOG.CHANGE_COMMENT,
      PERMISSIONS.BLOG.DELETE_COMMENT,
    ],
  },
  tickets: {},
  wallet: {},
  'system-settings': { staffOnly: true, anyOf: SYSTEM_VIEW_PERMISSIONS },
  'system-health': { staffOnly: true, anyOf: SYSTEM_VIEW_PERMISSIONS },
}

export type TicketsSubmenuRouteName =
  | 'tickets'
  | 'create-ticket'
  | 'ticket-queue'
  | 'ticket-types'
  | 'ticket-departments'
  | 'ticket-settings'

export const TICKETS_SUBMENU_ACCESS: Array<{
  route: TicketsSubmenuRouteName
  label: string
  anyOf?: readonly string[]
  staffOnly?: boolean
}> = [
  { route: 'tickets', label: 'همه تیکت‌ها' },
  { route: 'create-ticket', label: 'تیکت جدید' },
  { route: 'ticket-queue', label: 'صف اپراتور', staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
  { route: 'ticket-types', label: 'موضوعات تیکت', staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
  { route: 'ticket-departments', label: 'دپارتمان‌ها', staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
  { route: 'ticket-settings', label: 'تنظیمات تیکت', staffOnly: true, anyOf: [PERMISSIONS.TICKETS.CHANGE] },
]

export type BlogSubmenuRouteName = 'blog' | 'blog-categories' | 'blog-comments'

export const BLOG_SUBMENU_ACCESS: Array<{ route: BlogSubmenuRouteName; label: string; anyOf: readonly string[] }> = [
  { route: 'blog', label: 'پست‌ها', anyOf: [PERMISSIONS.BLOG.VIEW] },
  { route: 'blog-categories', label: 'دسته‌ها', anyOf: [PERMISSIONS.BLOG.CHANGE] },
  {
    route: 'blog-comments',
    label: 'نظرات',
    anyOf: [
      PERMISSIONS.BLOG.VIEW_COMMENT,
      PERMISSIONS.BLOG.CHANGE_COMMENT,
      PERMISSIONS.BLOG.DELETE_COMMENT,
    ],
  },
]

export type RolesSubmenuRouteName = 'roles' | 'create-role' | 'permissions'

export const ROLES_SUBMENU_ACCESS: Array<{ route: RolesSubmenuRouteName; label: string; anyOf: readonly string[] }> = [
  { route: 'roles', label: 'نقش‌ها', anyOf: [PERMISSIONS.AUTH.VIEW_GROUP] },
  { route: 'create-role', label: 'نقش جدید', anyOf: [PERMISSIONS.AUTH.ADD_GROUP] },
  { route: 'permissions', label: 'مشاهده دسترسی‌ها', anyOf: [PERMISSIONS.AUTH.VIEW_PERMISSION] },
]

export type WalletSubmenuRouteName =
  | 'wallet'
  | 'wallet-deposit'
  | 'my-sale-orders'
  | 'wallet-manage'
  | 'payment-settings'
  | 'payment-gateways'
  | 'payment-manual-deposit'

export const WALLET_SUBMENU_ACCESS: Array<{
  route: WalletSubmenuRouteName
  label: string
}> = [
  { route: 'wallet', label: 'کیف پول من' },
  { route: 'wallet-deposit', label: 'شارژ کیف پول' },
  { route: 'my-sale-orders', label: 'فاکتورهای من' },
  { route: 'wallet-manage', label: 'مدیریت کیف پول‌ها' },
  { route: 'payment-settings', label: 'تنظیمات پرداخت' },
  { route: 'payment-gateways', label: 'درگاه‌های پرداخت' },
  { route: 'payment-manual-deposit', label: 'شارژ دستی' },
]

