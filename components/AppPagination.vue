<template>
    <nav
        v-if="totalPages > 1"
        class="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
        aria-label="صفحه‌بندی"
    >
        <div class="flex items-center justify-between gap-2 sm:hidden">
            <button
                type="button"
                class="inline-flex min-w-22 cursor-pointer items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="page <= 1 || disabled"
                @click="emit('update:page', page - 1)"
            >
                قبلی
            </button>
            <span class="text-sm text-text-secondary">
                صفحه {{ page }} از {{ totalPages }}
            </span>
            <button
                type="button"
                class="inline-flex min-w-22 cursor-pointer items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="page >= totalPages || disabled"
                @click="emit('update:page', page + 1)"
            >
                بعدی
            </button>
        </div>

        <div class="hidden items-center gap-1 sm:flex" dir="ltr">
            <button
                type="button"
                class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="page <= 1 || disabled"
                aria-label="صفحه قبل"
                @click="emit('update:page', page - 1)"
            >
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
                <span
                    v-if="item === 'ellipsis'"
                    class="inline-flex size-9 items-center justify-center text-sm text-text-muted"
                    aria-hidden="true"
                >
                    …
                </span>
                <button
                    v-else
                    type="button"
                    class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    :class="
                        item === page
                            ? 'border-0 bg-primary text-white'
                            : 'border-border text-text-primary hover:bg-surface-hover'
                    "
                    :disabled="disabled"
                    :aria-current="item === page ? 'page' : undefined"
                    @click="emit('update:page', item)"
                >
                    {{ item }}
                </button>
            </template>

            <button
                type="button"
                class="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="page >= totalPages || disabled"
                aria-label="صفحه بعد"
                @click="emit('update:page', page + 1)"
            >
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        page: number
        totalPages: number
        disabled?: boolean
    }>(),
    {
        disabled: false,
    },
)

const emit = defineEmits<{
    'update:page': [page: number]
}>()

type PageItem = number | 'ellipsis'

const pageItems = computed(() => getPaginationRange(props.page, props.totalPages))

function getPaginationRange(current: number, total: number): PageItem[] {
    if (total <= 1) return [1]

    const delta = 1
    const range: number[] = []
    const rangeWithDots: PageItem[] = []
    let previous: number | undefined

    for (let i = 1; i <= total; i += 1) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i)
        }
    }

    for (const i of range) {
        if (previous !== undefined) {
            if (i - previous === 2) {
                rangeWithDots.push(previous + 1)
            } else if (i - previous > 2) {
                rangeWithDots.push('ellipsis')
            }
        }
        rangeWithDots.push(i)
        previous = i
    }

    return rangeWithDots
}
</script>

