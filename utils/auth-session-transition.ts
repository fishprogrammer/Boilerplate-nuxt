let sessionTransitionActive = false
let sessionTransitionEndTimer: ReturnType<typeof setTimeout> | null = null

/** Suppress auth redirects / global network toasts while logging out or navigating to login. */
export function beginAuthSessionTransition() {
  if (sessionTransitionEndTimer) {
    clearTimeout(sessionTransitionEndTimer)
    sessionTransitionEndTimer = null
  }
  sessionTransitionActive = true
}

export function endAuthSessionTransition(delayMs = 1000) {
  if (sessionTransitionEndTimer) clearTimeout(sessionTransitionEndTimer)
  sessionTransitionEndTimer = setTimeout(() => {
    sessionTransitionActive = false
    sessionTransitionEndTimer = null
  }, delayMs)
}

export function isAuthSessionTransitioning(): boolean {
  return sessionTransitionActive
}

