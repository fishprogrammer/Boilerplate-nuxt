import { readonly, ref } from 'vue'
import {
  acknowledgeDeployedAppVersion,
  fetchDeployedAppVersion,
  getUpdatePromptShownVersion,
  markUpdatePromptShown,
  SW_UPDATE_PROMPT_KEY,
} from '~/utils/app-version'
import { clearStaleAppCaches } from '~/utils/pwa-cache'

const updateAvailable = ref(false)

let applyUpdateFn: ((reloadPage?: boolean) => void | Promise<void>) | null = null
let notifyInFlight = false

export function registerPwaUpdateHandler(apply: (reloadPage?: boolean) => void | Promise<void>) {
  applyUpdateFn = apply
}

export async function notifyPwaUpdateAvailable() {
  if (updateAvailable.value || notifyInFlight) return

  notifyInFlight = true
  try {
    const deployed = await fetchDeployedAppVersion()
    const promptKey = deployed ?? SW_UPDATE_PROMPT_KEY

    if (getUpdatePromptShownVersion() === promptKey) {
      return
    }

    markUpdatePromptShown(promptKey)
    updateAvailable.value = true
  } finally {
    notifyInFlight = false
  }
}

export function dismissPwaUpdate() {
  updateAvailable.value = false
}

export async function applyPwaUpdate() {
  if (!applyUpdateFn) return
  updateAvailable.value = false
  await acknowledgeDeployedAppVersion()
  await clearStaleAppCaches()
  await Promise.resolve(applyUpdateFn(true))
}

export function usePwaUpdate() {
  return {
    updateAvailable: readonly(updateAvailable),
    applyPwaUpdate,
    dismissPwaUpdate,
  }
}
