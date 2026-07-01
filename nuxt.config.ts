import tailwindcss from '@tailwindcss/vite'
import { readAppVersion } from './config/read-app-version'
import { writeVersionJson } from './config/write-version-json'

const appVersion = readAppVersion()

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-01',
  ssr: false,

  routeRules: {
    '/': { prerender: true },
    '/shop/**': { prerender: true },
    '/blog': { prerender: true },
    '/en/**': { prerender: true },
    '/panel/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/verify': { ssr: false },
  },

  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  css: ['~/assets/css/style.css', '~/assets/fonts/index.css'],

  imports: {
    dirs: ['utils', 'constants', 'config'],
  },

  alias: {
    '@': '.',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: 'My App',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'application-name', content: 'My App' },
        { name: 'description', content: 'An admin dashboard' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        {
          rel: 'preload',
          href: '/fonts/woff2/YekanBakhFaNum-Regular.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      apiProxyTarget: process.env.NUXT_PUBLIC_API_PROXY_TARGET || 'https://api.store.a4j.ir',
      apiTimeout: process.env.NUXT_PUBLIC_API_TIMEOUT || '30000',
      appTitle: process.env.NUXT_PUBLIC_APP_TITLE || 'My App',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'My App',
      appDescription: process.env.NUXT_PUBLIC_APP_DESCRIPTION || 'An admin dashboard',
      appVersion,
      appThemeColor: process.env.NUXT_PUBLIC_APP_THEME_COLOR || '#00B894',
      appBgColor: process.env.NUXT_PUBLIC_APP_BG_COLOR || '#f4f5f6',
      appStoragePrefix: process.env.NUXT_PUBLIC_APP_STORAGE_PREFIX || 'app',
      guestTicketTypeId: process.env.NUXT_PUBLIC_GUEST_TICKET_TYPE_ID || '',
      guestDepartmentId: process.env.NUXT_PUBLIC_GUEST_DEPARTMENT_ID || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://store.a4j.ir',
      catalogApiLive: process.env.NUXT_PUBLIC_CATALOG_API_LIVE || 'false',
      commerceApiLive: process.env.NUXT_PUBLIC_COMMERCE_API_LIVE || 'false',
      licensingApiLive: process.env.NUXT_PUBLIC_LICENSING_API_LIVE || 'false',
    },
    revalidateSecret: process.env.NUXT_REVALIDATE_SECRET || 'change-me-in-production',
  },

  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },

  hooks: {
    ready() {
      writeVersionJson('public/version.json')
    },
    'build:done'() {
      writeVersionJson('.output/public/version.json')
    },
    'vite:extendConfig'(config) {
      const rollupInput = config.build?.rollupOptions?.input

      if (
        !rollupInput ||
        typeof rollupInput === 'string' ||
        Array.isArray(rollupInput)
      ) {
        return
      }

      const firstInput = Object.values(rollupInput).find(
        (value) => typeof value === 'string',
      )

      if (!firstInput) {
        return
      }

      if (!rollupInput.entry) {
        rollupInput.entry = firstInput
      }

      if (!rollupInput.server) {
        rollupInput.server = firstInput
      }
    },
  },

  nitro: {
    preset: 'static',
    devProxy: {
      '/api': {
        target: process.env.NUXT_PUBLIC_API_PROXY_TARGET || 'https://api.store.a4j.ir',
        changeOrigin: true,
        secure: true,
      },
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    devOptions: {
      enabled: false,
    },
    workbox: {
      mode: 'production',
      cleanupOutdatedCaches: true,
      // Do not precache generated route HTML files: Workbox may fetch them over http://
      // during install and break the service worker on HTTPS static hosts.
      globPatterns: ['**/*.{js,css,ico,png,svg,woff,woff2,webmanifest}'],
      navigateFallback: '/index.html',
      navigateFallbackDenylist: [/^\/_nuxt\//, /^\/api\//],
      additionalManifestEntries: [
        { url: '/version.json', revision: appVersion },
        { url: '/index.html', revision: appVersion },
      ],
      runtimeCaching: [
        {
          urlPattern: /^\/version\.json$/,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 5,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
      skipWaiting: true,
      clientsClaim: true,
    },
    includeAssets: [
      'logo.png',
      'pwa-icon-192.png',
      'pwa-icon-512.png',
      'pwa-icon-192-maskable.png',
      'pwa-icon-512-maskable.png',
      'apple-touch-icon.png',
    ],
    manifest: {
      name: 'My App',
      short_name: 'My App',
      description: 'An admin dashboard',
      theme_color: '#00B894',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: 'pwa-icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'pwa-icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'pwa-icon-192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'pwa-icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
  },
})
