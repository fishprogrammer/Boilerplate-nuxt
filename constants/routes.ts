/**
 * Centralised route path constants.
 * Use these instead of raw string literals when navigating or building links.
 *
 * @example
 * router.push(ROUTES.LOGIN)
 * router.push({ path: ROUTES.USER_VIEW, params: { id } })
 */
export const ROUTES = {
  // Auth (guest)
  LOGIN: '/login',
  VERIFY: '/verify',
  REGISTER: '/register',
  REGISTER_VERIFY: '/register/verify',

  // Dashboard
  HOME: '/panel',
  PROFILE: '/profile',

  // Users
  USERS: '/users',
  USER_CREATE: '/users/create',
  USER_VIEW: '/users/:id',
  USER_EDIT: '/users/:id/edit',

  // Roles & Permissions
  ROLES: '/roles',
  ROLE_CREATE: '/roles/create',
  ROLE_EDIT: '/roles/edit/:id',
  PERMISSIONS: '/permissions',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_SEND: '/notifications/send',
  NOTIFICATION_VIEW: '/notifications/view/:id',

  // System
  SYSTEM_SETTINGS: '/system-settings',
  SYSTEM_HEALTH: '/system-health',

  // Media
  MEDIA: '/media',

  // Wallet
  WALLET: '/wallet',
  WALLET_DEPOSIT: '/wallet/deposit',
  WALLET_DEPOSIT_RESULT: '/wallet/deposit/result',
  WALLET_DEPOSIT_SUCCESS: '/wallet/deposit/success',
  WALLET_DEPOSIT_FAILURE: '/wallet/deposit/failure',
  WALLET_MANAGE: '/wallet/manage',
  WALLET_VIEW: '/wallet/manage/:id',

  PAYMENT_SETTINGS: '/payments/admin/settings',
  PAYMENT_GATEWAYS: '/payments/admin/gateways',
  PAYMENT_GATEWAY_CREATE: '/payments/admin/gateways/create',
  PAYMENT_GATEWAY_EDIT: '/payments/admin/gateways/:id',
  PAYMENT_GATEWAY_ORDERS: '/payments/admin/gateways/:id/orders',
  PAYMENT_MANUAL_DEPOSIT: '/payments/admin/manual-deposit',

  // Tickets
  TICKETS: '/tickets',
  TICKET_CREATE: '/tickets/create',
  TICKET_VIEW: '/tickets/view/:id',
  TICKET_QUEUE: '/tickets/queue',
  TICKET_TYPES: '/tickets/admin/types',
  TICKET_DEPARTMENTS: '/tickets/admin/departments',
  TICKET_SETTINGS: '/tickets/admin/settings',
  GUEST_TICKET_CREATE: '/tickets/guest/create',
  GUEST_TICKET_TRACK: '/tickets/guest/track',
  GUEST_TICKET_VIEW: '/tickets/guest/view',

  // Blog
  BLOG: '/blog/manage',
  BLOG_CREATE: '/blog/create',
  BLOG_VIEW: '/blog/p/:id',
  BLOG_EDIT: '/blog/:id/edit',
  BLOG_COMMENTS: '/blog/comments',
  BLOG_COMMENT_VIEW: '/blog/comments/view/:id',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

/** Route names — use for router.push({ name }) calls */
export const ROUTE_NAMES = {
  LOGIN: 'Login',
  VERIFY: 'Verify',
  REGISTER: 'Register',
  REGISTER_VERIFY: 'RegisterVerify',
  INDEX: 'Index',
  PROFILE: 'Profile',
  USERS: 'users',
  USER_CREATE: 'create-user',
  USER_VIEW: 'user-view',
  USER_EDIT: 'user-edit',
  ROLES: 'roles',
  ROLE_CREATE: 'create-role',
  ROLE_EDIT: 'edit-role',
  PERMISSIONS: 'permissions',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_SEND: 'send-notification',
  NOTIFICATION_VIEW: 'view-notification',
  SYSTEM_SETTINGS: 'system-settings',
  SYSTEM_HEALTH: 'system-health',
  MEDIA: 'media',
  WALLET: 'wallet',
  WALLET_DEPOSIT: 'wallet-deposit',
  WALLET_DEPOSIT_RESULT: 'wallet-deposit-result',
  WALLET_DEPOSIT_SUCCESS: 'wallet-deposit-success',
  WALLET_DEPOSIT_FAILURE: 'wallet-deposit-failure',
  MY_SALE_ORDERS: 'my-sale-orders',
  MY_SALE_ORDER_VIEW: 'my-sale-order-view',
  WALLET_MANAGE: 'wallet-manage',
  WALLET_VIEW: 'view-wallet',
  PAYMENT_SETTINGS: 'payment-settings',
  PAYMENT_GATEWAYS: 'payment-gateways',
  PAYMENT_GATEWAY_CREATE: 'payment-gateway-create',
  PAYMENT_GATEWAY_EDIT: 'payment-gateway-edit',
  PAYMENT_GATEWAY_ORDERS: 'payment-gateway-orders',
  PAYMENT_MANUAL_DEPOSIT: 'payment-manual-deposit',
  TICKETS: 'tickets',
  TICKET_CREATE: 'create-ticket',
  TICKET_VIEW: 'view-ticket',
  TICKET_QUEUE: 'ticket-queue',
  TICKET_TYPES: 'ticket-types',
  TICKET_DEPARTMENTS: 'ticket-departments',
  TICKET_SETTINGS: 'ticket-settings',
  GUEST_TICKET_CREATE: 'guest-ticket-create',
  GUEST_TICKET_TRACK: 'guest-ticket-track',
  GUEST_TICKET_VIEW: 'guest-ticket-view',
  BLOG: 'blog',
  BLOG_CREATE: 'create-blog',
  BLOG_VIEW: 'view-blog',
  BLOG_EDIT: 'edit-blog',
  BLOG_COMMENTS: 'blog-comments',
  BLOG_COMMENT_VIEW: 'view-blog-comment',
} as const

