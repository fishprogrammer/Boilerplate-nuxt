import { parseContentDispositionFilename, triggerBlobDownload } from '~/utils/download'
import { commerceService } from '~/api/services/commerce.service'
import { getApiErrorMessage } from '~/utils/api-error'

export type AdminOrdersExportFilters = {
  status?: string
  paid_from?: number
  paid_to?: number
  user?: string
}

export async function downloadCommerceOrdersExport(filters: AdminOrdersExportFilters): Promise<string> {
  const params: Record<string, string | number> = {}
  if (filters.status) params.status = filters.status
  if (filters.paid_from) params.paid_from = filters.paid_from
  if (filters.paid_to) params.paid_to = filters.paid_to
  if (filters.user) params.user = filters.user

  try {
    const response = await commerceService.adminExportOrders(params)
    const contentType = String(response.headers['content-type'] || '')
    if (!contentType.includes('csv') && !contentType.includes('octet-stream') && !contentType.includes('text')) {
      throw new Error('پاسخ خروجی معتبر نیست')
    }
    const filename = parseContentDispositionFilename(
      response.headers['content-disposition'] as string | undefined,
      'commerce-orders.csv',
    )
    triggerBlobDownload(response.data as Blob, filename)
    return filename
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'خروجی CSV ناموفق بود'))
  }
}
