<template>
  <div class="page-shell">
    <div class="page-card-fill space-y-8">
      <div class="border-b border-border/50 pb-4">
        <h1 class="text-xl font-semibold text-text-primary">SEO و Google Search Console</h1>
        <p class="mt-1 text-sm text-text-secondary">تنظیمات سایت، GA4، ISR و داشبورد GSC</p>
      </div>

      <div
        v-if="gscBanner"
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
      >
        {{ gscBanner }}
        <button v-if="!gscStatus?.configured" type="button" class="mr-2 text-xs underline" @click="scrollToSettings">
          رفتن به تنظیمات OAuth
        </button>
      </div>

      <!-- Site settings -->
      <section ref="settingsSection" class="rounded-xl border border-border bg-surface p-4">
        <h2 class="mb-4 text-sm font-semibold text-text-primary">تنظیمات یکپارچه‌سازی</h2>
        <div v-if="settingsPending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
        <form v-else class="grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="saveSettings">
          <div class="md:col-span-2">
            <h3 class="mb-2 text-xs font-medium text-text-muted">Analytics</h3>
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs font-medium">GA4 Measurement ID</label>
            <input v-model="form.ga4_measurement_id" type="text" dir="ltr" placeholder="G-XXXXXXXXXX" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>

          <div class="md:col-span-2 mt-2">
            <h3 class="mb-2 text-xs font-medium text-text-muted">Store URLs</h3>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium">Storefront base URL</label>
            <input v-model="form.storefront_base_url" type="url" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium">API public base URL</label>
            <input v-model="form.api_public_base_url" type="url" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>

          <div class="md:col-span-2 mt-2">
            <h3 class="mb-2 text-xs font-medium text-text-muted">ISR revalidation</h3>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium">Nuxt revalidate URL</label>
            <input v-model="form.nuxt_revalidate_url" type="url" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium">Revalidate secret</label>
            <p v-if="settings?.nuxt_revalidate_secret_masked" class="mb-1 text-xs text-text-muted">فعلی: {{ settings.nuxt_revalidate_secret_masked }}</p>
            <input v-model="form.nuxt_revalidate_secret" type="password" dir="ltr" placeholder="خالی = بدون تغییر" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <div class="md:col-span-2">
            <button
              type="button"
              class="btn-muted-sm"
              :disabled="revalidating"
              @click="runStorefrontRevalidate"
            >
              {{ revalidating ? 'در حال revalidate...' : 'Revalidate فروشگاه (/fa/shop, /en/shop)' }}
            </button>
          </div>

          <div class="md:col-span-2 mt-2">
            <h3 class="mb-2 text-xs font-medium text-text-muted">Google Search Console OAuth</h3>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium">GSC Client ID</label>
            <input v-model="form.gsc_client_id" type="text" dir="ltr" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium">GSC Client secret</label>
            <p v-if="settings?.gsc_client_secret_masked" class="mb-1 text-xs text-text-muted">فعلی: {{ settings.gsc_client_secret_masked }}</p>
            <input v-model="form.gsc_client_secret" type="password" dir="ltr" placeholder="خالی = بدون تغییر" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs font-medium">GSC Redirect URI</label>
            <input v-model="form.gsc_redirect_uri" type="url" dir="ltr" placeholder="https://api.../api/seo/gsc/callback/" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
          </div>

          <div class="md:col-span-2">
            <button type="submit" class="btn-action-sm" :disabled="savingSettings">{{ savingSettings ? '...' : 'ذخیره تنظیمات' }}</button>
          </div>
        </form>
      </section>

      <!-- GSC dashboard -->
      <section class="rounded-xl border border-border bg-surface p-4">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-sm font-semibold text-text-primary">Google Search Console</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-if="gscStatus?.configured && !gscStatus.connected"
              type="button"
              class="btn-action-sm"
              :disabled="connecting"
              @click="startGscConnect"
            >
              اتصال به GSC
            </button>
            <button
              v-if="gscStatus?.connected"
              type="button"
              class="btn-muted-sm"
              :disabled="submittingSitemap"
              @click="submitSitemapAction"
            >
              ارسال sitemap
            </button>
          </div>
        </div>

        <div v-if="gscStatus?.connected" class="mb-4 text-sm text-text-secondary">
          <span v-if="gscStatus.property_url" class="dir-ltr">{{ gscStatus.property_url }}</span>
          <span v-if="gscStatus.last_sync_at" class="mr-3">· آخرین sync: {{ formatDate(gscStatus.last_sync_at) }}</span>
        </div>

        <div v-if="gscLoading" class="text-sm text-text-secondary">در حال بارگذاری GSC...</div>
        <div v-else-if="gscStatus?.connected" class="space-y-6">
          <div>
            <h3 class="mb-2 text-xs font-medium text-text-muted">Analytics (۲۸ روز)</h3>
            <GscAnalyticsChart :rows="analyticsRows" />
          </div>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <h3 class="mb-2 text-xs font-medium text-text-muted">Top queries</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-border text-right text-text-secondary">
                      <th class="px-2 py-1">Query</th>
                      <th class="px-2 py-1">Clicks</th>
                      <th class="px-2 py-1">Impr.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in queryRows" :key="row.query" class="border-b border-border/50">
                      <td class="px-2 py-1">{{ row.query }}</td>
                      <td class="px-2 py-1 dir-ltr">{{ row.clicks }}</td>
                      <td class="px-2 py-1 dir-ltr">{{ row.impressions }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 class="mb-2 text-xs font-medium text-text-muted">Top pages</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-border text-right text-text-secondary">
                      <th class="px-2 py-1">Page</th>
                      <th class="px-2 py-1">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in pageRows" :key="row.page" class="border-b border-border/50">
                      <td class="px-2 py-1 dir-ltr text-xs">{{ row.page }}</td>
                      <td class="px-2 py-1 dir-ltr">{{ row.clicks }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-if="indexingIssues.length">
            <h3 class="mb-2 text-xs font-medium text-text-muted">Indexing issues</h3>
            <ul class="space-y-1 text-sm">
              <li v-for="(issue, idx) in indexingIssues" :key="idx" class="rounded-lg border border-border/60 px-3 py-2">
                <span class="font-medium">{{ issue.issue }}</span>
                <span class="text-text-muted"> · {{ issue.severity }} · {{ issue.count }}</span>
                <p class="mt-1 dir-ltr text-xs text-text-secondary">{{ issue.url }}</p>
              </li>
            </ul>
          </div>
        </div>
        <p v-else-if="gscStatus && !gscStatus.configured" class="text-sm text-text-secondary">
          ابتدا تنظیمات OAuth را در فرم بالا تکمیل و ذخیره کنید.
        </p>
        <p v-else-if="gscStatus?.configured" class="text-sm text-text-secondary">
          OAuth پیکربندی شده — برای مشاهده داده‌ها به GSC متصل شوید.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GscAnalyticsRow, GscIndexingIssue, GscPageRow, GscQueryRow, GscStatus, SeoSettings } from '~/types/seo-admin'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatEpochSeconds } from '~/utils/locale'
import { showToast } from '~/composables/useToast'

definePageMeta({
  name: 'admin-seo',
  middleware: ['noindex', 'staff'],
  layout: 'dashboard',
})

const route = useRoute()
const settingsSection = ref<HTMLElement | null>(null)

const { fetchSettings, patchSettings } = useSeoSettings()
const { triggerStorefrontRevalidate } = useInternal()
const {
  fetchStatus,
  connect,
  fetchAnalytics,
  fetchQueries,
  fetchPages,
  fetchIndexingIssues,
  submitSitemap,
} = useGsc()

const settings = ref<SeoSettings | null>(null)
const settingsPending = ref(true)
const savingSettings = ref(false)
const gscStatus = ref<GscStatus | null>(null)
const gscLoading = ref(false)
const connecting = ref(false)
const submittingSitemap = ref(false)
const revalidating = ref(false)
const analyticsRows = ref<GscAnalyticsRow[]>([])
const queryRows = ref<GscQueryRow[]>([])
const pageRows = ref<GscPageRow[]>([])
const indexingIssues = ref<GscIndexingIssue[]>([])

const form = reactive({
  ga4_measurement_id: '',
  storefront_base_url: '',
  api_public_base_url: '',
  nuxt_revalidate_url: '',
  nuxt_revalidate_secret: '',
  gsc_client_id: '',
  gsc_client_secret: '',
  gsc_redirect_uri: '',
})

const gscBanner = computed(() => {
  if (!gscStatus.value) return ''
  if (!gscStatus.value.configured) {
    return 'تنظیمات OAuth گوگل (Client ID، Secret، Redirect URI) را تکمیل کنید.'
  }
  if (!gscStatus.value.connected) {
    return 'GSC پیکربندی شده اما متصل نیست — دکمه «اتصال به GSC» را بزنید.'
  }
  return ''
})

function formatDate(ts: number): string {
  return formatEpochSeconds(ts, 'fa')
}

function scrollToSettings() {
  settingsSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function applySettingsToForm(data: SeoSettings) {
  form.ga4_measurement_id = data.ga4_measurement_id
  form.storefront_base_url = data.storefront_base_url
  form.api_public_base_url = data.api_public_base_url
  form.nuxt_revalidate_url = data.nuxt_revalidate_url
  form.gsc_client_id = data.gsc_client_id
  form.gsc_redirect_uri = data.gsc_redirect_uri
  form.nuxt_revalidate_secret = ''
  form.gsc_client_secret = ''
}

async function loadSettings() {
  settingsPending.value = true
  try {
    settings.value = await fetchSettings()
    if (settings.value) applySettingsToForm(settings.value)
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'بارگذاری تنظیمات ناموفق بود'), variant: 'error' })
  } finally {
    settingsPending.value = false
  }
}

async function saveSettings() {
  savingSettings.value = true
  try {
    const patch: Record<string, string> = {
      ga4_measurement_id: form.ga4_measurement_id.trim(),
      storefront_base_url: form.storefront_base_url.trim(),
      api_public_base_url: form.api_public_base_url.trim(),
      nuxt_revalidate_url: form.nuxt_revalidate_url.trim(),
      gsc_client_id: form.gsc_client_id.trim(),
      gsc_redirect_uri: form.gsc_redirect_uri.trim(),
    }
    if (form.nuxt_revalidate_secret.trim()) {
      patch.nuxt_revalidate_secret = form.nuxt_revalidate_secret.trim()
    }
    if (form.gsc_client_secret.trim()) {
      patch.gsc_client_secret = form.gsc_client_secret.trim()
    }
    settings.value = await patchSettings(patch)
    if (settings.value) applySettingsToForm(settings.value)
    showToast({ message: 'تنظیمات ذخیره شد', variant: 'success' })
    await refreshGscStatus()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'ذخیره تنظیمات ناموفق بود'), variant: 'error' })
  } finally {
    savingSettings.value = false
  }
}

async function runStorefrontRevalidate() {
  revalidating.value = true
  try {
    await triggerStorefrontRevalidate(['/', '/fa/shop', '/en/shop', '/blog'])
    showToast({ message: 'درخواست revalidate به بک‌اند ارسال شد', variant: 'success' })
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'Revalidate ناموفق بود'), variant: 'error' })
  } finally {
    revalidating.value = false
  }
}

async function refreshGscStatus() {
  gscStatus.value = await fetchStatus()
}

async function loadGscData() {
  if (!gscStatus.value?.connected) return
  gscLoading.value = true
  try {
    const [analytics, queries, pages, issues] = await Promise.all([
      fetchAnalytics(28),
      fetchQueries(28, 50),
      fetchPages(28, 50),
      fetchIndexingIssues(),
    ])
    analyticsRows.value = analytics
    queryRows.value = queries
    pageRows.value = pages
    indexingIssues.value = issues
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'بارگذاری GSC ناموفق بود'), variant: 'error' })
  } finally {
    gscLoading.value = false
  }
}

async function startGscConnect() {
  connecting.value = true
  try {
    const result = await connect()
    if (!result?.auth_url) throw new Error('auth_url missing')
    window.location.href = result.auth_url
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'شروع OAuth ناموفق بود'), variant: 'error' })
    connecting.value = false
  }
}

async function submitSitemapAction() {
  submittingSitemap.value = true
  try {
    const result = await submitSitemap()
    if (!result) throw new Error('Invalid response')
    showToast({ message: `Sitemap ارسال شد: ${result.feedpath}`, variant: 'success' })
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'ارسال sitemap ناموفق بود'), variant: 'error' })
  } finally {
    submittingSitemap.value = false
  }
}

function handleGscQuery() {
  const gsc = String(route.query.gsc || '')
  if (gsc === 'connected') {
    showToast({ message: 'اتصال GSC با موفقیت انجام شد', variant: 'success' })
  } else if (gsc === 'error') {
    showToast({ message: 'اتصال GSC ناموفق بود', variant: 'error' })
  }
}

onMounted(async () => {
  handleGscQuery()
  await loadSettings()
  await refreshGscStatus()
  await loadGscData()
})
</script>
