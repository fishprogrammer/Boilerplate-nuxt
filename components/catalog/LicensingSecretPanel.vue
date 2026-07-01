<template>
  <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
    <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-200">کلید API محصول (یک‌بار)</h3>
    <p class="mt-2 text-sm text-amber-800 dark:text-amber-300">
      این کلید فقط یک‌بار نمایش داده می‌شود. آن را در سرور مشتری (WordPress) ذخیره کنید و هرگز در فرانت‌اند عمومی قرار ندهید.
    </p>
    <p class="mt-3 rounded-lg border border-amber-300/60 bg-white px-3 py-2 font-mono text-sm dir-ltr dark:bg-surface dark:border-amber-800">
      {{ secret }}
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button type="button" class="btn-action-sm" @click="copySecret">کپی کلید</button>
      <button type="button" class="btn-muted-sm" @click="$emit('close')">بستن</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from '~/composables/useToast'

const props = defineProps<{ secret: string }>()
defineEmits<{ close: [] }>()

async function copySecret() {
  try {
    await navigator.clipboard.writeText(props.secret)
    showToast({ message: 'کلید کپی شد', variant: 'success' })
  } catch {
    showToast({ message: 'کپی ناموفق بود', variant: 'error' })
  }
}
</script>
