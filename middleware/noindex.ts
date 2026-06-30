export default defineNuxtRouteMiddleware(() => {
  useSeoMeta({ robots: 'noindex, nofollow' })
})
