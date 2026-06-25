import { ref, readonly } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '~/api/services/auth.service'
import { isApiSuccess, parseUserDetailResponse } from '~/api/utils/api-response'
import type { UpdateUserRequest, UserFormState, UserProfile } from '~/api/types/auth.types'
import { birthDateToPickerValue } from '~/utils/date'

function cacheKey(id: string | number): string {
  return String(id)
}

function deriveAccessFlags(profile: UserProfile) {
  const roles = (profile.roles || []).map((role) => String(role).toLowerCase())

  return {
    is_active: profile.is_active ?? profile.wallet?.is_active ?? true,
    is_staff: profile.is_staff ?? roles.some((role) => role === 'staff'),
    is_superuser:
      profile.is_superuser ??
      roles.some(
        (role) => role === 'admin' || role === 'administrator' || role === 'superuser',
      ),
  }
}

export const useUsersStore = defineStore('users', () => {
  const usersById = ref<Record<string, UserProfile>>({})

  function setUserInStore(profile: UserProfile) {
    usersById.value = {
      ...usersById.value,
      [cacheKey(profile.id)]: { ...profile },
    }
  }

  function getUserFromStore(id: string | number): UserProfile | null {
    return usersById.value[cacheKey(id)] ?? null
  }

  function profileToForm(profile: UserProfile): UserFormState {
    const access = deriveAccessFlags(profile)

    return {
      username: profile.username ?? '',
      email: profile.email ?? '',
      password: '',
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone_number: profile.phone_number ?? '',
      national_id: profile.national_id ?? '',
      birth_date: birthDateToPickerValue(profile.birth_date),
      gender: profile.gender === 'male' || profile.gender === 'female' ? profile.gender : '',
      is_active: access.is_active,
      is_staff: access.is_staff,
      is_superuser: access.is_superuser,
    }
  }

  async function fetchUserById(id: string | number, force = false): Promise<UserProfile | null> {
    const key = cacheKey(id)
    if (!force && usersById.value[key]) {
      return usersById.value[key]
    }

    const response = await authService.getUser(id)
    const parsed = parseUserDetailResponse(response)
    if (parsed) setUserInStore(parsed)
    return parsed
  }

  async function updateUserById(
    id: string | number,
    payload: UpdateUserRequest,
  ): Promise<UserProfile> {
    const response = await authService.updateUser(id, payload)

    if (!isApiSuccess(response)) {
      const root = (response && typeof response === 'object' ? response : {}) as Record<
        string,
        unknown
      >
      throw Object.assign(
        new Error(typeof root.message === 'string' ? root.message : 'به‌روزرسانی کاربر ناموفق بود'),
        { errors: root.errors, code: root.code },
      )
    }

    const updated = parseUserDetailResponse(response)
    if (updated) setUserInStore(updated)

    const refreshed = await fetchUserById(id, true)
    if (refreshed) return refreshed
    if (updated) return updated

    throw new Error('به‌روزرسانی کاربر ناموفق بود')
  }

  return {
    usersById: readonly(usersById),
    getUserFromStore,
    setUserInStore,
    profileToForm,
    fetchUserById,
    updateUserById,
  }
})
