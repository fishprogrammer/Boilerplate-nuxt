import { computed, ref, watch } from 'vue'
import { appConfig } from '~/config/app'
import { STORAGE_KEYS } from '~/constants/storage'

const STORAGE_KEY = STORAGE_KEYS.THEME
const LIGHT_THEME_COLOR = appConfig.themeColor
const DARK_THEME_COLOR = '#18191a'

const isDark = ref(false)
let initialized = false
let watchRegistered = false
let lifecycleBound = false

function updateThemeMeta(dark: boolean) {
  const themeColor = dark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR

  const themeMeta = document.querySelector('meta[name="theme-color"]')
  themeMeta?.setAttribute('content', themeColor)

  const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  appleStatusBar?.setAttribute('content', dark ? 'black-translucent' : 'default')
}

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'

  if (document.body) {
    document.body.classList.toggle('dark', dark)
    document.body.style.colorScheme = dark ? 'dark' : 'light'
  }

  updateThemeMeta(dark)
}

function persistTheme(dark: boolean) {
  applyTheme(dark)
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

function readStoredDark(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'dark'
}

function registerThemeWatch() {
  if (watchRegistered) return
  watchRegistered = true

  watch(
    isDark,
    (dark) => {
      persistTheme(dark)
    },
    { flush: 'sync' },
  )
}

function bindThemeLifecycle() {
  if (lifecycleBound || typeof document === 'undefined') return
  lifecycleBound = true

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && initialized) {
      applyTheme(isDark.value)
    }
  })

  window.addEventListener('pageshow', (event) => {
    if ((event as PageTransitionEvent).persisted && initialized) {
      applyTheme(isDark.value)
    }
  })
}

/** Call once before app mount (also mirrored in index.html to avoid flash). */
export function initTheme() {
  if (initialized || typeof document === 'undefined') return

  isDark.value = readStoredDark()
  applyTheme(isDark.value)
  registerThemeWatch()
  bindThemeLifecycle()
  initialized = true
}

export function useTheme() {
  if (!initialized) {
    initTheme()
  } else if (!watchRegistered) {
    registerThemeWatch()
  }

  return {
    isDark: computed({
      get: () => isDark.value,
      set: (dark: boolean) => {
        isDark.value = dark
      },
    }),
    toggleTheme: () => {
      isDark.value = !isDark.value
    },
    setTheme: (dark: boolean) => {
      isDark.value = dark
    },
  }
}

