/** Iranian mobile: 09 + 9 digits */
export const MOBILE_REGEX = /^09\d{9}$/

export function sanitizeMobileInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function isValidMobile(value: string): boolean {
  return MOBILE_REGEX.test(value.trim())
}

