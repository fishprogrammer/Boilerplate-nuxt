<template>
    <div class="page-shell">
        <div class="page-card-fill">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">دسترسی‌ها</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        مدیریت نقش‌های سیستم و مشاهده دسترسی‌های هر نقش
                    </p>
                </div>
                <RouterLink
                    :to="{ name: 'roles' }"
                    class="btn-muted-sm"
                >
                مشاهده نقش‌ها
                </RouterLink>
            </div>

            <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div class="md:col-span-5">
                    <label for="permission-search" class="mb-1 block text-xs font-medium text-text-primary">جستجو</label>
                    <input
                        id="permission-search"
                        v-model="searchQuery"
                        type="search"
                        placeholder="نام، codename یا اپ..."
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                        @keydown.enter.prevent="applyFilters"
                    />
                </div>
                <div class="md:col-span-3">
                    <label for="permission-app" class="mb-1 block text-xs font-medium text-text-primary">اپلیکیشن</label>
                    <select
                        id="permission-app"
                        v-model="appFilter"
                        class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none input-focus"
                    >
                        <option value="">همه اپ‌ها</option>
                        <option v-for="app in knownApps" :key="app" :value="app">
                            {{ formatAppLabel(app) }}
                        </option>
                    </select>
                </div>
                <div class="flex items-end gap-2 md:col-span-4">
                    <button
                        type="button"
                        class="btn-action"
                        :disabled="isFetching"
                        @click="applyFilters"
                    >
                        اعمال فیلتر
                    </button>
                    <button
                        type="button"
                        class="btn-muted disabled:opacity-50"
                        :disabled="isFetching || !hasActiveFilters"
                        @click="resetFilters"
                    >
                        پاک کردن
                    </button>
                </div>
            </div>

            <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap gap-2">
                <span
                    v-if="appliedSearch"
                    class="brand-chip"
                >
                    جستجو: {{ appliedSearch }}
                </span>
                <span
                    v-if="appliedApp"
                    class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary dark:bg-primary/15 dark:text-primary"
                >
                    اپ: {{ formatAppLabel(appliedApp) }}
                </span>
            </div>

            <PermissionsListSkeleton v-if="isInitialLoading" />

            <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {{ loadError }}
            </div>

            <template v-else>
                <div class="mb-4 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
                    <span>
                        {{ permissions.length }} دسترسی
                        <span v-if="groupedPermissions.length > 0">
                            — {{ groupedPermissions.length }} گروه
                        </span>
                    </span>
                </div>

                <div v-if="permissions.length === 0" class="rounded-xl border border-border px-4 py-12 text-center text-sm text-text-secondary">
                    دسترسی‌ای یافت نشد.
                </div>

                <div v-else class="relative space-y-4">
                    <div
                        v-if="isFetching"
                        class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
                    >
                        <PermissionsListSkeleton
                            :groups="Math.max(groupedPermissions.length, 3)"
                            :rows-per-group="4"
                            :show-count-bar="false"
                        />
                    </div>

                    <section
                        v-for="group in groupedPermissions"
                        :key="group.app"
                        class="overflow-hidden rounded-xl border border-border bg-surface transition-colors"
                    >
                        <header
                            class="flex items-center gap-2 border-b border-border/60 bg-surface-muted/60 px-4 py-3"
                        >
                            <button
                                type="button"
                                class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-right"
                                :aria-expanded="!isGroupCollapsed(group.app)"
                                @click="toggleGroupCollapse(group.app)"
                            >
                                <svg
                                    class="size-4 shrink-0 text-text-muted transition-transform duration-200"
                                    :class="!isGroupCollapsed(group.app) ? 'rotate-180' : ''"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                                <span class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary-muted text-xs font-bold text-secondary-foreground dark:bg-secondary/20 dark:text-secondary">
                                    {{ group.app.slice(0, 2).toUpperCase() }}
                                </span>
                                <div class="min-w-0 flex-1">
                                    <h2 class="truncate text-sm font-semibold text-text-primary">{{ formatAppLabel(group.app) }}</h2>
                                    <p class="truncate text-xs text-text-muted dir-ltr text-right">{{ group.app }}</p>
                                </div>
                                <span class="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs text-text-secondary">
                                    {{ group.items.length }} دسترسی
                                </span>
                            </button>
                        </header>

                        <div v-show="!isGroupCollapsed(group.app)">
                            <div class="overflow-x-auto">
                                <table class="w-full min-w-[640px] divide-y divide-border/60 text-sm">
                                    <thead class="bg-surface-muted/50">
                                        <tr>
                                            <th class="whitespace-nowrap px-4 py-2.5 text-right font-medium text-text-secondary">شناسه</th>
                                            <th class="whitespace-nowrap px-4 py-2.5 text-right font-medium text-text-secondary">نوع</th>
                                            <th class="whitespace-nowrap px-4 py-2.5 text-right font-medium text-text-secondary">codename</th>
                                            <th class="whitespace-nowrap px-4 py-2.5 text-right font-medium text-text-secondary">عنوان</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-border/40">
                                        <tr
                                            v-for="item in paginatedGroupItems(group)"
                                            :key="item.id"
                                            class="hover:bg-surface-hover/50"
                                        >
                                            <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-text-primary">{{ item.id }}</td>
                                            <td class="whitespace-nowrap px-4 py-2.5">
                                                <span
                                                    class="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
                                                    :class="actionBadgeClass(item.codename)"
                                                >
                                                    {{ formatActionLabel(item.codename) }}
                                                </span>
                                            </td>
                                            <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-text-primary dir-ltr text-right">
                                                {{ item.codename }}
                                            </td>
                                            <td class="px-4 py-2.5 text-text-primary">{{ item.name }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <AppPagination
                                v-if="groupTotalPages(group.items.length) > 1"
                                class="border-t border-border/60 px-2 pb-2"
                                :page="getGroupPage(group.app)"
                                :total-pages="groupTotalPages(group.items.length)"
                                :disabled="isFetching"
                                @update:page="(page) => setGroupPage(group.app, page)"
                            />
                        </div>
                    </section>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'permissions',
  layout: 'dashboard'
})


import { computed, onMounted, ref, watch } from 'vue'
import { authService } from '~/api/services/auth.service'
import { parsePermissionsListResponse } from '~/api/utils/api-response'
import type { Permission } from '~/api/types/auth.types'
import AppPagination from '~/components/AppPagination.vue'
import PermissionsListSkeleton from '~/components/skeleton/PermissionsListSkeleton.vue'
import { getApiErrorMessage } from '~/utils/api-error'

const GROUP_PAGE_SIZE = 20
const FETCH_PAGE_SIZE = 100

const APP_LABELS: Record<string, string> = {
    admin: 'مدیریت سیستم',
    auth: 'احراز هویت',
    contenttypes: 'انواع محتوا',
    sessions: 'نشست‌ها',
    users: 'کاربران',
}

const permissions = ref<Permission[]>([])

const searchQuery = ref('')
const appFilter = ref('')
const appliedSearch = ref('')
const appliedApp = ref('')

const isInitialLoading = ref(true)
const isFetching = ref(false)
const loadError = ref<string | null>(null)
const knownApps = ref<string[]>([])
const collapsedGroupApps = ref<Set<string>>(new Set())
const groupPages = ref<Record<string, number>>({})

const hasActiveFilters = computed(() => Boolean(appliedSearch.value || appliedApp.value))

const groupedPermissions = computed(() => {
    const groups = new Map<string, Permission[]>()

    for (const item of permissions.value) {
        const app = item.app || 'unknown'
        const list = groups.get(app) ?? []
        list.push(item)
        groups.set(app, list)
    }

    return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([app, items]) => ({ app, items }))
})

function collapseAllGroups(items: Permission[]) {
    const apps = [...new Set(items.map((item) => item.app || 'unknown'))]
    collapsedGroupApps.value = new Set(apps)
}

function isGroupCollapsed(app: string): boolean {
    return collapsedGroupApps.value.has(app)
}

function toggleGroupCollapse(app: string) {
    const next = new Set(collapsedGroupApps.value)
    if (next.has(app)) {
        next.delete(app)
    } else {
        next.add(app)
    }
    collapsedGroupApps.value = next
}

function getGroupPage(app: string): number {
    return groupPages.value[app] ?? 1
}

function setGroupPage(app: string, page: number) {
    groupPages.value = { ...groupPages.value, [app]: page }
}

function groupTotalPages(itemCount: number): number {
    return Math.max(1, Math.ceil(itemCount / GROUP_PAGE_SIZE))
}

function paginatedGroupItems(group: { app: string; items: Permission[] }): Permission[] {
    const page = getGroupPage(group.app)
    const start = (page - 1) * GROUP_PAGE_SIZE
    return group.items.slice(start, start + GROUP_PAGE_SIZE)
}

function resetGroupPages() {
    groupPages.value = {}
}

watch(
    () => permissions.value,
    (items) => {
        if (items.length > 0) {
            collapseAllGroups(items)
        }
    },
)

function formatAppLabel(app: string): string {
    return APP_LABELS[app] || app
}

function getActionType(codename: string): string {
    const prefix = codename.split('_')[0]
    if (['add', 'change', 'delete', 'view'].includes(prefix)) return prefix
    return 'other'
}

function formatActionLabel(codename: string): string {
    const action = getActionType(codename)
    const labels: Record<string, string> = {
        add: 'افزودن',
        change: 'ویرایش',
        delete: 'حذف',
        view: 'مشاهده',
        other: 'سایر',
    }
    return labels[action] || action
}

function actionBadgeClass(codename: string): string {
    const action = getActionType(codename)
    const classes: Record<string, string> = {
        add: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
        change: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        delete: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        view: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        other: 'bg-surface-muted text-text-secondary',
    }
    return classes[action] || classes.other
}

function collectKnownApps(items: Permission[]) {
    const set = new Set(knownApps.value)
    for (const item of items) {
        if (item.app) set.add(item.app)
    }
    knownApps.value = Array.from(set).sort((a, b) => a.localeCompare(b))
}

async function fetchPermissions() {
    const isFirstLoad = isInitialLoading.value
    isFetching.value = true
    if (!isFirstLoad) loadError.value = null

    try {
        const all: Permission[] = []
        let page = 1
        let totalPages = 1

        while (page <= totalPages) {
            const params: Record<string, string | number> = {
                page,
                page_size: FETCH_PAGE_SIZE,
            }
            if (appliedSearch.value) params.search = appliedSearch.value
            if (appliedApp.value) params.app = appliedApp.value

            const response = await authService.listPermissions(params)
            const parsed = parsePermissionsListResponse(response)

            if (!parsed) {
                loadError.value = 'دریافت لیست دسترسی‌ها با خطا مواجه شد.'
                permissions.value = []
                return
            }

            all.push(...parsed.permissions)
            totalPages = parsed.pagination.total_pages
            page += 1
        }

        permissions.value = all
        collectKnownApps(all)
        resetGroupPages()
        loadError.value = null
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست دسترسی‌ها')
        if (isFirstLoad) permissions.value = []
    } finally {
        isFetching.value = false
        isInitialLoading.value = false
    }
}

function applyFilters() {
    appliedSearch.value = searchQuery.value.trim()
    appliedApp.value = appFilter.value.trim()
    fetchPermissions()
}

function resetFilters() {
    searchQuery.value = ''
    appFilter.value = ''
    appliedSearch.value = ''
    appliedApp.value = ''
    fetchPermissions()
}

onMounted(() => {
    fetchPermissions()
})
</script>
