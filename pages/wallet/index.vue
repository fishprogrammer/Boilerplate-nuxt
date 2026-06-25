<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">کیف پول</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        موجودی و تاریخچه تراکنش‌ها (ریال)
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <span
                        v-if="isWalletLoading"
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
                    <RouterLink
                        v-if="wallet?.is_active"
                        :to="{ name: 'wallet-deposit' }"
                        class="btn-action-sm gap-1.5"
                    >
                        <svg class="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        شارژ کیف پول
                    </RouterLink>
                </div>
            </div>

            <div
                v-if="pageNetworkError"
                class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ pageNetworkError }}
            </div>

            <div
                v-else-if="walletError"
                class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ walletError }}
            </div>

            <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div class="md:col-span-3">
                    <label for="wallet-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <input
                        id="wallet-search"
                        v-model="searchQuery"
                        type="search"
                        placeholder="توضیحات یا مرجع..."
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                        @keydown.enter.prevent="applyFilters"
                    />
                </div>
                <div class="flex gap-2 md:contents">
                    <div class="min-w-0 flex-1 md:col-span-3">
                        <label for="wallet-type" class="mb-1 block text-xs font-medium text-text-primary">نوع</label>
                        <select
                            id="wallet-type"
                            v-model="typeFilter"
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option value="">همه</option>
                            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                    <div class="min-w-0 flex-1 md:col-span-3">
                        <label for="wallet-status" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
                        <select
                            id="wallet-status"
                            v-model="statusFilter"
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option value="">همه</option>
                            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                    <div class="min-w-0 flex-1 md:col-span-3">
                        <label for="wallet-ordering" class="mb-1 block text-xs font-medium text-text-primary">مرتب‌سازی</label>
                        <select
                            id="wallet-ordering"
                            v-model="ordering"
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option v-for="option in orderingOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap gap-2">
                <span v-if="appliedSearch" class="brand-chip">جستجو: {{ appliedSearch }}</span>
                <span v-if="appliedType" class="brand-chip">نوع: {{ formatWalletTransactionType(appliedType) }}</span>
                <span v-if="appliedStatus" class="brand-chip">وضعیت: {{ formatWalletTransactionStatus(appliedStatus) }}</span>
                <button
                    type="button"
                    class="text-xs text-text-secondary underline hover:text-text-primary"
                    :disabled="isFetching"
                    @click="resetFilters"
                >
                    پاک کردن فیلترها
                </button>
            </div>

            <WalletTransactionsTableSkeleton v-if="isInitialLoading" :rows="10" />

            <div
                v-else-if="loadError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
                {{ loadError }}
            </div>

            <template v-else>
                <div class="relative w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border">
                    <div
                        v-if="isFetching"
                        class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
                    >
                        <WalletTransactionsTableSkeleton
                            :rows="Math.max(transactions.length, 8)"
                            :show-header="false"
                        />
                    </div>

                    <table class="w-full min-w-[760px] divide-y divide-border text-sm">
                        <thead class="bg-surface-muted">
                            <tr>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">نوع</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">مبلغ</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">موجودی پس از تراکنش</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">وضعیت</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">توضیحات</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">تاریخ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border/60 bg-surface">
                            <tr v-if="transactions.length === 0">
                                <td colspan="6" class="px-4 py-10 text-center text-text-secondary">
                                    تراکنشی یافت نشد.
                                </td>
                            </tr>
                            <tr v-for="item in transactions" :key="item.id">
                                <td class="whitespace-nowrap px-4 py-3 text-text-primary">
                                    {{ formatWalletTransactionType(item.transaction_type) }}
                                </td>
                                <td
                                    class="whitespace-nowrap px-4 py-3 font-semibold"
                                    :class="getWalletTransactionTypeClass(item.transaction_type)"
                                >
                                    {{ formatSignedWalletAmount(item.transaction_type, item.amount) }} ریال
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-primary">
                                    {{ formatWalletAmount(item.balance_after) }} ریال
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <span
                                        class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                        :class="getWalletTransactionStatusClass(item.status)"
                                    >
                                        {{ formatWalletTransactionStatus(item.status) }}
                                    </span>
                                </td>
                                <td class="max-w-[220px] px-4 py-3 text-text-secondary">
                                    <p class="truncate">{{ item.description || '—' }}</p>
                                    <p v-if="item.reference" class="mt-0.5 truncate text-xs text-text-muted">
                                        مرجع: {{ item.reference }}
                                    </p>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {{ formatWalletTransactionDate(item.created_at) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <AppPagination
                    :page="pagination.page"
                    :total-pages="pagination.total_pages"
                    :disabled="isFetching"
                    @update:page="goToPage"
                />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'wallet',
  layout: 'dashboard'
})

import { computed, onMounted, ref } from 'vue'
import { walletService } from '~/api/services/wallet.service'
import type { Wallet, WalletTransaction, WalletTransactionStatus, WalletTransactionType } from '~/api/types/wallet.types'
import type { PaginationMeta } from '~/api/types/auth.types'
import {
    parseWalletDetailResponse,
    parseWalletTransactionsListResponse,
} from '~/api/utils/api-response'
import AppPagination from '~/components/AppPagination.vue'
import WalletTransactionsTableSkeleton from '~/components/skeleton/WalletTransactionsTableSkeleton.vue'
import { getApiErrorMessage, isNetworkError, NETWORK_ERROR_MESSAGE } from '~/utils/api-error'
import {
    formatSignedWalletAmount,
    formatWalletAmount,
    formatWalletTransactionDate,
    formatWalletTransactionStatus,
    formatWalletTransactionType,
    getWalletTransactionStatusClass,
    getWalletTransactionTypeClass,
    WALLET_TRANSACTION_ORDERING_OPTIONS,
    WALLET_TRANSACTION_STATUS_OPTIONS,
    WALLET_TRANSACTION_TYPE_OPTIONS,
} from '~/utils/wallet'

const PAGE_SIZE = 15

const wallet = ref<Wallet | null>(null)
const isWalletLoading = ref(true)
const walletError = ref<string | null>(null)
const pageNetworkError = ref<string | null>(null)

const transactions = ref<WalletTransaction[]>([])
const pagination = ref<PaginationMeta>({
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
    total_items: 0,
    next: null,
    previous: null,
})

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)

const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const ordering = ref('-created_at')

const appliedSearch = ref('')
const appliedType = ref('')
const appliedStatus = ref('')

const typeOptions = WALLET_TRANSACTION_TYPE_OPTIONS
const statusOptions = WALLET_TRANSACTION_STATUS_OPTIONS
const orderingOptions = WALLET_TRANSACTION_ORDERING_OPTIONS

const hasActiveFilters = computed(() =>
    Boolean(appliedSearch.value || appliedType.value || appliedStatus.value),
)

function resolveFetchError(err: unknown, fallback: string): string | null {
    if (isNetworkError(err)) {
        if (!pageNetworkError.value) {
            pageNetworkError.value = NETWORK_ERROR_MESSAGE
        }
        return null
    }

    return getApiErrorMessage(err, fallback)
}

async function fetchWallet() {
    isWalletLoading.value = true
    walletError.value = null

    try {
        const response = await walletService.getMyWallet()
        wallet.value = parseWalletDetailResponse(response)

        if (!wallet.value) {
            walletError.value = 'اطلاعات کیف پول دریافت نشد.'
        } else {
            pageNetworkError.value = null
        }
    } catch (err) {
        walletError.value = resolveFetchError(err, 'خطا در بارگذاری کیف پول')
    } finally {
        isWalletLoading.value = false
    }
}

async function fetchTransactions(page = pagination.value.page) {
    isFetching.value = true
    loadError.value = null

    try {
        const response = await walletService.listMyTransactions({
            page,
            page_size: PAGE_SIZE,
            search: appliedSearch.value || undefined,
            transaction_type: (appliedType.value || undefined) as WalletTransactionType | undefined,
            status: (appliedStatus.value || undefined) as WalletTransactionStatus | undefined,
            ordering: ordering.value || undefined,
        })

        const parsed = parseWalletTransactionsListResponse(response)
        if (!parsed) {
            loadError.value = 'پاسخ سرور نامعتبر است.'
            return
        }

        transactions.value = parsed.transactions
        pagination.value = parsed.pagination
        pageNetworkError.value = null
    } catch (err) {
        loadError.value = resolveFetchError(err, 'خطا در بارگذاری تراکنش‌ها')
    } finally {
        isInitialLoading.value = false
        isFetching.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedType.value = typeFilter.value
    appliedStatus.value = statusFilter.value
    pagination.value.page = 1
    fetchTransactions(1)
}

function resetFilters() {
    searchQuery.value = ''
    typeFilter.value = ''
    statusFilter.value = ''
    ordering.value = '-created_at'
    appliedSearch.value = ''
    appliedType.value = ''
    appliedStatus.value = ''
    pagination.value.page = 1
    fetchTransactions(1)
}

function goToPage(page: number) {
    pagination.value.page = page
    fetchTransactions(page)
}

onMounted(async () => {
    await fetchWallet()
    await fetchTransactions(1)
})
</script>
