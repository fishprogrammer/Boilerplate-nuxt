<template>
  <ConfirmModal
    v-if="state"
    :model-value="isOpen"
    :title="state.title"
    :message="state.message"
    :confirm-label="state.confirmLabel"
    :cancel-label="state.cancelLabel"
    :loading="isLoading"
    :variant="state.variant ?? 'default'"
    @confirm="onConfirm"
    @cancel="onCancel"
    @update:model-value="(v) => !v && onCancel()"
  />
</template>

<script setup lang="ts">
import ConfirmModal from './ConfirmModal.vue'
import { useConfirm } from '~/composables/useConfirm'

const { isOpen, isLoading, state, onConfirm, onCancel } = useConfirm()
</script>

