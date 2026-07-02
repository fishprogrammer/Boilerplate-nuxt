<template>
  <div class="page-shell">
    <div class="page-card md:p-5">
      <div class="mb-4 flex flex-col gap-2 border-b border-border/50 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-lg font-semibold text-text-primary">تیکت جدید</h1>
        </div>
        <div class="page-header-actions">
          <BackIconButton />
        </div>
      </div>

      <form class="space-y-3" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label for="ticket-type" class="mb-1 block text-xs font-medium text-text-primary">دسته / نوع</label>
            <select id="ticket-type" v-model="ticketTypeId" class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none input-focus">
              <option value="">انتخاب کنید</option>
              <option v-for="type in ticketTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
            <p v-if="fieldErrors.ticket_type" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.ticket_type }}</p>
          </div>

          <div>
            <label for="priority" class="mb-1 block text-xs font-medium text-text-primary">اولویت</label>
            <select id="priority" v-model="priority" class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none input-focus">
              <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
        </div>

        <div>
          <div class="mb-1.5 flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-text-primary">مقصد</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="option in visibleTargetTypeOptions"
                :key="option.value"
                type="button"
                class="rounded-md px-2.5 py-1 text-xs font-medium"
                :class="targetType === option.value ? 'bg-secondary text-white' : 'bg-surface-muted text-text-secondary'"
                @click="setTargetType(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <p v-if="showPersonalTargetOption && canSendPersonal" class="mt-1 text-xs text-text-muted">
            برای ارسال تیکت شخصی باید عضو حداقل یک دپارتمان باشید.
          </p>
          <p v-if="fieldErrors.target_type" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.target_type }}</p>
        </div>

        <div v-if="targetType === 'department'">
          <label for="department" class="mb-1 block text-xs font-medium text-text-primary">دپارتمان مقصد</label>
          <select id="department" v-model="departmentId" class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none input-focus sm:max-w-md">
            <option value="">انتخاب کنید</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
          </select>
          <p v-if="fieldErrors.current_department" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.current_department }}</p>
        </div>

        <RecipientPicker
          v-else
          v-model="targetUserId"
          :error="fieldErrors.target_user"
          :can-search="canSearchRecipients"
          @clear-error="clearFieldError('target_user')"
        />

        <div>
          <label for="subject" class="mb-1 block text-xs font-medium text-text-primary">عنوان</label>
          <p v-if="productSlug" class="mb-1 text-xs text-violet-700 dark:text-violet-300">
            محصول مرتبط: <span class="dir-ltr font-medium">{{ productSlug }}</span>
          </p>
          <input
            id="subject"
            v-model="subject"
            type="text"
            maxlength="255"
            class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none input-focus"
          />
          <p v-if="fieldErrors.subject" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.subject }}</p>
        </div>

        <div>
          <label for="body" class="mb-1 block text-xs font-medium text-text-primary">متن</label>
          <textarea
            id="body"
            v-model="body"
            rows="4"
            maxlength="5000"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
          />
          <p v-if="fieldErrors.body" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.body }}</p>
        </div>

        <div>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            class="sr-only"
            :disabled="isUploading || uploadedFiles.length >= 3"
            @change="onFilesSelected"
          />
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="btn-muted-sm gap-1.5"
              :disabled="isUploading || uploadedFiles.length >= 3"
              @click="openFilePicker"
            >
              <svg v-if="!isUploading" class="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <svg v-else class="size-3.5 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ isUploading ? 'در حال آپلود...' : 'پیوست (اختیاری)' }}
            </button>
            <span v-if="uploadedFiles.length >= 3" class="text-xs text-text-muted">حداکثر ۳ فایل</span>
          </div>
          <div v-if="uploadedFiles.length" class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="file in uploadedFiles"
              :key="file.id"
              class="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-surface-muted/60 px-2 py-0.5 text-xs text-text-primary"
            >
              <span class="truncate">{{ file.name }}</span>
              <button
                type="button"
                class="shrink-0 text-red-600 hover:text-red-700 dark:text-red-400"
                aria-label="حذف پیوست"
                @click="removeFile(file.id)"
              >
                ×
              </button>
            </span>
          </div>
          <p v-if="fieldErrors.media_ids" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.media_ids }}</p>
        </div>

        <p v-if="submitError" class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">{{ submitError }}</p>

        <div class="flex justify-end pt-1">
          <button type="submit" class="btn-action-sm w-fit" :disabled="isSubmitting">
            {{ isSubmitting ? 'در حال ارسال...' : 'ثبت تیکت' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'create-ticket',
  layout: 'dashboard'
})

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mediaService } from '~/api/services/media.service'
import { ticketsService } from '~/api/services/tickets.service'
import type { TargetType, TicketDepartment, TicketPriority, TicketType } from '~/api/types/tickets.types'
import {
  buildCreateTicketPayload,
  isApiSuccess,
  parsePersonalTicketEligibilityResponse,
  parseTicketDepartmentsListResponse,
  parseTicketDetailResponse,
  parseTicketTypesListResponse,
} from '~/api/utils/api-response'
import RecipientPicker from '~/components/tickets/RecipientPicker.vue'
import { usePermissions } from '~/composables/usePermissions'
import { extractApiFieldErrors, getApiErrorMessage } from '~/utils/api-error'
import { isApiModuleLive } from '~/utils/api-module-live'
import { handleMediaUploadFailure } from '~/utils/media-upload'
import {
  canSearchPersonalRecipients,
  canShowPersonalTicketTarget,
  CREATE_TICKET_TARGET_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
} from '~/utils/tickets'

const route = useRoute()
const router = useRouter()
const { isStaff, isSuperuser, userPermissions } = usePermissions()

const priorityOptions = TICKET_PRIORITY_OPTIONS

const ticketTypes = ref<TicketType[]>([])
const departments = ref<TicketDepartment[]>([])
const canSendPersonal = ref(false)
const eligibilityLoaded = ref(false)
const targetType = ref<TargetType>('department')
const ticketTypeId = ref('')
const departmentId = ref('')
const targetUserId = ref<number | null>(null)
const priority = ref<TicketPriority>('medium')
const subject = ref('')
const body = ref('')
const productSlug = ref(String(route.query.product || '').trim())
const productId = ref<string | null>(null)
const mediaIds = ref<string[]>([])
const uploadedFiles = ref<Array<{ id: string; name: string }>>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const fieldErrors = ref<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)
const isUploading = ref(false)

const permissionContext = computed(() => ({
  permissions: userPermissions.value,
  isSuperuser: isSuperuser.value,
  isStaff: isStaff.value,
}))

const visibleTargetTypeOptions = computed(() =>
  CREATE_TICKET_TARGET_OPTIONS.filter(
    (option) =>
      option.value !== 'user' ||
      canShowPersonalTicketTarget(eligibilityLoaded.value, canSendPersonal.value, permissionContext.value),
  ),
)

const showPersonalTargetOption = computed(() =>
  visibleTargetTypeOptions.value.some((option) => option.value === 'user'),
)

const canSearchRecipients = computed(() =>
  canSearchPersonalRecipients(canSendPersonal.value, permissionContext.value),
)

function clearFieldError(key: string) {
  if (!fieldErrors.value[key]) return
  const next = { ...fieldErrors.value }
  delete next[key]
  fieldErrors.value = next
}

function setTargetType(value: TargetType) {
  if (value === 'user' && !showPersonalTargetOption.value) return
  targetType.value = value
  fieldErrors.value = {}
  if (value === 'department') {
    targetUserId.value = null
  } else {
    departmentId.value = ''
  }
}

watch(targetType, () => {
  fieldErrors.value = {}
})

function openFilePicker() {
  fileInputRef.value?.click()
}

function removeFile(id: string) {
  mediaIds.value = mediaIds.value.filter((mediaId) => mediaId !== id)
  uploadedFiles.value = uploadedFiles.value.filter((file) => file.id !== id)
}

function validateClient(): boolean {
  const errors: Record<string, string> = {}
  if (!ticketTypeId.value) errors.ticket_type = 'دسته / نوع الزامی است.'
  if (!subject.value.trim()) errors.subject = 'عنوان الزامی است.'
  if (!body.value.trim()) errors.body = 'متن تیکت الزامی است.'
  if (targetType.value === 'department' && !departmentId.value) {
    errors.current_department = 'انتخاب دپارتمان مقصد الزامی است.'
  }
  if (targetType.value === 'user') {
    if (!canSearchRecipients.value) {
      errors.target_type = 'برای ارسال تیکت شخصی باید عضو یک دپارتمان باشید.'
    } else if (!targetUserId.value) {
      errors.target_user = 'انتخاب گیرنده الزامی است.'
    }
  }
  if (mediaIds.value.length > 3) errors.media_ids = 'حداکثر ۳ فایل مجاز است.'
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (!files.length) return

  isUploading.value = true
  try {
    for (const file of files.slice(0, 3 - mediaIds.value.length)) {
      try {
        const response = await mediaService.uploadMedia(file)
        const payload = (response as { data?: { id?: string; original_name?: string } })?.data ?? response
        const record = payload as { id?: string; original_name?: string }
        if (record.id) {
          mediaIds.value.push(record.id)
          uploadedFiles.value.push({ id: record.id, name: record.original_name || file.name })
        }
      } catch (err: unknown) {
        submitError.value = handleMediaUploadFailure(err)
      }
    }
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

async function resolveProductFromQuery() {
  if (!productSlug.value) return
  const config = useRuntimeConfig()
  if (!isApiModuleLive(config.public.catalogApiLive, String(config.public.apiBaseUrl))) return
  try {
    const { getProduct } = useCatalog()
    const product = await getProduct(productSlug.value, 'fa')
    if (product?.id) productId.value = product.id
  } catch {
    // fallback to product_slug on submit
  }
}

async function loadFormData() {
  try {
    const [typesRes, deptRes, eligibilityRes] = await Promise.all([
      ticketsService.listTypes({ is_active: true, page_size: 100 }),
      ticketsService.listAvailableDepartments(),
      ticketsService.getPersonalEligibility(),
    ])
    ticketTypes.value = parseTicketTypesListResponse(typesRes)?.types ?? []
    departments.value = parseTicketDepartmentsListResponse(deptRes)?.departments ?? []
    canSendPersonal.value = parsePersonalTicketEligibilityResponse(eligibilityRes)?.can_send_personal === true
    const canShowPersonal = canShowPersonalTicketTarget(
      true,
      canSendPersonal.value,
      permissionContext.value,
    )
    if (targetType.value === 'user' && !canShowPersonal) {
      targetType.value = 'department'
      targetUserId.value = null
    }
  } finally {
    eligibilityLoaded.value = true
  }
}

async function handleSubmit() {
  submitError.value = ''
  if (!validateClient() || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const payload = buildCreateTicketPayload({
      ticket_type: ticketTypeId.value,
      target_type: targetType.value,
      current_department: targetType.value === 'department' ? departmentId.value : undefined,
      target_user: targetType.value === 'user' ? targetUserId.value ?? undefined : undefined,
      subject: subject.value,
      body: body.value,
      product: productId.value || undefined,
      product_slug: productId.value ? undefined : productSlug.value || undefined,
      priority: priority.value,
      media_ids: mediaIds.value,
    })
    const response = await ticketsService.createTicket(payload)
    if (!isApiSuccess(response)) {
      fieldErrors.value = extractApiFieldErrors(response)
      submitError.value = getApiErrorMessage(response, 'ثبت تیکت ناموفق بود')
      return
    }
    const ticket = parseTicketDetailResponse(response)
    if (ticket?.id) {
      router.push({ name: 'view-ticket', params: { id: ticket.id } })
      return
    }
    router.push({ name: 'tickets' })
  } catch (err: unknown) {
    fieldErrors.value = extractApiFieldErrors(err)
    submitError.value = getApiErrorMessage(err, 'ثبت تیکت ناموفق بود')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void Promise.all([loadFormData(), resolveProductFromQuery()])
})
</script>
