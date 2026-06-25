import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import { useAuthStore } from '~/stores/auth'
import {
  beginAuthSessionTransition,
  endAuthSessionTransition,
} from '~/utils/auth-session-transition'
import { clearAuthTokens, getRefreshToken } from '~/utils/auth-storage'

export function useLogout() {
  const router = useRouter()
  const authStore = useAuthStore()
  const isLoggingOut = ref(false)

  const clearAuthSession = () => {
    clearAuthTokens()
    authStore.clearUser()
  }

  const executeLogout = async () => {
    if (isLoggingOut.value) return

    isLoggingOut.value = true
    beginAuthSessionTransition()
    try {
      const refresh = getRefreshToken()
      if (refresh) {
        await authService.logout({ refresh })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuthSession()
      isLoggingOut.value = false
      await router.replace({ name: 'Login' })
      endAuthSessionTransition()
    }
  }

  return {
    isLoggingOut,
    executeLogout,
    clearAuthSession,
  }
}

