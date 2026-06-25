<template>
    <div
        class="rounded-lg border border-border bg-surface-muted/50 px-4 py-3.5 dark:border-border-muted dark:bg-surface-hover/45"
        :class="fieldClass"
    >
        <p class="text-xs font-medium text-text-secondary">{{ label }}</p>
        <p
            class="mt-1.5 text-sm font-semibold text-text-primary dark:text-[#f5f5f5]"
            :class="ltr ? 'dir-ltr text-right' : ''"
        >
            {{ value }}
        </p>
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        label: string
        value?: string | number
        ltr?: boolean
        fieldClass?: string
    }>(),
    {
        value: '',
        ltr: false,
        fieldClass: '',
    },
)
</script>

