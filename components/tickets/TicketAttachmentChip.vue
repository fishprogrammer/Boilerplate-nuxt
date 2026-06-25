<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-secondary transition hover:border-secondary/40 hover:text-text-primary disabled:opacity-60"
    :disabled="isDownloading"
    @click="handleDownload"
  >
    <svg class="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
    <span class="max-w-40 truncate">{{ attachment.original_name }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TicketAttachment } from '~/api/types/tickets.types'
import { downloadMediaFile } from '~/utils/media'
import { getApiErrorMessage } from '~/utils/api-error'

const props = defineProps<{
  attachment: TicketAttachment
  guestToken?: string
}>()

const isDownloading = ref(false)

async function handleDownload() {
  if (isDownloading.value) return
  isDownloading.value = true
  try {
    await downloadMediaFile(props.attachment, props.guestToken)
  } catch (err: unknown) {
    window.alert(getApiErrorMessage(err, 'خطا در دانلود فایل'))
  } finally {
    isDownloading.value = false
  }
}
</script>

