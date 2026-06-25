# Boilerplate Nuxt

پنل مدیریت **Nuxt 3** (SPA) با UI فارسی RTL، اتصال به API بک‌اند Django، و ماژول‌های آماده ادمین.

## Nuxt هستیم یا Vue؟

**این پروژه Nuxt 3 است.**

| | این پروژه |
|---|-----------|
| فریم‌ورک | **Nuxt 3** |
| UI | Vue 3 |
| مسیریابی | `pages/` |
| تنظیمات | `nuxt.config.ts` |
| env | `NUXT_PUBLIC_*` |
| اجرا | `yarn dev` → پورت 3000 |

Vue 3 موتور UI است؛ Nuxt لایهٔ فریم‌ورک (routing، build، plugins، middleware، runtime config) را فراهم می‌کند.

## ویژگی‌ها

- **احراز هویت:** ورود، OTP، ثبت‌نام، JWT
- **کاربران:** users، roles، permissions
- **کیف پول:** موجودی، شارژ آنلاین، رسید، مدیریت کیف پول
- **پرداخت:** تنظیمات، درگاه‌ها، سفارش‌ها، واریز دستی
- **تیکت:** کاربر، صف، admin، مهمان
- **اعلان‌ها:** inbox و ارسال
- **وبلاگ:** پست، نظر، HTML editor
- **سیستم:** تنظیمات، health/diagnostics
- **رسانه:** آپلود و مدیریت فایل
- **PWA** و **تم روشن/تاریک**

## استک

| لایه | ابزار |
|------|--------|
| Framework | **Nuxt 3** (Vue 3 + Vue Router 4) |
| State | Pinia (`@pinia/nuxt`) |
| HTTP | Axios |
| UI | Tailwind CSS 4 |
| تاریخ | moment-jalaali, vue3-persian-datetime-picker |
| Editor | Quill |
| PWA | @vite-pwa/nuxt |
| TypeScript | vue-tsc |

## پیش‌نیازها

- Node.js 20+ (توصیه: 22)
- Yarn
- API بک‌اند (پیش‌فرض: `https://api.store.a4j.ir`)

## راه‌اندازی

```bash
git clone git@github.com:fishprogrammer/Boilerplate-nuxt.git
cd Boilerplate-nuxt
yarn install
cp .env.example .env
yarn dev
```

آدرس dev: **http://localhost:3000**

## اسکریپت‌ها

| دستور | کاربرد |
|-------|--------|
| `yarn dev` | سرور توسعه Nuxt |
| `yarn build` | بیلد production |
| `yarn preview` | پیش‌نمایش بیلد |
| `yarn generate` | خروجی static |
| `yarn type-check` | بررسی TypeScript |
| `yarn icons:pwa` | تولید آیکون PWA |

## متغیرهای محیطی (Nuxt)

همهٔ متغیرهای عمومی باید با **`NUXT_PUBLIC_`** شروع شوند تا در client در دسترس باشند.

| متغیر | توضیح |
|-------|--------|
| `NUXT_PUBLIC_API_BASE_URL` | آدرس API (بدون `/api`). خالی = fallback به proxy target |
| `NUXT_PUBLIC_API_PROXY_TARGET` | هدف proxy در dev (پیش‌فرض: `https://api.store.a4j.ir`) |
| `NUXT_PUBLIC_API_TIMEOUT` | تایم‌اوت Axios (ms) |
| `NUXT_PUBLIC_APP_TITLE` | عنوان `<title>` |
| `NUXT_PUBLIC_APP_NAME` | نام PWA |
| `NUXT_PUBLIC_APP_DESCRIPTION` | توضیح meta |
| `app.version.json` | **نسخه اپ** — فقط این فایل را برای bump نسخه ویرایش کنید |
| `NUXT_PUBLIC_APP_THEME_COLOR` | رنگ برند |
| `NUXT_PUBLIC_APP_BG_COLOR` | رنگ پس‌زمینه PWA |
| `NUXT_PUBLIC_APP_STORAGE_PREFIX` | پیشوند localStorage |
| `NUXT_PUBLIC_APP_PUBLIC_URL` | origin فرانت (URL بازگشت پرداخت) |
| `NUXT_PUBLIC_GUEST_TICKET_TYPE_ID` | نوع تیکت مهمان |
| `NUXT_PUBLIC_GUEST_DEPARTMENT_ID` | دپارتمان تیکت مهمان |

> `.env` commit نمی‌شود؛ فقط `.env.example` در ریپو است.

### API در development

- اگر `NUXT_PUBLIC_API_BASE_URL` خالی باشد، درخواست‌ها از `config/app.ts` به `api.store.a4j.ir` می‌روند.
- Nitro در dev می‌تواند `/api` را به `NUXT_PUBLIC_API_PROXY_TARGET` پروکسی کند (تنظیم در `nuxt.config.ts`).

## ساختار پروژه (Nuxt)

```
Boilerplate-nuxt/
├── api/                 # سرویس Axios، types، parser پاسخ
├── assets/              # CSS، فونت (via Nuxt)
├── components/          # auto-import — بدون import دستی در صفحات
├── composables/         # useXxx — auto-import
├── config/app.ts        # تنظیمات متمرکز اپ
├── constants/           # routes، permissions، breadcrumbs
├── layouts/             # dashboard.vue, blank.vue
├── middleware/          # auth.global.ts
├── pages/               # مسیریابی خودکار (/users → pages/users/index.vue)
├── plugins/             # *.client.ts — فقط سمت مرورگر
├── public/              # فایل استاتیک (/logo.png)
├── stores/              # Pinia
├── utils/               # auto-import
├── app.vue              # root
└── nuxt.config.ts       # تنظیمات Nuxt
```

## قراردادهای مهم Nuxt در این پروژه

### صفحات

هر فایل در `pages/` یک route است:

```vue
<!-- pages/users/index.vue -->
<script setup lang="ts">
definePageMeta({
  name: 'users',
  layout: 'dashboard',
})
</script>
```

### Layout

- `layout: 'dashboard'` — سایدبار + هدر (اکثر صفحات ادمین)
- `layout: 'blank'` — login، register، guest tickets

### Middleware

`middleware/auth.global.ts` روی همهٔ routeها اجرا می‌شود و session/permission را چک می‌کند.

### Importها

در Nuxt معمولاً نیازی به import `ref`، `computed`، composableها و بسیاری componentها نیست — auto-import فعال است. مسیر alias: `~/` (مثلاً `~/api/client`).

### مسیرها و دسترسی

- مسیرها: `constants/routes.ts` → `ROUTES.USERS`
- permissionها: `constants/permissions.ts` → `usePermissions()`

## ماژول‌های صفحات

| مسیر | ماژول |
|------|--------|
| `/login`, `/verify`, `/register` | احراز هویت |
| `/users`, `/roles`, `/permissions` | کاربران |
| `/wallet`, `/wallet/deposit`, `/wallet/manage` | کیف پول |
| `/payments/admin/*` | پرداخت |
| `/tickets/*` | تیکت |
| `/notifications/*` | اعلان |
| `/blog/*` | وبلاگ |
| `/system-settings`, `/system-health` | سیستم |
| `/media` | رسانه |

## Liara

در پنل Liara نوع اپ را **Static** بگذارید (نه Vue). `liara.json` برای Nuxt تنظیم شده:

| تنظیم | مقدار |
|-------|--------|
| build | `yarn build:liara` → `nuxt generate` |
| خروجی static | `.output/public` |
| fallback Vue platform | کپی خودکار به `dist/` |

```bash
liara deploy
```

بعد از deploy: `https://your-app.liara.run/version.json` باید نسخه `app.version.json` را برگرداند.

> اگر اپ روی **Vue platform** مانده، اسکریپت `build:liara` خروجی را به `dist/` هم می‌کشد تا خطای `app/dist not found` رفع شود. ترجیحاً platform را **Static** کنید.

## Docker

```bash
docker compose up --build
# یا
docker build -t boilerplate-nuxt .
```

## Deploy و نکات production

- **SSR خاموش است** (`ssr: false`) — خروجی SPA/client-only است.
- قبل از deploy: `yarn type-check` و `yarn build:liara` (یا `yarn generate`)
- `NUXT_PUBLIC_APP_PUBLIC_URL` را برای callback درگاه پرداخت تنظیم کنید.
- نسخه را فقط در `app.version.json` تغییر دهید؛ build فایل `/version.json` را می‌سازد.
- متغیرهای `NUXT_PUBLIC_*` در زمان **build** bake می‌شوند؛ برای Docker از `ARG`/`ENV` در `Dockerfile` استفاده شده.

## لایسنس

Private — استفاده داخلی / پروژه شخصی.
