# MediaClaw Frontend Task 3: Advanced Dashboard Features

## Context
Next.js 15 project with shadcn/ui. Dashboard layout + 6 sub-pages exist.
Build currently passes with 10 routes. Backend API at /api/v1/*.

## Task: Add advanced features to existing pages + new pages

### 1. Content Calendar (/dashboard/calendar)
- Weekly + Monthly toggle view
- Calendar grid showing scheduled videos per day
- Click day to see video list
- Drag-drop to reschedule (use state only, no real API)
- Color-coded by status (draft=gray, scheduled=blue, published=green, failed=red)
- "Schedule New" button opens dialog
- Use date-fns for date manipulation (install if needed)

### 2. Admin Panel (/dashboard/admin)
- Tab layout: Clients | System | Config
- **Clients tab**: table of organizations with name, plan, video count, status, created date
- **System tab**: system health indicators (API status, worker queue depth, storage usage)
- **Config tab**: global settings form (max concurrent jobs, default credits, notification settings)
- Access control note in UI: "Admin access required"

### 3. Batch Operations Enhancement (/dashboard/videos)
- Add select-all checkbox to videos table
- Batch action bar (appears when items selected): "Download ZIP", "Edit Copy", "Delete"
- "Download ZIP" shows progress modal
- "Edit Copy" opens bulk editor with AI suggestions

### 4. Data Export Feature
- Add export button to Analytics and Videos pages
- Export dialog: format (CSV/Excel/PDF), date range, fields selection
- Show download progress

### 5. Auth Flow Enhancement (/auth)
- Update auth page with tabs: "个人登录" | "企业注册"
- Individual: phone + SMS code input
- Enterprise: company name + phone + admin name
- Terms of service checkbox
- Loading states on submit

### 6. API Integration Layer
Create `src/lib/api.ts`:
- Axios instance with base URL, JWT interceptor, refresh token logic
- Type definitions for all API responses
- Functions: `login()`, `getVideos()`, `getBrands()`, `getAnalytics()`, `getOrders()`, `getProfile()`
- Error handling with toast notifications

### 7. Global State Management
Create `src/lib/store.ts`:
- Use Zustand (install) for client state
- Stores: `useAuthStore` (user, token, org), `useVideoStore` (list, filters), `useBrandStore`
- Persist auth to localStorage

## Design Rules
- Follow existing design system
- All new pages need loading skeleton + empty state + error state
- Mobile responsive
- Use shadcn components consistently

## After completing:
- `npm run build` must pass with 0 errors
- `git add -A && git commit -m "feat(dashboard): add calendar, admin, batch ops, export, auth flow, API layer, state management"`
- `git push`
