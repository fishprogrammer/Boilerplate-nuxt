import { readonly, ref } from 'vue'
import { appConfig } from '~/config/app'

const PWA_INSTALL_DISMISSED_KEY = `${appConfig.storagePrefix}-pwa-install-dismissed`

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const canInstall = ref(false)
let deferredPrompt: BeforeInstallPromptEvent | null = null
let listenersInitialized = false

export function isPwaInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isInstallDismissed(): boolean {
  return localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === '1'
}

function updateCanInstall(): void {
  canInstall.value = !!deferredPrompt && !isPwaInstalled() && !isInstallDismissed()
}

function handleBeforeInstallPrompt(event: Event): void {
  if (isPwaInstalled() || isInstallDismissed()) return
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
  updateCanInstall()
}

function handleAppInstalled(): void {
  deferredPrompt = null
  canInstall.value = false
  localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1')
}

/** Register early so beforeinstallprompt is not missed (dynamic pwa.ts import is too late). */
export function initPwaInstallListener(): void {
  if (listenersInitialized || !import.meta.env.PROD) return
  listenersInitialized = true

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  updateCanInstall()
}

export function dismissInstallPrompt(): void {
  localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1')
  canInstall.value = false
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false

  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  canInstall.value = false

  if (outcome === 'accepted') {
    localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1')
  }

  return outcome === 'accepted'
}

export function usePwaInstall() {
  return {
    canInstall: readonly(canInstall),
    dismissInstallPrompt,
    promptInstall,
    isPwaInstalled,
  }
}

