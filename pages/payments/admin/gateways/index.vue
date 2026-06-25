<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">درگاه‌های پرداخت</h1>
          <p class="mt-1 text-sm text-text-secondary">مدیریت درگاه‌های شارژ آنلاین کیف پول</p>
        </div>
        <div class="page-header-actions">
          <RouterLink
            v-if="canAccessRoute('payment-gateway-create')"
            :to="{ name: 'payment-gateway-create' }"
            class="btn-action-sm gap-1.5"
          >
            درگاه جدید
            <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </RouterLink>
        </div>
      </div>

      <PaymentGatewaysListSkeleton v-if="isLoading" :count="5" />

      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{{ loadError }}</div>
      <div v-else class="space-y-2">
        <article
          v-for="gateway in gateways"
          :key="gateway.id"
          class="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p class="font-medium text-text-primary">{{ gateway.title }}</p>
              <span
                class="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium"
                :class="gateway.is_active
                  ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
              >
                {{ gateway.is_active ? 'فعال' : 'غیرفعال' }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-text-muted">
              {{ gateway.driver }}
              <span v-if="gateway.is_sandbox"> · sandbox</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <RouterLink
              v-if="canAccessRoute('payment-gateway-orders')"
              :to="{ name: 'payment-gateway-orders', params: { id: gateway.id } }"
              class="btn-muted-sm"
            >
              سفارش‌ها
            </RouterLink>
            <RouterLink
              v-if="canAccessRoute('payment-gateway-edit')"
              :to="{ name: 'payment-gateway-edit', params: { id: gateway.id } }"
              class="btn-action-sm"
            >
              ویرایش
            </RouterLink>
            <button
              v-if="canDeleteGateway"
              type="button"
              class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              aria-label="حذف"
              v-tooltip="'حذف'"
              @click="openDeleteModal(gateway)"
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
        </article>
        <p v-if="gateways.length === 0" class="py-8 text-center text-sm text-text-secondary">درگاهی ثبت نشده است.</p>
      </div>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف درگاه"
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
  name: 'payment-gateways',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { paymentsService } from '~/api/services/payments.service'
import type { PaymentGatewayAdmin } from '~/api/types/payments.types'
import { parsePaymentGatewaysAdminListResponse } from '~/api/utils/api-response'
import ConfirmModal from '~/components/ConfirmModal.vue'
import PaymentGatewaysListSkeleton from '~/components/skeleton/PaymentGatewaysListSkeleton.vue'
import { usePermissions } from '~/composables/usePermissions'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'

const { canAccessRoute, hasPermission, PERMISSIONS } = usePermissions()

const canDeleteGateway = computed(() => hasPermission(PERMISSIONS.PAYMENTS.DELETE_GATEWAY))

const gateways = ref<PaymentGatewayAdmin[]>([])
const isLoading = ref(true)
const loadError = ref('')
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const gatewayToDelete = ref<PaymentGatewayAdmin | null>(null)

const deleteModalMessage = computed(() => {
  const gateway = gatewayToDelete.value
  if (!gateway) return 'آیا از حذف این درگاه مطمئن هستید؟'
  return `آیا از حذف درگاه «${gateway.title}» مطمئن هستید؟`
})

async function fetchGateways() {
  isLoading.value = true
  loadError.value = ''
  try {
    const response = await paymentsService.listAdminGateways({ page_size: 100 })
    gateways.value = parsePaymentGatewaysAdminListResponse(response)?.gateways ?? []
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در دریافت درگاه‌ها')
  } finally {
    isLoading.value = false
  }
}

function openDeleteModal(gateway: PaymentGatewayAdmin) {
  gatewayToDelete.value = gateway
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!gatewayToDelete.value || isDeleting.value) return

  isDeleting.value = true
  try {
    await paymentsService.deleteAdminGateway(gatewayToDelete.value.id)
    gateways.value = gateways.value.filter((item) => item.id !== gatewayToDelete.value!.id)
    showDeleteModal.value = false
    gatewayToDelete.value = null
    showToast({ message: 'درگاه حذف شد.', variant: 'success' })
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'حذف ناموفق بود'), variant: 'error' })
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchGateways)
</script>
