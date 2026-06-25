import { authService } from '~/api/services/auth.service'
import type { ExportUsersParams, Gender, ListUsersParams, UserProfile } from '~/api/types/auth.types'
import { normalizeNationalIdInput } from '~/utils/national-id'
import { formatWalletAmount } from '~/utils/wallet'

export interface UserPickerItem {  id: number
  username: string
  first_name: string
  last_name: string
}

/** API may return role names (strings) or `{ slug, display_name }` objects. */
export type UserRoleLike =
  | string
  | {
      slug?: string
      display_name?: string
      name?: string
    }

export function normalizeUserRoleLabel(role: UserRoleLike): string {
  if (typeof role === 'string') {
    const normalized = role.trim().toLowerCase()
    if (normalized === 'admin' || normalized === 'administrator') return 'مدیر'
    if (normalized === 'user') return 'کاربر'
    if (normalized === 'staff') return 'کارمند'
    return role.trim()
  }

  if (role && typeof role === 'object') {
    const displayName = typeof role.display_name === 'string' ? role.display_name.trim() : ''
    if (displayName) return displayName
    const slug = typeof role.slug === 'string' ? role.slug.trim() : ''
    if (slug) return slug
    const name = typeof role.name === 'string' ? role.name.trim() : ''
    if (name) return name
  }

  return '—'
}

export function formatUserRoles(roles?: UserRoleLike[] | null): string {
  if (!roles?.length) return '—'
  return roles.map(normalizeUserRoleLabel).join('، ')
}

export function formatUserRolesShort(roles?: UserRoleLike[] | null): string {
  const full = formatUserRoles(roles)
  if (full === '—') return full

  const parts = full.split('، ').filter(Boolean)
  if (parts.length <= 2) return full
  return `${parts.slice(0, 2).join('، ')}…`
}

export function userRoleKey(role: UserRoleLike, index: number): string {
  if (typeof role === 'string') return role
  return String(role.slug || role.name || role.display_name || index)
}

/** Match keys from API user.roles (string or {slug, display_name}) to Role.name */
export function userRoleMatchKeys(role: UserRoleLike): string[] {
  if (typeof role === 'string') {
    const trimmed = role.trim().toLowerCase()
    return trimmed ? [trimmed] : []
  }

  const keys: string[] = []
  for (const value of [role.slug, role.display_name, role.name]) {
    if (typeof value === 'string' && value.trim()) {
      keys.push(value.trim().toLowerCase())
    }
  }
  return keys
}

export function resolveUserRolesToGroupIds(
  userRoles: UserRoleLike[],
  allRoles: Array<{ id: number; name: string }>,
): number[] {
  const matchKeys = new Set(userRoles.flatMap(userRoleMatchKeys))
  if (matchKeys.size === 0) return []

  return allRoles
    .filter((role) => matchKeys.has(role.name.trim().toLowerCase()))
    .map((role) => role.id)
}

export function normalizeUserPickerItem(user: {
  id: number | string
  username?: string
  first_name?: string
  last_name?: string
}): UserPickerItem | null {
  const id = Number(user.id)
  if (!Number.isFinite(id) || id <= 0) return null
  return {
    id,
    username: String(user.username || ''),
    first_name: String(user.first_name || ''),
    last_name: String(user.last_name || ''),
  }
}

export function formatUserDisplayName(
  user: Pick<UserPickerItem, 'first_name' | 'last_name' | 'username'> & { id: number | string },
): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (user.username) return user.username
  return `#${user.id}`
}

export const USER_LIST_ORDERING_OPTIONS = [
  { value: '', label: 'پیش‌فرض سرور' },
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'created_at', label: 'قدیمی‌ترین' },
  { value: 'username', label: 'نام کاربری (الف-ی)' },
  { value: '-username', label: 'نام کاربری (ی-الف)' },
  { value: 'last_name', label: 'نام خانوادگی (الف-ی)' },
  { value: '-last_name', label: 'نام خانوادگی (ی-الف)' },
] as const

export const USER_GENDER_FILTER_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'male', label: 'مرد' },
  { value: 'female', label: 'زن' },
] as const

export const USER_PROFILE_MISSING_FIELD_LABELS: Record<string, string> = {
  first_name: 'نام',
  last_name: 'نام خانوادگی',
  phone_number: 'شماره موبایل',
  national_id: 'کد ملی',
}

export function formatUserGender(gender?: Gender | null): string {
  if (gender === 'male') return 'مرد'
  if (gender === 'female') return 'زن'
  return '—'
}

export function isUserActive(user: UserProfile): boolean {
  return user.is_active !== false
}

export function formatUserWalletBalance(user: UserProfile): string {
  const raw = user.wallet?.balance ?? user.wallet_balance ?? 0
  return `${formatWalletAmount(raw)} ریال`
}

export function formatProfileMissingFields(fields?: string[] | null): string {
  if (!fields?.length) return '—'
  return fields.map((field) => USER_PROFILE_MISSING_FIELD_LABELS[field] || field).join('، ')
}

export function isLikelyNationalIdSearch(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return false
  const normalized = normalizeNationalIdInput(trimmed)
  if (normalized.length < 2) return false
  const withoutSeparators = trimmed.replace(/[\s\-]/g, '')
  return !/[a-zA-Z\u0600-\u06FF]/.test(withoutSeparators)
}

export function buildUsersListSearchParams(
  query: string,
  extra?: Omit<ListUsersParams, 'search' | 'national_id'>,
): ListUsersParams {
  const trimmed = query.trim()
  const params: ListUsersParams = { ...extra }
  if (!trimmed) return params

  if (isLikelyNationalIdSearch(trimmed)) {
    params.national_id = normalizeNationalIdInput(trimmed)
  } else {
    params.search = trimmed
  }
  return params
}

export interface UsersListFilterState {
  search?: string
  ordering?: string
  gender?: Gender | ''
  national_id?: string
  is_active?: boolean | '' | string
  is_staff?: boolean | '' | string
}

function parseOptionalBooleanFilter(
  value: boolean | '' | string | undefined,
): boolean | undefined {
  if (value === '' || value === undefined || value === null) return undefined
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

export function buildUsersListParams(
  filters: UsersListFilterState,
  pagination?: { page?: number; page_size?: number },
): ListUsersParams {
  const params: ListUsersParams = {}

  if (pagination?.page) params.page = pagination.page
  if (pagination?.page_size) params.page_size = pagination.page_size

  const search = filters.search?.trim()
  if (search) params.search = search

  if (filters.ordering) params.ordering = filters.ordering

  if (filters.gender === 'male' || filters.gender === 'female') {
    params.gender = filters.gender
  }

  const nationalId = filters.national_id?.trim()
  if (nationalId) params.national_id = nationalId

  const isActive = parseOptionalBooleanFilter(filters.is_active)
  if (isActive !== undefined) params.is_active = isActive

  const isStaff = parseOptionalBooleanFilter(filters.is_staff)
  if (isStaff !== undefined) params.is_staff = isStaff

  return params
}

export function buildUsersExportParams(filters: UsersListFilterState): ExportUsersParams {
  return buildUsersListParams(filters)
}

function parseContentDispositionFilename(header: string | null | undefined): string {
  if (!header) return 'users-export.xlsx'

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }

  const quotedMatch = /filename="([^"]+)"/i.exec(header)
  if (quotedMatch?.[1]) return quotedMatch[1]

  const plainMatch = /filename=([^;]+)/i.exec(header)
  if (plainMatch?.[1]) return plainMatch[1].trim()

  return 'users-export.xlsx'
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

async function readBlobErrorMessage(data: unknown): Promise<string | null> {
  if (!(data instanceof Blob)) return null

  try {
    const text = await data.text()
    const json = JSON.parse(text) as { message?: string; code?: string }
    if (typeof json.message === 'string' && json.message.trim()) return json.message
    if (typeof json.code === 'string' && json.code.trim()) return json.code
  } catch {
    return null
  }

  return null
}

export class UsersExportError extends Error {
  readonly status?: number
  readonly code?: string

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message)
    this.name = 'UsersExportError'
    this.status = options?.status
    this.code = options?.code
  }
}

export async function downloadUsersExport(filters: UsersListFilterState): Promise<string> {
  const params = buildUsersExportParams(filters)

  try {
    const response = await authService.exportUsers(params)
    const contentType = String(response.headers['content-type'] || '')

    if (!contentType.includes('spreadsheetml') && !contentType.includes('octet-stream')) {
      const message = await readBlobErrorMessage(response.data)
      throw new UsersExportError(message || 'export_invalid_response', { code: 'export_invalid_response' })
    }

    const filename = parseContentDispositionFilename(
      response.headers['content-disposition'] as string | undefined,
    )
    triggerBlobDownload(response.data, filename)
    return filename
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: Blob } }
    const status = axiosErr.response?.status
    const apiMessage = await readBlobErrorMessage(axiosErr.response?.data)

    if (status === 403) {
      throw new UsersExportError('export_forbidden', { status, code: 'export_forbidden' })
    }

    if (status === 406) {
      throw new UsersExportError(
        apiMessage || 'هدر Accept قابل برآورده نیست.',
        { status, code: 'not_acceptable' },
      )
    }

    if (apiMessage) {
      throw new UsersExportError(apiMessage, { status })
    }

    if (err instanceof UsersExportError) throw err
    throw new UsersExportError('export_failed', { status })
  }
}

