/**
 * Phase 0 — verify production API liveness (PHASE-0 FE-P0S0 / §7).
 * Usage: node scripts/verify-api-health.mjs
 * Env: API_HEALTH_URL (default https://api.store.a4j.ir/api/health/live/)
 */
const url = process.env.API_HEALTH_URL || 'https://api.store.a4j.ir/api/health/live/'

const response = await fetch(url, {
  headers: { Accept: 'application/json' },
})

if (!response.ok) {
  console.error(`[verify-api-health] ${url} → HTTP ${response.status}`)
  process.exit(1)
}

let body
try {
  body = await response.json()
} catch {
  console.error('[verify-api-health] Response is not JSON')
  process.exit(1)
}

const status = body?.status ?? body?.data?.status
if (status && status !== 'ok' && status !== 'success') {
  console.error('[verify-api-health] Unexpected payload:', JSON.stringify(body))
  process.exit(1)
}

console.log(`[verify-api-health] OK ${url}`)
