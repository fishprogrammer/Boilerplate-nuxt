<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">جزئیات کیف پول</h1>
                    <p class="mt-1 text-sm text-text-secondary">واریز و برداشت توسط مدیر</p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                </div>
            </div>

            <ViewWalletSkeleton v-if="isLoading" />

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <div v-else-if="wallet" class="space-y-6">
                <div class="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                    <div class="border-b border-border/60 bg-surface-muted/70 px-4 py-2.5">
                        <p class="text-xs font-medium text-text-secondary">اطلاعات کیف پول</p>
                    </div>
                    <div class="grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-2">
                        <div class="bg-surface px-4 py-3.5">
                            <p class="text-xs text-text-muted">مالک</p>
                            <p class="mt-0.5 text-sm font-semibold text-text-primary">{{ formatWalletOwnerDisplay(wallet) }}</p>
                        </div>
                        <div class="bg-surface px-4 py-3.5">
                            <p class="text-xs text-text-muted">شناسه کاربر</p>
                            <p class="mt-0.5 text-sm font-semibold text-text-primary dir-ltr text-right">{{ wallet.owner || '—' }}</p>
                        </div>
                        <div class="bg-surface px-4 py-3.5">
                            <p class="text-xs text-text-muted">موجودی</p>
                            <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                {{ formatWalletAmount(wallet.balance) }} ریال
                            </p>
                        </div>
                        <div class="bg-surface px-4 py-3.5">
                            <p class="text-xs text-text-muted">وضعیت</p>
                            <span
                                class="mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                :class="wallet.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'"
                            >
                                {{ wallet.is_active ? 'فعال' : 'غیرفعال' }}
                            </span>
                        </div>
                        <div class="bg-surface px-4 py-3.5">
                            <p class="text-xs text-text-muted">آخرین به‌روزرسانی</p>
                            <p class="mt-0.5 text-sm font-semibold text-text-primary">
                                {{ formatWalletTransactionDate(wallet.updated_at) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div class="rounded-xl border border-border bg-surface-muted/20 p-4">
                        <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </span>
                            واریز
                        </h2>
                        <form class="flex flex-col gap-3" @submit.prevent="handleDeposit">
                            <div>
                                <label for="deposit-amount" class="mb-1 block text-xs font-medium text-text-secondary">
                                    مبلغ (ریال)
                                </label>
                                <AmountInput
                                    id="deposit-amount"
                                    v-model="depositAmount"
                                    placeholder="مثلاً ۵۰۰٬۰۰۰"
                                    input-class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-right text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                                />
                                <p v-if="depositErrors.amount" class="mt-1 text-xs text-red-600">{{ depositErrors.amount }}</p>
                            </div>
                            <div>
                                <label for="deposit-description" class="mb-1 block text-xs font-medium text-text-secondary">
                                    توضیحات
                                </label>
                                <textarea
                                    id="deposit-description"
                                    v-model="depositForm.description"
                                    rows="2"
                                    class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                                />
                            </div>
                            <div>
                                <label for="deposit-reference" class="mb-1 block text-xs font-medium text-text-secondary">
                                    مرجع
                                </label>
                                <input
                                    id="deposit-reference"
                                    v-model="depositForm.reference"
                                    type="text"
                                    class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                                />
                            </div>
                            <p v-if="depositError" class="text-sm text-red-600">{{ depositError }}</p>
                            <button
                                type="submit"
                                class="btn-action-sm self-start"
                                :disabled="isDepositing"
                            >
                                {{ isDepositing ? 'در حال واریز...' : 'واریز' }}
                            </button>
                        </form>
                    </div>

                    <div class="rounded-xl border border-border bg-surface-muted/20 p-4">
                        <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                                </svg>
                            </span>
                            برداشت
                        </h2>
                        <form class="flex flex-col gap-3" @submit.prevent="handleWithdraw">
                            <div>
                                <label for="withdraw-amount" class="mb-1 block text-xs font-medium text-text-secondary">
                                    مبلغ (ریال)
                                </label>
                                <AmountInput
                                    id="withdraw-amount"
                                    v-model="withdrawAmount"
                                    placeholder="مثلاً ۵۰۰٬۰۰۰"
                                    input-class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-right text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                                />
                                <p v-if="withdrawErrors.amount" class="mt-1 text-xs text-red-600">{{ withdrawErrors.amount }}</p>
                            </div>
                            <div>
                                <label for="withdraw-description" class="mb-1 block text-xs font-medium text-text-secondary">
                                    توضیحات
                                </label>
                                <textarea
                                    id="withdraw-description"
                                    v-model="withdrawForm.description"
                                    rows="2"
                                    class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                                />
                            </div>
                            <div>
                                <label for="withdraw-reference" class="mb-1 block text-xs font-medium text-text-secondary">
                                    مرجع
                                </label>
                                <input
                                    id="withdraw-reference"
                                    v-model="withdrawForm.reference"
                                    type="text"
                                    class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                                />
                            </div>
                            <p v-if="withdrawError" class="text-sm text-red-600">{{ withdrawError }}</p>
                            <button
                                type="submit"
                                class="btn-muted-sm self-start border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                                :disabled="isWithdrawing"
                            >
                                {{ isWithdrawing ? 'در حال برداشت...' : 'برداشت' }}
                            </button>
                        </form>
                    </div>
                </div>

                <div
                    v-if="lastTransaction"
                    class="rounded-xl border border-secondary/30 bg-secondary-muted/10 px-4 py-3 text-sm text-text-primary"
                >
                    <p class="font-semibold">آخرین تراکنش</p>
                    <p class="mt-1">
                        {{ formatWalletTransactionType(lastTransaction.transaction_type) }} —
                        {{ formatSignedWalletAmount(lastTransaction.transaction_type, lastTransaction.amount) }} ریال
                        ({{ formatWalletTransactionStatus(lastTransaction.status) }})
                    </p>
                    <p class="mt-1 text-xs text-text-secondary">
                        موجودی پس از تراکنش: {{ formatWalletAmount(lastTransaction.balance_after) }} ریال
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'view-wallet',
  layout: 'dashboard'
})

import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import ViewWalletSkeleton from '~/components/skeleton/ViewWalletSkeleton.vue'
import AmountInput from '~/components/AmountInput.vue'
import { walletService } from '~/api/services/wallet.service'
import type { Wallet, WalletTransaction } from '~/api/types/wallet.types'
import {
    buildWalletOperationPayload,
    parseWalletDetailResponse,
    parseWalletTransactionDetailResponse,
} from '~/api/utils/api-response'
import { showToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import {
    formatSignedWalletAmount,
    formatWalletAmount,
    formatWalletOwnerDisplay,
    formatWalletTransactionDate,
    formatWalletTransactionStatus,
    formatWalletTransactionType,
    parseWalletAmount,
} from '~/utils/wallet'

const route = useRoute()
const authStore = useAuthStore()

const wallet = ref<Wallet | null>(null)
const lastTransaction = ref<WalletTransaction | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const depositForm = reactive({
    description: '',
    reference: '',
})
const withdrawForm = reactive({
    description: '',
    reference: '',
})
const depositAmount = ref<number | null>(null)
const withdrawAmount = ref<number | null>(null)

const depositErrors = ref<Record<string, string>>({})
const withdrawErrors = ref<Record<string, string>>({})
const depositError = ref<string | null>(null)
const withdrawError = ref<string | null>(null)
const isDepositing = ref(false)
const isWithdrawing = ref(false)

const walletId = () => String(route.params.id || '')

function validateAmount(value: number | null, max?: number): string | null {
    const amount = parseWalletAmount(value ?? 0)
    if (value == null || amount < 1) return 'مبلغ باید عدد صحیح مثبت باشد.'
    if (max !== undefined && amount > max) return 'مبلغ از موجودی بیشتر است.'
    return null
}

async function fetchWallet() {
    const showSkeleton = wallet.value === null
    if (showSkeleton) {
        isLoading.value = true
    }
    loadError.value = null

    try {
        const response = await walletService.getWallet(walletId())
        wallet.value = parseWalletDetailResponse(response)

        if (!wallet.value) {
            loadError.value = 'کیف پول یافت نشد.'
        }
    } catch (err) {
        loadError.value = getApiErrorMessage(err, 'خطا در بارگذاری کیف پول')
    } finally {
        if (showSkeleton) {
            isLoading.value = false
        }
    }
}

async function handleDeposit() {
    depositErrors.value = {}
    depositError.value = null

    const amountError = validateAmount(depositAmount.value)
    if (amountError) {
        depositErrors.value.amount = amountError
        return
    }

    isDepositing.value = true

    try {
        const payload = buildWalletOperationPayload(
            parseWalletAmount(depositAmount.value),
            depositForm.description,
            depositForm.reference,
        )
        const response = await walletService.deposit(walletId(), payload)
        const transaction = parseWalletTransactionDetailResponse(response)

        if (!transaction) {
            depositError.value = 'پاسخ سرور نامعتبر است.'
            return
        }

        lastTransaction.value = transaction
        depositAmount.value = null
        depositForm.description = ''
        depositForm.reference = ''

        showToast({ message: 'واریز با موفقیت انجام شد.', variant: 'success' })
        await fetchWallet()
        await authStore.fetchCurrentUser()
    } catch (err) {
        depositError.value = getApiErrorMessage(err, 'خطا در واریز')
    } finally {
        isDepositing.value = false
    }
}

async function handleWithdraw() {
    withdrawErrors.value = {}
    withdrawError.value = null

    const maxBalance = wallet.value?.balance ?? 0
    const amountError = validateAmount(withdrawAmount.value, maxBalance)
    if (amountError) {
        withdrawErrors.value.amount = amountError
        return
    }

    isWithdrawing.value = true

    try {
        const payload = buildWalletOperationPayload(
            parseWalletAmount(withdrawAmount.value),
            withdrawForm.description,
            withdrawForm.reference,
        )
        const response = await walletService.withdraw(walletId(), payload)
        const transaction = parseWalletTransactionDetailResponse(response)

        if (!transaction) {
            withdrawError.value = 'پاسخ سرور نامعتبر است.'
            return
        }

        lastTransaction.value = transaction
        withdrawAmount.value = null
        withdrawForm.description = ''
        withdrawForm.reference = ''

        showToast({ message: 'برداشت با موفقیت انجام شد.', variant: 'success' })
        await fetchWallet()
        await authStore.fetchCurrentUser()
    } catch (err) {
        withdrawError.value = getApiErrorMessage(err, 'خطا در برداشت')
    } finally {
        isWithdrawing.value = false
    }
}

onMounted(fetchWallet)
</script>
