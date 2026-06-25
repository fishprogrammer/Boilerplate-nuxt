import { registerSW } from 'virtual:pwa-register'
import { showToast } from '~/composables/useToast'
import { syncWhenOnline } from '~/utils/backgroundSync'
import {
  bindAppUpdateTriggers,
  bindControllerChangeReload,
  checkForAppUpdate,
  setSwRegistration,
} from '~/utils/pwa-update'

export default defineNuxtPlugin(() => {
  if (!import.meta.env.PROD) return

  bindControllerChangeReload()
  bindAppUpdateTriggers()

  const updateSW = registerSW({
    onOfflineReady() {
      showToast({ message: 'اپلیکیشن آفلاین آماده است.', variant: 'info' })
    },
    onNeedRefresh() {
      showToast({
        message: 'نسخه جدید دریافت شد. در حال بروزرسانی...',
        variant: 'info',
        duration: 3000,
      })
      updateSW(true)
    },
    onRegisteredSW(_swScriptUrl, registration) {
      if (!registration) return

      setSwRegistration(registration)
      checkForAppUpdate(true)

      setInterval(() => {
        checkForAppUpdate()
      }, 15 * 60 * 1000)
    },
    onRegisterError() {
      // SW registration failed silently
    },
  })

  window.addEventListener('online', () => {
    checkForAppUpdate(true)
    void syncWhenOnline()
  })
})
