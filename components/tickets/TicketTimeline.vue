<template>
  <div class="rounded-xl border border-border bg-surface-muted/40 p-4">
    <h3 class="mb-3 text-sm font-semibold text-text-primary">تایم‌لاین رویدادها</h3>
    <div v-if="!events.length" class="text-sm text-text-secondary">رویدادی ثبت نشده است.</div>
    <ol v-else class="space-y-3">
      <li
        v-for="event in events"
        :key="event.id"
        class="rounded-lg border border-border/70 bg-surface px-3 py-2.5"
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span class="font-medium text-text-primary">{{ formatTicketEventType(event.event_type) }}</span>
          <span>·</span>
          <span>{{ formatCompactUser(event.actor) }}</span>
          <span>·</span>
          <span>{{ formatTicketDate(event.created_at) }}</span>
        </div>
        <p v-if="formatTicketEventDetail(event)" class="mt-2 whitespace-pre-wrap text-sm leading-7 text-text-secondary">
          {{ formatTicketEventDetail(event) }}
        </p>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { TicketEvent } from '~/api/types/tickets.types'
import {
  formatCompactUser,
  formatTicketDate,
  formatTicketEventDetail,
  formatTicketEventType,
} from '~/utils/tickets'

defineProps<{
  events: TicketEvent[]
}>()
</script>

