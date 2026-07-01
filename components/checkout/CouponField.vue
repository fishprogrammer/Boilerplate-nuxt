<template>
  <div>
    <label :for="inputId" class="mb-2 block text-sm font-medium text-text-primary">کد تخفیف</label>
    <div class="flex gap-2">
      <input
        :id="inputId"
        :value="modelValue"
        type="text"
        class="flex-1 rounded-xl border border-border bg-app-bg px-3 py-2 text-sm outline-none input-focus"
        placeholder="SAVE20"
        :disabled="disabled"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="btn-action-sm shrink-0"
        :disabled="disabled || applying || !modelValue.trim()"
        @click="emit('apply')"
      >
        {{ applying ? '...' : 'اعمال' }}
      </button>
    </div>
    <p
      v-if="result"
      class="mt-3 text-sm"
      :class="result.valid ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'"
    >
      {{ result.message }}
      <span v-if="result.valid">
        — تخفیف: {{ formatIrr(result.discount_amount) }} · مبلغ نهایی: {{ formatIrr(result.final_amount) }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { CouponValidateResponse } from '~/types/commerce'

defineProps<{
  modelValue: string
  result: CouponValidateResponse | null
  applying?: boolean
  disabled?: boolean
  inputId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  apply: []
}>()

function formatIrr(amount: number): string {
  return `${amount.toLocaleString('fa-IR')} ریال`
}
</script>
