import { BaseService } from '../base.service'
import { apiClient } from '../client'
import { API_ENDPOINTS } from '../endpoints'
import type {
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest,
  VerifyRegisterRequest,
  ResendOtpRequest,
  ResendRegisterRequest,
  LogoutRequest,
  CaptchaResponse,
  CaptchaRequest,
  UpdateProfileRequest,
  CreateUserRequest,
  CreateRoleRequest,
  UpdateUserRequest,
  AssignRolesRequest,
  ListPermissionsParams,
  ListRolesParams,
  ListUsersParams,
  ExportUsersParams,
} from '../types/auth.types'

export class AuthService extends BaseService {
  async login(data: LoginRequest): Promise<any> {
    const response = await this.postRaw<any>(API_ENDPOINTS.AUTH.LOGIN, data)
    return response
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<any> {
    return this.postRaw(API_ENDPOINTS.AUTH.LOGIN_VERIFY, data)
  }

  async resendOtp(loginId: string): Promise<any> {
    const payload: ResendOtpRequest = { login_id: loginId }
    const response = await this.postRaw<any>(API_ENDPOINTS.AUTH.LOGIN_RESEND, payload)
    return response
  }

  async getCaptcha(purpose: string = 'login') {
    const payload: CaptchaRequest = { purpose: purpose as any }
    return this.postRaw<CaptchaResponse>(API_ENDPOINTS.AUTH.CAPTCHA, payload)
  }

  async getCaptchaImage(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${API_ENDPOINTS.AUTH.CAPTCHA}${id}/image/`, {
      responseType: 'blob',
    })
    return response.data
  }

  async register(data: RegisterRequest): Promise<any> {
    return this.postRaw(API_ENDPOINTS.AUTH.REGISTER, data)
  }

  async verifyRegister(data: VerifyRegisterRequest): Promise<any> {
    return this.postRaw(API_ENDPOINTS.AUTH.REGISTER_VERIFY, data)
  }

  async resendRegisterOtp(registerId: string): Promise<any> {
    const payload: ResendRegisterRequest = { register_id: registerId }
    return this.postRaw(API_ENDPOINTS.AUTH.REGISTER_RESEND, payload)
  }

  async getMe(): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.AUTH.ME)
  }

  async listUsers(params?: ListUsersParams): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.AUTH.USERS, buildUsersListQuery(params))
  }

  async exportUsers(params?: ExportUsersParams) {
    return apiClient.get<Blob>(API_ENDPOINTS.AUTH.USERS_EXPORT, {
      params: buildUsersListQuery(params),
      responseType: 'blob',
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'fa',
      },
    })
  }

  async listPermissions(params?: ListPermissionsParams): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.AUTH.PERMISSIONS, params as Record<string, unknown>)
  }

  async listRoles(params?: ListRolesParams): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.AUTH.ROLES, params as Record<string, unknown>)
  }

  async createRole(data: CreateRoleRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.AUTH.ROLES, data)
  }

  async getRole(id: string | number): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.AUTH.roleById(id))
  }

  async updateRole(id: string | number, data: CreateRoleRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.AUTH.roleById(id), data)
  }

  async deleteRole(id: string | number): Promise<unknown> {
    const response = await apiClient.delete(API_ENDPOINTS.AUTH.roleById(id))
    return response.data
  }

  async createUser(data: CreateUserRequest): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.AUTH.USERS, data)
  }

  async getUser(id: string | number): Promise<unknown> {
    return this.getRaw(API_ENDPOINTS.AUTH.userById(id))
  }

  async updateUser(id: string | number, data: UpdateUserRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.AUTH.userById(id), data)
  }

  async assignRoles(id: string | number, data: AssignRolesRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.AUTH.assignRolesByUserId(id), data)
  }

  async deleteUser(id: string | number): Promise<unknown> {
    const response = await apiClient.delete(API_ENDPOINTS.AUTH.userById(id))
    return response.data
  }

  async updateMe(data: UpdateProfileRequest): Promise<unknown> {
    return this.putRaw(API_ENDPOINTS.AUTH.ME, data)
  }

  async refresh(body: { refresh: string }): Promise<unknown> {
    return this.postRaw(API_ENDPOINTS.AUTH.REFRESH, body)
  }

  async logout(data: LogoutRequest): Promise<any> {
    return this.postRaw(API_ENDPOINTS.AUTH.LOGOUT, data)
  }
}

export const authService = new AuthService()

function buildUsersListQuery(
  params?: ListUsersParams | ExportUsersParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {}
  if (!params) return query

  if ('page' in params && params.page) query.page = params.page
  if ('page_size' in params && params.page_size) query.page_size = params.page_size
  if (params.search) query.search = params.search
  if (params.national_id) query.national_id = params.national_id
  if (params.ordering) query.ordering = params.ordering
  if (params.gender) query.gender = params.gender
  if (params.is_active !== undefined) query.is_active = params.is_active
  if (params.is_staff !== undefined) query.is_staff = params.is_staff
  if (params.role) query.role = params.role

  return query
}

