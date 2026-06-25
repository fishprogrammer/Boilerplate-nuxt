import { appConfig } from '~/config/app'

const p = appConfig.storagePrefix

/** Centralised localStorage key constants — avoids string typos across files. */
export const STORAGE_KEYS = {
  TOKEN: `${p}-token`,
  REFRESH_TOKEN: `${p}-refresh_token`,
  USER_ID: `${p}-user_id`,
  THEME: `${p}-theme`,
  GUEST_TICKET_TOKEN: `${p}-guest_ticket_token`,
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

