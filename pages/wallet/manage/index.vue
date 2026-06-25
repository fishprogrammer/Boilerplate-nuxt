<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 class="text-xl font-semibold text-text-primary">مدیریت کیف پول‌ها</h1>
                <div class="flex w-full flex-nowrap gap-1 sm:w-auto sm:flex-wrap sm:gap-1.5">
                    <RouterLink :to="{ name: 'wallet' }" class="btn-muted-sm min-w-0 flex-1 px-2 text-center text-xs sm:flex-none sm:px-3 sm:text-sm">
                        کیف پول من
                    </RouterLink>
                    <RouterLink
                        v-if="canAccessRoute('payment-settings')"
                        :to="{ name: 'payment-settings' }"
                        class="btn-muted-sm min-w-0 flex-1 px-2 text-center text-xs sm:flex-none sm:px-3 sm:text-sm"
                    >
                        تنظیمات
                    </RouterLink>
                    <RouterLink
                        v-if="canAccessRoute('payment-gateways')"
                        :to="{ name: 'payment-gateways' }"
                        class="btn-muted-sm min-w-0 flex-1 px-2 text-center text-xs sm:flex-none sm:px-3 sm:text-sm"
                    >
                        درگاه‌ها
                    </RouterLink>
                    <RouterLink
                        v-if="canAccessRoute('payment-manual-deposit')"
                        :to="{ name: 'payment-manual-deposit' }"
                        class="btn-muted-sm min-w-0 flex-1 px-2 text-center text-xs sm:flex-none sm:px-3 sm:text-sm"
                    >
                        شارژ دستی
                    </RouterLink>
                </div>
            </div>

            <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:gap-2">
                <div class="min-w-0 md:flex-2">
                    <label for="wallet-admin-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <div class="flex overflow-hidden rounded-lg border border-border bg-surface focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 dark:focus-within:border-secondary">
                        <input
                            id="wallet-admin-search"
                            v-model="searchQuery"
                            type="text"
                            autocomplete="off"
                            placeholder="نام مالک، کد ملی..."
                            class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                            :disabled="isFetching"
                            @keydown.enter.prevent="applyFilters"
                        />
                        <button
                            v-if="searchQuery.trim() || appliedSearch"
                            type="button"
                            class="flex shrink-0 items-center justify-center px-2 text-text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
                            :disabled="isFetching"
                            aria-label="پاک کردن جستجو"
                            @click="clearSearch"
                        >
                            <svg
                                class="size-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                                aria-hidden="true"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            class="flex shrink-0 items-center justify-center px-3 text-text-muted transition-colors hover:text-secondary disabled:opacity-50"
                            :disabled="isFetching"
                            aria-label="جستجو"
                            @click="applyFilters"
                        >
                            <svg
                                class="size-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 md:contents">
                    <div class="min-w-0 md:flex-1">
                        <label for="wallet-admin-active" class="mb-1 block text-xs font-medium text-text-primary">وضعیت</label>
                        <select
                            id="wallet-admin-active"
                            v-model="activeFilter"
                            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                            @change="applyFilters"
                        >
                            <option value="">همه</option>
                            <option value="true">فعال</option>
                            <option value="false">غیرفعال</option>
                        </select>
                    </div>
                    <div class="min-w-0 md:flex-1">
                        <label for="wallet-admin-ordering" class="mb-1 block text-xs font-medium text-text-primary">مرتب‌سازی</label>
                        <select
                            id="wallet-admin-ordering"
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

            <div v-if="hasActiveFilters && !isInitialLoading && !loadError" class="mb-4 flex flex-wrap gap-2">
                <span v-if="appliedSearch" class="brand-chip">جستجو: {{ appliedSearch }}</span>
                <span v-if="appliedActiveFilter === 'true'" class="brand-chip">فعال</span>
                <span v-if="appliedActiveFilter === 'false'" class="brand-chip">غیرفعال</span>
                <button
                    type="button"
                    class="text-xs text-text-secondary underline hover:text-text-primary"
                    :disabled="isFetching"
                    @click="resetFilters"
                >
                    پاک کردن فیلترها
                </button>
            </div>

            <WalletsManageTableSkeleton v-if="isInitialLoading" :rows="10" :show-count-bar="false" />

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
                        <WalletsManageTableSkeleton
                            :rows="Math.max(wallets.length, 8)"
                            :show-header="false"
                            :show-count-bar="false"
                        />
                    </div>

                    <table class="w-full min-w-[880px] divide-y divide-border text-sm">
                        <thead class="bg-surface-muted">
                            <tr>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">#</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">مالک</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">شناسه کاربر</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">موجودی</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">وضعیت</th>
                                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-primary">تاریخ ایجاد</th>
                                <th class="whitespace-nowrap px-4 py-3 text-center font-semibold text-text-primary">عملیات</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border/60 bg-surface">
                            <tr v-if="wallets.length === 0">
                                <td colspan="7" class="px-4 py-10 text-center text-text-secondary">
                                    کیف پولی یافت نشد.
                                </td>
                            </tr>
                            <tr v-for="(item, index) in wallets" :key="item.id">
                                <td class="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {{ rowNumber(index) }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                                    {{ formatWalletOwnerDisplay(item) }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-primary dir-ltr text-right">
                                    {{ item.owner || '—' }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 font-semibold text-text-primary">
                                    {{ formatWalletAmount(item.balance) }} ریال
                                </td>
                                <td class="whitespace-nowrap px-4 py-3">
                                    <span
                                        class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                        :class="item.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'"
                                    >
                                        {{ item.is_active ? 'فعال' : 'غیرفعال' }}
                                    </span>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-text-secondary">
                                    {{ formatWalletTransactionDate(item.created_at) }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-center">
                                    <button
                                        type="button"
                                        class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-secondary"
                                        aria-label="مشاهده کیف پول"
                                        v-tooltip="'مشاهده'"
                                        @click="viewWallet(item.id)"
                                    >
                                        <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
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
  name: 'wallet-manage',
  layout: 'dashboard',
})

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { walletService } from '~/api/services/wallet.service'
import type { Wallet } from '~/api/types/wallet.types'
import type { PaginationMeta } from '~/api/types/auth.types'
import { parseWalletsListResponse } from '~/api/utils/api-response'
import AppPagination from '~/components/AppPagination.vue'
import WalletsManageTableSkeleton from '~/components/skeleton/WalletsManageTableSkeleton.vue'
import { usePermissions } from '~/composables/usePermissions'
import { getApiErrorMessage } from '~/utils/api-error'
import {
    formatWalletAmount,
    formatWalletOwnerDisplay,
    formatWalletTransactionDate,
    WALLET_ORDERING_OPTIONS,
} from '~/utils/wallet'

const PAGE_SIZE = 15
const router = useRouter()
const { canAccessRoute } = usePermissions()

const wallets = ref<Wallet[]>([])
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
const activeFilter = ref('')
const ordering = ref('-created_at')

const appliedSearch = ref('')
const appliedActiveFilter = ref('')

const orderingOptions = WALLET_ORDERING_OPTIONS

const hasActiveFilters = computed(() =>
    Boolean(appliedSearch.value || appliedActiveFilter.value),
)

function rowNumber(index: number): number {
    return (pagination.value.page - 1) * pagination.value.page_size + index + 1
}

async function fetchWallets(page = pagination.value.page) {
    isFetching.value = true
    loadError.value = null

    try {
        const response = await walletService.listWallets({
            page,
            page_size: PAGE_SIZE,
            search: appliedSearch.value || undefined,
            ordering: ordering.value || undefined,
            is_active: appliedActiveFilter.value === ''
                ? undefined
                : appliedActiveFilter.value === 'true',
        })

        const parsed = parseWalletsListResponse(response)
        if (!parsed) {
            loadError.value = 'پاسخ سرور نامعتبر است.'
            return
        }

        wallets.value = parsed.wallets
        pagination.value = parsed.pagination
    } catch (err) {
        loadError.value = getApiErrorMessage(err, 'خطا در بارگذاری کیف پول‌ها')
    } finally {
        isInitialLoading.value = false
        isFetching.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedActiveFilter.value = activeFilter.value
    pagination.value.page = 1
    fetchWallets(1)
}

function clearSearch() {
    searchQuery.value = ''
    appliedSearch.value = ''
    pagination.value.page = 1
    fetchWallets(1)
}

function resetFilters() {
    searchQuery.value = ''
    activeFilter.value = ''
    ordering.value = '-created_at'
    appliedSearch.value = ''
    appliedActiveFilter.value = ''
    pagination.value.page = 1
    fetchWallets(1)
}

function goToPage(page: number) {
    pagination.value.page = page
    fetchWallets(page)
}

function viewWallet(id: string) {
    router.push({ name: 'view-wallet', params: { id } })
}

onMounted(() => {
    fetchWallets(1)
})
</script>
