<template>
  <div class="page-shell">
    <div class="page-card">
      <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">شارژ کیف پول</h1>
          <p class="mt-1 text-sm text-text-secondary">پرداخت آنلاین از طریق درگاه بانکی یا ارسال فیش کارت‌به‌کارت (ریال)</p>
        </div>
        <div class="page-header-actions flex items-center gap-2">
          <span
            v-if="isLoading"
            class="inline-block h-7 w-32 animate-pulse rounded-lg bg-surface-muted"
            aria-hidden="true"
          />
          <span
            v-else-if="wallet"
            class="inline-flex items-baseline gap-1 rounded-lg border border-border/50 bg-surface-muted/30 px-2.5 py-1 text-xs leading-none"
            dir="rtl"
          >
            <span class="text-text-muted">موجودی</span>
            <span class="text-sm font-semibold tabular-nums text-text-primary" dir="ltr">{{ formatWalletAmount(wallet.balance) }}</span>
            <span class="text-text-muted">ریال</span>
          </span>
          <BackIconButton />
        </div>
      </div>

      <WalletDepositFormSkeleton v-if="isLoading" />

      <div
        v-else-if="loadError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ loadError }}
      </div>

      <template v-else>
        <div
          v-if="!wallet?.is_active"
          class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          کیف پول شما غیرفعال است و امکان شارژ وجود ندارد.
        </div>

        <form
          v-if="wallet?.is_active && gateways.length > 0"
          class="space-y-5"
          @submit.prevent="startDeposit"
        >
          <fieldset class="space-y-3">
            <legend class="mb-2 text-sm font-medium text-text-primary">شارژ آنلاین — انتخاب درگاه</legend>
            <label
              v-for="gateway in gateways"
              :key="gateway.id"
              class="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors"
              :class="selectedGatewayId === gateway.id
                ? 'border-secondary bg-secondary/5'
                : 'border-border hover:border-secondary/40'"
            >
              <input
                v-model="selectedGatewayId"
                type="radio"
                name="gateway"
                :value="gateway.id"
                class="mt-1"
              />
              <span class="min-w-0 flex-1">
                <span class="block font-medium text-text-primary">{{ gateway.title }}</span>
                <span class="mt-1 block text-xs text-text-muted">
                  {{ buildGatewayAmountHint(gateway) }}
                </span>
              </span>
            </label>
          </fieldset>

          <div>
            <label for="deposit-amount" class="mb-1 block text-xs font-medium text-text-primary">
              مبلغ شارژ (ریال)
            </label>
            <AmountInput
              id="deposit-amount"
              v-model="depositAmount"
              placeholder="مثلاً ۵۰۰٬۰۰۰"
              input-class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-right text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
            />
            <p class="mt-1 text-xs text-text-muted">{{ amountHint }}</p>
            <p v-if="amountError" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ amountError }}</p>
          </div>

          <button
            type="submit"
            class="btn-action w-full rounded-xl py-2.5 text-sm"
            :disabled="isSubmitting || !selectedGatewayId"
          >
            {{ isSubmitting ? 'در حال اتصال به درگاه...' : 'پرداخت و شارژ کیف پول' }}
          </button>
        </form>

        <section
          v-if="wallet?.is_active"
          class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
          :class="gateways.length > 0 ? 'mt-8' : ''"
        >
          <div class="grid lg:grid-cols-2 lg:items-stretch">
            <div class="border-b border-border/60 p-5 sm:p-6 lg:border-b-0 lg:border-e lg:border-border/60">
              <div class="flex items-start gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary dark:bg-secondary/15"
                  aria-hidden="true"
                >
                  <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <h2 class="text-sm font-semibold text-text-primary">ارسال فیش واریز</h2>
                  <p class="mt-1.5 text-xs leading-relaxed text-text-muted">
                    پس از کارت‌به‌کارت، تصویر فیش را آپلود کنید. حسابدار پس از بررسی، کیف پول شما را شارژ می‌کند.
                  </p>
                </div>
              </div>

              <div class="mt-6">
                <label for="receipt-amount" class="mb-1.5 block text-xs font-medium text-text-primary">
                  مبلغ اعلامی (اختیاری)
                </label>
                <AmountInput
                  id="receipt-amount"
                  v-model="receiptAmount"
                  placeholder="در صورت تمایل مبلغ واریزی را وارد کنید"
                  input-class="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-right text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                  :disabled="isSubmittingReceipt || isUploadingReceipt"
                />
                <p class="mt-1.5 text-xs text-text-muted">
                  اگر خالی بگذارید، حسابدار مبلغ را از روی فیش تعیین می‌کند.
                </p>
              </div>
            </div>

            <div class="flex flex-col p-5 sm:p-6">
              <p class="mb-3 text-xs font-medium text-text-primary">تصویر فیش</p>

              <label
                v-if="!receiptMediaId && !isUploadingReceipt"
                class="group flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
                :class="[
                  isReceiptDragOver
                    ? 'border-secondary bg-secondary/10'
                    : 'border-border/80 bg-surface-muted/20 hover:border-secondary/40 hover:bg-secondary/5',
                  (isSubmittingReceipt || isUploadingReceipt) ? 'pointer-events-none opacity-60' : '',
                ]"
                @dragenter.prevent="onReceiptDragEnter"
                @dragover.prevent="onReceiptDragOver"
                @dragleave.prevent="onReceiptDragLeave"
                @drop.prevent="onReceiptDrop"
              >
                <input
                  ref="receiptInputRef"
                  type="file"
                  accept="image/*,.pdf"
                  class="sr-only"
                  :disabled="isUploadingReceipt || isSubmittingReceipt"
                  @change="onReceiptSelected"
                />
                <div
                  class="flex size-12 items-center justify-center rounded-full bg-surface text-text-muted shadow-sm transition-colors group-hover:bg-secondary/10 group-hover:text-secondary"
                  aria-hidden="true"
                >
                  <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-text-primary">انتخاب تصویر یا PDF فیش</p>
                  <p class="mt-1 text-xs text-text-muted">کلیک کنید یا فایل را اینجا رها کنید</p>
                </div>
              </label>

              <div
                v-else
                class="rounded-xl border border-border bg-surface-muted/30 p-4"
              >
                <div v-if="isUploadingReceipt" class="space-y-3">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-xs font-medium text-text-primary">
                      {{ receiptUploadPercent >= 100 ? 'در حال نهایی‌سازی آپلود...' : 'در حال آپلود فیش...' }}
                    </p>
                    <span class="shrink-0 text-xs font-semibold text-secondary">{{ receiptUploadPercent }}%</span>
                  </div>
                  <div
                    class="h-2 overflow-hidden rounded-full bg-border"
                    role="progressbar"
                    :aria-valuenow="receiptUploadPercent"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="پیشرفت آپلود فیش"
                  >
                    <div
                      class="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
                      :style="{ width: `${receiptUploadPercent}%` }"
                    />
                  </div>
                </div>

                <div v-else class="flex items-stretch gap-3">
                  <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
                    <p class="text-xs font-medium text-green-700 dark:text-green-400">آپلود با موفقیت انجام شد</p>
                    <p class="truncate text-xs text-text-muted">{{ uploadedReceiptName }}</p>
                    <button
                      type="button"
                      class="mt-2 w-fit text-xs text-secondary underline-offset-2 hover:underline"
                      :disabled="isSubmittingReceipt"
                      @click="removeUploadedReceipt"
                    >
                      انتخاب فایل دیگر
                    </button>
                  </div>

                  <div
                    v-if="receiptPreviewIsImage && receiptPreviewUrl"
                    class="relative shrink-0 self-center"
                  >
                    <a
                      :href="receiptPreviewUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
                      :title="uploadedReceiptName || 'پیش‌نمایش فیش'"
                    >
                      <img
                        :src="receiptPreviewUrl"
                        :alt="uploadedReceiptName || 'پیش‌نمایش فیش'"
                        class="size-24 object-cover sm:size-28"
                      />
                    </a>
                    <button
                      type="button"
                      class="absolute -inset-e-2 -top-2 flex size-7 items-center justify-center rounded-full border border-border bg-surface text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      aria-label="حذف تصویر فیش"
                      :disabled="isSubmittingReceipt"
                      @click="removeUploadedReceipt"
                    >
                      <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div
                    v-else-if="receiptPreviewIsPdf"
                    class="relative shrink-0 self-center"
                  >
                    <div class="flex size-24 flex-col items-center justify-center rounded-lg border border-border bg-surface px-2 text-center shadow-sm sm:size-28">
                      <svg class="size-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="mt-1 text-[10px] font-medium text-text-secondary">PDF</span>
                    </div>
                    <button
                      type="button"
                      class="absolute -inset-e-2 -top-2 flex size-7 items-center justify-center rounded-full border border-border bg-surface text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      aria-label="حذف فیش"
                      :disabled="isSubmittingReceipt"
                      @click="removeUploadedReceipt"
                    >
                      <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-auto space-y-2 pt-5">
                <div class="flex justify-start">
                  <button
                    type="button"
                    class="btn-action-sm rounded-xl px-4 py-2 text-xs"
                    :disabled="!receiptMediaId || isSubmittingReceipt || isUploadingReceipt"
                    @click="submitWalletDepositReceipt"
                  >
                    {{ isSubmittingReceipt ? 'در حال ارسال...' : 'ارسال فیش برای بررسی' }}
                  </button>
                </div>
                <p v-if="receiptError" class="text-start text-xs text-red-600 dark:text-red-400">{{ receiptError }}</p>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'wallet-deposit',
  layout: 'dashboard',
})

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { financeService } from '~/api/services/finance.service'
import { mediaService } from '~/api/services/media.service'
import { paymentsService } from '~/api/services/payments.service'
import { walletService } from '~/api/services/wallet.service'
import type { MediaFile } from '~/api/types/media.types'
import type { PaymentGatewayPublic } from '~/api/types/payments.types'
import type { Wallet } from '~/api/types/wallet.types'
import {
  isApiSuccess,
  parseDepositInitResponse,
  parseMediaFileResponse,
  parsePaymentGatewaysPublicResponse,
  parseWalletDetailResponse,
} from '~/api/utils/api-response'
import AmountInput from '~/components/AmountInput.vue'
import WalletDepositFormSkeleton from '~/components/skeleton/WalletDepositFormSkeleton.vue'
import { showToast } from '~/composables/useToast'
import { getApiErrorCode, getApiErrorMessage } from '~/utils/api-error'
import { handleMediaUploadFailure } from '~/utils/media-upload'
import { getFinanceErrorMessage } from '~/utils/finance'
import { getMediaFullUrl, getMediaPreviewUrl } from '~/utils/media'
import {
  buildGatewayAmountHint,
  savePendingPayment,
  submitPaymentRedirect,
  validateDepositAmount,
} from '~/utils/payments'
import { formatWalletAmount } from '~/utils/wallet'

const wallet = ref<Wallet | null>(null)
const gateways = ref<PaymentGatewayPublic[]>([])
const selectedGatewayId = ref('')
const depositAmount = ref<number | null>(null)
const amountError = ref('')

const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')
const isUploadingReceipt = ref(false)
const isSubmittingReceipt = ref(false)
const receiptError = ref('')
const receiptMediaId = ref('')
const uploadedReceiptName = ref('')
const receiptAmount = ref<number | null>(null)
const receiptInputRef = ref<HTMLInputElement | null>(null)
const receiptUploadPercent = ref(0)
const receiptPreviewUrl = ref('')
const receiptPreviewIsImage = ref(false)
const receiptPreviewIsPdf = ref(false)
const isReceiptDragOver = ref(false)

const selectedGateway = computed(() =>
  gateways.value.find((item) => item.id === selectedGatewayId.value) || null,
)

const amountHint = computed(() => buildGatewayAmountHint(selectedGateway.value))

watch(selectedGatewayId, () => {
  amountError.value = ''
})

function clearReceiptPreview() {
  if (receiptPreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(receiptPreviewUrl.value)
  }
  receiptPreviewUrl.value = ''
  receiptPreviewIsImage.value = false
  receiptPreviewIsPdf.value = false
}

function resetReceiptForm(options?: { clearAmount?: boolean }) {
  receiptMediaId.value = ''
  uploadedReceiptName.value = ''
  receiptUploadPercent.value = 0
  receiptError.value = ''
  clearReceiptPreview()
  if (receiptInputRef.value) receiptInputRef.value.value = ''
  if (options?.clearAmount) {
    receiptAmount.value = null
  }
}

function removeUploadedReceipt() {
  if (isUploadingReceipt.value || isSubmittingReceipt.value) return
  resetReceiptForm()
}

function setReceiptPreviewFromFile(file: File) {
  clearReceiptPreview()
  const isImage = file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  receiptPreviewIsImage.value = isImage
  receiptPreviewIsPdf.value = isPdf
  if (isImage) {
    receiptPreviewUrl.value = URL.createObjectURL(file)
  }
}

function setReceiptPreviewFromMedia(media: MediaFile) {
  if (receiptPreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(receiptPreviewUrl.value)
  }
  receiptPreviewUrl.value = ''
  receiptPreviewIsImage.value = false
  receiptPreviewIsPdf.value = false

  const isPdf =
    media.file_type === 'document' ||
    media.mime_type === 'application/pdf' ||
    media.original_name.toLowerCase().endsWith('.pdf')

  if (media.file_type === 'image') {
    receiptPreviewUrl.value = getMediaFullUrl(media) || getMediaPreviewUrl(media) || ''
    receiptPreviewIsImage.value = !!receiptPreviewUrl.value
    return
  }

  if (isPdf) {
    receiptPreviewIsPdf.value = true
    receiptPreviewUrl.value = media.file_url || ''
  }
}

function isAcceptedReceiptFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  if (file.type === 'application/pdf') return true
  return file.name.toLowerCase().endsWith('.pdf')
}

function preventDocumentFileDrop(event: DragEvent) {
  event.preventDefault()
}

function onReceiptDragEnter(event: DragEvent) {
  event.preventDefault()
  if (isUploadingReceipt.value || isSubmittingReceipt.value) return
  isReceiptDragOver.value = true
}

function onReceiptDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function onReceiptDragLeave(event: DragEvent) {
  event.preventDefault()
  const related = event.relatedTarget as Node | null
  const current = event.currentTarget as HTMLElement | null
  if (current && related && current.contains(related)) return
  isReceiptDragOver.value = false
}

async function onReceiptDrop(event: DragEvent) {
  event.preventDefault()
  isReceiptDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  await uploadReceiptFile(file)
}

async function uploadReceiptFile(file: File) {
  if (isUploadingReceipt.value || isSubmittingReceipt.value) return
  if (!isAcceptedReceiptFile(file)) {
    receiptError.value = 'فرمت فایل مجاز نیست. تصویر یا PDF انتخاب کنید.'
    return
  }

  isUploadingReceipt.value = true
  receiptUploadPercent.value = 0
  receiptError.value = ''
  receiptMediaId.value = ''
  uploadedReceiptName.value = ''
  setReceiptPreviewFromFile(file)
  try {
    const response = await mediaService.uploadMedia(file, (percent) => {
      receiptUploadPercent.value = percent
    })
    const parsed = parseMediaFileResponse(response)
    const id = parsed?.id || (response as { data?: { id?: string } })?.data?.id
    if (!id) {
      receiptError.value = 'آپلود فیش ناموفق بود.'
      clearReceiptPreview()
      return
    }
    receiptMediaId.value = id
    uploadedReceiptName.value = parsed?.original_name || file.name
    if (parsed) {
      setReceiptPreviewFromMedia(parsed)
    }
  } catch (err: unknown) {
    receiptError.value = handleMediaUploadFailure(err, { fallback: 'خطا در آپلود فیش' })
    clearReceiptPreview()
  } finally {
    isUploadingReceipt.value = false
    if (receiptInputRef.value) receiptInputRef.value.value = ''
  }
}

async function onReceiptSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await uploadReceiptFile(file)
}

async function submitWalletDepositReceipt() {
  if (isSubmittingReceipt.value || !wallet.value?.is_active) return
  if (!receiptMediaId.value) {
    receiptError.value = 'لطفاً تصویر فیش را آپلود کنید.'
    return
  }

  const payload: Parameters<typeof financeService.submitManualPayment>[0] = {
    purpose: 'wallet_deposit',
    receipt_media_id: receiptMediaId.value,
  }
  const amount = receiptAmount.value
  if (amount != null && amount > 0) payload.amount = amount

  isSubmittingReceipt.value = true
  receiptError.value = ''
  try {
    const response = await financeService.submitManualPayment(payload)
    if (!isApiSuccess(response)) {
      const code = getApiErrorCode(response)
      receiptError.value = getFinanceErrorMessage(code, getApiErrorMessage(response, 'ارسال فیش ناموفق بود.'))
      return
    }
    showToast({ message: 'فیش ارسال شد و در انتظار تأیید حسابدار است.', variant: 'success' })
    resetReceiptForm({ clearAmount: true })
  } catch (err: unknown) {
    const code = getApiErrorCode(err)
    receiptError.value = getFinanceErrorMessage(code, getApiErrorMessage(err, 'ارسال فیش ناموفق بود.'))
  } finally {
    isSubmittingReceipt.value = false
  }
}

async function fetchPageData() {
  isLoading.value = true
  loadError.value = ''

  try {
    const [walletResponse, gatewaysResponse] = await Promise.all([
      walletService.getMyWallet(),
      paymentsService.listGateways(),
    ])

    wallet.value = parseWalletDetailResponse(walletResponse)
    gateways.value = parsePaymentGatewaysPublicResponse(gatewaysResponse) || []

    if (!wallet.value) {
      loadError.value = 'اطلاعات کیف پول دریافت نشد.'
      return
    }

    if (gateways.value.length > 0) {
      selectedGatewayId.value = gateways.value[0].id
    }
  } catch (err: unknown) {
    loadError.value = getApiErrorMessage(err, 'خطا در بارگذاری اطلاعات پرداخت')
  } finally {
    isLoading.value = false
  }
}

async function startDeposit() {
  if (isSubmitting.value || !wallet.value?.is_active) return

  const amount = depositAmount.value ?? 0
  const validation = validateDepositAmount(amount, selectedGateway.value)
  if (!validation.valid) {
    amountError.value = validation.message || 'مبلغ نامعتبر است.'
    return
  }

  if (!selectedGatewayId.value) {
    amountError.value = 'یک درگاه پرداخت انتخاب کنید.'
    return
  }

  isSubmitting.value = true
  amountError.value = ''

  try {
    const response = await paymentsService.initDeposit({
      gateway_id: selectedGatewayId.value,
      amount,
    })

    const initData = parseDepositInitResponse(response)
    if (!initData) {
      showToast({ message: getApiErrorMessage(response, 'شروع پرداخت ناموفق بود'), variant: 'error' })
      return
    }

    savePendingPayment(initData.order_id, amount)
    submitPaymentRedirect(initData.redirect)
  } catch (err: unknown) {
    showToast({ message: getApiErrorMessage(err, 'خطا در اتصال به درگاه'), variant: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  document.addEventListener('dragover', preventDocumentFileDrop)
  document.addEventListener('drop', preventDocumentFileDrop)
  fetchPageData()
})

onUnmounted(() => {
  document.removeEventListener('dragover', preventDocumentFileDrop)
  document.removeEventListener('drop', preventDocumentFileDrop)
  clearReceiptPreview()
})
</script>
