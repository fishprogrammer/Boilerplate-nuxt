<template>
  <div class="inline-flex max-w-full flex-col gap-1">
    <button
      v-if="effectivePreviewUrl"
      type="button"
      class="block overflow-hidden rounded-lg border border-border bg-surface text-right transition-colors hover:border-secondary/40"
      :disabled="isOpening"
      @click="openAttachment"
    >
      <img
        :src="effectivePreviewUrl"
        :alt="attachment.original_name"
        class="max-h-40 max-w-full object-contain"
        loading="lazy"
        @error="onPreviewImageError"
      />
    </button>
    <button
      v-else-if="hasTicketAttachmentFile(attachment)"
      type="button"
      class="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary hover:bg-surface-hover disabled:opacity-60"
      :disabled="isOpening"
      @click="openAttachment"
    >
      <svg class="size-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <span class="truncate">{{ attachment.original_name }}</span>
    </button>
    <span
      v-else
      class="inline-flex max-w-full items-center rounded-md bg-surface px-2 py-1 text-xs text-text-secondary"
    >
      {{ attachment.original_name }}
    </span>
    <p v-if="loadError" class="text-[11px] text-red-600 dark:text-red-400">{{ loadError }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { TicketAttachment } from '~/api/types/tickets.types'
import { showToast } from '~/composables/useToast'
import {
  createProtectedMediaObjectUrl,
  getBearerMediaAuth,
  openProtectedMedia,
  requiresProtectedMediaFetch,
  type ProtectedMediaAuth,
} from '~/utils/protected-media'
import {
  getTicketAttachmentDownloadUrl,
  getTicketAttachmentFileUrl,
  getTicketAttachmentThumbnailUrl,
  hasTicketAttachmentFile,
} from '~/utils/tickets'

const props = defineProps<{
  attachment: TicketAttachment
  mediaAuth?: ProtectedMediaAuth | null
}>()

const protectedPreviewUrl = ref('')
const loadError = ref('')
const isOpening = ref(false)
let previewObjectUrl: string | null = null

const resolvedAuth = computed(() => props.mediaAuth ?? getBearerMediaAuth())

const thumbnailUrl = computed(() => getTicketAttachmentThumbnailUrl(props.attachment))
const fileUrl = computed(() => getTicketAttachmentFileUrl(props.attachment))
const downloadUrl = computed(() => getTicketAttachmentDownloadUrl(props.attachment))

const usesDirectThumbnail = computed(() => {
  const url = thumbnailUrl.value
  return !!url && !requiresProtectedMediaFetch(url)
})

const effectivePreviewUrl = computed(() => {
  if (usesDirectThumbnail.value) return thumbnailUrl.value
  return protectedPreviewUrl.value
})

function revokeProtectedPreviewUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl)
    previewObjectUrl = null
  }
  protectedPreviewUrl.value = ''
}

async function loadProtectedPreview() {
  revokeProtectedPreviewUrl()
  loadError.value = ''

  const sourceUrl = thumbnailUrl.value
  if (!sourceUrl || usesDirectThumbnail.value) return

  const auth = resolvedAuth.value
  if (!auth) return

  try {
    previewObjectUrl = await createProtectedMediaObjectUrl(sourceUrl, auth)
    protectedPreviewUrl.value = previewObjectUrl
  } catch {
    loadError.value = 'بارگذاری پیش‌نمایش ناموفق بود.'
  }
}

function onPreviewImageError() {
  if (!usesDirectThumbnail.value) return
  loadError.value = 'بارگذاری پیش‌نمایش ناموفق بود.'
}

async function openAttachment() {
  const fileUrlValue = fileUrl.value
  const downloadUrlValue = downloadUrl.value
  const auth = resolvedAuth.value

  if (!fileUrlValue && !downloadUrlValue) {
    showToast({ message: 'دسترسی به فایل پیوست ممکن نیست.', variant: 'error' })
    return
  }

  if (fileUrlValue && !requiresProtectedMediaFetch(fileUrlValue)) {
    window.open(fileUrlValue, '_blank', 'noopener,noreferrer')
    return
  }

  if (!auth) {
    showToast({ message: 'دسترسی به فایل پیوست ممکن نیست.', variant: 'error' })
    return
  }

  const protectedUrl = downloadUrlValue || fileUrlValue
  if (!protectedUrl) {
    showToast({ message: 'دسترسی به فایل پیوست ممکن نیست.', variant: 'error' })
    return
  }

  isOpening.value = true
  try {
    await openProtectedMedia(protectedUrl, auth)
  } catch {
    showToast({ message: 'باز کردن فایل پیوست ناموفق بود.', variant: 'error' })
  } finally {
    isOpening.value = false
  }
}

watch(
  () => [props.attachment.id, props.mediaAuth?.token, thumbnailUrl.value] as const,
  () => {
    void loadProtectedPreview()
  },
)

onMounted(() => {
  void loadProtectedPreview()
})

onUnmounted(() => {
  revokeProtectedPreviewUrl()
})
</script>
