// Captcha types
export type CaptchaPurpose = 'login' | 'register' | 'password_reset' | 'comment' | 'general'

export interface CaptchaRequest {
  purpose: CaptchaPurpose
}

export interface CaptchaResponse {
  captcha_id: string
  purpose: CaptchaPurpose
  image_url: string
  expires_at: string
}

// API Response wrapper
export interface ApiResponse<T> {
  status: 'success' | 'error'
  code: string
  message: string
  data?: T
  errors?: Record<string, string[]>
  meta?: Record<string, unknown>
}

export interface LoginRequest {
  phone_number: string
  captcha_id?: string
  captcha_answer?: string
  debug?: boolean
}

export interface LoginOtpResponse {
  login_id: string
  expires_at: string
  debug_code?: string
}

export interface LoginResponse {
  login_id?: string
  debug_code?: string
  access?: string
  refresh?: string
  user?: UserInfo
}

/** Tokens + profile returned in `data` by POST /api/auth/login/verify/ */
export interface VerifyOtpResponse {
  access: string
  refresh: string
  user: UserInfo
}

export interface VerifyOtpRequest {
  login_id: string
  code: string
}

export interface ResendOtpRequest {
  login_id: string
}

export interface RegisterRequest {
  phone_number: string
  captcha_id: string
  captcha_answer: string
  debug?: boolean
}

export interface RegisterOtpResponse {
  register_id: string
  expires_at: string
  debug_code?: string
}

export type Gender = 'male' | 'female'

export interface VerifyRegisterRequest {
  register_id: string
  code: string
  first_name?: string
  last_name?: string
  email?: string
  gender?: Gender
  birth_date?: string | number
  national_id?: string
}

export interface ResendRegisterRequest {
  register_id: string
}

export interface LogoutRequest {
  refresh: string
}

export interface RefreshTokenRequest {
  refresh: string
}

/** Tokens returned in `data` by POST /api/auth/refresh/ */
export interface RefreshTokenResponse {
  access: string
  refresh: string
}

/** Tokens + profile returned by POST /api/auth/register/verify/ */
export interface VerifyRegisterResponse {
  access: string
  refresh: string
  user: UserInfo
}

export interface UserRoleBrief {
  slug: string
  display_name: string
}

export interface WalletInfo {
  balance?: number | string
  is_active?: boolean
  [key: string]: string | number | boolean | undefined
}

export interface InboxInfo {
  unread_count?: number
  [key: string]: string | number | undefined
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_pages: number
  total_items: number
  next: string | null
  previous: string | null
}

export interface UsersListResult {
  users: UserProfile[]
  pagination: PaginationMeta
}

export interface ListUsersParams {
  page?: number
  page_size?: number
  search?: string
  national_id?: string
  ordering?: string
  gender?: Gender
  is_active?: boolean
  is_staff?: boolean
  role?: string
}

/** GET /api/auth/users/export/ — same filters as list; pagination is ignored server-side */
export type ExportUsersParams = Omit<ListUsersParams, 'page' | 'page_size'>

/** GET /api/auth/permissions/ */
export interface Permission {
  id: number
  codename: string
  name: string
  app: string
}

export interface ListPermissionsParams {
  page?: number
  page_size?: number
  search?: string
  app?: string
  ordering?: string
}

export interface PermissionsListResult {
  permissions: Permission[]
  pagination: PaginationMeta
}

/** GET /api/auth/roles/ */
export interface Role {
  id: number
  name: string
  permissions: Permission[]
  user_count: number
}

export interface ListRolesParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
}

export interface RolesListResult {
  roles: Role[]
  pagination: PaginationMeta
}

/** POST /api/auth/roles/ */
export interface CreateRoleRequest {
  name: string
  permissions: number[]
}

/** PUT /api/auth/roles/{id}/assign-permissions/ */
export interface AssignRolePermissionsRequest {
  permissions: number[]
}

/** GET /api/auth/me/ — authenticated user profile */
export interface UserProfile {
  id: number | string
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  national_id?: string | null
  birth_date?: string | number
  gender?: Gender
  roles: (string | UserRoleBrief)[]
  permissions?: string[]
  wallet?: WalletInfo
  wallet_balance?: string
  wallet_is_active?: boolean
  inbox?: InboxInfo
  unread_count?: number
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  profile_complete?: boolean
  profile_missing_fields?: string[]
}

export type UserInfo = UserProfile

/** PUT /api/auth/me/ — update authenticated user profile */
export interface UpdateProfileRequest {
  email: string
  first_name: string
  last_name: string
  phone_number: string
  national_id?: string | null
  birth_date?: string
  gender?: Gender
}

/** Form/input values before birth_date is normalized to YYYY-MM-DD */
export type UpdateProfileInput = Omit<UpdateProfileRequest, 'birth_date'> & {
  birth_date?: string | number
}

/** POST /api/auth/users/ — admin create user */
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone_number: string
  national_id?: string | null
  birth_date?: string
  gender?: Gender
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  groups?: number[]
  user_permissions?: number[]
}

export type CreateUserInput = Omit<CreateUserRequest, 'birth_date' | 'gender'> & {
  birth_date?: string | number
  gender?: Gender | ''
}

/** PUT /api/auth/users/{id}/ — admin update user (username is not editable) */
export interface UpdateUserRequest {
  email: string
  password?: string
  first_name: string
  last_name: string
  phone_number: string
  national_id?: string | null
  birth_date?: string
  gender?: Gender
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  groups?: number[]
  user_permissions?: number[]
}

export type UpdateUserInput = Omit<UpdateUserRequest, 'birth_date' | 'gender' | 'password'> & {
  birth_date?: string | number
  gender?: Gender | ''
  password?: string
}

/** PUT /api/auth/users/{id}/assign-roles/ */
export interface AssignRolesRequest {
  roles: number[]
}

export interface UserFormState {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone_number: string
  national_id: string
  birth_date: string
  gender: Gender | ''
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
}

