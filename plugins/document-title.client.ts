import { appConfig } from '~/config/app'

export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.afterEach((to) => {
    const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : null
    document.title = pageTitle ? `${pageTitle} | ${appConfig.name}` : appConfig.title
  })
})
