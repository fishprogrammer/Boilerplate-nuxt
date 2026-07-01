import { stripLocalePrefix } from '~/utils/locale-path'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/fa' || to.path === '/fa/') {
    return navigateTo('/', { redirectCode: 301 })
  }

  if (to.path.startsWith('/fa/')) {
    const target = stripLocalePrefix(to.path)
    return navigateTo({ path: target, query: to.query, hash: to.hash }, { redirectCode: 301 })
  }
})
