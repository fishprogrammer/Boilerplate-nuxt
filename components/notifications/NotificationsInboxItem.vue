<template>
  <article
    class="group relative flex cursor-pointer overflow-hidden rounded-2xl border transition-transform hover:-translate-y-px"
    :class="
      item.is_read
        ? 'border-border/50 bg-surface-muted/25 hover:border-border hover:bg-surface-muted/40'
        : 'border-secondary/45 bg-linear-to-l from-secondary/12 via-secondary-muted/20 to-surface shadow-sm hover:border-secondary/60 hover:shadow-md dark:from-secondary/18 dark:via-secondary/10'
    "
    @click="emit('open', item)"
  >
    <div
      v-if="!item.is_read"
      class="absolute inset-y-0 right-0 w-1.5 bg-secondary"
      aria-hidden="true"
    />

    <div class="flex min-w-0 flex-1 gap-3 p-4 sm:gap-4 sm:p-4">
      <div class="flex w-6 shrink-0 flex-col items-center pt-1 sm:w-7">
        <span
          v-if="!item.is_read"
          class="relative flex size-3.5 items-center justify-center"
          aria-hidden="true"
        >
          <span class="absolute inset-0 animate-ping rounded-full bg-secondary/40" />
          <span class="relative size-3.5 rounded-full bg-secondary ring-4 ring-secondary/25" />
        </span>
        <span
          v-else
          class="flex size-7 items-center justify-center rounded-full bg-surface-muted text-text-muted ring-1 ring-border/60"
          aria-hidden="true"
        >
          <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.5 12.5L8 16l11.5-11.5" />
          </svg>
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-start gap-2">
          <div class="min-w-0 flex-1">
            <div class="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                v-if="!item.is_read"
                class="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[0.625rem] font-bold text-white"
              >
                جدید
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-md border border-border/70 bg-surface/60 px-2 py-0.5 text-[0.625rem] font-medium text-text-muted"
              >
                خوانده‌شده
              </span>
              <NotificationMetaBadge
                kind="type"
                :value="item.notification_type"
                :label="item.notification_type_label"
              />
              <NotificationMetaBadge
                v-if="item.priority === 'high' || item.priority === 'critical'"
                kind="priority"
                :value="item.priority"
                :label="item.priority_label"
              />
            </div>

            <h2
              class="text-base leading-snug"
              :class="item.is_read ? 'font-medium text-text-secondary' : 'font-bold text-text-primary'"
            >
              {{ item.title || 'بدون عنوان' }}
            </h2>
          </div>
        </div>

        <p
          v-if="item.body"
          class="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed"
          :class="item.is_read ? 'text-text-muted' : 'text-text-secondary'"
        >
          {{ item.body }}
        </p>

        <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span v-if="formatNotificationSender(item, { includeRoles: false })">
            {{ formatNotificationSender(item, { includeRoles: false }) }}
          </span>
          <span v-if="item.is_read && item.read_at">
            خوانده‌شده {{ formatNotificationDate(item.read_at) }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-1.5 self-start pt-1 sm:gap-2">
        <time
          class="shrink-0 whitespace-nowrap text-xs tabular-nums"
          :class="item.is_read ? 'text-text-muted' : 'font-semibold text-secondary'"
          :datetime="createdAtIso"
        >
          {{ formatNotificationDate(item.created_at) }}
        </time>
        <button
          type="button"
          class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted/30 transition-colors hover:bg-red-50 hover:text-red-600 hover:[&_path]:stroke-[2.5] focus-visible:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          aria-label="حذف اعلان"
          v-tooltip="'حذف'"
          @click.stop="emit('delete', item)"
        >
          <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <svg
          class="size-4 shrink-0 text-text-muted/40 transition-opacity group-hover:text-text-muted group-hover:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from '~/api/types/inbox.types'
import NotificationMetaBadge from '~/components/notifications/NotificationMetaBadge.vue'
import { formatNotificationDate, formatNotificationSender } from '~/utils/inbox'

const props = defineProps<{
  item: Notification
}>()

const emit = defineEmits<{
  open: [item: Notification]
  delete: [item: Notification]
}>()

const createdAtIso = computed(() => {
  const ts = props.item.created_at
  if (!Number.isFinite(ts) || ts <= 0) return undefined
  const ms = ts > 1e12 ? ts : ts * 1000
  return new Date(ms).toISOString()
})
</script>
