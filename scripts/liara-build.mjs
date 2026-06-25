/**
 * Liara deploy build for Nuxt SPA (ssr: false).
 * - Generates static assets to .output/public (Nuxt standard)
 * - Mirrors to dist/ for Liara Vue platform nginx (expects app/dist)
 *
 * Liara already runs `yarn install`; do not repeat it in buildCommand.
 */
import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { injectEntryCss } from './inject-entry-css.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nuxtBin = join(root, 'node_modules', 'nuxt', 'bin', 'nuxt.mjs')

if (!existsSync(nuxtBin)) {
  throw new Error('[liara-build] nuxt not found. Run `yarn install` first.')
}

process.env.NODE_ENV = 'production'

execSync(`node "${nuxtBin}" generate`, {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
})

if (!existsSync(join(root, '.output/public/index.html'))) {
  throw new Error('[liara-build] .output/public/index.html missing after nuxt generate')
}

injectEntryCss(join(root, '.output/public'))

const distDir = join(root, 'dist')
rmSync(distDir, { recursive: true, force: true })
cpSync(join(root, '.output/public'), distDir, { recursive: true })

if (!existsSync(join(distDir, 'index.html'))) {
  throw new Error('[liara-build] dist/index.html missing after copy')
}

console.log('[liara-build] static output ready: .output/public and dist/')
