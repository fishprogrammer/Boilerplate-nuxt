<template>
  <div class="relative">
    <label v-if="label" class="mb-1.5 block text-sm font-semibold text-text-primary">{{ label }}</label>
    <p v-if="hint" class="mb-2 text-xs text-text-muted">{{ hint }}</p>

    <div v-if="selectedUsers.length" class="mb-2 flex flex-wrap gap-2">
      <span
        v-for="user in selectedUsers"
        :key="user.id"
        class="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface-muted/60 px-2.5 py-1 text-xs text-text-primary"
      >
        <span class="truncate">{{ formatUserDisplayName(user) }}</span>
        <button
          type="button"
          class="shrink-0 text-red-600 hover:text-red-700 dark:text-red-400"
          aria-label="حذف"
          @click="removeUser(user.id)"
        >
          ×
        </button>
      </span>
    </div>

    <input
      :id="inputId"
      ref="searchInputRef"
      v-model="searchQuery"
      type="search"
      autocomplete="off"
      :placeholder="placeholder"
      class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
      @focus="openResults"
      @blur="onBlur"
    />

    <div
      v-if="showResults && (isSearching || results.length || searchQuery.trim())"
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
        class="flex w-full cursor-pointer items-center justify-between gap-2 border-b border-border/60 px-3 py-2 text-right last:border-b-0 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSelected(user.id)"
        @mousedown.prevent="selectUser(user)"
      >
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-medium text-text-primary">{{ formatUserDisplayName(user) }}</span>
          <span class="block text-xs text-text-muted dir-ltr">{{ user.username || user.id }}</span>
        </span>
        <span
          v-if="isSelected(user.id)"
          class="shrink-0 text-[0.6875rem] font-medium text-secondary"
        >
          انتخاب شده
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { authService } from '~/api/services/auth.service'
import { parseUsersListResponse } from '~/api/utils/api-response'
import {
  formatUserDisplayName,
  normalizeUserPickerItem,
  type UserPickerItem,
} from '~/utils/users'

const props = withDefaults(
  defineProps<{
    modelValue?: UserPickerItem[]
    label?: string
    hint?: string
    placeholder?: string
  }>(),
  {
    modelValue: () => [],
    placeholder: 'جستجو با نام، نام کاربری یا موبایل...',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: UserPickerItem[]]
}>()

const inputId = `department-user-picker-${Math.random().toString(36).slice(2, 9)}`
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const results = ref<UserPickerItem[]>([])
const isSearching = ref(false)
const showResults = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const selectedUsers = computed(() => props.modelValue ?? [])

function isSelected(id: number): boolean {
  return selectedUsers.value.some((user) => user.id === id)
}

function selectUser(user: UserPickerItem) {
  if (isSelected(user.id)) return
  emit('update:modelValue', [...selectedUsers.value, user])
  searchQuery.value = ''
  results.value = []
  showResults.value = true
  window.setTimeout(() => {
    searchInputRef.value?.focus()
  }, 0)
}

function removeUser(id: number) {
  emit(
    'update:modelValue',
    selectedUsers.value.filter((user) => user.id !== id),
  )
}

function openResults() {
  showResults.value = true
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
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void searchUsers(value)
  }, 350)
})
</script>

