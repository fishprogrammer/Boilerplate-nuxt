/** Decode JWT payload (no signature verification — client-side expiry hint only). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

/** True when JWT `exp` is in the past (with optional leeway). Non-JWT tokens return false. */
export function isAccessTokenExpired(token: string, leewaySeconds = 30): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return false
  return Date.now() >= (payload.exp - leewaySeconds) * 1000
}

