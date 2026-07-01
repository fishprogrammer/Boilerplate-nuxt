# فاز ۰ — تحویل فرانت (Nuxt 3)

> **API:** `https://api.store.a4j.ir` · **Swagger:** `/swagger/`  
> مرجع کامل بک‌اند: `PHASE-0.md` (ریپوی Django)

## env

```bash
# Production — direct API (SPA static deploy)
NUXT_PUBLIC_API_BASE_URL=https://api.store.a4j.ir
NUXT_PUBLIC_SITE_URL=https://store.a4j.ir

# Local dev — leave API base empty; Nitro proxies /api → api.store.a4j.ir
NUXT_PUBLIC_API_BASE_URL=
NUXT_PUBLIC_API_PROXY_TARGET=https://api.store.a4j.ir
```

## API زنده در فاز ۰

`auth`, `system`, `media`, `inbox`, `wallet`, `payments` (deposit), `tickets`, `blog`

**Mock تا فاز ۱:** `catalog`, `commerce`, `licensing`, `finance`, `seo`  
(`NUXT_PUBLIC_CATALOG_API_LIVE=false` و مشابه)

**پیاده نکنید:** `/api/marketing/`, `/api/crm/`

## Envelope

```typescript
type ApiSuccess<T> = { status: 'success'; code: string; message: string; data: T; meta: object }
type ApiError = { status: 'error'; code: string; message: string; errors: object | null; data: null; meta: object }
```

- Header: `Accept-Language: fa|en`
- Header: `Authorization: Bearer <token>` (when logged in)
- Logic on **`code`**, not `message`

## Health check

- `GET /api/health/live/` → 200
- Composable: `useApiHealth().verifyLiveHealth()`
- CI: `yarn verify:api-health`

## خطاهای handle (Phase 0)

| code | HTTP | UI |
|------|------|-----|
| `media_storage_error` | 503 | پیام ops / retry — `constants/api-error-codes.ts` |
| `sms_unavailable` | 503 | تماس پشتیبانی |

Mapped in `utils/api-error.ts` → `getApiErrorMessage()`.

## تسک‌های FE-P0S0

| ID | وضعیت | توضیح |
|----|--------|--------|
| FE-P0S0-T01 | ✅ | CI: `.github/workflows/ci.yml` — typecheck + build |
| FE-P0S0-T02 | ✅ | `.env.example` + `config/app.ts` defaults |
| Health verify | ✅ | `scripts/verify-api-health.mjs` + composable |
