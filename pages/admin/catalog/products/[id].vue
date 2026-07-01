<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">{{ product?.name || 'محصول' }}</h1>
          <p v-if="product" class="mt-1 text-sm text-text-secondary dir-ltr">{{ product.slug }} · {{ product.locale }}</p>
        </div>
        <BackIconButton />
      </div>

      <div v-if="pending" class="text-sm text-text-secondary">در حال بارگذاری...</div>
      <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</div>
      <div v-else-if="!product" class="text-sm text-text-secondary">محصول یافت نشد.</div>
      <div v-else class="space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <span
            class="rounded-md px-2 py-0.5 text-xs font-medium"
            :class="product.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
          >
            {{ product.status === 'published' ? 'منتشر شده' : 'پیش‌نویس' }}
          </span>
          <button
            v-if="hasPermission(PERMISSIONS.CATALOG.CHANGE_PRODUCT) && product.status === 'draft'"
            type="button"
            class="btn-action-sm"
            :disabled="actionPending"
            @click="publishProduct"
          >
            انتشار
          </button>
          <button
            v-if="hasPermission(PERMISSIONS.CATALOG.CHANGE_PRODUCT) && product.status === 'published'"
            type="button"
            class="btn-muted-sm"
            :disabled="actionPending"
            @click="unpublishProduct"
          >
            لغو انتشار
          </button>
          <button
            v-if="hasPermission(PERMISSIONS.CATALOG.CHANGE_PRODUCT)"
            type="button"
            class="btn-muted-sm"
            :disabled="actionPending"
            @click="generateSecret"
          >
            تولید کلید API
          </button>
        </div>

        <LicensingSecretPanel v-if="licensingSecret" :secret="licensingSecret" @close="licensingSecret = ''" />

        <section class="rounded-xl border border-border bg-surface p-4">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">پلن‌های قیمت‌گذاری</h2>
          <div v-if="product.plans.length === 0" class="text-sm text-text-secondary">پلنی ثبت نشده است.</div>
          <table v-else class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-right text-text-secondary">
                <th class="px-2 py-2">نام</th>
                <th class="px-2 py-2">مدل</th>
                <th class="px-2 py-2">قیمت</th>
                <th class="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in product.plans" :key="plan.id" class="border-b border-border/60">
                <td class="px-2 py-2">{{ plan.name }}</td>
                <td class="px-2 py-2">{{ plan.pricing_model }} / {{ plan.license_type }}</td>
                <td class="px-2 py-2">{{ plan.price.toLocaleString('fa-IR') }}</td>
                <td class="px-2 py-2">
                  <button
                    v-if="hasPermission(PERMISSIONS.CATALOG.CHANGE_PRODUCT)"
                    type="button"
                    class="text-xs text-primary"
                    :disabled="actionPending"
                    @click="duplicatePlan(plan.id)"
                  >
                    کپی پلن
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="hasPermission(PERMISSIONS.CATALOG.CHANGE_PRODUCT)" class="rounded-xl border border-border bg-surface p-4">
          <h2 class="mb-3 text-sm font-semibold text-text-primary">انتشار نسخه جدید</h2>
          <form class="grid grid-cols-1 gap-3 md:grid-cols-2" @submit.prevent="submitRelease">
            <input v-model="releaseForm.version" type="text" placeholder="نسخه (مثلاً 1.2.0)" dir="ltr" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
            <input v-model="releaseForm.artifact" type="text" placeholder="شناسه artifact" dir="ltr" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
            <textarea v-model="releaseForm.release_notes" rows="3" placeholder="یادداشت انتشار" class="md:col-span-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none input-focus" />
            <button type="submit" class="btn-action-sm w-fit" :disabled="releasePending">{{ releasePending ? '...' : 'ثبت release' }}</button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminCatalogProductDetail } from '~/types/catalog'
import { PERMISSIONS } from '~/constants/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { getApiErrorMessage } from '~/utils/api-error'
import { showToast } from '~/composables/useToast'

definePageMeta({
  name: 'catalog-product-view',
  layout: 'dashboard',
})

const route = useRoute()
const productId = computed(() => String(route.params.id || ''))
const { hasPermission } = usePermissions()
const {
  adminGetProduct,
  adminPublishProduct,
  adminUnpublishProduct,
  adminDuplicatePlan,
  adminGenerateLicensingSecret,
  adminCreateRelease,
} = useCatalog()

const product = ref<AdminCatalogProductDetail | null>(null)
const pending = ref(true)
const loadError = ref('')
const actionPending = ref(false)
const releasePending = ref(false)
const licensingSecret = ref('')

const releaseForm = reactive({
  version: '',
  artifact: '',
  release_notes: '',
})

async function loadProduct() {
  pending.value = !product.value
  loadError.value = ''
  try {
    product.value = await adminGetProduct(productId.value)
    if (!product.value) loadError.value = 'محصول یافت نشد.'
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'بارگذاری محصول ناموفق بود')
  } finally {
    pending.value = false
  }
}

async function publishProduct() {
  actionPending.value = true
  try {
    await adminPublishProduct(productId.value)
    showToast({ message: 'محصول منتشر شد', variant: 'success' })
    await loadProduct()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'انتشار ناموفق بود'), variant: 'error' })
  } finally {
    actionPending.value = false
  }
}

async function unpublishProduct() {
  actionPending.value = true
  try {
    await adminUnpublishProduct(productId.value)
    showToast({ message: 'انتشار لغو شد', variant: 'success' })
    await loadProduct()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'لغو انتشار ناموفق بود'), variant: 'error' })
  } finally {
    actionPending.value = false
  }
}

async function duplicatePlan(planId: string) {
  actionPending.value = true
  try {
    await adminDuplicatePlan(productId.value, planId)
    await loadProduct()
    showToast({ message: 'پلن کپی شد', variant: 'success' })
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'کپی پلن ناموفق بود'), variant: 'error' })
  } finally {
    actionPending.value = false
  }
}

async function generateSecret() {
  if (!confirm('کلید API فقط یک‌بار نمایش داده می‌شود. ادامه می‌دهید؟')) return
  actionPending.value = true
  try {
    const result = await adminGenerateLicensingSecret(productId.value)
    if (!result?.api_secret) throw new Error('پاسخ نامعتبر')
    licensingSecret.value = result.api_secret
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'تولید کلید ناموفق بود'), variant: 'error' })
  } finally {
    actionPending.value = false
  }
}

async function submitRelease() {
  if (!releaseForm.version.trim() || !releaseForm.artifact.trim()) return
  releasePending.value = true
  try {
    await adminCreateRelease(productId.value, {
      version: releaseForm.version.trim(),
      artifact: releaseForm.artifact.trim(),
      release_notes: releaseForm.release_notes.trim(),
      released_at: Math.floor(Date.now() / 1000),
    })
    releaseForm.version = ''
    releaseForm.artifact = ''
    releaseForm.release_notes = ''
    showToast({ message: 'نسخه ثبت شد', variant: 'success' })
    await loadProduct()
  } catch (error) {
    showToast({ message: getApiErrorMessage(error, 'ثبت نسخه ناموفق بود'), variant: 'error' })
  } finally {
    releasePending.value = false
  }
}

onMounted(() => {
  void loadProduct()
})
</script>
