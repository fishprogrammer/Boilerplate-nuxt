import { apiPath } from '~/utils/api-url'
import { getAccessToken } from '~/utils/auth-storage'

export type ProtectedMediaAuthScheme = 'Bearer' | 'GuestTicket'

export interface ProtectedMediaAuth {
  scheme: ProtectedMediaAuthScheme
  token: string
}

function resolveProtectedMediaUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return apiPath(trimmed)
}

/** API file/preview endpoints need Authorization; static /media/uploads/ URLs do not. */
export function requiresProtectedMediaFetch(url: string): boolean {
  const resolved = resolveProtectedMediaUrl(url)
  if (!resolved) return false

  try {
    const pathname = new URL(resolved).pathname
    return /\/api\/media\/[^/]+\/(file|preview)\/?$/i.test(pathname)
  } catch {
    return /\/api\/media\/[^/]+\/(file|preview)\/?/i.test(resolved)
  }
}

export async function fetchProtectedMediaBlob(
  url: string,
  auth: ProtectedMediaAuth,
): Promise<Blob> {
  const resolved = resolveProtectedMediaUrl(url)
  if (!resolved) throw new Error('media_url_missing')

  const response = await fetch(resolved, {
    headers: {
      Authorization: `${auth.scheme} ${auth.token}`,
    },
  })

  if (!response.ok) throw new Error('media_access_denied')
  return response.blob()
}

export async function createProtectedMediaObjectUrl(
  url: string,
  auth: ProtectedMediaAuth,
): Promise<string> {
  const blob = await fetchProtectedMediaBlob(url, auth)
  return URL.createObjectURL(blob)
}

export async function openProtectedMedia(
  url: string,
  auth: ProtectedMediaAuth,
): Promise<void> {
  const objectUrl = await createProtectedMediaObjectUrl(url, auth)
  window.open(objectUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}

export function getBearerMediaAuth(): ProtectedMediaAuth | null {
  const token = getAccessToken()
  if (!token) return null
  return { scheme: 'Bearer', token }
}

export function getGuestTicketMediaAuth(token: string): ProtectedMediaAuth | null {
  const trimmed = token.trim()
  if (!trimmed) return null
  return { scheme: 'GuestTicket', token: trimmed }
}
