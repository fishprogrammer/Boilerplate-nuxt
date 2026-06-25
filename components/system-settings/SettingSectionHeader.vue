<template>
    <header class="flex items-center justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3 dark:border-border-muted dark:bg-surface-hover/55">
        <div class="flex min-w-0 items-center gap-3">
            <div
                class="flex size-9 shrink-0 items-center justify-center rounded-lg ring-1"
                :class="iconClass"
            >
                <slot name="icon" />
            </div>
            <div class="min-w-0">
                <h2 class="text-sm font-semibold text-text-primary">{{ title }}</h2>
                <p class="text-xs text-text-secondary">{{ description }}</p>
            </div>
        </div>
        <button
            v-if="showEdit"
            type="button"
            class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-amber-600 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
            :aria-label="editLabel"
            :title="editLabel"
            @click="$emit('edit')"
        >
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        </button>
    </header>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'

const props = withDefaults(
    defineProps<{
        title: string
        description: string
        iconClass: string
        showEdit?: boolean
    }>(),
    {
        showEdit: true,
    },
)

defineEmits<{
    edit: []
}>()

const editLabel = computed(() => `ویرایش ${props.title}`)
</script>

