import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { paymentsService } from '~/api/services/payments.service'
import { walletService } from '~/api/services/wallet.service'
import type { PaymentOrder } from '~/api/types/payments.types'
import { parsePaymentOrderDetailResponse, parseWalletDetailResponse } from '~/api/utils/api-response'
import { useAuthStore } from '~/stores/auth'
import { getApiErrorMessage } from '~/utils/api-error'
import {
  clearPendingPayment,
  getPendingPaymentOrderId,
  isPaymentTerminalStatus,
  pollPaymentOrder,
} from '~/utils/payments'

export function useDepositPaymentResult() {
  const route = useRoute()
  const authStore = useAuthStore()

  const order = ref<PaymentOrder | null>(null)
  const refreshedBalance = ref<number | null>(null)
  const isLoading = ref(true)
  const loadError = ref('')

  const orderId = computed(() => {
    const queryId = typeof route.query.order_id === 'string' ? route.query.order_id.trim() : ''
    return queryId || getPendingPaymentOrderId()
  })

  async function resolveOrderStatus() {
    if (!orderId.value) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    loadError.value = ''

    try {
      const initialResponse = await paymentsService.getOrder(orderId.value)
      let resolved = parsePaymentOrderDetailResponse(initialResponse)

      if (!resolved) {
        loadError.value = 'سفارش پرداخت یافت نشد.'
        return
      }

      if (!isPaymentTerminalStatus(resolved.status)) {
        resolved = await pollPaymentOrder(orderId.value)
      }

      order.value = resolved
      clearPendingPayment()

      if (resolved.status === 'paid') {
        const walletResponse = await walletService.getMyWallet()
        const wallet = parseWalletDetailResponse(walletResponse)
        if (wallet) {
          refreshedBalance.value = wallet.balance
        }
        await authStore.fetchCurrentUser(true)
      }
    } catch (err: unknown) {
      loadError.value = getApiErrorMessage(err, 'خطا در بررسی وضعیت پرداخت')
    } finally {
      isLoading.value = false
    }
  }

  onMounted(resolveOrderStatus)

  return {
    order,
    refreshedBalance,
    isLoading,
    loadError,
    orderId,
    resolveOrderStatus,
  }
}
