import { appConfig } from '~/config/app'
import { STORAGE_KEYS } from '~/constants/storage'

const GUEST_TOKEN_KEY = STORAGE_KEYS.GUEST_TICKET_TOKEN

export function getGuestTicketToken(): string {
  return sessionStorage.getItem(GUEST_TOKEN_KEY) || ''
}

export function setGuestTicketToken(token: string): void {
  if (!token) {
    sessionStorage.removeItem(GUEST_TOKEN_KEY)
    return
  }
  sessionStorage.setItem(GUEST_TOKEN_KEY, token)
}

export function clearGuestTicketToken(): void {
  sessionStorage.removeItem(GUEST_TOKEN_KEY)
}

export function getGuestTicketConfig() {
  return {
    ticketTypeId: String(import.meta.env.NUXT_PUBLIC_GUEST_TICKET_TYPE_ID || '').trim(),
    departmentId: String(import.meta.env.NUXT_PUBLIC_GUEST_DEPARTMENT_ID || '').trim(),
  }
}

export function hasGuestTicketConfig(): boolean {
  const { ticketTypeId, departmentId } = getGuestTicketConfig()
  return Boolean(ticketTypeId && departmentId)
}

export function getGuestStoragePrefix(): string {
  return `${appConfig.storagePrefix}-guest-ticket`
}

