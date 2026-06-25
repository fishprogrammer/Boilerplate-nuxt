<template>
  <span
    class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
    :class="getTicketStatusClass(status)"
  >
    {{ formatTicketStatus(status) }}
  </span>
</template>

<script setup lang="ts">
import type { TicketStatus } from '~/api/types/tickets.types'
import { formatTicketStatus, getTicketStatusClass } from '~/utils/tickets'

defineProps<{
  status: TicketStatus | string
}>()
</script>

