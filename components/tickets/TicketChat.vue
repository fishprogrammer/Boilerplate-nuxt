<template>
  <div class="space-y-3">
    <div
      v-for="message in sortedMessages"
      :key="message.id"
      class="flex"
      :class="message.is_staff_reply ? 'justify-start' : 'justify-end'"
    >
      <div
        class="max-w-[85%] rounded-2xl border px-4 py-3"
        :class="message.is_staff_reply
          ? 'border-border bg-surface-muted text-text-primary'
          : 'border-secondary/30 bg-secondary-muted/60 text-text-primary dark:border-secondary/35 dark:bg-secondary/10'"
      >
        <div class="mb-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span>{{ formatCompactUser(message.author) }}</span>
          <span>·</span>
          <span>{{ formatTicketDate(message.created_at) }}</span>
        </div>
        <p v-if="message.body" class="whitespace-pre-wrap text-sm leading-7">{{ message.body }}</p>
        <div v-if="message.attachments.length" class="mt-3 space-y-2">
          <p class="text-[11px] font-medium text-text-muted">پیوست‌ها</p>
          <div class="flex flex-wrap gap-2">
            <TicketAttachmentItem
              v-for="attachment in message.attachments"
              :key="attachment.id"
              :attachment="attachment"
              :media-auth="mediaAuth"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TicketMessage } from '~/api/types/tickets.types'
import TicketAttachmentItem from '~/components/tickets/TicketAttachmentItem.vue'
import type { ProtectedMediaAuth } from '~/utils/protected-media'
import {
  formatCompactUser,
  formatTicketDate,
  sortTicketMessages,
} from '~/utils/tickets'

const props = defineProps<{
  messages: TicketMessage[]
  mediaAuth?: ProtectedMediaAuth | null
}>()

const sortedMessages = computed(() => sortTicketMessages(props.messages))
</script>
