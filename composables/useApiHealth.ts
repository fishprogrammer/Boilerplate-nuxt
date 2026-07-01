import { healthService } from '~/api/services/health.service'
import { parseLivenessProbeResponse } from '~/api/utils/health-response'

export interface ApiLiveHealthResult {
  ok: boolean
  httpStatus: number
  code: string
  message: string
}

/** GET /api/health/live/ — Phase 0 baseline check (PHASE-0 §7). */
export async function checkApiLiveHealth(): Promise<ApiLiveHealthResult> {
  const { response, httpStatus } = await healthService.getLiveHealth()
  const parsed = parseLivenessProbeResponse(response, httpStatus)

  return {
    ok: httpStatus === 200 && (parsed?.isHealthy ?? false),
    httpStatus,
    code: parsed?.code ?? '',
    message: parsed?.data ?? parsed?.message ?? (httpStatus === 200 ? 'ok' : 'unavailable'),
  }
}

export function useApiHealth() {
  const lastLiveCheck = useState<ApiLiveHealthResult | null>('api-live-health', () => null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function verifyLiveHealth(force = false): Promise<ApiLiveHealthResult> {
    if (!force && lastLiveCheck.value?.ok) {
      return lastLiveCheck.value
    }

    pending.value = true
    error.value = null

    try {
      const result = await checkApiLiveHealth()
      lastLiveCheck.value = result
      if (!result.ok) {
        error.value = `API liveness failed (${result.httpStatus})`
      }
      return result
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Health check failed'
      const failed: ApiLiveHealthResult = {
        ok: false,
        httpStatus: 0,
        code: 'health_check_failed',
        message: error.value,
      }
      lastLiveCheck.value = failed
      return failed
    } finally {
      pending.value = false
    }
  }

  return {
    lastLiveCheck,
    pending,
    error,
    verifyLiveHealth,
  }
}
