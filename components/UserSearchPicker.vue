<template>
  <div class="relative">
    <label v-if="label" :for="inputId" class="mb-1 block text-xs font-medium text-text-primary">{{ label }}</label>

    <input
      :id="inputId"
      v-model="searchQuery"
      type="search"
      autocomplete="off"
      :placeholder="placeholder"
      :required="required && !selectedUser"
      class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
      :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/20': !!error }"
      @focus="showResults = true"
      @blur="onBlur"
    />

    <div
      v-if="selectedUser"
      class="mt-2 flex items-start justify-between gap-2 rounded-lg border border-secondary/30 bg-secondary-muted/40 px-3 py-2 dark:bg-secondary/10"
    >
      <div class="min-w-0">
        <p class="text-sm font-medium text-text-primary">{{ formatUserDisplayName(selectedUser) }}</p>
        <p class="mt-0.5 text-xs text-text-muted dir-ltr">
          {{ selectedUser.username || `#${selectedUser.id}` }}
        </p>
      </div>
      <button type="button" class="shrink-0 text-xs text-red-600 dark:text-red-400" @click="clearSelection">
        حذف
      </button>
    </div>

    <div
      v-else-if="showResults && (isSearching || results.length || searchQuery.trim())"
      class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface shadow-lg"
    >
      <p v-if="isSearching" class="px-3 py-2 text-xs text-text-muted">در حال جستجو...</p>
      <p v-else-if="!results.length && searchQuery.trim().length >= 2" class="px-3 py-2 text-xs text-text-muted">
        کاربری یافت نشد.
      </p>
      <button
        v-for="user in results"
        :key="user.id"
        type="button"
        class="flex w-full cursor-pointer flex-col gap-0.5 border-b border-border/60 px-3 py-2 text-right last:border-b-0 hover:bg-surface-hover"
        @mousedown.prevent="selectUser(user)"
      >
        <span class="text-sm font-medium text-text-primary">{{ formatUserDisplayName(user) }}</span>
        <span class="text-xs text-text-muted dir-ltr">{{ user.username || user.id }}</span>
      </button>
    </div>

    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { authService } from '~/api/services/auth.service'
import { parseUsersListResponse } from '~/api/utils/api-response'
import {
  formatUserDisplayName,
  normalizeUserPickerItem,
  type UserPickerItem,
} from '~/utils/users'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    label?: string
    placeholder?: string
    error?: string
    required?: boolean
  }>(),
  {
    placeholder: 'جستجو با نام، نام کاربری یا موبایل...',
    required: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  clearError: []
}>()

const inputId = `user-search-picker-${Math.random().toString(36).slice(2, 9)}`
const searchQuery = ref('')
const results = ref<UserPickerItem[]>([])
const selectedUser = ref<UserPickerItem | null>(null)
const isSearching = ref(false)
const showResults = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function clearSelection() {
  selectedUser.value = null
  searchQuery.value = ''
  results.value = []
  emit('update:modelValue', null)
  emit('clearError')
}

function selectUser(user: UserPickerItem) {
  selectedUser.value = user
  searchQuery.value = formatUserDisplayName(user)
  results.value = []
  showResults.value = false
  emit('update:modelValue', user.id)
  emit('clearError')
}

function onBlur() {
  window.setTimeout(() => {
    showResults.value = false
  }, 150)
}

async function searchUsers(query: string) {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    results.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await authService.listUsers({
      search: trimmed,
      page: 1,
      page_size: 20,
    })
    const users = parseUsersListResponse(response)?.users ?? []
    results.value = users
      .map((user) => normalizeUserPickerItem(user))
      .filter((user): user is UserPickerItem => user !== null)
  } catch {
    results.value = []
  } finally {
    isSearching.value = false
  }
}

watch(searchQuery, (value) => {
  if (selectedUser.value && value !== formatUserDisplayName(selectedUser.value)) {
    selectedUser.value = null
    emit('update:modelValue', null)
  }

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void searchUsers(value)
  }, 350)
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value && selectedUser.value) {
      clearSelection()
    }
  },
)
</script>

