<template>
  <div class="relative">
    <label :for="inputId" class="mb-1 block text-xs font-medium text-text-primary">گیرنده</label>
    <input
      :id="inputId"
      v-model="searchQuery"
      type="search"
      autocomplete="off"
      placeholder="جستجو با نام، نام کاربری یا موبایل..."
      class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus disabled:cursor-not-allowed disabled:opacity-60"
      :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!error }"
      :disabled="disabled || !canSearch"
      @focus="showResults = true"
      @blur="onBlur"
    />

    <div
      v-if="selectedRecipient"
      class="mt-2 flex items-start justify-between gap-2 rounded-lg border border-secondary/30 bg-secondary-muted/40 px-3 py-2 dark:bg-secondary/10"
    >
      <div class="min-w-0">
        <p class="text-sm font-medium text-text-primary">{{ formatPersonalRecipientLabel(selectedRecipient) }}</p>
        <p v-if="selectedRecipient.phone_number" class="mt-0.5 text-xs text-text-muted dir-ltr">
          {{ selectedRecipient.phone_number }}
        </p>
      </div>
      <button type="button" class="shrink-0 text-xs text-red-600 dark:text-red-400" @click="clearSelection">
        حذف
      </button>
    </div>

    <div
      v-else-if="showResults && (isSearching || results.length || searchQuery.trim() || emptyMessage)"
      class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-lg"
    >
      <p v-if="isSearching" class="px-3 py-2 text-xs text-text-muted">در حال جستجو...</p>
      <p v-else-if="emptyMessage" class="px-3 py-2 text-xs text-text-muted">{{ emptyMessage }}</p>
      <p v-else-if="!results.length && searchQuery.trim().length >= 2" class="px-3 py-2 text-xs text-text-muted">
        گیرنده‌ای یافت نشد.
      </p>
      <button
        v-for="recipient in results"
        :key="recipient.id"
        type="button"
        class="flex w-full cursor-pointer flex-col gap-0.5 border-b border-border/60 px-3 py-2 text-right last:border-b-0 hover:bg-surface-hover"
        @mousedown.prevent="selectRecipient(recipient)"
      >
        <span class="text-sm font-medium text-text-primary">{{ formatPersonalRecipientLabel(recipient) }}</span>
        <span v-if="recipient.phone_number" class="text-xs text-text-muted dir-ltr">{{ recipient.phone_number }}</span>
      </button>
    </div>

    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="!disabled && !canSearch" class="mt-1 text-xs text-text-muted">
      برای ارسال تیکت شخصی باید عضو حداقل یک دپارتمان باشید.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ticketsService } from '~/api/services/tickets.service'
import type { PersonalTicketRecipient } from '~/api/types/tickets.types'
import { parsePersonalRecipientsListResponse } from '~/api/utils/api-response'
import { formatPersonalRecipientLabel } from '~/utils/tickets'

const props = defineProps<{
  modelValue: number | null
  error?: string
  disabled?: boolean
  canSearch?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'update:recipient': [value: PersonalTicketRecipient | null]
  clearError: []
}>()

const inputId = `recipient-picker-${Math.random().toString(36).slice(2, 9)}`
const searchQuery = ref('')
const results = ref<PersonalTicketRecipient[]>([])
const selectedRecipient = ref<PersonalTicketRecipient | null>(null)
const isSearching = ref(false)
const showResults = ref(false)
const emptyMessage = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function clearSelection() {
  selectedRecipient.value = null
  searchQuery.value = ''
  results.value = []
  emptyMessage.value = ''
  emit('update:modelValue', null)
  emit('update:recipient', null)
  emit('clearError')
}

function selectRecipient(recipient: PersonalTicketRecipient) {
  selectedRecipient.value = recipient
  searchQuery.value = formatPersonalRecipientLabel(recipient)
  results.value = []
  emptyMessage.value = ''
  showResults.value = false
  emit('update:modelValue', recipient.id)
  emit('update:recipient', recipient)
  emit('clearError')
}

function onBlur() {
  window.setTimeout(() => {
    showResults.value = false
  }, 150)
}

async function searchRecipients(query: string) {
  emptyMessage.value = ''
  if (!props.canSearch || props.disabled) {
    results.value = []
    return
  }

  const trimmed = query.trim()
  if (trimmed.length < 2) {
    results.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await ticketsService.listPersonalRecipients({
      search: trimmed,
      page: 1,
      page_size: 50,
    })
    const parsed = parsePersonalRecipientsListResponse(response)
    results.value = parsed?.recipients ?? []
    if (!results.value.length && parsed?.message) {
      emptyMessage.value = parsed.message
    }
  } catch {
    results.value = []
  } finally {
    isSearching.value = false
  }
}

watch(searchQuery, (value) => {
  if (selectedRecipient.value && value !== formatPersonalRecipientLabel(selectedRecipient.value)) {
    selectedRecipient.value = null
    emit('update:modelValue', null)
    emit('update:recipient', null)
  }

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void searchRecipients(value)
  }, 350)
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      if (!selectedRecipient.value) return
      clearSelection()
    }
  },
)
</script>

