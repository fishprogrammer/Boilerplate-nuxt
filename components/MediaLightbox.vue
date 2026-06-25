<template>
    <Teleport to="body">
        <Transition name="lightbox-fade">
            <div
                v-if="modelValue && currentItem"
                class="fixed inset-0 z-50 flex flex-col"
                role="dialog"
                aria-modal="true"
                :aria-label="currentItem.original_name"
            >
                <div
                    class="absolute inset-0 bg-black/90 overlay-dismiss"
                    aria-hidden="true"
                    @click="close"
                />

                <div class="relative z-10 flex items-center justify-between gap-3 px-4 py-3 text-white">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium">{{ currentItem.original_name }}</p>
                        <p class="mt-0.5 text-xs text-white/60">
                            <span class="meta-ltr inline-block text-right">{{ formatMediaFileMeta(currentItem) }}</span>
                            <span v-if="items.length > 1"> · {{ index + 1 }} از {{ items.length }}</span>
                        </p>
                    </div>
                    <div class="flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            class="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            aria-label="حذف فایل"
                            title="حذف"
                            @click="requestDelete"
                        >
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            class="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                            aria-label="بستن"
                            @click="close"
                        >
                        <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        </button>
                    </div>
                </div>

                <div class="relative z-10 flex min-h-0 flex-1 items-center justify-center px-14 py-2">
                    <button
                        v-if="hasPrevious"
                        type="button"
                        class="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-white/70 hover:text-white"
                        aria-label="تصویر قبلی"
                        @click.stop="goPrevious"
                    >
                        <svg class="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <img
                        :src="currentImageUrl!"
                        :alt="currentItem.original_name"
                        class="max-h-[calc(100vh-7rem)] max-w-full object-contain shadow-2xl"
                        @click.stop
                    />

                    <button
                        v-if="hasNext"
                        type="button"
                        class="absolute inset-y-0 left-0 flex w-12 cursor-pointer items-center justify-center text-white/70 hover:text-white"
                        aria-label="تصویر بعدی"
                        @click.stop="goNext"
                    >
                        <svg class="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import type { MediaFile } from '~/api/types/media.types'
import { formatMediaFileMeta, getMediaFullUrl } from '~/utils/media'

const props = defineProps<{
    modelValue: boolean
    items: MediaFile[]
    index: number
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'update:index': [value: number]
    delete: [item: MediaFile]
}>()

const currentItem = computed(() => props.items[props.index] ?? null)
const currentImageUrl = computed(() => (currentItem.value ? getMediaFullUrl(currentItem.value) : null))
const hasPrevious = computed(() => props.index > 0)
const hasNext = computed(() => props.index < props.items.length - 1)

function close() {
    emit('update:modelValue', false)
}

function requestDelete() {
    if (currentItem.value) emit('delete', currentItem.value)
}

function goPrevious() {
    if (hasPrevious.value) emit('update:index', props.index - 1)
}

function goNext() {
    if (hasNext.value) emit('update:index', props.index + 1)
}

function onKeydown(event: KeyboardEvent) {
    if (!props.modelValue) return

    if (event.key === 'Escape') {
        event.preventDefault()
        close()
    } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goPrevious()
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goNext()
    }
}

watch(
    () => props.modelValue,
    (open) => {
        document.body.style.overflow = open ? 'hidden' : ''
    },
    { immediate: true },
)

watch(
    () => props.modelValue,
    (open) => {
        if (open) {
            window.addEventListener('keydown', onKeydown)
        } else {
            window.removeEventListener('keydown', onKeydown)
        }
    },
)

onUnmounted(() => {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
    transition: opacity 0.2s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
    opacity: 0;
}
</style>

