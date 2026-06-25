/**
 * Liara deploy build for Nuxt SPA (ssr: false).
 * - Generates static assets to .output/public (Nuxt standard)
 * - Mirrors to dist/ for Liara Vue platform nginx (expects app/dist)
 *
 * Liara already runs `yarn install`; do not repeat it in buildCommand.
 */
import { execSync } from 'node:child_process'
import { cpSync, rmSync } from 'node:fs'

process.env.NODE_ENV = 'production'

execSync('nuxt generate', { stdio: 'inherit' })

rmSync('dist', { recursive: true, force: true })
cpSync('.output/public', 'dist', { recursive: true })

console.log('[liara-build] .output/public → dist (vue-platform fallback)')
