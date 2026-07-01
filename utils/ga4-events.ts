export function trackCommercePurchaseOnce(order: {
  id: string
  final_amount: number
  status: string
}) {
  if (order.status !== 'paid' || typeof sessionStorage === 'undefined') return
  const key = `ga4-purchase-${order.id}`
  if (sessionStorage.getItem(key)) return
  const { trackPurchase } = useGa4()
  trackPurchase({
    transaction_id: order.id,
    value: order.final_amount,
    currency: 'IRR',
  })
  sessionStorage.setItem(key, '1')
}
