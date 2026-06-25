/**
 * Nuxt SPA (ssr: false) shells do not always emit a stylesheet link for entry.css.
 * Inject the built Tailwind bundle into every generated HTML file so production
 * static hosts load styles on first paint.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function findHtmlFiles(dir) {
  /** @type {string[]} */
  const files = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(path))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path)
    }
  }

  return files
}

/**
 * @param {string} publicDir
 */
export function injectEntryCss(publicDir) {
  const nuxtAssetsDir = join(publicDir, '_nuxt')
  if (!existsSync(nuxtAssetsDir)) {
    throw new Error(`[inject-entry-css] missing ${nuxtAssetsDir}`)
  }

  const entryCss = readdirSync(nuxtAssetsDir).find(
    (name) => name.startsWith('entry.') && name.endsWith('.css'),
  )

  if (!entryCss) {
    throw new Error(`[inject-entry-css] entry.*.css not found in ${nuxtAssetsDir}`)
  }

  const linkTag = `<link rel="stylesheet" href="/_nuxt/${entryCss}" crossorigin>`
  const htmlFiles = findHtmlFiles(publicDir)

  if (htmlFiles.length === 0) {
    throw new Error(`[inject-entry-css] no HTML files found in ${publicDir}`)
  }

  let patched = 0

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    if (html.includes(entryCss) || html.includes(linkTag)) {
      continue
    }
    if (!html.includes('</head>')) {
      continue
    }

    writeFileSync(file, html.replace('</head>', `  ${linkTag}\n</head>`))
    patched += 1
  }

  console.log(`[inject-entry-css] linked /_nuxt/${entryCss} in ${patched} html file(s)`)
}
