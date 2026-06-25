<template>
    <div class="page-shell">
        <div class="page-card">
            <div class="mb-6 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-text-primary">ارسال اعلان جدید</h1>
                    <p class="mt-1 text-sm text-text-secondary">
                        ارسال اعلان به کاربران مشخص، نقش‌ها یا همه کاربران فعال
                    </p>
                </div>
                <div class="page-header-actions">
                    <BackIconButton />
                </div>
            </div>

            <form @submit.prevent="submitSend" class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-4 rounded-xl border border-border bg-surface-muted p-4 md:col-span-2">
                    <h2 class="text-sm font-semibold text-text-primary">محتوای اعلان</h2>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div class="sm:col-span-1">
                            <label for="notif-title" class="mb-1 block text-xs font-medium text-text-primary">عنوان</label>
                            <input
                                id="notif-title"
                                v-model="title"
                                type="text"
                                maxlength="255"
                                placeholder="عنوان اعلان"
                                :class="inputClass('title')"
                                @input="clearFieldError('title')"
                            />
                            <p v-if="fieldErrors.title" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.title }}</p>
                        </div>
                        <div>
                            <label for="notif-type" class="mb-1 block text-xs font-medium text-text-primary">نوع اعلان</label>
                            <select
                                id="notif-type"
                                v-model="notificationType"
                                :class="inputClass('notification_type')"
                                @change="clearFieldError('notification_type')"
                            >
                                <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                            <p v-if="fieldErrors.notification_type" class="mt-1 text-xs text-red-600 dark:text-red-400">
                                {{ fieldErrors.notification_type }}
                            </p>
                        </div>
                        <div>
                            <label for="notif-priority" class="mb-1 block text-xs font-medium text-text-primary">اولویت</label>
                            <select
                                id="notif-priority"
                                v-model="priority"
                                :class="inputClass('priority')"
                                @change="clearFieldError('priority')"
                            >
                                <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                            <p v-if="fieldErrors.priority" class="mt-1 text-xs text-red-600 dark:text-red-400">
                                {{ fieldErrors.priority }}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label for="notif-body" class="mb-1 block text-xs font-medium text-text-primary">متن</label>
                        <textarea
                            id="notif-body"
                            v-model="body"
                            rows="6"
                            placeholder="متن اعلان..."
                            :class="textareaClass('body')"
                            @input="clearFieldError('body')"
                        />
                        <p v-if="fieldErrors.body" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.body }}</p>
                    </div>

                    <div>
                        <label for="notif-action-url" class="mb-1 block text-xs font-medium text-text-primary">
                            لینک اقدام
                            <span class="font-normal text-text-muted">(اختیاری)</span>
                        </label>
                        <input
                            id="notif-action-url"
                            v-model="actionUrl"
                            type="url"
                            dir="ltr"
                            maxlength="500"
                            placeholder="https://example.com/page"
                            :class="inputClass('action_url', true)"
                            @input="clearFieldError('action_url')"
                        />
                        <p v-if="fieldErrors.action_url" class="mt-1 text-xs text-red-600 dark:text-red-400">
                            {{ fieldErrors.action_url }}
                        </p>
                    </div>
                </div>

                <div class="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
                    <h2 class="text-sm font-semibold text-text-primary">تنظیمات ارسال</h2>

                    <div class="space-y-2">
                        <label
                            v-for="option in targetingOptions"
                            :key="option.value"
                            class="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-3 transition-colors"
                            :class="targetingMode === option.value ? 'border-primary/40 ring-1 ring-primary/20' : ''"
                        >
                            <input
                                v-model="targetingMode"
                                type="radio"
                                name="send-targeting"
                                class="mt-0.5 size-4 shrink-0 accent-primary"
                                :value="option.value"
                                @change="onTargetingModeChange"
                            />
                            <span>
                                <span class="block text-sm font-medium text-text-primary">{{ option.label }}</span>
                                <span class="mt-0.5 block text-xs text-text-secondary">{{ option.description }}</span>
                            </span>
                        </label>
                    </div>

                    <div class="rounded-lg border border-border/60 bg-surface px-3 py-2.5 text-xs text-text-secondary">
                        <template v-if="targetingMode === 'all'">
                            ارسال گروهی به همه کاربران فعال
                        </template>
                        <template v-else-if="targetingMode === 'roles'">
                            {{ selectedRoleSlugs.length }} نقش انتخاب شده
                            <span class="text-text-muted">— {{ roles.length }} نقش در دسترس</span>
                        </template>
                        <template v-else>
                            {{ selectedRecipientIds.length }} کاربر انتخاب شده
                            <span class="text-text-muted">
                                — {{ users.length }} از {{ usersTotalItems }} بارگذاری‌شده
                            </span>
                        </template>
                    </div>
                </div>

                <div
                    v-if="showRecipientsCard"
                    class="overflow-hidden rounded-xl border border-border bg-surface-muted md:col-span-3"
                >
                    <button
                        type="button"
                        class="flex w-full cursor-pointer items-center gap-2 border-b px-4 py-3 transition-colors [direction:ltr]"
                        :class="recipientsCollapsed ? 'border-transparent' : 'border-border/60'"
                        :aria-expanded="!recipientsCollapsed"
                        @click="toggleRecipientsCollapse"
                    >
                        <svg
                            class="size-4 shrink-0 text-text-muted transition-transform duration-200"
                            :class="!recipientsCollapsed ? 'rotate-180' : ''"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <div class="min-w-0 flex-1 text-right [direction:rtl]">
                            <h2 class="text-sm font-semibold text-text-primary">گیرندگان</h2>
                            <p class="mt-0.5 text-xs text-text-secondary">
                                {{ selectedRecipientIds.length }} کاربر انتخاب شده
                                <span class="text-text-muted">— جستجو کنید یا اسکرول کنید</span>
                            </p>
                        </div>
                    </button>

                    <div v-show="!recipientsCollapsed" class="p-4 pt-3">
                    <input
                        v-model="userSearch"
                        type="search"
                        placeholder="جستجو در نام کاربری، نام، ایمیل یا تلفن..."
                        class="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                        @keydown.enter.prevent="applyUserSearch"
                    />

                    <p v-if="fieldErrors.recipients" class="mb-3 text-xs text-red-600 dark:text-red-400">
                        {{ fieldErrors.recipients }}
                    </p>

                    <div
                        v-if="usersLoadError && users.length === 0"
                        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                    >
                        {{ usersLoadError }}
                    </div>

                    <SendNotificationRecipientsSkeleton
                        v-else-if="isInitialUsersLoading"
                        :rows="8"
                    />

                    <div v-else-if="users.length === 0" class="py-8 text-center text-sm text-text-secondary">
                        کاربری یافت نشد.
                    </div>

                    <div
                        v-else
                        ref="recipientsScrollRef"
                        class="relative max-h-72 overflow-x-auto overflow-y-auto rounded-xl border border-border bg-surface"
                        @scroll="onRecipientsScroll"
                    >
                        <div
                            v-if="isRefetchingUsers"
                            class="absolute inset-0 z-10 overflow-hidden rounded-xl bg-surface/80 backdrop-blur-[1px]"
                        >
                            <SendNotificationRecipientsSkeleton
                                :rows="Math.max(users.length, 6)"
                                :show-header="false"
                            />
                        </div>

                        <table class="w-full divide-y divide-border/60 text-sm">
                            <thead class="sticky top-0 z-20 bg-surface-muted">
                                <tr>
                                    <th class="w-10 px-3 py-2.5" />
                                    <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">نام کاربری</th>
                                    <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">نام</th>
                                    <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">ایمیل</th>
                                    <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">تلفن</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border/40">
                                <tr
                                    v-for="user in users"
                                    :key="user.id"
                                    class="hover:bg-surface-hover/40"
                                >
                                    <td class="px-3 py-2.5">
                                        <input
                                            type="checkbox"
                                            class="size-4 accent-primary"
                                            :checked="isRecipientSelected(user.id)"
                                            @change="toggleRecipient(user.id)"
                                        />
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-2.5 text-text-primary dir-ltr text-right">
                                        {{ user.username || '—' }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-2.5 text-text-primary">
                                        {{ formatUserName(user) }}
                                    </td>
                                    <td class="max-w-40 truncate px-3 py-2.5 text-text-primary dir-ltr text-right">
                                        {{ user.email || '—' }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-2.5 text-text-primary dir-ltr text-right">
                                        {{ user.phone_number || '—' }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div
                            v-if="isLoadingMoreUsers"
                            class="flex items-center gap-3 border-t border-border/60 px-3 py-3"
                        >
                            <SkeletonBlock block-class="size-4 shrink-0 rounded" />
                            <SkeletonBlock block-class="h-4 flex-1 max-w-24" />
                            <SkeletonBlock block-class="h-4 flex-1 max-w-20" />
                            <SkeletonBlock block-class="hidden h-4 flex-1 max-w-32 sm:block" />
                            <SkeletonBlock block-class="hidden h-4 flex-1 max-w-28 sm:block" />
                        </div>
                        <div
                            v-else-if="hasMoreUsers"
                            class="border-t border-border/60 py-2 text-center text-xs text-text-muted"
                        >
                            برای بارگذاری بیشتر اسکرول کنید
                        </div>
                    </div>
                    </div>
                </div>

                <div
                    v-if="showRolesCard"
                    class="overflow-hidden rounded-xl border border-border bg-surface-muted md:col-span-3"
                >
                    <button
                        type="button"
                        class="flex w-full cursor-pointer items-center gap-2 border-b px-4 py-3 transition-colors [direction:ltr]"
                        :class="rolesCollapsed ? 'border-transparent' : 'border-border/60'"
                        :aria-expanded="!rolesCollapsed"
                        @click="toggleRolesCollapse"
                    >
                        <svg
                            class="size-4 shrink-0 text-text-muted transition-transform duration-200"
                            :class="!rolesCollapsed ? 'rotate-180' : ''"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <div class="min-w-0 flex-1 text-right [direction:rtl]">
                            <h2 class="text-sm font-semibold text-text-primary">نقش‌ها</h2>
                            <p class="mt-0.5 text-xs text-text-secondary">
                                {{ selectedRoleSlugs.length }} نقش انتخاب شده
                                <span class="text-text-muted">— جستجو کنید یا نقش‌ها را تیک بزنید</span>
                            </p>
                        </div>
                    </button>

                    <div v-show="!rolesCollapsed" class="p-4 pt-3">
                        <input
                            v-model="roleSearch"
                            type="search"
                            placeholder="جستجو در نام نقش یا شناسه..."
                            class="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted input-focus"
                        />

                        <p v-if="fieldErrors.roles" class="mb-3 text-xs text-red-600 dark:text-red-400">
                            {{ fieldErrors.roles }}
                        </p>

                        <div
                            v-if="rolesLoadError && roles.length === 0"
                            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                        >
                            {{ rolesLoadError }}
                        </div>

                        <div v-else-if="isLoadingRoles" class="py-8 text-center text-sm text-text-muted">
                            در حال بارگذاری نقش‌ها...
                        </div>

                        <div v-else-if="filteredRoles.length === 0" class="py-8 text-center text-sm text-text-secondary">
                            نقشی یافت نشد.
                        </div>

                        <div
                            v-else
                            class="max-h-72 overflow-x-auto overflow-y-auto rounded-xl border border-border bg-surface"
                        >
                            <table class="w-full divide-y divide-border/60 text-sm">
                                <thead class="sticky top-0 z-20 bg-surface-muted">
                                    <tr>
                                        <th class="w-10 px-3 py-2.5" />
                                        <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">نام نقش</th>
                                        <th class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-text-secondary">شناسه</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-border/40">
                                    <tr
                                        v-for="role in filteredRoles"
                                        :key="role.id"
                                        class="hover:bg-surface-hover/40"
                                    >
                                        <td class="px-3 py-2.5">
                                            <input
                                                type="checkbox"
                                                class="size-4 accent-primary"
                                                :checked="isRoleSelected(role.name)"
                                                @change="toggleRole(role.name)"
                                            />
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-2.5 text-text-primary">
                                            {{ formatRoleDisplayName(role) }}
                                        </td>
                                        <td class="whitespace-nowrap px-3 py-2.5 text-text-muted dir-ltr text-right">
                                            {{ role.name }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 md:col-span-3">
                    <button
                        type="submit"
                        :disabled="isSaving"
                        class="btn-action-sm"
                    >
                        {{ isSaving ? 'در حال ارسال...' : 'ارسال اعلان' }}
                    </button>
                    <RouterLink
                        :to="{ name: 'notifications' }"
                        class="btn-muted-sm"
                    >
                        انصراف
                    </RouterLink>
                </div>

                <div
                    v-if="saveError || hasFieldErrors"
                    class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/40 md:col-span-3"
                >
                    <p v-if="saveError" class="text-sm font-medium text-red-700 dark:text-red-300">{{ saveError }}</p>
                    <ul v-if="hasFieldErrors" class="mt-2 list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-400">
                        <li v-for="(message, field) in fieldErrors" :key="field">
                            <span class="font-medium">{{ fieldLabel(field) }}:</span>
                            {{ message }}
                        </li>
                    </ul>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'send-notification',
  layout: 'dashboard'
})


import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '~/api/services/auth.service'
import { inboxService } from '~/api/services/inbox.service'
import {
    buildSendNotificationPayload,
    parseRolesListResponse,
    parseSendNotificationResponse,
    parseUsersListResponse,
} from '~/api/utils/api-response'
import type { Role, UserProfile } from '~/api/types/auth.types'
import type { NotificationPriority, NotificationType } from '~/api/types/inbox.types'
import SendNotificationRecipientsSkeleton from '~/components/skeleton/SendNotificationRecipientsSkeleton.vue'
import SkeletonBlock from '~/components/skeleton/SkeletonBlock.vue'
import { showToast } from '~/composables/useToast'
import { API_FIELD_LABELS, extractApiFieldErrors, getApiErrorMessage, getApiResponseMessage } from '~/utils/api-error'
import {
    DEFAULT_NOTIFICATION_PRIORITY,
    DEFAULT_NOTIFICATION_TYPE,
    NOTIFICATION_ACTION_URL_MAX_LENGTH,
    NOTIFICATION_PRIORITY_OPTIONS,
    NOTIFICATION_TITLE_MAX_LENGTH,
    NOTIFICATION_TYPE_OPTIONS,
} from '~/utils/inbox'
import { formatRoleDisplayName } from '~/utils/user-roles'

type TargetingMode = 'recipients' | 'roles' | 'all'

const targetingOptions: { value: TargetingMode; label: string; description: string }[] = [
    {
        value: 'recipients',
        label: 'کاربران مشخص',
        description: 'انتخاب یک یا چند کاربر از لیست به‌عنوان گیرنده.',
    },
    {
        value: 'roles',
        label: 'نقش‌ها',
        description: 'ارسال به کاربران فعال هر نقش انتخاب‌شده (منطق OR).',
    },
    {
        value: 'all',
        label: 'همه کاربران فعال',
        description: 'بدون انتخاب گیرنده یا نقش؛ اعلان به تمام کاربران فعال ارسال می‌شود.',
    },
]

const router = useRouter()

const RECIPIENTS_PAGE_SIZE = 20
const SCROLL_LOAD_THRESHOLD = 48
const SEARCH_DEBOUNCE_MS = 350

const typeOptions = NOTIFICATION_TYPE_OPTIONS
const priorityOptions = NOTIFICATION_PRIORITY_OPTIONS

const users = ref<UserProfile[]>([])
const usersPage = ref(1)
const usersTotalPages = ref(1)
const usersTotalItems = ref(0)
const selectedRecipientIds = ref<number[]>([])
const recipientsScrollRef = ref<HTMLElement | null>(null)
const userSearch = ref('')
const appliedSearch = ref('')
const title = ref('')
const body = ref('')
const notificationType = ref<NotificationType>(DEFAULT_NOTIFICATION_TYPE)
const priority = ref<NotificationPriority>(DEFAULT_NOTIFICATION_PRIORITY)
const actionUrl = ref('')
const targetingMode = ref<TargetingMode>('recipients')
const selectedRoleSlugs = ref<string[]>([])
const roles = ref<Role[]>([])
const roleSearch = ref('')
const recipientsCollapsed = ref(false)
const rolesCollapsed = ref(true)

const isLoadingUsers = ref(false)
const isLoadingMoreUsers = ref(false)
const isLoadingRoles = ref(false)
const isSaving = ref(false)
const usersLoadError = ref<string | null>(null)
const rolesLoadError = ref<string | null>(null)
const saveError = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string>>({})

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const fieldClass =
    'w-full h-10 rounded-lg border border-border px-3 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus'

const textareaClassBase =
    'w-full rounded-lg border border-border px-3 py-2 bg-surface text-sm text-text-primary placeholder:text-text-muted box-border outline-none input-focus resize-y min-h-32'

const hasFieldErrors = computed(() => Object.keys(fieldErrors).length > 0)

const showRecipientsCard = computed(() => targetingMode.value === 'recipients')
const showRolesCard = computed(() => targetingMode.value === 'roles')

const isInitialUsersLoading = computed(() => isLoadingUsers.value && users.value.length === 0)

const isRefetchingUsers = computed(
    () => isLoadingUsers.value && users.value.length > 0 && !isLoadingMoreUsers.value,
)

const hasMoreUsers = computed(() => usersPage.value < usersTotalPages.value)

const filteredRoles = computed(() => {
    const query = roleSearch.value.trim().toLowerCase()
    if (!query) return roles.value
    return roles.value.filter((role) => {
        const name = formatRoleDisplayName(role).toLowerCase()
        const slug = role.name.toLowerCase()
        return name.includes(query) || slug.includes(query)
    })
})

function fieldLabel(field: string): string {
    return API_FIELD_LABELS[field] || field
}

function inputClass(field: string, ltr = false): string {
    const base = fieldErrors[field]
        ? `${fieldClass} border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : fieldClass
    return ltr ? `${base} dir-ltr text-right` : base
}

function textareaClass(field: string): string {
    return fieldErrors[field]
        ? `${textareaClassBase} border-red-400 focus:border-red-500 focus:ring-red-500/20`
        : textareaClassBase
}

function formatUserName(user: UserProfile): string {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    return fullName || '—'
}

function clearFieldErrors() {
    for (const key of Object.keys(fieldErrors)) {
        delete fieldErrors[key]
    }
}

function clearFieldError(field: string) {
    delete fieldErrors[field]
}

function normalizeUserId(id: number | string | undefined): number | undefined {
    if (id === undefined || id === null) return undefined
    const num = typeof id === 'number' ? id : Number(id)
    return Number.isFinite(num) ? num : undefined
}

function isRecipientSelected(id: number | string | undefined): boolean {
    const normalized = normalizeUserId(id)
    if (normalized === undefined) return false
    return selectedRecipientIds.value.includes(normalized)
}

function toggleRecipient(id: number | string | undefined) {
    if (targetingMode.value !== 'recipients') return

    const normalized = normalizeUserId(id)
    if (normalized === undefined) return

    if (isRecipientSelected(normalized)) {
        selectedRecipientIds.value = selectedRecipientIds.value.filter((item) => item !== normalized)
    } else {
        selectedRecipientIds.value = [...selectedRecipientIds.value, normalized]
    }
    clearFieldError('recipients')
}

function isRoleSelected(slug: string): boolean {
    return selectedRoleSlugs.value.includes(slug)
}

function toggleRole(slug: string) {
    if (targetingMode.value !== 'roles') return

    if (isRoleSelected(slug)) {
        selectedRoleSlugs.value = selectedRoleSlugs.value.filter((item) => item !== slug)
    } else {
        selectedRoleSlugs.value = [...selectedRoleSlugs.value, slug]
    }
    clearFieldError('roles')
}

function onTargetingModeChange() {
    clearFieldError('recipients')
    clearFieldError('roles')
    saveError.value = null

    if (targetingMode.value === 'recipients') {
        recipientsCollapsed.value = false
        rolesCollapsed.value = true
    } else if (targetingMode.value === 'roles') {
        recipientsCollapsed.value = true
        rolesCollapsed.value = false
    }
}

function toggleRolesCollapse() {
    rolesCollapsed.value = !rolesCollapsed.value
}

function toggleRecipientsCollapse() {
    recipientsCollapsed.value = !recipientsCollapsed.value
}

watch(userSearch, () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
        applyUserSearch()
    }, SEARCH_DEBOUNCE_MS)
})

function mergeUsers(existing: UserProfile[], incoming: UserProfile[]): UserProfile[] {
    const map = new Map<number, UserProfile>()
    for (const user of existing) {
        const id = normalizeUserId(user.id)
        if (id !== undefined) map.set(id, user)
    }
    for (const user of incoming) {
        const id = normalizeUserId(user.id)
        if (id !== undefined) map.set(id, user)
    }
    return Array.from(map.values())
}

async function fetchUsersPage(page: number, options: { append?: boolean } = {}) {
    const append = options.append === true

    if (append) {
        if (!hasMoreUsers.value || isLoadingMoreUsers.value || isLoadingUsers.value) return
        isLoadingMoreUsers.value = true
    } else {
        isLoadingUsers.value = true
        usersLoadError.value = null
    }

    try {
        const params: { page: number; page_size: number; search?: string } = {
            page,
            page_size: RECIPIENTS_PAGE_SIZE,
        }
        if (appliedSearch.value) params.search = appliedSearch.value

        const response = await authService.listUsers(params)
        const parsed = parseUsersListResponse(response)
        if (!parsed) {
            if (!append) {
                usersLoadError.value = 'دریافت لیست کاربران با خطا مواجه شد.'
                users.value = []
            }
            return
        }

        users.value = append ? mergeUsers(users.value, parsed.users) : parsed.users
        usersPage.value = parsed.pagination.page
        usersTotalPages.value = parsed.pagination.total_pages
        usersTotalItems.value = parsed.pagination.total_items
    } catch (err: unknown) {
        if (!append) {
            usersLoadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست کاربران')
            users.value = []
        }
    } finally {
        isLoadingUsers.value = false
        isLoadingMoreUsers.value = false
        if (hasMoreUsers.value) {
            await nextTick()
            checkAndLoadMoreIfNeeded()
        }
    }
}

function checkAndLoadMoreIfNeeded() {
    const el = recipientsScrollRef.value
    if (!el || !hasMoreUsers.value || isLoadingMoreUsers.value || isLoadingUsers.value) return
    if (el.scrollHeight <= el.clientHeight + SCROLL_LOAD_THRESHOLD) {
        loadMoreUsers()
    }
}

function loadMoreUsers() {
    if (!hasMoreUsers.value || isLoadingMoreUsers.value || isLoadingUsers.value) return
    fetchUsersPage(usersPage.value + 1, { append: true })
}

function onRecipientsScroll(event: Event) {
    const el = event.target as HTMLElement
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceToBottom <= SCROLL_LOAD_THRESHOLD) {
        loadMoreUsers()
    }
}

async function fetchAllRoles() {
    isLoadingRoles.value = true
    rolesLoadError.value = null

    try {
        const all: Role[] = []
        let page = 1
        let totalPages = 1

        while (page <= totalPages) {
            const response = await authService.listRoles({ page, page_size: 100 })
            const parsed = parseRolesListResponse(response)
            if (!parsed) {
                rolesLoadError.value = 'دریافت لیست نقش‌ها با خطا مواجه شد.'
                roles.value = []
                return
            }

            all.push(...parsed.roles)
            totalPages = parsed.pagination.total_pages
            page += 1
        }

        roles.value = all
    } catch (err: unknown) {
        rolesLoadError.value = getApiErrorMessage(err, 'خطا در دریافت لیست نقش‌ها')
        roles.value = []
    } finally {
        isLoadingRoles.value = false
    }
}

function applyUserSearch() {
    const nextSearch = userSearch.value.trim()
    if (nextSearch === appliedSearch.value && users.value.length > 0) return

    appliedSearch.value = nextSearch
    usersPage.value = 1
    usersTotalPages.value = 1
    usersTotalItems.value = 0
    fetchUsersPage(1)
}

function applyApiErrors(err: unknown) {
    clearFieldErrors()
    Object.assign(fieldErrors, extractApiFieldErrors(err))

    if (Object.keys(fieldErrors).length > 0) {
        saveError.value = getApiResponseMessage(err, 'اعتبارسنجی ناموفق بود')
        return
    }

    saveError.value = getApiErrorMessage(err, 'خطا در ارسال اعلان')
}

onMounted(() => {
    fetchUsersPage(1)
    void fetchAllRoles()
})

onBeforeUnmount(() => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})

async function submitSend() {
    saveError.value = null
    clearFieldErrors()

    if (targetingMode.value === 'recipients' && selectedRecipientIds.value.length === 0) {
        fieldErrors.recipients = 'حداقل یک گیرنده انتخاب کنید.'
        saveError.value = fieldErrors.recipients
        return
    }

    if (targetingMode.value === 'roles' && selectedRoleSlugs.value.length === 0) {
        fieldErrors.roles = 'حداقل یک نقش انتخاب کنید.'
        saveError.value = fieldErrors.roles
        return
    }

    if (!title.value.trim()) {
        fieldErrors.title = 'عنوان الزامی است.'
        saveError.value = 'عنوان الزامی است.'
        return
    }

    if (title.value.trim().length > NOTIFICATION_TITLE_MAX_LENGTH) {
        fieldErrors.title = `عنوان حداکثر ${NOTIFICATION_TITLE_MAX_LENGTH} کاراکتر مجاز است.`
        saveError.value = fieldErrors.title
        return
    }

    if (!body.value.trim()) {
        fieldErrors.body = 'متن اعلان الزامی است.'
        saveError.value = 'متن اعلان الزامی است.'
        return
    }

    if (actionUrl.value.trim().length > NOTIFICATION_ACTION_URL_MAX_LENGTH) {
        fieldErrors.action_url = `لینک اقدام حداکثر ${NOTIFICATION_ACTION_URL_MAX_LENGTH} کاراکتر مجاز است.`
        saveError.value = fieldErrors.action_url
        return
    }

    isSaving.value = true

    try {
        const payload = buildSendNotificationPayload({
            send_to_all: targetingMode.value === 'all' ? true : undefined,
            recipients: targetingMode.value === 'recipients' ? selectedRecipientIds.value : undefined,
            roles: targetingMode.value === 'roles' ? selectedRoleSlugs.value : undefined,
            title: title.value,
            body: body.value,
            notification_type: notificationType.value,
            priority: priority.value,
            action_url: actionUrl.value,
        })

        const response = await inboxService.sendNotification(payload)
        const parsed = parseSendNotificationResponse(response)

        if (!parsed.ok) {
            applyApiErrors(response)
            return
        }

        const message = parsed.sent_to !== undefined
            ? `ارسال شد به ${parsed.sent_to} کاربر`
            : parsed.message || 'اعلان با موفقیت ارسال شد.'
        showToast({ message, variant: 'success' })

        setTimeout(() => {
            router.push({ name: 'notifications' })
        }, 600)
    } catch (err: unknown) {
        applyApiErrors(err)
    } finally {
        isSaving.value = false
    }
}
</script>
