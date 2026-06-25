import moment from 'moment-jalaali'
import type { MediaFile, MediaFileType } from '~/api/types/media.types'
import type { TicketAttachment } from '~/api/types/tickets.types'
import { mediaService } from '~/api/services/media.service'
import { triggerBlobDownload } from '~/utils/download'

const FILE_TYPE_LABELS: Record<MediaFileType, string> = {
  image: 'تصویر',
  document: 'سند',
  video: 'ویدیو',
  audio: 'صوت',
  other: 'سایر',
}

const FILE_TYPE_ICON_PATHS: Record<MediaFileType, string> = {
  image:
    'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  document:
    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  video:
    'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  audio:
    'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z',
  other:
    'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
}

export function formatMediaFileType(type: MediaFileType | string): string {
  return FILE_TYPE_LABELS[type as MediaFileType] || type
}

export function getMediaFileTypeIconPath(type: MediaFileType | string): string {
  return FILE_TYPE_ICON_PATHS[type as MediaFileType] || FILE_TYPE_ICON_PATHS.other
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  const formatted = unitIndex === 0 ? String(Math.round(size)) : size.toFixed(size >= 10 ? 0 : 1)
  return `${formatted} ${units[unitIndex]}`
}

export function formatMediaDimensions(width: number | null, height: number | null): string | null {
  if (!width || !height) return null
  return `${width}\u00D7${height}`
}

export function formatMediaFileMeta(item: Pick<MediaFile, 'size' | 'width' | 'height'>): string {
  const parts = [formatFileSize(item.size)]
  const dimensions = formatMediaDimensions(item.width, item.height)
  if (dimensions) parts.push(dimensions)
  return parts.join(' \u00B7 ')
}

export function formatMediaUploadMeta(
  item: Pick<MediaFile, 'uploaded_by_username' | 'created_at'>,
): string {
  const user = item.uploaded_by_username || '\u2014'
  return `${user} \u00B7 ${formatMediaDate(item.created_at)}`
}

export function formatMediaDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—'
  const seconds = timestamp > 1e12 ? Math.floor(timestamp / 1000) : Math.floor(timestamp)
  return moment.unix(seconds).format('jYYYY/jMM/jDD HH:mm')
}

export function getMediaPreviewUrl(item: Pick<MediaFile, 'file_type' | 'thumbnail_url' | 'file_url'>): string | null {
  if (item.file_type === 'image') {
    return item.thumbnail_url || item.file_url || null
  }
  return null
}

export function getMediaVideoUrl(item: Pick<MediaFile, 'file_type' | 'file_url'>): string | null {
  if (item.file_type !== 'video') return null
  return item.file_url || null
}

/** Video src with media fragment so grid tiles show the first frame as preview. */
export function getMediaVideoPreviewSrc(item: Pick<MediaFile, 'file_type' | 'file_url'>): string | null {
  const url = getMediaVideoUrl(item)
  if (!url) return null
  if (url.includes('#')) return url
  return `${url}#t=0.1`
}

export function getMediaFullUrl(item: Pick<MediaFile, 'file_type' | 'file_url' | 'thumbnail_url'>): string | null {
  if (item.file_type === 'image') {
    return item.file_url || item.thumbnail_url || null
  }
  return null
}

export function getMediaLightboxUrl(
  item: Pick<MediaFile, 'file_type' | 'file_url' | 'thumbnail_url'>,
): string | null {
  if (item.file_type === 'image') return getMediaFullUrl(item)
  if (item.file_type === 'video') return getMediaVideoUrl(item)
  return null
}

export function isMediaLightboxItem(
  item: Pick<MediaFile, 'file_type' | 'file_url' | 'thumbnail_url'>,
): boolean {
  return !!getMediaLightboxUrl(item)
}

export function getAttachmentPreviewUrl(
  attachment: Pick<TicketAttachment, 'file_type' | 'thumbnail_url' | 'file_url'>,
): string | null {
  if (attachment.file_type === 'image') {
    return attachment.thumbnail_url || attachment.file_url || null
  }
  return null
}

export function needsAuthenticatedMediaFetch(
  item: Pick<MediaFile | TicketAttachment, 'file_url' | 'download_url'>,
): boolean {
  return !item.file_url && Boolean(item.download_url)
}

export async function downloadMediaFile(
  item: Pick<MediaFile | TicketAttachment, 'id' | 'original_name' | 'download_url' | 'file_url'>,
  guestToken?: string,
): Promise<void> {
  if (item.file_url) {
    window.open(item.file_url, '_blank', 'noopener,noreferrer')
    return
  }
  if (!item.download_url) return

  const blob = await mediaService.downloadFile(item.id, guestToken)
  triggerBlobDownload(blob, item.original_name || `file-${item.id}`)
}

export async function createAuthenticatedPreviewUrl(
  item: Pick<MediaFile | TicketAttachment, 'id' | 'thumbnail_url' | 'file_url' | 'download_url'>,
  guestToken?: string,
): Promise<string | null> {
  if (item.thumbnail_url) return item.thumbnail_url
  if (item.file_url) return item.file_url
  if (!item.download_url) return null

  try {
    const blob = await mediaService.fetchPreview(item.id, guestToken)
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

export function getMediaExtension(name: string): string {
  const parts = name.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toLowerCase()
}

