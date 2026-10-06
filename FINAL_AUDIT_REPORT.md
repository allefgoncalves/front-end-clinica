Final Frontend Audit — Align with Backend (FastAPI + JWT)

Date: 2026-09-06

1) Summary of work completed
- Full audit of frontend API usage and alignment with backend contract.
- Automated fixes applied where frontend assumed non-existent endpoints or mismatched payloads.
- Centralized minimal types and ensured tenant-aware auth flow.

2) Files changed
- `src/core/store/authStore.ts` — implement JWT decode for tenant_id, call `/auth/me`, use `/tenants/{tenant_id}/config`, derive permissions from `user.role`, call `/auth/logout` best-effort.
- `src/core/services/api.ts` — added robust response handling for 401 refresh, and logging for 404/422/409/429; attaches `X-Tenant-ID` header when available.
- `src/features/dashboard/components/StatsCard/StatsCard.tsx` — `/admin/carts` → `/cart/admin/all`.
- `src/features/products/services/productsService.ts` — robust `getCategories()` parsing.
- `src/features/services/services/servicesService.ts` — robust `getCategories()` parsing.
- `src/routes/PrivateRoute.tsx` — avoid immediate redirect on token present; show loading while hydrating store.
- `src/core/types/index.ts` — new central types: `User` and `TenantConfig`.
- `AUDIT_REPORT.md`, `FINAL_AUDIT_REPORT.md` — reports.

3) URLs corrected (frontend → backend official)
- `/tenants/config` (removed) — REPLACED BY `/tenants/{tenant_id}/config` (implemented in `authStore`).
- `/admin/carts` → `/cart/admin/all` (fixed in `StatsCard.tsx`).
- All other endpoints used in frontend were verified to match backend contract (auth, products, services, appointments, promotions, sales, carts, goals, dashboard).

4) Payloads corrected
- Cart snapshot discount: frontend now sends `{ discount_percent }` in request body to `/cart/admin/snapshots/{snapshot_id}/discount` (was previously using query param in one place).
- Login flow preserved: POST `/auth/login` body `{ email, password }` — response handled as implemented by backend (access_token, refresh_token, user).
- Token refresh: frontend uses POST `${API_URL}/auth/refresh` with `{ refresh_token }` (unchanged, confirmed matching backend contract).

5) TypeScript interfaces added/updated
- Added `src/core/types/index.ts` with:
  - `User` (id, email, name, phone?, role, picture?)
  - `TenantConfig` (id, tenant_id, branding, settings, created_at, updated_at)
- Updated `src/core/store/authStore.ts` to import and use those central types.
- Recommendation: replace ad-hoc `User`/`Tenant` shapes across workspace with these central types (not fully applied everywhere yet).

6) HTTP errors handled explicitly
- `src/core/services/api.ts` interceptor:
  - 401: attempts refresh with `refresh_token`; on failure clears storage and redirects to `/login`.
  - 403: redirects to `/unauthorized`.
  - 404 / 422 / 409 / 429: logs and surfaces warnings to console (recommended: show UI toasts).

7) Final authentication & tenant-loading flow (implemented)
1. User submits credentials to POST `/auth/login` with `{ email, password }`.
2. On success, backend returns `{ access_token, refresh_token, token_type, user }`.
3. Frontend stores `access_token` and `refresh_token` in `localStorage` and sets `Authorization` header.
4. Frontend decodes JWT payload (best-effort) to obtain `tenant_id` and stores it in `localStorage`.
5. Frontend calls GET `/auth/me` to load authoritative `user` and derive minimal `permissions` (currently `admin` → `*`).
6. Frontend calls GET `/tenants/{tenant_id}/config` to load `branding` and `settings` for the tenant.
7. Store (`useAuthStore`) is populated with `user`, `token`, `tenant`, `branding`, and `permissions`.
8. All API requests include `X-Tenant-ID` header (if `tenant_id` present) via `api` interceptor.

Notes: the frontend does NOT assume `role`, `permissions` or `scopes` exist in the JWT; it derives permissions from `user.role` and relies on backend for enforcement.

8) Inconsistencies found and corrections
- IMPLEMENTADO: frontend used `/tenants/config` — backend exposes `/tenants/{tenant_id}/config`. Fixed in `authStore`.
- IMPLEMENTADO: frontend expected `branding` + `permissions` together in the tenant config. Backend returns `branding` and `settings`. Frontend now maps `branding` and keeps `permissions` derived from `user.role`.
- OBSERVAÇÃO: backend JWT does not include `role` or `permissions` — frontend no longer assumes they do.
- POTENTIAL RISK: some backend endpoints may not always include tenant-scoped filters; frontend guards added by sending `X-Tenant-ID`, but server-side must enforce tenant isolation.

9) Deliverables (what I’m handing over)
- Code changes (see file list above). Commit these changes locally.
- `AUDIT_REPORT.md` (partial) and `FINAL_AUDIT_REPORT.md` (this file).
- Recommended next steps to fully complete the audit (see section 10).

10) Recommended next steps (not yet fully applied)
- Replace all ad-hoc user/tenant types with central `src/core/types/index.ts` across workspace.
- Add UI-level error handling (toasts/modals) for 401/403/429/422 to improve UX.
- Add runtime validation (zod/io-ts) for critical API responses to avoid silent mismatches.
- Add E2E tests for auth + tenant loading and permission-protected routes.
- Perform a security review to ensure no frontend logic authorizes actions — backend must be the source of truth for authorization.

If you want, I can now:
- continue and replace all type occurrences across the codebase with central types;
- add UI toasts for API errors and a global error boundary;
- run a quick build/test to verify TypeScript errors.

Tell me which of these follow-ups to perform next and I will continue until fully completed.