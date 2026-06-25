import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Read semantic version from the single source of truth: `app.version.json`. */
export function readAppVersion(): string {
  try {
    const raw = readFileSync(resolve(process.cwd(), 'app.version.json'), 'utf-8')
    const data = JSON.parse(raw) as { version?: string }
    const version = data.version?.trim()
    return version || '1.0.0'
  } catch {
    return '1.0.0'
  }
}
