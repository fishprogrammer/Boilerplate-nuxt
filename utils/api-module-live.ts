const PRODUCTION_API_HOST = 'api.store.a4j.ir'

function usesProductionApi(apiBaseUrl: string): boolean {
  const base = apiBaseUrl.trim().toLowerCase()
  return base.includes(PRODUCTION_API_HOST)
}

/**
 * Resolves whether a storefront module should call the live API.
 * Explicit `true`/`false` from runtime config wins; otherwise production API URL implies live.
 */
export function isApiModuleLive(
  flagValue: string | boolean | undefined,
  apiBaseUrl: string,
): boolean {
  const flag = String(flagValue ?? '').trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return usesProductionApi(apiBaseUrl)
  return usesProductionApi(apiBaseUrl) || flag === ''
}
