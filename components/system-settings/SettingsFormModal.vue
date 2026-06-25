<template>
    <Teleport to="body">
        <Transition name="settings-modal-fade">
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
            >
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                    aria-hidden="true"
                    @click="onCancel"
                />

                <div
                    class="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-2xl"
                    dir="rtl"
                >
                    <div class="flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                        <div class="min-w-0">
                            <h2 :id="titleId" class="text-lg font-bold text-text-primary">{{ title }}</h2>
                            <p v-if="description" class="mt-1 text-sm text-text-secondary">{{ description }}</p>
                        </div>
                        <button
                            type="button"
                            class="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                            aria-label="بستن"
                            :disabled="loading"
                            @click="onCancel"
                        >
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                        <slot />
                    </div>

                    <div class="flex shrink-0 gap-3 border-t border-border/60 px-5 py-4">
                        <button
                            type="button"
                            class="btn-muted flex-1 rounded-xl py-2.5 font-semibold"
                            :disabled="loading"
                            @click="onCancel"
                        >
                            {{ cancelLabel }}
                        </button>
                        <button
                            type="button"
                            class="btn-action flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                            :disabled="loading || saveDisabled"
                            @click="$emit('save')"
                        >
                            <svg v-if="loading" class="size-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {{ saveLabel }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
    defineProps<{
        modelValue: boolean
        title: string
        description?: string
        loading?: boolean
        saveDisabled?: boolean
        saveLabel?: string
        cancelLabel?: string
    }>(),
    {
        description: '',
        loading: false,
        saveDisabled: false,
        saveLabel: 'ذخیره',
        cancelLabel: 'انصراف',
    },
)

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: []
    cancel: []
}>()

const titleId = useId()

function onCancel() {
    emit('update:modelValue', false)
    emit('cancel')
}
</script>

<style scoped>
.settings-modal-fade-enter-active,
.settings-modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.settings-modal-fade-enter-active .relative,
.settings-modal-fade-leave-active .relative {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.settings-modal-fade-enter-from,
.settings-modal-fade-leave-to {
    opacity: 0;
}

.settings-modal-fade-enter-from .relative,
.settings-modal-fade-leave-to .relative {
    transform: scale(0.96);
    opacity: 0;
}
</style>

