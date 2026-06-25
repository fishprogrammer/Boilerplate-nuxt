<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 dark:border-border/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">سلامت سایت</h1>
          <p class="mt-1 text-sm text-text-secondary">
            بررسی زیرساخت، Redis، Celery و پنل دیباگ ادمین
          </p>
        </div>
        <button
          type="button"
          class="btn-muted-sm gap-1.5"
          :disabled="isRefreshing"
          @click="refreshAll"
        >
          <svg
            class="size-4 shrink-0"
            :class="isRefreshing ? 'animate-spin' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          بروزرسانی
        </button>
      </div>

      <div class="space-y-5">
        <section class="overflow-hidden rounded-xl border border-border bg-surface dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]">
          <header class="flex flex-col gap-3 border-b border-border bg-surface-muted px-4 py-3 dark:bg-surface-hover/55 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20">
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-text-primary">بررسی کامل سلامت</h2>
                <p class="text-xs text-text-secondary">GET /api/health/</p>
              </div>
            </div>
            <span
              v-if="fullHealth && !fullLoading"
              class="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="overallHealthBadgeClass(fullHealth.isHealthy, fullHealth.isDegraded)"
            >
              {{ overallHealthLabel(fullHealth.isHealthy, fullHealth.isDegraded) }}
            </span>
          </header>

          <div class="relative p-4">
            <div
              v-if="fullLoading && fullHealth"
              class="absolute inset-0 z-10 overflow-hidden rounded-b-xl bg-surface/80 p-4 backdrop-blur-[1px]"
            >
              <SystemHealthSectionSkeleton variant="full" />
            </div>

            <SystemHealthSectionSkeleton v-if="fullLoading && !fullHealth" variant="full" />

            <div
              v-else-if="fullError"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {{ fullError }}
            </div>

            <div v-else-if="fullHealth" class="space-y-4">
              <div
                class="rounded-xl border px-4 py-3"
                :class="healthPanelClass(fullHealth.isHealthy, fullHealth.isDegraded)"
              >
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm font-semibold" :class="healthTextClass(fullHealth.isHealthy, fullHealth.isDegraded)">
                      {{ fullHealth.message || overallHealthLabel(fullHealth.isHealthy, fullHealth.isDegraded) }}
                    </p>
                    <p class="mt-1 text-xs text-text-secondary">
                      وضعیت کلی: {{ formatHealthStatus(fullHealth.health.status) }}
                    </p>
                  </div>
                  <div class="text-xs text-text-secondary">
                    <p>کد HTTP: {{ formatHttpStatus(fullHealth.httpStatus) }}</p>
                    <p v-if="fullCheckedAt" class="mt-1">آخرین بررسی: {{ fullCheckedAt }}</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <article class="rounded-xl border border-border bg-surface-muted/50 p-4 dark:bg-surface-hover/45">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-text-primary">{{ formatHealthCheckLabel('database') }}</h3>
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="checkStatusClass(fullHealth.health.checks.database.status)">
                      {{ formatHealthStatus(fullHealth.health.checks.database.status) }}
                    </span>
                  </div>
                  <dl class="space-y-1 text-xs text-text-secondary">
                    <div class="flex justify-between gap-2">
                      <dt>موتور</dt>
                      <dd class="dir-ltr text-text-primary">{{ fullHealth.health.checks.database.engine || '—' }}</dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt>هاست</dt>
                      <dd class="dir-ltr text-text-primary">{{ fullHealth.health.checks.database.host || '—' }}</dd>
                    </div>
                    <div class="flex justify-between gap-2">
                      <dt>تأخیر</dt>
                      <dd class="dir-ltr text-text-primary">{{ formatLatencyMs(fullHealth.health.checks.database.latency_ms) }}</dd>
                    </div>
                  </dl>
                </article>

                <article v-if="fullHealth.health.checks.cache" class="rounded-xl border border-border bg-surface-muted/50 p-4 dark:bg-surface-hover/45">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-text-primary">{{ formatHealthCheckLabel('cache') }}</h3>
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="checkStatusClass(fullHealth.health.checks.cache.status)">
                      {{ formatHealthStatus(fullHealth.health.checks.cache.status) }}
                    </span>
                  </div>
                  <p class="text-xs text-text-secondary">backend</p>
                  <p class="mt-1 text-sm font-semibold text-text-primary dir-ltr text-right">
                    {{ fullHealth.health.checks.cache.backend || '—' }}
                  </p>
                </article>

                <article v-if="fullHealth.health.checks.redis" class="rounded-xl border border-border bg-surface-muted/50 p-4 dark:bg-surface-hover/45">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-text-primary">{{ formatHealthCheckLabel('redis') }}</h3>
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="checkStatusClass(fullHealth.health.checks.redis.status)">
                      {{ formatHealthStatus(fullHealth.health.checks.redis.status) }}
                    </span>
                  </div>
                  <dl class="space-y-1 text-xs text-text-secondary">
                    <div class="flex justify-between gap-2">
                      <dt>تأخیر</dt>
                      <dd class="dir-ltr text-text-primary">{{ formatLatencyMs(fullHealth.health.checks.redis.latency_ms) }}</dd>
                    </div>
                    <div>
                      <dt class="mb-1">URL</dt>
                      <dd class="break-all dir-ltr text-left text-text-primary">{{ fullHealth.health.checks.redis.url || '—' }}</dd>
                    </div>
                  </dl>
                </article>

                <article v-if="fullHealth.health.checks.celery" class="rounded-xl border border-border bg-surface-muted/50 p-4 md:col-span-2 dark:bg-surface-hover/45">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-text-primary">Celery worker</h3>
                    <span
                      class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="checkStatusClass(isCeleryHealthy(fullHealth.health.checks.celery) ? 'ok' : fullHealth.health.checks.celery.status)"
                    >
                      {{ isCeleryHealthy(fullHealth.health.checks.celery) ? 'فعال' : formatHealthStatus(fullHealth.health.checks.celery.status) }}
                    </span>
                  </div>
                  <p class="text-xs text-text-secondary">
                    worker_count: {{ fullHealth.health.checks.celery.worker_count ?? 0 }}
                    <span v-if="fullHealth.health.checks.celery.task_always_eager"> · eager mode</span>
                  </p>
                  <p v-if="fullHealth.health.checks.celery.workers?.length" class="mt-2 text-xs dir-ltr text-right text-text-primary">
                    {{ fullHealth.health.checks.celery.workers.join(', ') }}
                  </p>
                  <div v-if="fullHealth.health.checks.celery.scheduled_jobs?.length" class="mt-3 border-t border-border/50 pt-3">
                    <p class="mb-2 text-xs font-semibold text-text-primary">Celery beat</p>
                    <ul class="space-y-1 text-xs text-text-secondary">
                      <li v-for="job in fullHealth.health.checks.celery.scheduled_jobs" :key="job.name" class="dir-ltr text-right">
                        {{ job.name }} → {{ job.task }}
                      </li>
                    </ul>
                  </div>
                </article>
              </div>

              <article v-if="fullHealth.health.info" class="rounded-xl border border-border bg-surface-muted/30 p-4 dark:bg-surface-hover/30">
                <h3 class="mb-2 text-sm font-semibold text-text-primary">اطلاعات سرور</h3>
                <dl class="grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2">
                  <div><dt class="inline">Django:</dt> <dd class="inline dir-ltr text-text-primary">{{ fullHealth.health.info.django_version || '—' }}</dd></div>
                  <div><dt class="inline">DEBUG:</dt> <dd class="inline text-text-primary">{{ fullHealth.health.info.debug ? 'روشن' : 'خاموش' }}</dd></div>
                  <div><dt class="inline">DB engine:</dt> <dd class="inline dir-ltr text-text-primary">{{ fullHealth.health.info.database_engine || '—' }}</dd></div>
                  <div><dt class="inline">زبان:</dt> <dd class="inline dir-ltr text-text-primary">{{ fullHealth.health.info.language_code || '—' }}</dd></div>
                </dl>
              </article>
            </div>
          </div>
        </section>

        <section
          v-if="isSuperuser"
          class="overflow-hidden rounded-xl border border-border bg-surface dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"
        >
          <header class="flex flex-col gap-3 border-b border-border bg-surface-muted px-4 py-3 dark:bg-surface-hover/55 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-sm font-semibold text-text-primary">پنل دیباگ ادمین</h2>
              <p class="text-xs text-text-secondary">GET /api/system/diagnostics/</p>
            </div>
            <label class="flex items-center gap-2 text-xs text-text-secondary">
              <input v-model="includeLogs" type="checkbox" class="size-4 rounded border-border" @change="fetchDiagnostics" />
              بارگذاری لاگ سرور (?logs=1)
            </label>
          </header>

          <div class="p-4">
            <div v-if="diagLoading" class="py-8 text-center text-sm text-text-muted">در حال بارگذاری diagnostics...</div>
            <div
              v-else-if="diagError"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {{ diagError }}
            </div>
            <div v-else-if="diagnostics" class="space-y-4">
              <div
                v-if="diagnostics.data.debug_panel.debug_mode"
                class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200"
              >
                <strong>هشدار:</strong> DEBUG روی سرور روشن است — در production ممنوع.
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <article class="rounded-xl border border-border p-4">
                  <h3 class="text-sm font-semibold text-text-primary">SMS OTP</h3>
                  <p class="mt-2 text-xs" :class="diagnostics.data.sms.ready_for_otp ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'">
                    {{ diagnostics.data.sms.ready_for_otp ? 'آماده ارسال OTP' : 'SMS پیکربندی نشده' }}
                  </p>
                </article>
                <article class="rounded-xl border border-border p-4">
                  <h3 class="text-sm font-semibold text-text-primary">DEBUG</h3>
                  <p class="mt-2 text-xs text-text-secondary">
                    {{ diagnostics.data.info.debug ? 'فعال' : 'غیرفعال' }}
                  </p>
                </article>
                <article class="rounded-xl border border-border p-4">
                  <h3 class="text-sm font-semibold text-text-primary">debug_code در OTP</h3>
                  <p class="mt-2 text-xs text-text-secondary">
                    {{ diagnostics.data.debug_panel.otp_debug_code_in_responses ? 'نمایش در UI مجاز' : 'مخفی' }}
                  </p>
                </article>
              </div>

              <article v-if="diagnostics.data.debug_panel.notes.length" class="rounded-xl border border-border p-4">
                <h3 class="mb-2 text-sm font-semibold text-text-primary">راهنمای دیباگ</h3>
                <ul class="list-disc space-y-1 pr-5 text-xs text-text-secondary">
                  <li v-for="(note, index) in diagnostics.data.debug_panel.notes" :key="index">{{ note }}</li>
                </ul>
              </article>

              <article v-if="moduleEntries.length" class="rounded-xl border border-border p-4">
                <h3 class="mb-3 text-sm font-semibold text-text-primary">فاز ماژول‌ها</h3>
                <div class="overflow-x-auto">
                  <table class="min-w-full text-xs">
                    <thead class="text-text-muted">
                      <tr>
                        <th class="px-2 py-1 text-right font-medium">ماژول</th>
                        <th class="px-2 py-1 text-right font-medium">فاز</th>
                        <th class="px-2 py-1 text-right font-medium">آماده</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="entry in moduleEntries" :key="entry.key" class="border-t border-border/50">
                        <td class="px-2 py-1.5 text-text-primary">{{ formatModuleLabel(entry.key) }}</td>
                        <td class="px-2 py-1.5 dir-ltr text-right">{{ entry.phase }}</td>
                        <td class="px-2 py-1.5">{{ entry.ready ? 'بله' : 'خیر' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <article v-if="includeLogs" class="rounded-xl border border-border p-4">
                <h3 class="mb-2 text-sm font-semibold text-text-primary">لاگ سرور</h3>
                <p v-if="diagnostics.data.logs.hint" class="mb-2 text-xs text-text-muted">{{ diagnostics.data.logs.hint }}</p>
                <pre v-if="diagnostics.data.logs.lines.length" class="max-h-80 overflow-auto rounded-lg bg-surface-muted p-3 text-xs dir-ltr text-left text-text-primary">{{ diagnostics.data.logs.lines.join('\n') }}</pre>
                <p v-else class="text-xs text-text-muted">لاگی در دسترس نیست.</p>
              </article>
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-xl border border-border bg-surface dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]">
          <header class="flex flex-col gap-3 border-b border-border bg-surface-muted px-4 py-3 dark:bg-surface-hover/55 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/20">
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-text-primary">Liveness Probe</h2>
                <p class="text-xs text-text-secondary">GET /api/health/live/</p>
              </div>
            </div>
            <span
              v-if="liveHealth && !liveLoading"
              class="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="healthBadgeClass(liveHealth.isHealthy)"
            >
              {{ liveHealth.isHealthy ? 'فعال' : 'غیرفعال' }}
            </span>
          </header>

          <div class="relative p-4">
            <SystemHealthSectionSkeleton v-if="liveLoading && !liveHealth" variant="probe" />
            <div v-else-if="liveError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {{ liveError }}
            </div>
            <div v-else-if="liveHealth" class="rounded-xl border px-4 py-3" :class="healthPanelClass(liveHealth.isHealthy, false)">
              <p class="text-sm font-semibold" :class="healthTextClass(liveHealth.isHealthy, false)">
                {{ liveHealth.message || (liveHealth.isHealthy ? 'فرآیند برنامه در حال اجراست' : 'فرآیند برنامه پاسخگو نیست') }}
              </p>
              <p class="mt-1 text-xs text-text-secondary">HTTP {{ formatHttpStatus(liveHealth.httpStatus) }}</p>
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-xl border border-border bg-surface dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]">
          <header class="flex flex-col gap-3 border-b border-border bg-surface-muted px-4 py-3 dark:bg-surface-hover/55 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/20">
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-text-primary">Readiness Probe</h2>
                <p class="text-xs text-text-secondary">GET /api/health/ready/</p>
              </div>
            </div>
            <span
              v-if="readyHealth && !readyLoading"
              class="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="healthBadgeClass(readyHealth.isHealthy)"
            >
              {{ readyHealth.isHealthy ? 'آماده' : 'آماده نیست' }}
            </span>
          </header>

          <div class="relative p-4">
            <SystemHealthSectionSkeleton v-if="readyLoading && !readyHealth" variant="probe" />
            <div v-else-if="readyError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {{ readyError }}
            </div>
            <div v-else-if="readyHealth" class="rounded-xl border px-4 py-3" :class="healthPanelClass(readyHealth.isHealthy, false)">
              <p class="text-sm font-semibold" :class="healthTextClass(readyHealth.isHealthy, false)">
                {{ readyHealth.message || (readyHealth.isHealthy ? 'اتصال پایگاه داده برقرار است' : 'اتصال پایگاه داده برقرار نیست') }}
              </p>
              <p class="mt-1 text-xs text-text-secondary">HTTP {{ formatHttpStatus(readyHealth.httpStatus) }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'system-health',
  layout: 'dashboard',
})

import { computed, onMounted, ref } from 'vue'
import { healthService } from '~/api/services/health.service'
import { systemService } from '~/api/services/system.service'
import SystemHealthSectionSkeleton from '~/components/skeleton/SystemHealthSectionSkeleton.vue'
import {
  parseFullHealthCheckResponse,
  parseLivenessProbeResponse,
  parseReadinessProbeResponse,
  parseSystemDiagnosticsResponse,
} from '~/api/utils/health-response'
import type { HealthCheckResult, HealthProbeResult, SystemDiagnosticsResult } from '~/api/types/health.types'
import { usePermissions } from '~/composables/usePermissions'
import { getApiErrorMessage } from '~/utils/api-error'
import {
  checkStatusClass,
  formatHealthCheckLabel,
  formatHealthStatus,
  formatHttpStatus,
  formatLatencyMs,
  formatModuleLabel,
  isCeleryHealthy,
  overallHealthBadgeClass,
  overallHealthLabel,
} from '~/utils/health'

const { isSuperuser } = usePermissions()

const fullHealth = ref<HealthCheckResult | null>(null)
const liveHealth = ref<HealthProbeResult | null>(null)
const readyHealth = ref<HealthProbeResult | null>(null)
const diagnostics = ref<SystemDiagnosticsResult | null>(null)
const fullLoading = ref(true)
const liveLoading = ref(true)
const readyLoading = ref(true)
const diagLoading = ref(false)
const fullError = ref<string | null>(null)
const liveError = ref<string | null>(null)
const readyError = ref<string | null>(null)
const diagError = ref<string | null>(null)
const fullCheckedAt = ref<string | null>(null)
const includeLogs = ref(false)

const isRefreshing = computed(() => fullLoading.value || liveLoading.value || readyLoading.value || diagLoading.value)

const moduleEntries = computed(() => {
  if (!diagnostics.value) return []
  return Object.entries(diagnostics.value.data.modules).map(([key, value]) => ({
    key,
    phase: value.phase,
    ready: value.ready,
  }))
})

function healthBadgeClass(isHealthy: boolean): string {
  return isHealthy
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
    : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
}

function healthPanelClass(isHealthy: boolean, isDegraded: boolean): string {
  if (isHealthy && !isDegraded) {
    return 'border-emerald-200 bg-emerald-50 dark:border-emerald-600/50 dark:bg-emerald-950/30'
  }
  if (isDegraded) {
    return 'border-amber-200 bg-amber-50 dark:border-amber-600/50 dark:bg-amber-950/30'
  }
  return 'border-red-200 bg-red-50 dark:border-red-600/50 dark:bg-red-950/30'
}

function healthTextClass(isHealthy: boolean, isDegraded: boolean): string {
  if (isHealthy && !isDegraded) return 'text-emerald-800 dark:text-emerald-200'
  if (isDegraded) return 'text-amber-900 dark:text-amber-200'
  return 'text-red-800 dark:text-red-200'
}

function formatCheckedAt(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

async function fetchFullHealth() {
  fullLoading.value = true
  fullError.value = null

  try {
    const { response, httpStatus } = await healthService.getFullHealth()
    const parsed = parseFullHealthCheckResponse(response, httpStatus)

    if (!parsed) {
      fullError.value = 'دریافت وضعیت سلامت با خطا مواجه شد.'
      fullHealth.value = null
      return
    }

    fullHealth.value = parsed
    fullCheckedAt.value = formatCheckedAt(new Date())
  } catch (err: unknown) {
    fullError.value = getApiErrorMessage(err, 'خطا در دریافت وضعیت سلامت')
    fullHealth.value = null
  } finally {
    fullLoading.value = false
  }
}

async function fetchLiveHealth() {
  liveLoading.value = true
  liveError.value = null

  try {
    const { response, httpStatus } = await healthService.getLiveHealth()
    const parsed = parseLivenessProbeResponse(response, httpStatus)

    if (!parsed) {
      liveError.value = 'دریافت وضعیت liveness با خطا مواجه شد.'
      liveHealth.value = null
      return
    }

    liveHealth.value = parsed
  } catch (err: unknown) {
    liveError.value = getApiErrorMessage(err, 'خطا در دریافت وضعیت liveness')
    liveHealth.value = null
  } finally {
    liveLoading.value = false
  }
}

async function fetchReadyHealth() {
  readyLoading.value = true
  readyError.value = null

  try {
    const { response, httpStatus } = await healthService.getReadyHealth()
    const parsed = parseReadinessProbeResponse(response, httpStatus)

    if (!parsed) {
      readyError.value = 'دریافت وضعیت readiness با خطا مواجه شد.'
      readyHealth.value = null
      return
    }

    readyHealth.value = parsed
  } catch (err: unknown) {
    readyError.value = getApiErrorMessage(err, 'خطا در دریافت وضعیت readiness')
    readyHealth.value = null
  } finally {
    readyLoading.value = false
  }
}

async function fetchDiagnostics() {
  if (!isSuperuser.value) return

  diagLoading.value = true
  diagError.value = null

  try {
    const response = await systemService.getDiagnostics(includeLogs.value)
    const parsed = parseSystemDiagnosticsResponse(response, 200)

    if (!parsed) {
      diagError.value = getApiErrorMessage(response, 'دریافت diagnostics ناموفق بود.')
      diagnostics.value = null
      return
    }

    diagnostics.value = parsed
  } catch (err: unknown) {
    diagError.value = getApiErrorMessage(err, 'دسترسی diagnostics فقط برای superuser است.')
    diagnostics.value = null
  } finally {
    diagLoading.value = false
  }
}

async function refreshAll() {
  const tasks = [fetchFullHealth(), fetchLiveHealth(), fetchReadyHealth()]
  if (isSuperuser.value) tasks.push(fetchDiagnostics())
  await Promise.all(tasks)
}

onMounted(() => {
  refreshAll()
})
</script>
