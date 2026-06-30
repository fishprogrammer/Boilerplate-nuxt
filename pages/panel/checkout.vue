<script setup lang="ts">
definePageMeta({
  middleware: ['noindex', 'auth'],
  layout: 'dashboard',
})

const route = useRoute()
const planId = computed(() => String(route.query.plan || ''))
const { validateCoupon, commerceApiLive } = useCommerce()

const couponCode = ref('')
const couponResult = ref<Awaited<ReturnType<typeof validateCoupon>> | null>(null)
const validating = ref(false)

async function applyCoupon() {
  if (!couponCode.value.trim() || !planId.value) return
  validating.value = true
  try {
    couponResult.value = await validateCoupon(couponCode.value.trim(), planId.value)
  } finally {
    validating.value = false
  }
}
</script>

<template>
  <div class="page-shell py-8">
    <h1 class="text-2xl font-bold text-text-primary">تسویه حساب</h1>
    <p class="mt-2 text-sm text-text-secondary">
      پلن انتخاب‌شده: <code>{{ planId || '—' }}</code>
    </p>
    <p v-if="!commerceApiLive" class="mt-2 text-xs text-amber-600">
      API تجارت هنوز فعال نیست — اعتبارسنجی کوپن از mock اجرا می‌شود.
    </p>

    <div class="mt-6 max-w-lg rounded-2xl border border-border bg-surface p-5">
      <label class="mb-2 block text-sm font-medium">کد تخفیف</label>
      <div class="flex gap-2">
        <input
          v-model="couponCode"
          type="text"
          class="flex-1 rounded-xl border border-border bg-app-bg px-3 py-2"
          placeholder="LAUNCH20"
        />
        <button
          type="button"
          class="rounded-xl bg-primary px-4 py-2 text-sm text-white"
          :disabled="validating"
          @click="applyCoupon"
        >
          اعمال
        </button>
      </div>
      <p v-if="couponResult" class="mt-3 text-sm" :class="couponResult.valid ? 'text-green-600' : 'text-red-600'">
        {{ couponResult.message }}
        <span v-if="couponResult.valid"> — مبلغ نهایی: {{ couponResult.final_amount.toLocaleString('fa-IR') }} ریال</span>
      </p>
    </div>
  </div>
</template>
