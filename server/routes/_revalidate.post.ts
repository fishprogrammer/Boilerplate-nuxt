export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization') || ''
  const bearerSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const query = getQuery(event)
  const querySecret = String(query.secret || '')

  const secret = bearerSecret || querySecret
  if (!secret || secret !== config.revalidateSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid revalidate secret' })
  }

  let paths: string[] = []
  const queryPath = String(query.path || '')
  if (queryPath.startsWith('/')) {
    paths = [queryPath]
  }

  try {
    const body = await readBody<{ paths?: string[] }>(event)
    if (Array.isArray(body?.paths) && body.paths.length) {
      paths = body.paths.filter((p) => typeof p === 'string' && p.startsWith('/'))
    }
  } catch {
    // empty body is ok when path query param is used
  }

  if (!paths.length) {
    throw createError({ statusCode: 400, statusMessage: 'paths array or path query required' })
  }

  return {
    revalidated: true,
    paths,
    at: new Date().toISOString(),
  }
})
