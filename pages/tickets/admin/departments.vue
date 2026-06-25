<template>
  <div class="page-shell">
    <div class="page-card md:p-5">
      <div class="mb-4 flex flex-col gap-3 border-b border-border/50 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-lg font-semibold text-text-primary md:text-xl">دپارتمان‌های تیکت</h1>
          <p class="mt-0.5 text-xs text-text-secondary md:text-sm">مدیریت دپارتمان‌ها، اعضا و اپراتورها</p>
        </div>
        <button
          type="button"
          class="btn-action-sm shrink-0 gap-1"
          :disabled="isCreating"
          @click="toggleCreateForm"
        >
          <svg class="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              v-if="showCreateForm"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ showCreateForm ? 'بستن' : 'افزودن دپارتمان' }}
        </button>
      </div>

      <form
        v-if="showCreateForm"
        class="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-surface-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4"
        @submit.prevent="createDepartment"
      >
        <input
          v-model="newDept.name"
          type="text"
          placeholder="نام دپارتمان"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus"
        />
        <input
          v-model="newDept.slug"
          type="text"
          placeholder="slug"
          dir="ltr"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus"
        />
        <input
          v-model="newDept.description"
          type="text"
          placeholder="توضیح (اختیاری)"
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none input-focus sm:col-span-2 lg:col-span-1"
        />
        <button type="submit" class="btn-action-sm w-full sm:col-span-2 lg:col-span-1" :disabled="isCreating">
          {{ isCreating ? 'در حال افزودن…' : 'افزودن دپارتمان' }}
        </button>
      </form>

      <TicketDepartmentsSkeleton v-if="isLoading" />

      <div
        v-else-if="loadError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ loadError }}
      </div>

      <div
        v-else-if="!departments.length"
        class="rounded-xl border border-border px-4 py-10 text-center text-sm text-text-secondary"
      >
        دپارتمانی ثبت نشده است.
      </div>

      <div v-else class="space-y-4">
        <article v-for="dept in departments" :key="dept.id" class="rounded-xl border border-border p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p class="text-sm font-semibold text-text-primary">{{ dept.name }}</p>
                <span
                  class="inline-flex shrink-0 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
                  :class="dept.is_active ? activeBadgeClass : inactiveBadgeClass"
                >
                  {{ dept.is_active ? 'فعال' : 'غیرفعال' }}
                </span>
              </div>
              <p class="mt-0.5 text-xs text-text-muted dir-ltr">{{ dept.slug }}</p>
              <p v-if="dept.description" class="mt-1 text-sm text-text-secondary">{{ dept.description }}</p>
            </div>

            <button
              type="button"
              class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              aria-label="حذف"
              v-tooltip="'حذف'"
              @click="openDeleteModal(dept)"
            >
              <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="rounded-lg border border-border/70 bg-surface-muted/30 p-3">
              <DepartmentUserPicker
                :model-value="memberSelections[dept.id] ?? []"
                label="اعضا (DepartmentMember)"
                @update:model-value="updateMemberSelections(dept.id, $event)"
              />
              <button
                type="button"
                class="btn-action-sm mt-3"
                :disabled="savingMembersId === dept.id"
                @click="saveMembers(dept.id)"
              >
                {{ savingMembersId === dept.id ? 'در حال ذخیره...' : 'ذخیره اعضا' }}
              </button>
            </div>

            <div class="rounded-lg border border-border/70 bg-surface-muted/30 p-3">
              <DepartmentUserPicker
                :model-value="operatorSelections[dept.id] ?? []"
                label="اپراتورها (DepartmentOperator)"
                @update:model-value="updateOperatorSelections(dept.id, $event)"
              />
              <button
                type="button"
                class="btn-action-sm mt-3"
                :disabled="savingOperatorsId === dept.id"
                @click="saveOperators(dept.id)"
              >
                {{ savingOperatorsId === dept.id ? 'در حال ذخیره...' : 'ذخیره اپراتورها' }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف دپارتمان"
      :message="deleteModalMessage"
      confirm-label="بله، حذف"
      cancel-label="انصراف"
      variant="danger"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'ticket-departments',
  layout: 'dashboard'
})

import { computed, onMounted, reactive, ref } from 'vue'
import { authService } from '~/api/services/auth.service'
import { ticketsService } from '~/api/services/tickets.service'
import type { TicketDepartment } from '~/api/types/tickets.types'
import ConfirmModal from '~/components/ConfirmModal.vue'
import TicketDepartmentsSkeleton from '~/components/skeleton/TicketDepartmentsSkeleton.vue'
import DepartmentUserPicker from '~/components/tickets/DepartmentUserPicker.vue'
import {
  isApiSuccess,
  parseDepartmentUserIdsResponse,
  parseTicketDepartmentsListResponse,
  parseUserDetailResponse,
} from '~/api/utils/api-response'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage, isNetworkError } from '~/utils/api-error'
import { normalizeUserPickerItem, type UserPickerItem } from '~/utils/users'

const activeBadgeClass =
  'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
const inactiveBadgeClass =
  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'

const departments = ref<TicketDepartment[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isCreating = ref(false)
const showCreateForm = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const deptToDelete = ref<TicketDepartment | null>(null)
const savingMembersId = ref('')
const savingOperatorsId = ref('')
const newDept = ref({ name: '', slug: '', description: '' })
const memberSelections = reactive<Record<string, UserPickerItem[]>>({})
const operatorSelections = reactive<Record<string, UserPickerItem[]>>({})

const deleteModalMessage = computed(() => {
  const dept = deptToDelete.value
  if (!dept) return 'آیا از حذف این دپارتمان مطمئن هستید؟'
  return `آیا از حذف دپارتمان «${dept.name}» مطمئن هستید؟`
})

function ensureDepartmentSelections(deptId: string) {
  if (!memberSelections[deptId]) memberSelections[deptId] = []
  if (!operatorSelections[deptId]) operatorSelections[deptId] = []
}

function updateMemberSelections(deptId: string, users: UserPickerItem[]) {
  memberSelections[deptId] = users
}

function updateOperatorSelections(deptId: string, users: UserPickerItem[]) {
  operatorSelections[deptId] = users
}

function extractUserIdsFromResponse(response: unknown): number[] {
  return parseDepartmentUserIdsResponse(response)?.user_ids ?? []
}

function extractUsersFromResponse(response: unknown): UserPickerItem[] {
  if (!response || typeof response !== 'object') return []
  const root = response as Record<string, unknown>
  if (root.status === 'error') return []

  const payload =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root

  const candidates = [payload.users, payload.members, payload.operators, payload.results]
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue
    const users = candidate
      .map((item) => normalizeUserPickerItem(item as UserPickerItem))
      .filter((item): item is UserPickerItem => item !== null)
    if (users.length) return users
  }

  return []
}

function collectUserIds(users: UserPickerItem[] | undefined): number[] {
  const ids = (users ?? [])
    .map((user) => Number(user.id))
    .filter((id) => Number.isFinite(id) && id > 0)
  return [...new Set(ids)]
}

async function resolveUsersByIds(ids: number[]): Promise<UserPickerItem[]> {
  const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))]
  if (!uniqueIds.length) return []

  const resolved = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const response = await authService.getUser(id)
        const user = parseUserDetailResponse(response)
        return user ? normalizeUserPickerItem(user) : null
      } catch {
        return null
      }
    }),
  )

  return resolved.filter((user): user is UserPickerItem => user !== null)
}

async function loadDepartmentAssignments(deptId: string) {
  ensureDepartmentSelections(deptId)

  try {
    const [membersResponse, operatorsResponse] = await Promise.all([
      ticketsService.getDepartmentMembers(deptId),
      ticketsService.getDepartmentOperators(deptId),
    ])

    const membersFromPayload = extractUsersFromResponse(membersResponse)
    if (membersFromPayload.length) {
      memberSelections[deptId] = membersFromPayload
    } else {
      const memberIds = extractUserIdsFromResponse(membersResponse)
      memberSelections[deptId] = memberIds.length ? await resolveUsersByIds(memberIds) : []
    }

    const operatorsFromPayload = extractUsersFromResponse(operatorsResponse)
    if (operatorsFromPayload.length) {
      operatorSelections[deptId] = operatorsFromPayload
    } else {
      const operatorIds = extractUserIdsFromResponse(operatorsResponse)
      operatorSelections[deptId] = operatorIds.length ? await resolveUsersByIds(operatorIds) : []
    }
  } catch {
    memberSelections[deptId] = []
    operatorSelections[deptId] = []
  }
}

function showActionError(err: unknown, fallback: string) {
  if (isNetworkError(err)) return
  showToast({ message: getApiErrorMessage(err, fallback), variant: 'error' })
}

async function fetchDepartments() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await ticketsService.listDepartments({ page_size: 100 })
    departments.value = parseTicketDepartmentsListResponse(response)?.departments ?? []
    for (const dept of departments.value) {
      ensureDepartmentSelections(dept.id)
    }

    await Promise.all(departments.value.map((dept) => loadDepartmentAssignments(dept.id)))
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت دپارتمان‌ها')
  } finally {
    isLoading.value = false
  }
}

async function createDepartment() {
  if (!newDept.value.name.trim() || !newDept.value.slug.trim() || isCreating.value) return
  isCreating.value = true
  try {
    const response = await ticketsService.createDepartment({
      name: newDept.value.name.trim(),
      slug: newDept.value.slug.trim(),
      description: newDept.value.description.trim(),
      is_active: true,
    })
    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ایجاد دپارتمان ناموفق بود'), variant: 'error' })
      return
    }
    newDept.value = { name: '', slug: '', description: '' }
    showCreateForm.value = false
    await fetchDepartments()
  } catch (err: unknown) {
    showActionError(err, 'ایجاد دپارتمان ناموفق بود')
  } finally {
    isCreating.value = false
  }
}

function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value
  if (!showCreateForm.value) {
    newDept.value = { name: '', slug: '', description: '' }
  }
}

async function saveMembers(id: string) {
  savingMembersId.value = id
  try {
    const userIds = collectUserIds(memberSelections[id])
    const response = await ticketsService.updateDepartmentMembers(id, { user_ids: userIds })
    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ذخیره اعضا ناموفق بود'), variant: 'error' })
      return
    }

    const savedIds = extractUserIdsFromResponse(response)
    memberSelections[id] = savedIds.length ? await resolveUsersByIds(savedIds) : []

    showToast({ message: 'اعضای دپارتمان ذخیره شد.', variant: 'success' })
  } catch (err: unknown) {
    showActionError(err, 'ذخیره اعضا ناموفق بود')
  } finally {
    savingMembersId.value = ''
  }
}

async function saveOperators(id: string) {
  savingOperatorsId.value = id
  try {
    const userIds = collectUserIds(operatorSelections[id])
    const response = await ticketsService.updateDepartmentOperators(id, { user_ids: userIds })
    if (!isApiSuccess(response)) {
      showToast({ message: getApiErrorMessage(response, 'ذخیره اپراتورها ناموفق بود'), variant: 'error' })
      return
    }

    const savedIds = extractUserIdsFromResponse(response)
    operatorSelections[id] = savedIds.length ? await resolveUsersByIds(savedIds) : []

    showToast({ message: 'اپراتورهای دپارتمان ذخیره شد.', variant: 'success' })
  } catch (err: unknown) {
    showActionError(err, 'ذخیره اپراتورها ناموفق بود')
  } finally {
    savingOperatorsId.value = ''
  }
}

function openDeleteModal(dept: TicketDepartment) {
  deptToDelete.value = dept
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deptToDelete.value || isDeleting.value) return

  const id = deptToDelete.value.id
  isDeleting.value = true
  try {
    await ticketsService.deleteDepartment(id)
    departments.value = departments.value.filter((item) => item.id !== id)
    delete memberSelections[id]
    delete operatorSelections[id]
    showDeleteModal.value = false
    deptToDelete.value = null
    showToast({ message: 'دپارتمان با موفقیت حذف شد.', variant: 'success' })
  } catch (err: unknown) {
    showActionError(err, 'حذف ناموفق بود')
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchDepartments)
</script>
