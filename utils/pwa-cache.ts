/** Workbox / app runtime caches that may serve stale SPA shells after deploy. */
const STALE_CACHE_PATTERN =
  /^(pages|workbox-precache|workbox-runtime|api-cache|images-cache|google-fonts-cache)/

export async function clearStaleAppCaches() {
  if (!('caches' in window)) return

  const names = await caches.keys()
  await Promise.all(
    names.filter((name) => STALE_CACHE_PATTERN.test(name)).map((name) => caches.delete(name)),
  )
}

export async function clearAllAppCaches() {
  if (!('caches' in window)) return

  const names = await caches.keys()
  await Promise.all(names.map((name) => caches.delete(name)))
}
