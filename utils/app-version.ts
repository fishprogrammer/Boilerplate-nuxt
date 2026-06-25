import { appConfig } from '~/config/app'

const VERSION_STORAGE_KEY = `${appConfig.storagePrefix}-app-version`
const UPDATE_PROMPT_SHOWN_KEY = `${appConfig.storagePrefix}-update-prompt-shown`

/** Fallback when version.json is unavailable but a waiting service worker exists. */
export const SW_UPDATE_PROMPT_KEY = '__sw_update__'

type VersionPayload = {
  version?: string
}

export async function fetchDeployedAppVersion(): Promise<string | null> {
  try {
    const response = await fetch(`/version.json?ts=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
    if (!response.ok) return null

    const data = (await response.json()) as VersionPayload
    return typeof data.version === 'string' && data.version.trim() ? data.version.trim() : null
  } catch {
    return null
  }
}

export function getStoredAppVersion(): string | null {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredAppVersion(version: string) {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, version)
  } catch {
    // ignore quota / private mode
  }
}

/** First visit: store current version without prompting. */
export async function syncStoredAppVersionIfNeeded() {
  const deployed = await fetchDeployedAppVersion()
  if (!deployed) return

  if (!getStoredAppVersion()) {
    setStoredAppVersion(deployed)
  }
}

/** True when server version.json differs from the version stored on this device. */
export async function checkDeployedAppVersionUpdate(): Promise<boolean> {
  const deployed = await fetchDeployedAppVersion()
  if (!deployed) return false

  const stored = getStoredAppVersion()
  if (!stored) {
    setStoredAppVersion(deployed)
    return false
  }

  return stored !== deployed
}

/** Call before reload so the banner does not reappear on the new build. */
export async function acknowledgeDeployedAppVersion() {
  const deployed = await fetchDeployedAppVersion()
  if (deployed) {
    setStoredAppVersion(deployed)
  }
  clearUpdatePromptShown()
}

export function getUpdatePromptShownVersion(): string | null {
  try {
    return localStorage.getItem(UPDATE_PROMPT_SHOWN_KEY)
  } catch {
    return null
  }
}

export function markUpdatePromptShown(version: string) {
  try {
    localStorage.setItem(UPDATE_PROMPT_SHOWN_KEY, version)
  } catch {
    // ignore quota / private mode
  }
}

export function clearUpdatePromptShown() {
  try {
    localStorage.removeItem(UPDATE_PROMPT_SHOWN_KEY)
  } catch {
    // ignore
  }
}
