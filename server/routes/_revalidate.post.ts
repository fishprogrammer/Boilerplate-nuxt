export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const secret = String(query.secret || '')
  const path = String(query.path || '')

  if (!secret || secret !== config.revalidateSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid revalidate secret' })
  }

  if (!path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: 'path must start with /' })
  }

  // Hook for on-demand ISR when SSR/ISR hosting is enabled.
  return {
    revalidated: true,
    path,
    at: new Date().toISOString(),
  }
})
