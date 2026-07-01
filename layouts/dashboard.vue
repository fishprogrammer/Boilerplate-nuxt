<template>
  <div class="relative flex min-h-screen bg-app-bg" dir="rtl">
    <Sidebar ref="sidebarRef" />

    <div
      class="layout-main mr-0 flex h-[100dvh] min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"
      :class="sidebarRef?.isOpen ? 'min-[1124px]:mr-72' : ''"
    >
      <header
        class="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/95 px-2 shadow-sm backdrop-blur-sm md:h-16 md:px-4 min-[1124px]:h-18 min-[1124px]:px-8"
      >
        <div class="flex min-w-0 items-center gap-3 md:gap-4 min-[1124px]:gap-6">
          <button
            class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover md:size-11"
            aria-label="Toggle Sidebar"
            @click="sidebarRef?.toggleSidebar()"
          >
            <svg class="size-5 md:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <nav class="hidden items-center gap-0.5 text-sm md:flex" aria-label="مسیر صفحه">
            <template v-for="(crumb, index) in breadcrumbs" :key="`${crumb.label}-${index}`">
              <span v-if="index > 0" class="px-0.5 text-text-muted">/</span>
              <NuxtLink
                v-if="crumb.to"
                :to="crumb.to"
                class="text-text-secondary transition-colors hover:text-text-primary"
              >
                {{ crumb.label }}
              </NuxtLink>
              <span v-else class="font-semibold text-text-primary">{{ crumb.label }}</span>
            </template>
          </nav>
        </div>

        <div class="flex shrink-0 items-center gap-1 md:gap-1 min-[1124px]:gap-6">
          <OfflineConnectionIndicator v-if="isOffline" />

          <button
            type="button"
            @click="router.push('/notifications')"
            class="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-text-secondary hover:bg-surface-hover md:size-11"
          >
            <svg class="size-5 md:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[0.5625rem] font-semibold leading-none tabular-nums text-white ring-1 ring-surface"
            >
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>

          <button
            v-if="walletActive"
            type="button"
            class="hidden cursor-pointer items-center gap-3 md:flex md:pr-2"
            @click="router.push('/wallet')"
          >
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-2 rounded-2xl border border-border bg-white/80 px-3 py-1.5 text-sm font-semibold text-text-primary hover:bg-surface-hover dark:bg-surface-muted">
                <svg class="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11a1 1 0 100 2 1 1 0 000-2z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8v2" />
                </svg>
                <span class="leading-tight">{{ walletBalance }} ریال</span>
              </div>
            </div>
          </button>

          <div class="relative md:hidden">
            <button
              type="button"
              class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover"
              aria-label="منوی کاربر"
              aria-haspopup="menu"
              :aria-expanded="mobileMenuOpen"
              @click="toggleMobileMenu"
            >
              <svg class="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="5" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="12" cy="19" r="1.75" />
              </svg>
            </button>
          </div>

          <div class="group relative hidden items-center gap-2 md:flex md:gap-3 min-[1124px]:px-2">
            <div class="flex cursor-pointer items-center gap-2 md:gap-3">
              <UserAvatar avatar-class="size-7 min-[1124px]:size-10" />
              <div class="hidden text-right sm:block">
                <p class="m-0 text-sm font-semibold leading-tight text-text-primary">
                  خوش آمدید
                </p>
                <p class="m-0 truncate text-xs leading-tight text-text-secondary">
                  {{ headerDisplayName }}
                </p>
              </div>
            </div>

            <div
              class="pointer-events-none invisible absolute top-full left-0 z-50 w-[min(100vw-1.5rem,16rem)] pt-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
            >
              <HeaderUserMenuPanel
                :display-name="headerDisplayName"
                :wallet-balance="walletBalance"
                :wallet-active="walletActive"
                @navigate="navigateFromDesktopMenu"
                @logout="openLogoutFromDesktopMenu"
              />
            </div>
          </div>
        </div>
      </header>

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

      <main class="layout-main-content min-h-0 flex-1">
        <slot />
      </main>
    </div>

    <Teleport to="body">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-60 md:hidden"
        @click="closeMobileMenu"
      >
        <div
          class="absolute left-3 top-12 w-[min(100vw-1.5rem,16rem)]"
          @click.stop
        >
          <HeaderUserMenuPanel
            :display-name="headerDisplayName"
            :wallet-balance="walletBalance"
            :wallet-active="walletActive"
            @navigate="navigateFromMobileMenu"
            @logout="openLogoutFromMobileMenu"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '~/components/Sidebar.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import HeaderUserMenuPanel from '~/components/layout/HeaderUserMenuPanel.vue'
import UserAvatar from '~/components/UserAvatar.vue'
import OfflineConnectionIndicator from '~/components/layout/OfflineConnectionIndicator.vue'
import { useAuthStore } from '~/stores/auth'
import { hydrateUserSession } from '~/composables/useSession'
import { useOnlineStatus } from '~/composables/useOnlineStatus'
import { useLogout } from '~/composables/useLogout'
import { useRouter } from 'vue-router'
import { getAccessToken } from '~/utils/auth-storage'
import { formatWalletAmount } from '~/utils/wallet'
import { getRouteBreadcrumbs } from '~/constants/breadcrumbs'
import { scheduleScrollAppToTop } from '~/utils/scroll'

const SIDEBAR_BREAKPOINT = 1124
const router = useRouter()
const route = useRoute()
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const authStore = useAuthStore()
const { unreadCount } = authStore
const { isOffline } = useOnlineStatus()
const { isLoggingOut, executeLogout } = useLogout()

const mobileMenuOpen = ref(false)
const showLogoutModal = ref(false)

const headerDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return '—'

  const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
  return fullName || '—'
})

const walletBalance = computed(() => {
  const u = authStore.user
  if (!u) return '0'
  const raw = u.wallet?.balance ?? u.wallet_balance ?? 0
  return formatWalletAmount(raw)
})

const walletActive = computed(() => {
  const u = authStore.user
  if (!u) return false
  return Boolean(u.wallet?.is_active ?? u.wallet_is_active)
})

const breadcrumbs = computed(() => getRouteBreadcrumbs(route))

function toggleMobileMenu() {
  sidebarRef.value?.closeSidebar()
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function navigateFromMobileMenu(path: string) {
  closeMobileMenu()
  router.push(path)
}

function navigateFromDesktopMenu(path: string) {
  router.push(path)
}

function openLogoutFromMobileMenu() {
  closeMobileMenu()
  showLogoutModal.value = true
}

function openLogoutFromDesktopMenu() {
  showLogoutModal.value = true
}

async function confirmLogout() {
  await executeLogout()
  showLogoutModal.value = false
}

watch(
  () => route.fullPath,
  (to, from) => {
    closeMobileMenu()

    if (from && to !== from && !route.hash) {
      scheduleScrollAppToTop('smooth')
    }
  },
)

const syncSidebarWithViewport = () => {
  if (!sidebarRef.value) return

  if (window.innerWidth < SIDEBAR_BREAKPOINT) {
    sidebarRef.value.closeSidebar()
  } else {
    sidebarRef.value.openSidebar()
  }
}

onMounted(async () => {
  if (getAccessToken()) {
    await hydrateUserSession()
  }
  syncSidebarWithViewport()
  window.addEventListener('resize', syncSidebarWithViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', syncSidebarWithViewport)
})
</script>

<style scoped>
.layout-main {
  transition: margin 320ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
