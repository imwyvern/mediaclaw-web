# Frontend API Review

## 1. API Route Coverage (`src/lib/api.ts`)

**Matched Routes:**
- `/api/v1/auth/sms/send` -> `api.auth.sendCode`
- `/api/v1/auth/sms/verify` -> `api.auth.verifyCode` and `api.auth.login`
- `/api/v1/auth/enterprise/register` -> `api.auth.registerEnterprise`
- `/api/v1/auth/refresh` -> Handled in Axios response interceptor
- `/api/v1/brand` (CRUD) -> `api.brand.*`
- `/api/v1/content-mgmt` (CRUD) -> `api.content.*`
- `/api/v1/video/task` -> `api.tasks.*`
- `/api/v1/campaign` -> `api.campaigns.*`
- `/api/v1/analytics/overview` -> `api.analytics.overview`

**Missing / Mismatched Routes (P0/P1):**
- **[P0]** `/api/v1/platform-account`: Missing. `api.account.info` currently incorrectly points to `/v1/account`.
- **[P0]** `/api/v1/billing/balance`: Missing from API client. (Note: `api.account.usage` points to `/v1/account/usage` and `BillingAPI.getOrders` to `/v1/billing/orders`).
- **[P0]** `/api/v1/payment/products`: Missing completely.
- **[P0]** `/api/v1/apikey`: Missing completely.
- **[P0]** `/api/v1/skill/config`: Missing completely.

## 2. Auth Flow
- **Status:** Correct. The authentication flow is completely SMS-based via `/api/v1/auth/sms/send` and `/api/v1/auth/sms/verify`. Session management uses `auth_token` and `refresh_token` stored in cookies, which is integrated directly into the `axios` instance for automatic refresh handling.

## 3. Dashboard Data Fetching
- **Status:** Correct. Dashboard pages (`/src/app/dashboard/*`) are successfully importing and using the `api` singleton from `src/lib/api.ts` to fetch data (e.g., `api.brand.list()`, `api.content.list()`, `api.tasks.list()`).

## 4. Issues & Findings

- **[P0] Missing API Clients:** Several critical routes for platform account, billing, payments, apikeys, and skill config are not exposed via the centralized `api` object.
- **[P1] Incorrect Route Paths:** `api.account.info` fetches `/v1/account` instead of the expected `/v1/platform-account`.
- **[P2] Enterprise Registration UI:** The registration form layout on `/auth` is vertically squeezed. Padding and spacing around form inputs and the agreement checkbox need polish.
