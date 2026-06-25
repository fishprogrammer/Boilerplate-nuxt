const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

export function normalizeNationalIdInput(value: string): string {
  return value
    .trim()
    .split('')
    .map((char) => {
      const persianIndex = PERSIAN_DIGITS.indexOf(char)
      if (persianIndex >= 0) return String(persianIndex)
      const arabicIndex = ARABIC_DIGITS.indexOf(char)
      if (arabicIndex >= 0) return String(arabicIndex)
      return char
    })
    .join('')
    .replace(/\D/g, '')
}

export function getNationalIdValidationError(raw: string, options?: { required?: boolean }): string | null {
  const normalized = normalizeNationalIdInput(raw)
  if (!normalized) {
    return options?.required ? 'کد ملی الزامی است.' : null
  }
  if (normalized.length !== 10) return 'کد ملی باید دقیقاً ۱۰ رقم باشد.'
  if (!isValidNationalId(normalized)) return 'کد ملی معتبر نیست.'
  return null
}

export function isValidNationalId(value: string): boolean {
  const digits = normalizeNationalIdInput(value)
  if (!/^\d{10}$/.test(digits)) return false
  if (/^(\d)\1{9}$/.test(digits)) return false

  const check = Number(digits[9])
  let sum = 0
  for (let i = 0; i < 9; i += 1) {
    sum += Number(digits[i]) * (10 - i)
  }
  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check === 11 - remainder
}

export function formatNationalIdDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return '—'
  return normalizeNationalIdInput(value)
}

