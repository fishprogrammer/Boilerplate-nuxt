import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { authService } from '~/api/services/auth.service'
import { isApiSuccess, parseMeResponse } from '~/api/utils/api-response'
import type { UpdateProfileRequest, UserProfile } from '~/api/types/auth.types'
import { STORAGE_KEYS } from '~/constants/storage'
import { normalizePermissions } from '~/utils/permissions'

const normalizeRoles = (roles: unknown): string[] => {
  if (!roles) return []
  if (typeof roles === 'string') return [roles]
  if (!Array.isArray(roles)) return []

  return roles
    .map((role) => {
      if (typeof role === 'string') return role
      if (role && typeof role === 'object') {
        const record = role as Record<string, unknown>
        if (typeof record.name === 'string') return record.name
        if (typeof record.role === 'string') return record.role
      }
      return String(role)
    })
    .filter(Boolean)
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  let fetchPromise: Promise<UserProfile | null> | null = null

  const isAuthenticated = computed(
    () => !!localStorage.getItem(STORAGE_KEYS.TOKEN) && !!user.value,
  )

  const displayName = computed(() => {
    const u = user.value
    if (!u) return ''
    const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
    return fullName || u.username || u.phone_number || 'کاربر'
  })

  const userEmail = computed(() => user.value?.email || '')
  const userPhone = computed(() => user.value?.phone_number || '')
  const userRoles = computed(() => normalizeRoles(user.value?.roles))
  const userPermissions = computed(() => normalizePermissions(user.value?.permissions))
  const isSuperuser = computed(() => user.value?.is_superuser === true)
  const isStaff = computed(() => user.value?.is_staff === true)

  const isAdmin = computed(() => {
    if (isSuperuser.value) return true
    const u = user.value
    if (!u) return false
    if (String(u.username).toLowerCase() === 'admin') return true
    return userRoles.value.some((role) => {
      const normalized = String(role).toLowerCase()
      return normalized === 'admin' || normalized === 'administrator'
    })
  })

  const userName = computed(() => displayName.value)

  const unreadCount = computed(() => {
    const u = user.value
    if (!u) return 0
    const topLevel = typeof u.unread_count === 'number' ? u.unread_count : undefined
    const inboxLevel =
      typeof u.inbox?.unread_count === 'number' ? u.inbox.unread_count : undefined
    return topLevel ?? inboxLevel ?? 0
  })

  function setUser(userData: UserProfile) {
    user.value = { ...userData }
  }

  function mergeUserProfile(current: UserProfile | null, patch: Partial<UserProfile>): UserProfile {
    return { ...(current ?? {}), ...patch } as UserProfile
  }

  function applyUserProfile(patch: Partial<UserProfile>): UserProfile {
    const normalizedPatch = { ...patch }
    if ('permissions' in normalizedPatch) {
      normalizedPatch.permissions = normalizePermissions(normalizedPatch.permissions)
    }

    const nextProfile = mergeUserProfile(user.value, normalizedPatch)
    user.value = { ...nextProfile }
    if (nextProfile.id !== undefined && nextProfile.id !== null) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, String(nextProfile.id))
    }
    return nextProfile
  }

  async function loadUserProfile(options?: {
    clearOnFailure?: boolean
  }): Promise<UserProfile | null> {
    const clearOnFailure = options?.clearOnFailure ?? true

    try {
      const response = await authService.getMe()
      const profile = parseMeResponse(response)
      if (profile) {
        applyUserProfile(profile)
        return user.value
      }
      if (clearOnFailure) clearUser()
      return null
    } catch {
      if (clearOnFailure) clearUser()
      return null
    }
  }

  function clearUser() {
    user.value = null
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  async function fetchCurrentUser(force = false): Promise<UserProfile | null> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (!token) {
      clearUser()
      return null
    }

    if (!force && user.value) {
      return user.value
    }

    if (fetchPromise && !force) {
      return fetchPromise
    }

    fetchPromise = (async (): Promise<UserProfile | null> => {
      setLoading(true)
      try {
        return await loadUserProfile()
      } finally {
        setLoading(false)
        fetchPromise = null
      }
    })()

    return fetchPromise
  }

  function normalizeApiError(err: unknown, fallback: string): Error {
    const axiosErr = err as { response?: { data?: Record<string, unknown> }; message?: string }
    const data = axiosErr.response?.data
    const message =
      (typeof data?.message === 'string' && data.message) || axiosErr.message || fallback
    const apiError = new Error(message) as Error & { code?: string; errors?: unknown }
    if (typeof data?.code === 'string') apiError.code = data.code
    if (data?.errors !== undefined) apiError.errors = data.errors
    return apiError
  }

  async function updateCurrentUser(payload: UpdateProfileRequest): Promise<UserProfile> {
    setLoading(true)
    try {
      const response = await authService.updateMe(payload)
      if (!isApiSuccess(response)) {
        const root = (response && typeof response === 'object' ? response : {}) as Record<
          string,
          unknown
        >
        throw Object.assign(
          new Error(
            typeof root.message === 'string' ? root.message : 'به‌روزرسانی پروفایل ناموفق بود',
          ),
          { errors: root.errors, code: root.code },
        )
      }

      const updatedFromResponse = parseMeResponse(response)
      let nextProfile = applyUserProfile(updatedFromResponse ?? payload)

      fetchPromise = null
      const refreshed = await loadUserProfile({ clearOnFailure: false })
      if (refreshed) {
        nextProfile = refreshed
      }

      return nextProfile
    } catch (err) {
      throw normalizeApiError(err, 'به‌روزرسانی پروفایل ناموفق بود')
    } finally {
      setLoading(false)
    }
  }

  function decrementUnreadCount() {
    const u = user.value
    if (!u) return

    const current = unreadCount.value
    if (current <= 0) return

    const next = current - 1

    if (u.inbox && typeof u.inbox === 'object') {
      applyUserProfile({ inbox: { ...u.inbox, unread_count: next } })
      return
    }

    if (typeof u.unread_count === 'number') {
      applyUserProfile({ unread_count: next })
    }
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    isAuthenticated,
    displayName,
    userName,
    userEmail,
    userPhone,
    userRoles,
    userPermissions,
    isSuperuser,
    isStaff,
    isAdmin,
    setUser,
    clearUser,
    setLoading,
    unreadCount,
    decrementUnreadCount,
    fetchCurrentUser,
    updateCurrentUser,
  }
})
