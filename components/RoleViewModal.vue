<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="role-view-title"
            >
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-[2px] overlay-dismiss"
                    aria-hidden="true"
                    @click="close"
                />

                <div class="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-4 shadow-2xl md:p-6" dir="rtl">
                    <div class="mb-4 flex items-center justify-between gap-3">
                        <h2 id="role-view-title" class="text-lg font-bold text-text-primary">مشاهده نقش</h2>
                        <button
                            type="button"
                            class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                            aria-label="بستن"
                            @click="close"
                        >
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div v-if="isLoading" class="py-12 text-center text-sm text-text-secondary">
                        در حال بارگذاری...
                    </div>

                    <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                        {{ loadError }}
                    </div>

                    <article
                        v-else-if="role"
                        class="role-card"
                    >
                        <header class="role-card-header flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="role-card-icon">
                                        <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </span>
                                    <div class="min-w-0">
                                        <h3 class="truncate text-sm font-semibold text-text-primary">
                                            {{ formatRoleName(role.name) }}
                                        </h3>
                                        <p class="truncate text-xs text-text-muted dir-ltr text-right">#{{ role.id }} {{ role.name }}</p>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div class="role-card-body grid grid-cols-2 gap-3">
                            <div class="role-card-stat">
                                <p class="text-xs text-text-muted">کاربران</p>
                                <p class="mt-0.5 text-lg font-semibold text-text-primary">{{ role.user_count ?? 0 }}</p>
                            </div>
                            <div class="role-card-stat">
                                <p class="text-xs text-text-muted">دسترسی‌ها</p>
                                <p class="mt-0.5 text-lg font-semibold text-text-primary">{{ permissionCount(role) }}</p>
                            </div>
                        </div>

                        <div class="role-card-footer">
                            <p class="mb-2 text-xs font-medium text-text-secondary">دسترسی‌های تخصیص‌یافته</p>
                            <div v-if="role.permissions?.length" class="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto pe-1">
                                <span
                                    v-for="permission in role.permissions"
                                    :key="permission.id"
                                    class="role-card-chip"
                                    :title="permission.name"
                                >
                                    {{ permission.codename }}
                                </span>
                            </div>
                            <p v-else class="text-xs text-text-muted">بدون دسترسی</p>
                        </div>
                    </article>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { authService } from '~/api/services/auth.service'
import { parseRoleDetailResponse } from '~/api/utils/api-response'
import type { Role } from '~/api/types/auth.types'
import { getApiErrorMessage } from '~/utils/api-error'

const props = defineProps<{
    modelValue: boolean
    roleId: number | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const role = ref<Role | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

function formatRoleName(name: string): string {
    const normalized = name.toLowerCase()
    if (normalized === 'admin' || normalized === 'administrator') return 'مدیر'
    if (normalized === 'user') return 'کاربر'
    return name
}

function permissionCount(item: Role): number {
    return item.permissions?.length ?? 0
}

function close() {
    emit('update:modelValue', false)
}

async function fetchRole(id: number) {
    isLoading.value = true
    loadError.value = null
    role.value = null

    try {
        const response = await authService.getRole(id)
        const parsed = parseRoleDetailResponse(response)

        if (!parsed) {
            loadError.value = 'دریافت اطلاعات نقش با خطا مواجه شد.'
            return
        }

        role.value = parsed
    } catch (err: unknown) {
        loadError.value = getApiErrorMessage(err, 'خطا در دریافت اطلاعات نقش')
    } finally {
        isLoading.value = false
    }
}

watch(
    () => [props.modelValue, props.roleId] as const,
    ([open, id]) => {
        if (open && id != null) {
            fetchRole(id)
        }
        if (!open) {
            role.value = null
            loadError.value = null
        }
    },
)
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 200ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>

