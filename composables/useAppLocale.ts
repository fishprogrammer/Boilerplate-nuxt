import { resolveLocaleFromPath } from '~/utils/locale-path'
import type { AppLocale } from '~/utils/locale'

export function useAppLocale(): ComputedRef<AppLocale> {
  const route = useRoute()

  return computed(() => {
    const param = route.params.locale
    const fromParam = Array.isArray(param) ? param[0] : param

    if (fromParam === 'en') {
      return 'en'
    }

    if (fromParam === 'fa') {
      return 'fa'
    }

    return resolveLocaleFromPath(route.path)
  })
}
