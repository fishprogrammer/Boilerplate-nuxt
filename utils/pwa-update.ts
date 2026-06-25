const MIN_UPDATE_INTERVAL_MS = 30_000

let lastUpdateCheckAt = 0
let swRegistration: ServiceWorkerRegistration | null = null

export function setSwRegistration(registration: ServiceWorkerRegistration) {
  swRegistration = registration
}

/** Ask the browser to check sw.js for a new service worker version. */
export function checkForAppUpdate(force = false) {
  if (!('serviceWorker' in navigator)) return

  const now = Date.now()
  if (!force && now - lastUpdateCheckAt < MIN_UPDATE_INTERVAL_MS) return
  lastUpdateCheckAt = now

  if (swRegistration) {
    void swRegistration.update().catch(() => {})
    return
  }

  void navigator.serviceWorker.ready
    .then((registration) => {
      swRegistration = registration
      return registration.update()
    })
    .catch(() => {})
}

export function bindAppUpdateTriggers() {
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
export function bindControllerChangeReload() {
  if (!('serviceWorker' in navigator)) return

  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

