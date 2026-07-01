<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">جزئیات لایسنس</h1>
          <p v-if="license" class="mt-1 text-sm text-text-secondary">{{ license.product.name }}</p>
        </div>
        <BackIconButton />
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-else-if="!license" class="text-sm text-text-secondary">لایسنس یافت نشد.</div>
      <div v-else class="space-y-5">
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="font-mono text-sm dir-ltr">{{ license.license_key_masked }}</p>
            <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="getLicenseStatusClass(license.status)">
              {{ formatLicenseStatus(license.status) }}
            </span>
          </div>
          <p class="mt-2 text-sm text-text-secondary">
            {{ license.plan.name }} · {{ formatLicenseType(license.plan.license_type) }}
          </p>
          <p class="mt-1 text-xs text-text-muted">
            فعال‌سازی: {{ license.activation_count }} / {{ license.max_activations }}
          </p>
          <button type="button" class="btn-action-sm mt-4" @click="showReveal = true">
            نمایش کلید کامل
          </button>
        </div>

        <div class="rounded-xl border border-border bg-surface p-4">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">فعال‌سازی‌ها</h2>
          <div v-if="license.activations.length === 0" class="text-sm text-text-secondary">فعال‌سازی ثبت نشده است.</div>
          <ul v-else class="space-y-2">
            <li
              v-for="activation in license.activations"
              :key="activation.id"
              class="flex flex-col gap-2 rounded-lg border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="font-medium text-text-primary">{{ activation.label || activation.identifier }}</p>
                <p class="text-xs text-text-muted dir-ltr">{{ activation.identifier }}</p>
                <p v-if="activation.product_version" class="text-xs text-text-secondary">نسخه: {{ activation.product_version }}</p>
              </div>
              <button
                v-if="activation.status === 'active'"
                type="button"
                class="btn-muted-sm text-red-600"
                @click="confirmDeactivate(activation.id)"
              >
                غیرفعال‌سازی
              </button>
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="{ name: 'panel-licenses' }" class="btn-muted-sm">همه لایسنس‌ها</NuxtLink>
          <NuxtLink :to="{ name: 'panel-downloads' }" class="btn-action-sm">مرکز دانلود</NuxtLink>
        </div>
      </div>
    </div>

    <LicenseRevealModal v-model="showReveal" :license-id="licenseId" />

    <ConfirmModal
      v-model="showDeactivateConfirm"
      title="غیرفعال‌سازی"
      message="آیا از غیرفعال‌سازی این دستگاه مطمئن هستید؟"
      confirm-label="بله، غیرفعال کن"
      cancel-label="انصراف"
      variant="danger"
      :loading="deactivating"
      @confirm="runDeactivate"
    />
  </div>
</template>

<script setup lang="ts">
import type { LicenseDetail } from '~/types/licensing'
import ConfirmModal from '~/components/ConfirmModal.vue'
import LicenseRevealModal from '~/components/licensing/LicenseRevealModal.vue'
import { showToast } from '~/composables/useToast'
import { getApiErrorMessage } from '~/utils/api-error'
import { formatLicenseStatus, formatLicenseType, getLicenseStatusClass } from '~/utils/licensing'

definePageMeta({
  name: 'panel-license-view',
  middleware: ['noindex', 'auth'],
  layout: 'dashboard',
})

const route = useRoute()
const licenseId = computed(() => String(route.params.id || ''))

const { fetchLicense, deactivateActivation } = useLicensing()

const license = ref<LicenseDetail | null>(null)
const pending = ref(true)
const loadError = ref('')
const showReveal = ref(false)
const showDeactivateConfirm = ref(false)
const pendingActivationId = ref('')
const deactivating = ref(false)

async function loadLicense() {
  pending.value = true
  loadError.value = ''
  try {
    license.value = await fetchLicense(licenseId.value)
    if (!license.value) loadError.value = 'لایسنس یافت نشد.'
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری لایسنس ناموفق بود')
  } finally {
    pending.value = false
  }
}

function confirmDeactivate(activationId: string) {
  pendingActivationId.value = activationId
  showDeactivateConfirm.value = true
}

async function runDeactivate() {
  if (!pendingActivationId.value) return
  deactivating.value = true
  try {
    await deactivateActivation(licenseId.value, pendingActivationId.value)
    showToast({ message: 'فعال‌سازی غیرفعال شد', variant: 'success' })
    showDeactivateConfirm.value = false
    await loadLicense()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'غیرفعال‌سازی ناموفق بود'), variant: 'error' })
  } finally {
    deactivating.value = false
  }
}

onMounted(() => {
  void loadLicense()
})

useHead({ meta: [{ name: 'robots', content: 'noindex,nofollow' }] })
</script>
