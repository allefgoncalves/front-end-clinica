Frontend <> Backend Audit Report

Date: 2026-09-06

Summary:
- Scope: Verificar chamadas HTTP do frontend e alinhá-las com o contrato implementado no backend (FastAPI + JWT).
- Actions taken so far (automated changes applied):
  - `src/core/store/authStore.ts`
    - Stopped using `/tenants/config` and now decodes JWT `tenant_id` and calls `/tenants/{tenant_id}/config`.
    - Calls authoritative `/auth/me` after login and during `checkAuth()` to populate `user`.
    - Derives `permissions` from `user.role` (admin => wildcard `*`).
    - Calls `/auth/logout` best-effort on logout.
    - Updated TypeScript shapes locally for `TenantConfig` and `AuthState`.
  - `src/core/services/api.ts`
    - Added explicit handling/logging for HTTP 404/422/409/429 and preserved refresh flow for 401.
    - Ensures `X-Tenant-ID` header is attached when `tenant_id` is present in `localStorage`.
  - `src/features/dashboard/components/StatsCard/StatsCard.tsx`
    - Fixed `/admin/carts` → `/cart/admin/all`.
  - `src/features/products/services/productsService.ts` and `src/features/services/services/servicesService.ts`
    - Made `getCategories()` robust to backend returning either an array or `{ categories: [] }`.
  - `src/routes/PrivateRoute.tsx`
    - Avoids immediate redirect to `/login` when an access token is present but state not yet hydrated.
  - `src/features/*/*Service.ts` files
    - Scanned for endpoint usage; no other mismatches found against backend list provided.

Files modified (paths):
- src/core/store/authStore.ts
- src/core/services/api.ts
- src/features/dashboard/components/StatsCard/StatsCard.tsx
- src/features/products/services/productsService.ts
- src/features/services/services/servicesService.ts
- src/routes/PrivateRoute.tsx

Remaining recommended tasks (manual review / follow-ups):
- Update central TypeScript `User` and `Tenant` types in `src/core/types/` and replace ad-hoc definitions across the codebase.
- Validate all service responses against backend schema (e.g., paginated shapes) and add runtime guards where necessary.
- Add user-facing error handling for 401/403/429 flows (toasts/modals) where appropriate.
- Audit any server-side assumptions in backend (cross-tenant behavior) and add client-side safeguards when necessary.
- Create tests or mock server to validate the full auth + tenant loading flow.

Notes / Decisions:
- I treated the backend implementation as source-of-truth: removed any use of `/tenants/config` and replaced with `/tenants/{tenant_id}/config`.
- The backend JWT payload includes `tenant_id`, so the client decodes the token (best-effort) to populate `tenant_id` when `/auth/me` is not yet available.
- Permissions are not present in the JWT per backend contract; frontend now derives a minimal set from `user.role` and will rely on server-side authorizations for security.

Next actions I can take (select one):
- Continue automatic fixes: update TypeScript types across the workspace and tighten service response types.
- Produce a precise list of all endpoints found vs. backend contract with line references.
- Stop and provide the audit report so you can review changes before I continue.


---
End of partial report.
