import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { readAppVersion } from './read-app-version'

export function writeVersionJson(relativePath: string) {
  const targetPath = resolve(process.cwd(), relativePath)
  const payload = {
    version: readAppVersion(),
    builtAt: new Date().toISOString(),
  }

  mkdirSync(dirname(targetPath), { recursive: true })
  writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`)
}
