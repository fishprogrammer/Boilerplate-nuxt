# Changelog

All notable changes to **Boilerplate Nuxt** / **Soft Store** frontend are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.0.2] — 2026-06-30

### Added — Soft Store Phase 1 (Foundation)

- Public storefront routes: `/fa/`, `/en/`, `/fa|en/shop`, product detail, category pages
- Public blog routes: `/fa|en/blog` (list + article)
- Mock data layer: `mocks/catalog.ts`, `mocks/commerce.ts`, `mocks/licensing.ts`
- Composables: `useApi`, `useAuth`, `useSeoFromApi`, `useCatalog`, `useCommerce`, `useLicensing`
- TypeScript contracts: `types/catalog.ts`, `types/commerce.ts`, `types/licensing.ts`, `types/seo.ts`, `types/api.ts`
- SEO: `useSeoFromApi`, `JsonLd`, `Breadcrumb`, `public/robots.txt`
- Server routes: `robots.txt`, `sitemap.xml` (stub), `_revalidate` webhook stub
- Panel/admin path aliases: `/panel/**`, `/admin/**` → existing dashboard routes
- Checkout placeholder: `/panel/checkout` with coupon validate (mock)
- API endpoint constants for planned `catalog`, `commerce`, `licensing` apps
- Env flags: `NUXT_PUBLIC_CATALOG_API_LIVE`, `COMMERCE_API_LIVE`, `LICENSING_API_LIVE`, `NUXT_PUBLIC_SITE_URL`, `NUXT_REVALIDATE_SECRET`
- `routeRules` for public vs panel/admin zones in `nuxt.config.ts`
- Locale helpers: `utils/locale.ts`, `locales/fa.json`, `locales/en.json`
- Public layout: `layouts/public.vue`

### Fixed — Production deploy (Liara)

- Inject `entry.*.css` into generated HTML via `scripts/inject-entry-css.mjs`
- Windows-safe Liara build: `node node_modules/nuxt/bin/nuxt.mjs generate`
- PWA Workbox: remove HTML from precache (fix Mixed Content on HTTPS)
- Global styles plugin: `plugins/00.global-styles.client.ts`
- Restore `vite:extendConfig` rollup input fix for `ssr: false` dev mode

### Changed — Liara / Tailwind

- Move `tailwindcss`, `@tailwindcss/vite`, `@vite-pwa/nuxt` to `dependencies`
- `.yarnrc`: `install.production false` so devDependencies install on deploy
- `liara.json`: remove `NODE_ENV=production` from build env
- TypeScript shim for `@tailwindcss/vite` + VS Code settings

### Commits

- `bada532` — Soft Store Phase 1 foundation
- `3a301c8` — Production CSS, PWA, cross-platform Liara build
- `691a74a` — Tailwind/PWA deps on Liara production install
- `36d1a3d` — `@tailwindcss/vite` TypeScript resolution

---

## [1.0.1] — 2026-03-25

### Changed

- Default API base URL → `https://api.store.a4j.ir`
- Version bump across `package.json`, `.env.example`, Docker

### Added

- `README.md` with Nuxt setup, env, structure, deploy guide
- `api/utils/health-response.ts`, extended health types
- `getAppPublicOrigin()`, `buildSuggestedPaymentReturnUrl()`
- Routes: `WALLET_DEPOSIT_SUCCESS`, `WALLET_DEPOSIT_FAILURE`

### Fixed

- `/payments/admin/settings` aligned with AmountInput and payment return URL
- `/system-health` aligned with health parser and diagnostics UI

See also: [doc/changelog-1.0.1.html](doc/changelog-1.0.1.html)

---

## [1.0.0] — Initial release

- Nuxt 3 SPA (RTL Persian, Tailwind 4, Pinia, PWA)
- Auth: login, OTP, register, JWT session
- Users, roles, permissions
- Wallet, payments, tickets, inbox, blog, media, system settings
- Docker / docker-compose for deploy
