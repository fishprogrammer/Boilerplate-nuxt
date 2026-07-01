import { registerSW } from 'virtual:pwa-register'
import { showToast } from '~/composables/useToast'
import { notifyPwaUpdateAvailable, registerPwaUpdateHandler } from '~/composables/usePwaUpdate'
import { syncWhenOnline } from '~/utils/backgroundSync'
import {
  bindAppUpdateTriggers,
  bindControllerChangeReload,
  checkForAppUpdate,
  setSwRegistration,
  setWaitingWorkerHandler,
} from '~/utils/pwa-update'
import { clearStaleAppCaches } from '~/utils/pwa-cache'

const UPDATE_CHECK_INTERVAL_MS = 3 * 60 * 1000

function handleWaitingWorker() {
  void notifyPwaUpdateAvailable()
}

function watchRegistrationForWaitingWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    handleWaitingWorker()
  }

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing
    if (!installing) return

    installing.addEventListener('statechange', () => {
      if (installing.state !== 'installed') return
      if (!navigator.serviceWorker.controller) return
      handleWaitingWorker()
    })
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.env.PROD) return

  bindControllerChangeReload(async () => {
    await clearStaleAppCaches()
  })
  bindAppUpdateTriggers()
  setWaitingWorkerHandler(handleWaitingWorker)

  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      showToast({ message: 'اپلیکیشن آفلاین آماده است.', variant: 'info' })
    },
    onNeedRefresh() {
      handleWaitingWorker()
    },
    onRegisteredSW(_swScriptUrl, registration) {
      if (!registration) return

      setSwRegistration(registration)
      watchRegistrationForWaitingWorker(registration)
      checkForAppUpdate(true)

      setInterval(() => {
        checkForAppUpdate()
      }, UPDATE_CHECK_INTERVAL_MS)
    },
    onRegisterError() {
      // SW registration failed silently
    },
  })

  registerPwaUpdateHandler(updateSW)

  window.addEventListener('online', () => {
    checkForAppUpdate(true)
    void syncWhenOnline()
  })

  nuxtApp.hook('page:finish', () => {
    checkForAppUpdate()
  })
})
