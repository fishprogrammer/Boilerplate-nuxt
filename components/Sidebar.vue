<template>
  <!-- Backdrop (mobile / tablet overlay) -->
  <Transition
    enter-active-class="sidebar-backdrop-enter-active"
    leave-active-class="sidebar-backdrop-leave-active"
    enter-from-class="sidebar-backdrop-enter-from"
    leave-to-class="sidebar-backdrop-leave-to"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/40 min-[1124px]:hidden overlay-dismiss"
      aria-hidden="true"
      @click="closeSidebar"
      @touchmove.prevent
    />
  </Transition>

  <aside
    class="sidebar-panel fixed top-0 right-0 z-50 h-full overflow-hidden border-l border-border bg-surface shadow-xl"
    :class="[isOpen ? 'w-72' : 'w-0']"
  >
    <div class="flex h-full w-72 flex-col">
      <!-- Sidebar Header -->
      <div
        class="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:h-16 md:px-5 min-[1124px]:h-18 min-[1124px]:px-6"
      >
        <div class="flex min-w-0 items-center gap-2 md:gap-3">
          <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg md:size-9 min-[1124px]:size-10">
            <img
              src="/logo.png"
              :alt="`لوگوی ${appConfig.name}`"
              class="size-full object-contain p-0.5"
            />
          </div>
          <h2 class="truncate text-base font-bold dark:text-white  md:text-lg min-[1124px]:text-xl">
            {{ appConfig.name }}
          </h2>
        </div>
      </div>

      <!-- Menu Items -->
      <nav class="sidebar-nav flex-1 overflow-y-auto p-2 text-right">
        <div>
          <p class="mb-1.5 px-1.5 text-[0.625rem] font-semibold tracking-wider text-text-muted uppercase md:mb-2 md:text-xs">
            منوی اصلی
          </p>
          <ul class="space-y-1">
            <li v-for="(item, index) in visiblePrimaryMenuItems" :key="index">
              <template v-if="item.action === 'roles' && visibleRolesSubmenuItems.length > 0">
                <button
                  type="button"
                  :class="[
                    'group flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-text-primary md:gap-2.5 md:px-2.5 md:py-2 hover:bg-surface-hover hover:text-text-primary',
                    { 'bg-surface-hover text-text-primary': isRolesSectionActive() },
                  ]"
                  :aria-expanded="rolesSubmenuOpen"
                  @click="toggleRolesSubmenu"
                >
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg md:size-9"
                    :class="item.iconBg"
                  >
                    <svg
                      class="size-4"
                      :class="item.iconColor"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                  </div>
                  <span class="flex-1 text-right text-sm font-medium">{{ item.label }}</span>
                  <svg
                    class="size-4 shrink-0 text-text-muted transition-transform duration-100 ease-out"
                    :class="rolesSubmenuOpen ? 'rotate-90' : 'rotate-0'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <Transition
                  enter-active-class="sidebar-submenu-enter-active"
                  leave-active-class="sidebar-submenu-leave-active"
                  enter-from-class="sidebar-submenu-enter-from"
                  leave-to-class="sidebar-submenu-leave-to"
                >
                  <ul v-if="rolesSubmenuOpen" class="mt-0.5 space-y-0.5 border-r-2 border-border/70 pr-2 mr-12 md:mr-14">
                    <li v-for="subItem in visibleRolesSubmenuItems" :key="subItem.route">
                      <RouterLink
                        :to="{ name: subItem.route }"
                        :class="submenuLinkClass(subItem.route)"
                        @click="closeSidebarIfMobile"
                      >
                        {{ subItem.label }}
                      </RouterLink>
                    </li>
                  </ul>
                </Transition>
              </template>

              <template v-else-if="item.action === 'blog' && visibleBlogSubmenuItems.length > 0">
                <button
                  type="button"
                  :class="[
                    'group flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-text-primary md:gap-2.5 md:px-2.5 md:py-2 hover:bg-surface-hover hover:text-text-primary',
                    { 'bg-surface-hover text-text-primary': isBlogSectionActive() },
                  ]"
                  :aria-expanded="blogSubmenuOpen"
                  @click="toggleBlogSubmenu"
                >
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg md:size-9"
                    :class="item.iconBg"
                  >
                    <svg
                      class="size-4"
                      :class="item.iconColor"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                  </div>
                  <span class="flex-1 text-right text-sm font-medium">{{ item.label }}</span>
                  <svg
                    class="size-4 shrink-0 text-text-muted transition-transform duration-100 ease-out"
                    :class="blogSubmenuOpen ? 'rotate-90' : 'rotate-0'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <Transition
                  enter-active-class="sidebar-submenu-enter-active"
                  leave-active-class="sidebar-submenu-leave-active"
                  enter-from-class="sidebar-submenu-enter-from"
                  leave-to-class="sidebar-submenu-leave-to"
                >
                  <ul v-if="blogSubmenuOpen" class="mt-0.5 space-y-0.5 border-r-2 border-border/70 pr-2 mr-12 md:mr-14">
                    <li v-for="subItem in visibleBlogSubmenuItems" :key="subItem.route">
                      <RouterLink
                        :to="{ name: subItem.route }"
                        :class="submenuLinkClass(subItem.route)"
                        @click="closeSidebarIfMobile"
                      >
                        {{ subItem.label }}
                      </RouterLink>
                    </li>
                  </ul>
                </Transition>
              </template>

              <template v-else-if="item.action === 'tickets' && visibleTicketsSubmenuItems.length > 0">
                <button
                  type="button"
                  :class="[
                    'group flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-text-primary md:gap-2.5 md:px-2.5 md:py-2 hover:bg-surface-hover hover:text-text-primary',
                    { 'bg-surface-hover text-text-primary': isTicketsSectionActive() },
                  ]"
                  :aria-expanded="ticketsSubmenuOpen"
                  @click="toggleTicketsSubmenu"
                >
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg md:size-9"
                    :class="item.iconBg"
                  >
                    <svg
                      class="size-4"
                      :class="item.iconColor"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                  </div>
                  <span class="flex-1 text-right text-sm font-medium">{{ item.label }}</span>
                  <svg
                    class="size-4 shrink-0 text-text-muted transition-transform duration-100 ease-out"
                    :class="ticketsSubmenuOpen ? 'rotate-90' : 'rotate-0'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <Transition
                  enter-active-class="sidebar-submenu-enter-active"
                  leave-active-class="sidebar-submenu-leave-active"
                  enter-from-class="sidebar-submenu-enter-from"
                  leave-to-class="sidebar-submenu-leave-to"
                >
                  <ul v-if="ticketsSubmenuOpen" class="mt-0.5 space-y-0.5 border-r-2 border-border/70 pr-2 mr-12 md:mr-14">
                    <li v-for="subItem in visibleTicketsSubmenuItems" :key="subItem.route">
                      <RouterLink
                        :to="{ name: subItem.route }"
                        :class="submenuLinkClass(subItem.route)"
                        @click="closeSidebarIfMobile"
                      >
                        {{ subItem.label }}
                      </RouterLink>
                    </li>
                  </ul>
                </Transition>
              </template>

              <template v-else-if="item.action === 'wallet' && visibleWalletSubmenuItems.length > 0">
                <button
                  type="button"
                  :class="[
                    'group flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-text-primary md:gap-2.5 md:px-2.5 md:py-2 hover:bg-surface-hover hover:text-text-primary',
                    { 'bg-surface-hover text-text-primary': isWalletSectionActive() },
                  ]"
                  :aria-expanded="walletSubmenuOpen"
                  @click="toggleWalletSubmenu"
                >
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-lg md:size-9"
                    :class="item.iconBg"
                  >
                    <svg
                      class="size-4"
                      :class="item.iconColor"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                  </div>
                  <span class="flex-1 text-right text-sm font-medium">{{ item.label }}</span>
                  <svg
                    class="size-4 shrink-0 text-text-muted transition-transform duration-100 ease-out"
                    :class="walletSubmenuOpen ? 'rotate-90' : 'rotate-0'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <Transition
                  enter-active-class="sidebar-submenu-enter-active"
                  leave-active-class="sidebar-submenu-leave-active"
                  enter-from-class="sidebar-submenu-enter-from"
                  leave-to-class="sidebar-submenu-leave-to"
                >
                  <ul v-if="walletSubmenuOpen" class="mt-0.5 space-y-0.5 border-r-2 border-border/70 pr-2 mr-12 md:mr-14">
                    <li v-for="subItem in visibleWalletSubmenuItems" :key="subItem.route">
                      <RouterLink
                        :to="{ name: subItem.route }"
                        :class="submenuLinkClass(subItem.route)"
                        @click="closeSidebarIfMobile"
                      >
                        {{ subItem.label }}
                      </RouterLink>
                    </li>
                  </ul>
                </Transition>
              </template>

              <RouterLink
                v-else
                :to="{ name: getMenuRouteName(item.action)! }"
                :class="[ 'group flex items-center gap-2 rounded-xl px-2 py-1.5 text-text-primary md:gap-2.5 md:px-2.5 md:py-2 hover:bg-surface-hover hover:text-text-primary', { 'bg-surface-hover text-text-primary': isActive(item) } ]"
                @click="closeSidebarIfMobile"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg md:size-9"
                  :class="item.iconBg"
                >
                  <svg
                    class="size-4"
                    :class="item.iconColor"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                </div>
                <span class="flex-1 text-right text-sm font-medium">{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="my-4 border-t border-border" />

        <div>
          <p class="mb-1.5 px-1.5 text-[0.625rem] font-semibold tracking-wider text-text-muted uppercase md:mb-2 md:text-xs">
            تنظیمات
          </p>
          <ul class="space-y-1">
            <!-- حالت شب -->
            <li>
              <div
                class="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 md:gap-2.5 md:px-2.5 md:py-2"
              >
                <div class="flex min-w-0 items-center gap-2 md:gap-2.5">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 md:size-9">
                    <svg class="size-4 text-brand-gray dark:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-text-secondary">حالت شب</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="isDark"
                  aria-label="تغییر حالت شب"
                  dir="ltr"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-0 p-px transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  :class="isDark ? 'bg-primary' : 'bg-brand-gray/35 dark:bg-brand-gray-dark/80'"
                  @click.stop="toggleTheme"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
                    :class="isDark ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </li>

            <li v-for="(item, index) in visibleSecondaryMenuItems" :key="index">
              <button
                v-if="item.action === 'logout'"
                type="button"
                :class="[ 'group flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-text-secondary md:gap-2.5 md:px-2.5 md:py-2 hover:bg-surface-hover hover:text-text-primary', { 'bg-surface-hover text-text-primary': isActive(item) } ]"
                @click="openLogoutModal"
              >
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700 md:size-9">
                  <svg class="size-4 text-gray-600 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                </div>
                <span class="flex-1 text-right text-sm font-medium">{{ item.label }}</span>
              </button>
              <RouterLink
                v-else
                :to="{ name: getMenuRouteName(item.action)! }"
                :class="[ 'group flex items-center gap-2 rounded-xl px-2 py-1.5 text-text-secondary md:gap-2.5 md:px-2.5 md:py-2 hover:bg-surface-hover hover:text-text-primary', { 'bg-surface-hover text-text-primary': isActive(item) } ]"
                @click="closeSidebarIfMobile"
              >
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700 md:size-9">
                  <svg class="size-4 text-brand-gray dark:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                </div>
                <span class="flex-1 text-right text-sm font-medium">{{ item.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>

  <ConfirmModal
    v-model="showLogoutModal"
    title="خروج از حساب"
    message="آیا مطمئن هستید که می‌خواهید از حساب کاربری خارج شوید؟"
    confirm-label="بله، خروج"
    cancel-label="انصراف"
    variant="danger"
    :loading="isLoggingOut"
    @confirm="confirmLogout"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useTheme } from '~/composables/useTheme'
import { useLogout } from '~/composables/useLogout'
import { usePermissions } from '~/composables/usePermissions'
import { ROLES_SUBMENU_ACCESS, BLOG_SUBMENU_ACCESS, TICKETS_SUBMENU_ACCESS, WALLET_SUBMENU_ACCESS } from '~/constants/permissions'
import ConfirmModal from '~/components/ConfirmModal.vue'
import { appConfig } from '~/config/app'
import { getLayoutMainElement } from '~/utils/scroll'

const SIDEBAR_BREAKPOINT = 1124

const MENU_ACTION_TO_ROUTE: Record<string, string> = {
  home: 'Index',
  users: 'users',
  media: 'media',
  tickets: 'tickets',
  wallet: 'wallet',
  blog: 'blog',
  roles: 'roles',
  'system-settings': 'system-settings',
  'system-health': 'system-health',
}

function getMenuRouteName(action?: string): string | null {
  if (!action) return null
  return MENU_ACTION_TO_ROUTE[action] ?? null
}

function closeSidebarIfMobile() {
  if (window.innerWidth < SIDEBAR_BREAKPOINT) {
    lockedScrollY = 0
    closeSidebar()
  }
}

const { isDark, toggleTheme } = useTheme()
const { hasAnyPermission, canAccessMenu, canAccessRoute } = usePermissions()

interface MenuItem {
  label: string
  icon?: string
  iconPaths?: string[]
  iconBg?: string
  iconColor?: string
  action?: string
}

const isOpen = ref(false)
const rolesSubmenuOpen = ref(false)
const blogSubmenuOpen = ref(false)
const ticketsSubmenuOpen = ref(false)
const walletSubmenuOpen = ref(false)
const route = useRoute()
const showLogoutModal = ref(false)
const { isLoggingOut, executeLogout } = useLogout()

const menuItems: MenuItem[] = [
  {
    label: 'خانه',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    iconBg: 'bg-orange-100 group-hover:bg-orange-200 dark:bg-orange-950 dark:group-hover:bg-orange-900',
    iconColor: 'text-amber-600 group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300',
    action: 'home',
  },
  {
    label: 'کاربران',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    iconBg: 'bg-blue-100 group-hover:bg-blue-200 dark:bg-blue-950 dark:group-hover:bg-blue-900',
    iconColor: 'text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300',
    action: 'users',
  },
  {
    label: 'رسانه ها',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    iconBg: 'bg-purple-100 group-hover:bg-purple-200 dark:bg-purple-950 dark:group-hover:bg-purple-900',
    iconColor: 'text-purple-600 group-hover:text-purple-700 dark:text-purple-400 dark:group-hover:text-purple-300',
    action: 'media',
  },
  {
    label: 'تیکت‌ها',
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
    iconBg: 'bg-sky-100 group-hover:bg-sky-200 dark:bg-sky-950 dark:group-hover:bg-sky-900',
    iconColor: 'text-sky-600 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300',
    action: 'tickets',
  },
  {
    label: 'مدیریت پرداخت',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    iconBg: 'bg-primary/10 group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30',
    iconColor: 'text-primary-dark group-hover:text-primary dark:text-primary dark:group-hover:text-primary',
    action: 'wallet',
  },
  {
    label: 'دسترسی‌ و نقش‌ها',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    iconBg: 'bg-indigo-100 group-hover:bg-indigo-200 dark:bg-indigo-950 dark:group-hover:bg-indigo-900',
    iconColor: 'text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300',
    action: 'roles',
  },
  {
    label: 'بلاگ',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
    iconBg: 'bg-pink-100 group-hover:bg-pink-200 dark:bg-pink-950 dark:group-hover:bg-pink-900',
    iconColor: 'text-red-600 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300',
    action: 'blog',
  },
]

const secondaryMenuItems: MenuItem[] = [
  {
    label: 'تنظیمات سیستم',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    action: 'system-settings',
  },
  {
    label: 'سلامت سایت',
    icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
    action: 'system-health',
  },
  {
    label: 'خروج',
    icon: 'M17 16l4-4m0 0l-4-4m8 4H7',
    action: 'logout',
  },
]

const visiblePrimaryMenuItems = computed(() =>
  menuItems.filter((item) => canAccessMenu(item.action)),
)

const visibleSecondaryMenuItems = computed(() =>
  secondaryMenuItems.filter((item) => item.action === 'logout' || canAccessMenu(item.action)),
)

const visibleRolesSubmenuItems = computed(() =>
  ROLES_SUBMENU_ACCESS.filter((item) => hasAnyPermission(item.anyOf)),
)

const visibleBlogSubmenuItems = computed(() =>
  BLOG_SUBMENU_ACCESS.filter((item) => hasAnyPermission(item.anyOf)),
)

const visibleTicketsSubmenuItems = computed(() =>
  TICKETS_SUBMENU_ACCESS.filter((item) => canAccessRoute(item.route)),
)

const visibleWalletSubmenuItems = computed(() =>
  WALLET_SUBMENU_ACCESS.filter((item) => canAccessRoute(item.route)),
)

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const openSidebar = () => {
  isOpen.value = true
}

const closeSidebar = () => {
  isOpen.value = false
}

let isMobileScrollLocked = false
let lockedScrollY = 0
let lockedScrollRoot: HTMLElement | null = null

const isMobileViewport = () => window.innerWidth < SIDEBAR_BREAKPOINT

const lockMobileScroll = () => {
  if (isMobileScrollLocked) return

  const scrollRoot = getLayoutMainElement()
  if (!scrollRoot) return

  isMobileScrollLocked = true
  lockedScrollRoot = scrollRoot
  lockedScrollY = scrollRoot.scrollTop
  scrollRoot.style.overflow = 'hidden'
}

const unlockMobileScroll = () => {
  if (!isMobileScrollLocked) return

  const scrollRoot = lockedScrollRoot ?? getLayoutMainElement()
  isMobileScrollLocked = false
  lockedScrollRoot = null

  if (scrollRoot) {
    scrollRoot.style.overflow = ''
    scrollRoot.scrollTo({ top: lockedScrollY, left: 0, behavior: 'auto' })
  }

  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
}

const syncMobileScrollLock = () => {
  if (isOpen.value && isMobileViewport()) {
    lockMobileScroll()
    return
  }

  unlockMobileScroll()
}

watch(isOpen, syncMobileScrollLock)

const openLogoutModal = () => {
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  await executeLogout()
  showLogoutModal.value = false
  if (window.innerWidth < SIDEBAR_BREAKPOINT) {
    closeSidebar()
  }
}

function isRolesSectionRoute(): boolean {
  const name = String(route.name || '')
  return (
    name === 'roles' ||
    name === 'create-role' ||
    name === 'edit-role' ||
    name === 'permissions' ||
    route.path.includes('/roles') ||
    route.path.includes('/permissions')
  )
}

function isAdminBlogRoute(path: string): boolean {
  return (
    path.startsWith('/blog/manage') ||
    path === '/blog/create' ||
    path.startsWith('/blog/comments') ||
    /^\/blog\/[^/]+\/edit$/.test(path)
  )
}

function isBlogSectionRoute(): boolean {
  const name = String(route.name || '')
  if (route.path.startsWith('/blog/p/')) return false
  if (!isAdminBlogRoute(route.path)) return false
  return (
    name === 'blog' ||
    name === 'create-blog' ||
    name === 'edit-blog' ||
    name === 'blog-comments' ||
    name === 'view-blog-comment' ||
    isAdminBlogRoute(route.path)
  )
}

function isTicketsSectionRoute(): boolean {
  const name = String(route.name || '')
  if (route.path.startsWith('/tickets/guest')) return false
  return (
    name === 'tickets' ||
    name === 'create-ticket' ||
    name === 'view-ticket' ||
    name === 'ticket-queue' ||
    name === 'ticket-types' ||
    name === 'ticket-departments' ||
    name === 'ticket-settings' ||
    route.path.startsWith('/tickets')
  )
}

function isWalletSectionRoute(): boolean {
  const name = String(route.name || '')
  return (
    name === 'wallet' ||
    name === 'wallet-deposit' ||
    name === 'wallet-deposit-result' ||
    name === 'wallet-deposit-success' ||
    name === 'wallet-deposit-failure' ||
    name === 'my-sale-orders' ||
    name === 'my-sale-order-view' ||
    name === 'wallet-manage' ||
    name === 'view-wallet' ||
    name === 'payment-settings' ||
    name === 'payment-gateways' ||
    name === 'payment-gateway-create' ||
    name === 'payment-gateway-edit' ||
    name === 'payment-gateway-orders' ||
    name === 'payment-manual-deposit' ||
    route.path.startsWith('/wallet') ||
    route.path.startsWith('/payments') ||
    route.path.startsWith('/finance/my-invoices')
  )
}

type SubmenuKey = 'roles' | 'blog' | 'tickets' | 'wallet'

function closeAllSubmenus() {
  rolesSubmenuOpen.value = false
  blogSubmenuOpen.value = false
  ticketsSubmenuOpen.value = false
  walletSubmenuOpen.value = false
}

function toggleSubmenu(key: SubmenuKey) {
  const stateByKey = {
    roles: rolesSubmenuOpen,
    blog: blogSubmenuOpen,
    tickets: ticketsSubmenuOpen,
    wallet: walletSubmenuOpen,
  }
  const wasOpen = stateByKey[key].value
  closeAllSubmenus()
  if (!wasOpen) {
    stateByKey[key].value = true
  }
}

function syncSubmenuWithRoute() {
  closeAllSubmenus()
  if (isRolesSectionRoute()) {
    rolesSubmenuOpen.value = true
  } else if (isBlogSectionRoute()) {
    blogSubmenuOpen.value = true
  } else if (isTicketsSectionRoute()) {
    ticketsSubmenuOpen.value = true
  } else if (isWalletSectionRoute()) {
    walletSubmenuOpen.value = true
  }
}

function toggleTicketsSubmenu() {
  toggleSubmenu('tickets')
}

function isTicketsSectionActive(): boolean {
  return isTicketsSectionRoute()
}

function toggleWalletSubmenu() {
  toggleSubmenu('wallet')
}

function isWalletSectionActive(): boolean {
  return isWalletSectionRoute()
}

function toggleRolesSubmenu() {
  toggleSubmenu('roles')
}

function toggleBlogSubmenu() {
  toggleSubmenu('blog')
}

function isRolesSectionActive(): boolean {
  return isRolesSectionRoute()
}

function isBlogSectionActive(): boolean {
  return isBlogSectionRoute()
}

function isSubmenuActive(routeName: string): boolean {
  return String(route.name || '') === routeName
}

function submenuLinkClass(routeName: string): string {
  const base =
    'block rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover hover:text-text-primary'
  return isSubmenuActive(routeName)
    ? `${base} bg-surface-hover text-text-primary`
    : `${base} text-text-secondary`
}

onMounted(() => {
  syncSubmenuWithRoute()
  window.addEventListener('resize', syncMobileScrollLock)
})

onUnmounted(() => {
  window.removeEventListener('resize', syncMobileScrollLock)
  unlockMobileScroll()
})

watch(() => route.path, syncSubmenuWithRoute)

const isActive = (item: MenuItem) => {
  const name = String(route.name || '')
  if (item.action === 'home') return name === 'Index'
  if (item.action === 'users') return name === 'users'
  if (item.action === 'media') return name === 'media'
  if (item.action === 'tickets') return isTicketsSectionRoute()
  if (item.action === 'wallet') return isWalletSectionRoute()
  if (item.action === 'blog') {
    if (route.path.startsWith('/blog/p/')) return false
    return isBlogSectionRoute()
  }
  if (item.action === 'system-settings') return name === 'system-settings'
  if (item.action === 'system-health') return name === 'system-health'
  return false
}

defineExpose({
  toggleSidebar,
  openSidebar,
  closeSidebar,
  isOpen,
})
</script>

<style scoped>
.sidebar-panel {
  transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
}

.sidebar-nav {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.sidebar-backdrop-enter-active,
.sidebar-backdrop-leave-active {
  transition: opacity 320ms cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-backdrop-enter-from,
.sidebar-backdrop-leave-to {
  opacity: 0;
}

.sidebar-submenu-enter-active,
.sidebar-submenu-leave-active {
  transition: opacity 100ms ease-out, transform 100ms ease-out;
  overflow: hidden;
}

.sidebar-submenu-enter-from,
.sidebar-submenu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
