import moment from 'moment-jalaali'

export const API_DATE_FORMAT = 'YYYY-MM-DD'
export const PERSIAN_DATE_FORMAT = 'jYYYY/jMM/jDD'

function toUnixSeconds(value: string | number): number | undefined {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return undefined

  if (numeric > 1e12) return Math.floor(numeric / 1000)
  return Math.floor(numeric)
}

/** Convert picker/API date value to Unix timestamp (seconds). */
export function toBirthDateTimestamp(
  value: string | number | null | undefined,
): number | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const raw = String(value).trim()
  if (/^\d+$/.test(raw)) {
    return toUnixSeconds(raw)
  }

  const parsed = moment(raw, API_DATE_FORMAT, true)
  if (!parsed.isValid()) return undefined

  return parsed.startOf('day').unix()
}

/** Convert timestamp or API date string to `YYYY-MM-DD` for DatePicker. */
export function birthDateToPickerValue(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === '') return ''

  const raw = String(value).trim()
  if (/^\d+$/.test(raw)) {
    const seconds = toUnixSeconds(raw)
    if (seconds === undefined) return ''
    const parsed = moment.unix(seconds)
    return parsed.isValid() ? parsed.format(API_DATE_FORMAT) : ''
  }

  const parsed = moment(raw, API_DATE_FORMAT, true)
  if (parsed.isValid()) return parsed.format(API_DATE_FORMAT)

  const fallback = moment(raw)
  return fallback.isValid() ? fallback.format(API_DATE_FORMAT) : raw
}

/** Format birth date for UI display in Persian calendar. */
export function formatBirthDateForDisplay(
  value: string | number | null | undefined,
  emptyLabel = '—',
): string {
  if (value === null || value === undefined || value === '') return emptyLabel

  const raw = String(value).trim()
  let parsed = /^\d+$/.test(raw)
    ? moment.unix(toUnixSeconds(raw) ?? 0)
    : moment(raw, API_DATE_FORMAT, true)

  if (!parsed.isValid()) return raw
  return parsed.format(PERSIAN_DATE_FORMAT)
}

