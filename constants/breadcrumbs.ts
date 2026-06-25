import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

export type BreadcrumbItem = {
  label: string
  to?: RouteLocationRaw
}

const home: BreadcrumbItem = { label: 'داشبورد', to: { name: 'Index' } }

const usersList: BreadcrumbItem = { label: 'کاربران', to: { name: 'users' } }
const walletSection: BreadcrumbItem = { label: 'مدیریت پرداخت', to: { name: 'wallet' } }
const walletManage: BreadcrumbItem = { label: 'مدیریت کیف پول‌ها', to: { name: 'wallet-manage' } }
const paymentGateways: BreadcrumbItem = { label: 'درگاه‌های پرداخت', to: { name: 'payment-gateways' } }
const walletDeposit: BreadcrumbItem = { label: 'شارژ کیف پول', to: { name: 'wallet-deposit' } }
const notificationsList: BreadcrumbItem = { label: 'اعلانات', to: { name: 'notifications' } }
const rolesList: BreadcrumbItem = { label: 'نقش‌ها', to: { name: 'roles' } }
const blogPosts: BreadcrumbItem = { label: 'پست‌ها', to: { name: 'blog' } }
const blogComments: BreadcrumbItem = { label: 'نظرات', to: { name: 'blog-comments' } }
const ticketsList: BreadcrumbItem = { label: 'تیکت‌ها', to: { name: 'tickets' } }

const ROUTE_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  Index: [{ label: 'داشبورد' }],
  Profile: [home, { label: 'پروفایل' }],

  users: [home, { label: 'کاربران' }],
  'create-user': [home, usersList, { label: 'افزودن کاربر' }],
  'user-view': [home, usersList, { label: 'مشاهده کاربر' }],
  'user-edit': [home, usersList, { label: 'ویرایش کاربر' }],

  wallet: [home, { label: 'کیف پول من' }],
  'wallet-deposit': [home, walletSection, { label: 'شارژ کیف پول' }],
  'wallet-deposit-result': [home, walletSection, walletDeposit, { label: 'نتیجه پرداخت' }],
  'my-sale-orders': [home, walletSection, { label: 'فاکتورهای من' }],
  'my-sale-order-view': [home, walletSection, { label: 'فاکتورهای من', to: { name: 'my-sale-orders' } }, { label: 'جزئیات فاکتور' }],
  'wallet-manage': [home, walletSection, { label: 'مدیریت کیف پول‌ها' }],
  'view-wallet': [home, walletSection, walletManage, { label: 'جزئیات کیف پول' }],
  'payment-settings': [home, walletSection, { label: 'تنظیمات پرداخت' }],
  'payment-gateways': [home, walletSection, { label: 'درگاه‌های پرداخت' }],
  'payment-gateway-create': [home, walletSection, paymentGateways, { label: 'درگاه جدید' }],
  'payment-gateway-edit': [home, walletSection, paymentGateways, { label: 'ویرایش درگاه' }],
  'payment-gateway-orders': [home, walletSection, paymentGateways, { label: 'سفارش‌های درگاه' }],
  'payment-manual-deposit': [home, walletSection, { label: 'شارژ دستی' }],

  media: [home, { label: 'رسانه‌ها' }],

  notifications: [home, { label: 'اعلانات' }],
  'send-notification': [home, notificationsList, { label: 'ارسال اعلان' }],
  'view-notification': [home, notificationsList, { label: 'مشاهده اعلان' }],

  roles: [home, { label: 'نقش‌ها' }],
  'create-role': [home, rolesList, { label: 'ایجاد نقش' }],
  'edit-role': [home, rolesList, { label: 'ویرایش نقش' }],
  permissions: [home, { label: 'دسترسی‌ها' }],

  blog: [home, { label: 'پست‌ها' }],
  'create-blog': [home, blogPosts, { label: 'پست جدید' }],
  'edit-blog': [home, blogPosts, { label: 'ویرایش پست' }],
  'blog-comments': [home, { label: 'نظرات' }],
  'view-blog-comment': [home, blogComments, { label: 'مشاهده نظر' }],

  tickets: [home, { label: 'تیکت‌ها' }],
  'create-ticket': [home, ticketsList, { label: 'تیکت جدید' }],
  'view-ticket': [home, ticketsList, { label: 'جزئیات تیکت' }],
  'ticket-queue': [home, ticketsList, { label: 'صف اپراتور' }],
  'ticket-types': [home, ticketsList, { label: 'انواع تیکت' }],
  'ticket-departments': [home, ticketsList, { label: 'بخش‌های تیکت' }],
  'ticket-settings': [home, ticketsList, { label: 'تنظیمات تیکت' }],

  'system-settings': [home, { label: 'تنظیمات سیستم' }],
  'system-health': [home, { label: 'سلامت سایت' }],
}

const ROUTE_LABELS: Record<string, string> = {
  Index: 'داشبورد',
  Profile: 'پروفایل',
  wallet: 'کیف پول',
  'wallet-deposit': 'شارژ کیف پول',
  'wallet-deposit-result': 'نتیجه پرداخت',
  'my-sale-orders': 'فاکتورهای من',
  'my-sale-order-view': 'جزئیات فاکتور',
  'wallet-manage': 'مدیریت کیف پول',
  'view-wallet': 'جزئیات کیف پول',
  'payment-settings': 'تنظیمات پرداخت',
  'payment-gateways': 'درگاه‌های پرداخت',
  'payment-gateway-create': 'درگاه جدید',
  'payment-gateway-edit': 'ویرایش درگاه',
  'payment-gateway-orders': 'سفارش‌های درگاه',
  'payment-manual-deposit': 'شارژ دستی',
  permissions: 'دسترسی‌ها',
  roles: 'نقش‌ها',
  'create-role': 'ایجاد نقش',
  'edit-role': 'ویرایش نقش',
  users: 'کاربران',
  'create-user': 'افزودن کاربر',
  'user-view': 'مشاهده کاربر',
  'user-edit': 'ویرایش کاربر',
  media: 'رسانه‌ها',
  notifications: 'اعلانات',
  'send-notification': 'ارسال اعلان',
  'view-notification': 'مشاهده اعلان',
  blog: 'بلاگ',
  'blog-comments': 'نظرات بلاگ',
  'view-blog-comment': 'مشاهده نظر',
  'create-blog': 'پست جدید',
  'edit-blog': 'ویرایش پست',
  tickets: 'تیکت‌ها',
  'create-ticket': 'تیکت جدید',
  'view-ticket': 'جزئیات تیکت',
  'ticket-queue': 'صف اپراتور',
  'ticket-types': 'انواع تیکت',
  'ticket-departments': 'بخش‌های تیکت',
  'ticket-settings': 'تنظیمات تیکت',
  'system-settings': 'تنظیمات سیستم',
  'system-health': 'سلامت سایت',
}

function getRouteLabel(route: RouteLocationNormalizedLoaded): string {
  const name = String(route.name || '')
  if (typeof route.meta?.title === 'string' && route.meta.title.trim()) {
    return route.meta.title
  }
  return ROUTE_LABELS[name] || name || 'صفحه'
}

export function getRouteBreadcrumbs(route: RouteLocationNormalizedLoaded): BreadcrumbItem[] {
  const name = String(route.name || '')
  const mapped = ROUTE_BREADCRUMBS[name]
  if (mapped) return mapped

  if (name === 'Index') return [{ label: 'داشبورد' }]

  return [home, { label: getRouteLabel(route) }]
}
