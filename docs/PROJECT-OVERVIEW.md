# Billing frontend — how this project works

This document explains the architecture of **billing_frontend**: a Next.js single-page application that talks to a **Laravel billing backend** over HTTP, using **Sanctum**-style sessions and **Bearer tokens**.

---

## 1. What this app is

- **Role:** Browser UI for billing operations (companies, customers, invoices, vendors, payments, ranks, audit logs, dashboard analytics, etc.).
- **Backend:** A separate Laravel app exposes JSON under **`/api/...`** (proxied same-origin at **`/api/...`** on this Next app).
- **This repo:** Only the Next.js frontend — no Laravel code here.

---

## 2. Tech stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **Tailwind CSS 4** |
| Server data | **TanStack React Query** (`@tanstack/react-query`) |
| HTTP | **Axios** (`apiClient` in `src/lib/api/axiosClient.ts`) |
| Auth token | **localStorage** + sync for React (`tokenStore.ts`) |

---

## 3. High-level request flow

```
Browser UI (React)
    ↓ Axios baseURL: /api
Next.js Route Handler (src/app/api/[[...path]]/route.ts)
    ↓ proxies to Laravel
Laravel origin + /api/...
```

1. The **browser never calls the Laravel origin directly** for normal API traffic. It calls paths on **this Next.js app** (e.g. `/api/auth/login`).
2. A **Route Handler** forwards the request to the real billing backend (see `src/lib/env.ts` for origin resolution and TLS options).
3. **Sanctum CSRF** for cookie-based flows uses `/sanctum/csrf-cookie` (see `src/app/sanctum/csrf-cookie/route.ts` and `sanctum.service.ts`).

Server-side code (SSR, route handlers) may use an internal origin (`INTERNAL_NEXT_ORIGIN`) so the proxy loopback works in Docker/Kubernetes.

---

## 4. Authentication

### Login

- **Endpoint (via proxy):** `POST .../api/auth/login` with `samaccountname`, `password`.
- **Response:** Envelope with `data.access_token` (and related fields). Login is implemented with careful handling of CSRF and body transport (`auth.service.ts`, `postJsonWithXhr.ts` where needed).
- **Storage:** JWT is stored via `setStoredToken` in `src/lib/auth/tokenStore.ts`.
- **`expires_in`:** The billing API sends **`expires_in` in minutes**. The client converts to **seconds** for an absolute expiry timestamp in storage (`loginExpiresInMinutesToStorageSeconds`). Do not treat the raw value as OAuth “seconds” unless you change the backend contract.

### Authenticated calls

- Axios **request interceptor** attaches `Authorization: Bearer <jwt>` when a token exists.
- If the stored session is **past expiry**, the client can clear the token before sending (see `clearSessionIfExpired` / axios client docs in `axiosClient.ts`).
- **401 / 403** (client): typically clear token and redirect to **`/login`**.

### Logout

- `POST .../api/logout` (with CSRF where required), then **`clearStoredToken`**.
- The app navigates to **`/login`** after sign-out (`useAuthSessionMutations.ts`).

### Context

- `AuthProvider` (`src/contexts/auth-context.tsx`) exposes `token`, `login`, `logout`, and login mutation state to the tree.

---

## 5. API shape in the UI

- Most JSON responses follow a Laravel **`ApiResponse`** style: `{ success, message, action?, data }`.
- Helpers unwrap `data` where needed (e.g. `unwrapApiSuccessData`, list extraction in `extractApiData.ts`).
- **Validation errors** often return **422** with `errors` / `message`.

### Path builders

- **`src/lib/routes/apiRoutes.ts`** — central builders for backend paths **relative to** the Axios `baseURL` (this app’s `/api`, which maps to Laravel `/api/...`).

### HTTP helpers

- **`src/lib/api/http.ts`** — thin wrappers: `apiGet`, `apiPost`, `apiPut`, `apiDelete`, etc., all using `apiClient`.

### Services

- **`src/services/*.service.ts`** — one module per domain (e.g. `invoices.service.ts`, `auth.service.ts`). They call `apiRoutes` + `apiGet`/`apiPost`/….

### React Query

- **`src/hooks/**`** — `useXxx` for queries, `useXxxMutations` for writes where applicable.
- **`src/lib/queryKeys.ts`** — stable query keys for cache invalidation.

---

## 6. App Router structure

| Area | Purpose |
|------|---------|
| `src/app/page.tsx` | Entry / landing |
| `src/app/login/` | Login UI |
| `src/app/(app)/` | Authenticated shell routes (dashboard, vendors, invoices, …) |
| `src/app/api/[[...path]]/` | Proxy to Laravel `/api/*` |
| `src/app/sanctum/csrf-cookie/` | CSRF cookie for Sanctum |

Layout: **`(app)/layout.tsx`** wraps pages in **`AppShell`** (sidebar, top bar, scroll area).

---

## 7. UI organization (conventions)

Aligned with `AGENTS.md` in the repo:

- **`app/`** — routes only (`page.tsx`, `layout.tsx`).
- **`components/views/`** — page-level views (e.g. `VendorCrudView`, `InvoiceCrudView`).
- **`components/layout/`**, **`components/providers/`**, **`components/dashboard/`**, **`components/ui/`** — shared chrome and widgets.
- **`components/crud/`** — reusable CRUD pieces (`CrudEntityTable`, `RecordDetailModal`, `FormModal`, …).
- **`hooks/<domain>/`** — React Query hooks per domain.
- **`models/*.ts`** — TypeScript types for API entities.
- **`lib/routes/apiRoutes.ts`** — API path builders.

---

## 8. Environment variables (essentials)

Documented in detail in **`src/lib/env.ts`**. Typical needs:

- **`NEXT_PUBLIC_BILLING_BACKEND_URL`** — Laravel app origin (no trailing slash), e.g. `https://accounts.example.com`.
- Alternatives / legacy names are supported (`NEXT_PUBLIC_LARAVEL_API_URL`, `NEXT_PUBLIC_API_BASE_URL`) — see `env.ts`.
- **`INTERNAL_NEXT_ORIGIN`** — when the server must call this Next app by an internal URL (not `localhost`).
- **`API_TLS_INSECURE`** — for self-signed HTTPS to the backend from Node (dev only, use with care).

---

## 9. Middleware / proxy note

- **`src/proxy.ts`** runs on matched routes for logging; API and sanctum routes are excluded so POST bodies stay intact for Route Handlers.

---

## 10. Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # production server
npm run lint   # ESLint
```

---

## 11. Further reading

- **`AGENTS.md`** — AI/agent and file-naming conventions for this repo.
- **`CLAUDE.md`** — points at `AGENTS.md`.
- **Next.js** — see `node_modules/next/dist/docs/` for this project’s Next.js version (may differ from public docs).

If you change backend contracts (paths, `expires_in` units, envelopes), update **`apiRoutes.ts`**, relevant **services**, and this document.
