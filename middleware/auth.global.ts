export default defineNuxtRouteMiddleware(async (to) => {
  const isGuestPage = to.meta.guest === true
  const isStandalone = to.meta.standalone === true
  const isAuthenticated = await hasAuthenticatedSession()

  if (!isAuthenticated && !isGuestPage && !isStandalone) {
    return navigateTo('/login')
  }

  if (isAuthenticated && isGuestPage) {
    return navigateTo('/')
  }

  if (isAuthenticated && !isGuestPage && !isStandalone && typeof to.name === 'string') {
    const authStore = useAuthStore()
    await authStore.fetchCurrentUser()

    const allowed = canAccessRouteName(to.name, {
      permissions: authStore.userPermissions,
      isSuperuser: authStore.isSuperuser,
      isStaff: authStore.isStaff,
    })

    if (!allowed) {
      showToast({ message: 'دسترسی به این بخش مجاز نیست.', variant: 'error' })
      return navigateTo({ name: 'Index' })
    }
  }
})
