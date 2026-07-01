<script setup lang="ts">
import type { PricingPlan } from '~/types/catalog'
import type { PaymentGatewayPublic } from '~/api/types/payments.types'
import { paymentsService } from '~/api/services/payments.service'
import { walletService } from '~/api/services/wallet.service'
import { parsePaymentGatewaysPublicResponse, parseWalletDetailResponse } from '~/api/utils/api-response'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import { showToast } from '~/composables/useToast'
import { savePendingCommerceOrder } from '~/utils/commerce'
import { submitPaymentRedirect } from '~/utils/payments'

definePageMeta({
  name: 'panel-checkout',
  middleware: ['noindex', 'auth'],
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const planId = computed(() => String(route.query.plan || ''))
const productSlug = computed(() => String(route.query.product || ''))
const initialCoupon = computed(() => String(route.query.coupon || '').trim())

const { validateCoupon, createOrder, commerceApiLive } = useCommerce()
const { getProduct } = useCatalog()

const couponCode = ref('')
const couponResult = ref<Awaited<ReturnType<typeof validateCoupon>> | null>(null)
const validatingCoupon = ref(false)
const selectedPlan = ref<PricingPlan | null>(null)
const productName = ref('')
const paymentMethod = ref<'wallet' | 'gateway' | 'free'>('gateway')
const selectedGatewayId = ref('')
const gateways = ref<PaymentGatewayPublic[]>([])
const walletBalance = ref<number | null>(null)
const walletActive = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')
const pageLoading = ref(true)

const baseAmount = computed(() => selectedPlan.value?.price ?? 0)
const displayAmount = computed(() =>
  couponResult.value?.valid ? couponResult.value.final_amount : baseAmount.value,
)
const discountAmount = computed(() =>
  couponResult.value?.valid ? couponResult.value.discount_amount : 0,
)
const isFreeCheckout = computed(() => displayAmount.value === 0)

watch(isFreeCheckout, (free) => {
  if (free) paymentMethod.value = 'free'
})

async function loadCheckoutData() {
  pageLoading.value = true
  loadError.value = ''
  try {
    if (productSlug.value) {
      const product = await getProduct(productSlug.value, 'fa')
      if (product) {
        productName.value = product.name
        selectedPlan.value = product.plans.find((p) => p.id === planId.value) ?? product.plans[0] ?? null
      }
    }

    const [gatewaysRes, walletRes] = await Promise.all([
      paymentsService.listGateways(),
      walletService.getMyWallet(),
    ])
    gateways.value = parsePaymentGatewaysPublicResponse(gatewaysRes) || []
    if (gateways.value.length) selectedGatewayId.value = gateways.value[0].id

    const wallet = parseWalletDetailResponse(walletRes)
    walletBalance.value = wallet?.balance ?? null
    walletActive.value = wallet?.is_active !== false

    if (initialCoupon.value) {
      couponCode.value = initialCoupon.value
      await applyCoupon()
    }
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'خطا در بارگذاری اطلاعات تسویه')
  } finally {
    pageLoading.value = false
  }
}

async function applyCoupon() {
  if (!couponCode.value.trim() || !planId.value) return
  validatingCoupon.value = true
  try {
    couponResult.value = await validateCoupon(couponCode.value.trim(), planId.value)
  } finally {
    validatingCoupon.value = false
  }
}

watch(planId, () => {
  if (couponCode.value.trim()) void applyCoupon()
})

async function submitCheckout() {
  if (!planId.value || isSubmitting.value) return
  if (!commerceApiLive.value) {
    showToast({ message: 'API تجارت هنوز فعال نیست.', variant: 'error' })
    return
  }

  isSubmitting.value = true
  try {
    const payload: import('~/types/commerce').CreateOrderRequest = {
      plan_id: planId.value,
      coupon_code: couponResult.value?.valid ? couponCode.value.trim() : undefined,
    }

    if (!isFreeCheckout.value) {
      if (paymentMethod.value === 'wallet') {
        payload.pay_with_wallet = true
      } else if (paymentMethod.value === 'gateway') {
        if (!selectedGatewayId.value) {
          showToast({ message: 'یک درگاه پرداخت انتخاب کنید.', variant: 'error' })
          return
        }
        payload.gateway_id = selectedGatewayId.value
      }
    }

    const result = await createOrder(payload)

    if (result.status === 'paid') {
      await authStore.fetchCurrentUser()
      await router.push({ name: 'panel-order-view', params: { id: result.order_id } })
      return
    }

    if (result.status === 'pending_payment' && result.payment) {
      savePendingCommerceOrder(result.order_id)
      submitPaymentRedirect(result.payment)
      return
    }

    await router.push({ name: 'panel-order-view', params: { id: result.order_id } })
  } catch (error) {
    const message = getApiErrorMessage(error, 'ثبت سفارش ناموفق بود')
    showToast({ message, variant: 'error' })
    if (message.includes('موجودی') || message.includes('balance')) {
      showToast({ message: 'موجودی کیف پول کافی نیست.', variant: 'error' })
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (!planId.value) {
    loadError.value = 'پلن محصول مشخص نشده است.'
    pageLoading.value = false
    return
  }
  void loadCheckoutData()
})

useHead({
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})
</script>

<template>
  <div class="page-shell py-8">
    <div class="mb-6 flex items-center justify-between gap-3 border-b border-border/50 pb-4">
      <div>
        <h1 class="text-xl font-semibold text-text-primary">تسویه حساب</h1>
        <p class="mt-1 text-sm text-text-secondary">تکمیل خرید محصول</p>
      </div>
      <BackIconButton />
    </div>

    <p v-if="!commerceApiLive" class="mb-4 text-xs text-amber-600">
      API تجارت غیرفعال است — فقط اعتبارسنجی کوپن از mock اجرا می‌شود.
    </p>

    <div v-if="pageLoading" class="text-sm text-text-secondary">در حال بارگذاری...</div>
    <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
      {{ loadError }}
    </div>
    <div v-else class="grid gap-6 lg:grid-cols-5">
      <div class="space-y-5 lg:col-span-3">
        <CheckoutPlanSummary
          :plan="selectedPlan"
          :plan-id="planId"
          :product-name="productName"
          :display-amount="displayAmount"
          :discount-amount="discountAmount"
        />

        <div class="rounded-2xl border border-border bg-surface p-5">
          <CheckoutCouponField
            v-model="couponCode"
            :result="couponResult"
            :applying="validatingCoupon"
            @apply="applyCoupon"
          />
        </div>

        <div v-if="!isFreeCheckout" class="rounded-2xl border border-border bg-surface p-5">
          <CheckoutPaymentMethodPicker
            v-model="paymentMethod"
            :gateway-id="selectedGatewayId"
            :gateways="gateways"
            :wallet-balance="walletBalance"
            :wallet-active="walletActive"
            :amount="displayAmount"
            @update:gateway-id="selectedGatewayId = $event"
          />
          <p v-if="paymentMethod === 'wallet' && walletBalance !== null && walletBalance < displayAmount" class="mt-3 text-xs text-amber-700 dark:text-amber-300">
            موجودی کافی نیست.
            <NuxtLink to="/wallet/deposit" class="text-primary underline">شارژ کیف پول</NuxtLink>
          </p>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="sticky top-4 rounded-2xl border border-border bg-surface p-5">
          <p class="text-sm text-text-secondary">مبلغ نهایی</p>
          <p class="mt-1 text-2xl font-bold text-text-primary">
            {{ displayAmount === 0 ? 'رایگان' : `${displayAmount.toLocaleString('fa-IR')} ریال` }}
          </p>
          <button
            type="button"
            class="btn-action mt-5 w-full"
            :disabled="isSubmitting || (!isFreeCheckout && paymentMethod === 'wallet' && (walletBalance ?? 0) < displayAmount)"
            @click="submitCheckout"
          >
            {{ isSubmitting ? 'در حال پردازش...' : isFreeCheckout ? 'دریافت رایگان' : 'پرداخت و تکمیل خرید' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
