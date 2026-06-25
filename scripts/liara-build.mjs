/**
 * Liara deploy build for Nuxt SPA (ssr: false).
 * - Generates static assets to .output/public (Nuxt standard)
 * - Mirrors to dist/ for Liara Vue platform nginx (expects app/dist)
 *
 * Liara already runs `yarn install`; do not repeat it in buildCommand.
 */
import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'

process.env.NODE_ENV = 'production'

execSync('nuxt generate', { stdio: 'inherit' })

if (!existsSync('.output/public/index.html')) {
  throw new Error('[liara-build] .output/public/index.html missing after nuxt generate')
}

rmSync('dist', { recursive: true, force: true })
cpSync('.output/public', 'dist', { recursive: true })

if (!existsSync('dist/index.html')) {
  throw new Error('[liara-build] dist/index.html missing after copy')
}

console.log('[liara-build] static output ready: .output/public and dist/')
