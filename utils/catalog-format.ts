export function formatCatalogPriceAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '—'
  return Math.round(amount).toLocaleString('fa-IR')
}

export function formatCatalogPriceIrr(amount: number): string {
  const formatted = formatCatalogPriceAmount(amount)
  return formatted === '—' ? formatted : `${formatted} ریال`
}
