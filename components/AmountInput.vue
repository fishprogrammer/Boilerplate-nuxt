<template>
  <input
    :id="id"
    :value="displayValue"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    dir="ltr"
    :class="inputClass"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :aria-label="ariaLabel"
    @input="onInput"
    @blur="onBlur"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatAmountInput, formatWalletAmount, parseOptionalAmount } from '~/utils/wallet'

defineOptions({ inheritAttrs: false })

const model = defineModel<number | null>({ default: null })

const props = withDefaults(
  defineProps<{
    id?: string
    inputClass?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    ariaLabel?: string
    defaultZero?: boolean
  }>(),
  {
    inputClass:
      'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm input-focus text-right',
    defaultZero: false,
  },
)

const displayValue = ref('')
let syncingFromModel = false

function syncDisplayFromModel(value: number | null | undefined) {
  if (value === null || value === undefined) {
    displayValue.value = ''
    return
  }
  displayValue.value = formatWalletAmount(value)
}

watch(
  () => model.value,
  (value) => {
    if (syncingFromModel) return
    syncDisplayFromModel(value)
  },
  { immediate: true },
)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  displayValue.value = formatAmountInput(target.value)
  syncingFromModel = true
  const parsed = parseOptionalAmount(displayValue.value)
  model.value = parsed ?? (props.defaultZero ? 0 : null)
  syncingFromModel = false
}

function onBlur() {
  if (model.value === null && props.defaultZero) {
    syncingFromModel = true
    model.value = 0
    syncDisplayFromModel(0)
    syncingFromModel = false
  }
}
</script>
