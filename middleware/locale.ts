export default defineNuxtRouteMiddleware((to) => {
  const locale = to.params.locale
  if (typeof locale !== 'string' || !isAppLocale(locale)) {
    return navigateTo('/fa/')
  }
})
