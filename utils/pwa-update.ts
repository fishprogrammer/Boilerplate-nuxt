import {
  checkDeployedAppVersionUpdate,
  syncStoredAppVersionIfNeeded,
} from '~/utils/app-version'

const MIN_UPDATE_INTERVAL_MS = 10_000

let lastUpdateCheckAt = 0
let swRegistration: ServiceWorkerRegistration | null = null
let waitingWorkerHandler: (() => void) | null = null

export function setSwRegistration(registration: ServiceWorkerRegistration) {
  swRegistration = registration
}

export function setWaitingWorkerHandler(handler: () => void) {
  waitingWorkerHandler = handler
}

function notifyIfWaitingWorker(registration: ServiceWorkerRegistration | null | undefined) {
  if (registration?.waiting) {
    waitingWorkerHandler?.()
  }
}

async function notifyIfDeployedVersionChanged() {
  const hasUpdate = await checkDeployedAppVersionUpdate()
  if (hasUpdate) {
    waitingWorkerHandler?.()
  }
}

/** Ask the browser to check sw.js for a new service worker version. */
export function checkForAppUpdate(force = false) {
  if (!('serviceWorker' in navigator)) return

  const now = Date.now()
  if (!force && now - lastUpdateCheckAt < MIN_UPDATE_INTERVAL_MS) return
  lastUpdateCheckAt = now

  void notifyIfDeployedVersionChanged()

  if (swRegistration) {
    void swRegistration
      .update()
      .then(() => notifyIfWaitingWorker(swRegistration))
      .catch(() => {})
    return
  }

  void navigator.serviceWorker.ready
    .then((registration) => {
      swRegistration = registration
      return registration.update().then(() => notifyIfWaitingWorker(registration))
    })
    .catch(() => {})
}

export function bindAppUpdateTriggers() {
  void syncStoredAppVersionIfNeeded()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForAppUpdate()
    }
  })

  window.addEventListener('focus', () => {
    checkForAppUpdate()
  })

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      checkForAppUpdate(true)
    }
  })
}

/** Reload once when a waiting worker activates (skipWaiting + clientsClaim). */
export function bindControllerChangeReload(beforeReload?: () => void | Promise<void>) {
  if (!('serviceWorker' in navigator)) return

  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    void Promise.resolve(beforeReload?.()).finally(() => {
      window.location.reload()
    })
  })
}
