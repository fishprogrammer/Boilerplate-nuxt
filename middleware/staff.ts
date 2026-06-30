export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  await auth.fetchCurrentUser()

  if (!auth.isStaff) {
    return navigateTo('/')
  }
})
