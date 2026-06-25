<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 border-b border-border/50 pb-4">
        <h1 class="text-xl font-semibold text-text-primary">تنظیمات تیکت</h1>
        <p class="mt-1 text-sm text-text-secondary">محدودیت‌های پیوست، متن و نرخ درخواست مهمان</p>
      </div>

      <TicketSettingsFormSkeleton v-if="isLoading" />

      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{{ loadError }}</div>

      <form v-else-if="form" class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="saveSettings">
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">حداکثر فایل در پیام</label>
          <input v-model.number="form.max_files_per_message" type="number" min="1" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">حداکثر حجم (MB)</label>
          <input v-model.number="form.max_upload_size_mb" type="number" min="1" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">حداکثر طول متن</label>
          <input v-model.number="form.max_body_length" type="number" min="100" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-text-primary">Rate limit مهمان / ساعت</label>
          <input v-model.number="form.guest_rate_limit_per_hour" type="number" min="1" class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
        </div>
        <div class="sm:col-span-2">
          <label class="flex items-center gap-2 text-sm text-text-primary">
            <input v-model="form.allow_urls_in_body" type="checkbox" class="rounded border-border" />
            مجاز بودن URL در متن
          </label>
        </div>
        <div class="sm:col-span-2">
          <p class="text-xs text-text-muted">پسوندهای مجاز: {{ form.allowed_extensions.join(', ') || '—' }}</p>
        </div>
        <div class="sm:col-span-2">
          <button type="submit" class="btn-action rounded-xl px-5 py-2.5 text-sm" :disabled="isSaving">
            {{ isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'ticket-settings',
  layout: 'dashboard'
})

import { onMounted, ref } from 'vue'
import { ticketsService } from '~/api/services/tickets.service'
import type { TicketSettings } from '~/api/types/tickets.types'
import { isApiSuccess, parseTicketSettingsResponse } from '~/api/utils/api-response'
import TicketSettingsFormSkeleton from '~/components/skeleton/TicketSettingsFormSkeleton.vue'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'

const form = ref<TicketSettings | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref('')

async function fetchSettings() {
  isLoading.value = true
  try {
    const response = await ticketsService.getSettings()
    form.value = parseTicketSettingsResponse(response)
    if (!form.value) loadError.value = 'دریافت تنظیمات ناموفق بود.'
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت تنظیمات')
  } finally {
    isLoading.value = false
  }
}

async function saveSettings() {
  if (!form.value || isSaving.value) return
  isSaving.value = true
  try {
    const response = await ticketsService.patchSettings({
      max_files_per_message: form.value.max_files_per_message,
      max_upload_size_mb: form.value.max_upload_size_mb,
      max_body_length: form.value.max_body_length,
      guest_rate_limit_per_hour: form.value.guest_rate_limit_per_hour,
      allow_urls_in_body: form.value.allow_urls_in_body,
    })
    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ذخیره ناموفق بود'), variant: 'error' })
      return
    }
    form.value = parseTicketSettingsResponse(response) || form.value
    showToast({ message: 'تنظیمات ذخیره شد.', variant: 'success' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'ذخیره ناموفق بود'), variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchSettings)
</script>
