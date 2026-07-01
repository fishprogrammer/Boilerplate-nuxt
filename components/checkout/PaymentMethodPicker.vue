<template>
  <div class="space-y-4">
    <div>
      <p class="mb-2 text-sm font-medium text-text-primary">روش پرداخت</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-if="showWallet"
          type="button"
          class="rounded-xl border px-4 py-2 text-sm font-medium transition"
          :class="modelValue === 'wallet' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary'"
          @click="emit('update:modelValue', 'wallet')"
        >
          کیف پول
          <span v-if="walletBalance !== null" class="mr-1 text-xs opacity-80">
            ({{ walletBalance.toLocaleString('fa-IR') }} ریال)
          </span>
        </button>
        <button
          v-if="showGateway"
          type="button"
          class="rounded-xl border px-4 py-2 text-sm font-medium transition"
          :class="modelValue === 'gateway' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary'"
          @click="emit('update:modelValue', 'gateway')"
        >
          درگاه بانکی
        </button>
      </div>
    </div>

    <div v-if="modelValue === 'gateway' && gateways.length">
      <label class="mb-2 block text-xs font-medium text-text-primary">انتخاب درگاه</label>
      <div class="space-y-2">
        <label
          v-for="gateway in gateways"
          :key="gateway.id"
          class="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2"
          :class="selectedGatewayId === gateway.id ? 'border-primary ring-1 ring-primary/30' : ''"
        >
          <input
            v-model="selectedGatewayId"
            type="radio"
            name="checkout-gateway"
            :value="gateway.id"
            class="text-primary"
            @change="emit('update:gatewayId', gateway.id)"
          />
          <span class="text-sm font-medium text-text-primary">{{ gateway.title }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentGatewayPublic } from '~/api/types/payments.types'

const props = defineProps<{
  modelValue: 'wallet' | 'gateway' | 'free'
  gatewayId: string
  gateways: PaymentGatewayPublic[]
  walletBalance: number | null
  amount: number
  walletActive?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'wallet' | 'gateway' | 'free']
  'update:gatewayId': [value: string]
}>()

const selectedGatewayId = ref(props.gatewayId)

watch(
  () => props.gatewayId,
  (value) => {
    selectedGatewayId.value = value
  },
)

const showWallet = computed(
  () => props.amount > 0 && props.walletActive !== false && props.walletBalance !== null,
)
const showGateway = computed(() => props.amount > 0)
</script>
