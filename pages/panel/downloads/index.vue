<template>
  <div class="page-shell">
    <div class="page-card-fill">
      <div class="mb-6 flex items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">مرکز دانلود</h1>
          <p class="mt-1 text-sm text-text-secondary">فایل‌های نسخه محصولات خریداری‌شده</p>
        </div>
        <BackIconButton />
      </div>

      <p v-if="!licensingApiLive" class="mb-4 text-xs text-amber-600">نمایش داده نمونه — API لایسنس غیرفعال است.</p>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-else-if="downloads.length === 0" class="text-sm text-text-secondary">فایلی برای دانلود موجود نیست.</div>
      <div v-else class="space-y-4">
        <article
          v-for="item in downloads"
          :key="`${item.license_id}-${item.version}`"
          class="rounded-xl border border-border bg-surface p-4"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="font-semibold text-text-primary">{{ item.product_name }}</h2>
              <p class="mt-1 text-sm text-text-secondary">نسخه {{ item.version }} · {{ item.filename }}</p>
            </div>
            <a
              v-if="item.download_url"
              :href="item.download_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-action-sm w-fit"
            >
              دانلود
            </a>
          </div>
          <details v-if="item.changelog" class="mt-3">
            <summary class="cursor-pointer text-sm font-medium text-text-primary">تغییرات نسخه</summary>
            <p class="mt-2 text-sm text-text-secondary">{{ item.changelog }}</p>
          </details>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DownloadItem } from '~/types/licensing'
import { getApiErrorMessage } from '~/utils/api-error'

definePageMeta({
  name: 'panel-downloads',
  middleware: ['noindex', 'auth'],
  layout: 'dashboard',
})

const { fetchDownloads, licensingApiLive } = useLicensing()

const downloads = ref<DownloadItem[]>([])
const pending = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    downloads.value = await fetchDownloads()
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری فهرست دانلود ناموفق بود')
  } finally {
    pending.value = false
  }
})

useHead({ meta: [{ name: 'robots', content: 'noindex,nofollow' }] })
</script>
