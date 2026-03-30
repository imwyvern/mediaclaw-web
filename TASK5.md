# MediaClaw Frontend Task 5: Auth + Registration + Final Integration

## Context
Next.js 15 + shadcn/ui. 16 pages exist. API layer and stores ready.

## Task 1: Enhanced Auth Page (/auth)
- Tab switch: "个人登录" | "企业注册"
- Individual login: phone + SMS code (6-digit) + countdown timer
- Enterprise registration: company name + admin phone + SMS verify + industry select
- "已有账号？登录" / "没有账号？注册" toggle
- Loading states on all buttons
- Error handling with toast notifications

## Task 2: Onboarding Flow (/dashboard/onboarding)
- Step 1: Welcome + select plan (individual/enterprise)
- Step 2: Upload first brand (logo + name + industry)
- Step 3: Try free video (upload source video → preview → generate)
- Step 4: Success celebration + guide to dashboard
- Progress bar at top
- Skip button on each step
- Confetti animation on completion

## Task 3: Notification Center
- Bell icon in dashboard header with unread count badge
- Dropdown panel showing recent notifications:
  - Video completed / failed
  - Subscription expiring
  - Credit running low
  - New marketplace template
- Mark as read / Mark all read
- Link to full notification settings page

## Task 4: Video Player Component
- Reusable component at `src/components/video-player.tsx`
- Controls: play/pause, seek bar, volume, fullscreen
- Status overlay (processing spinner, failed error)
- Thumbnail poster before play
- Use in Video Detail page (`/dashboard/videos/[id]`)

## Task 5: Search & Filter System
- Global search bar in dashboard header (Cmd+K shortcut)
- Search across: videos, brands, campaigns
- Filter components for list pages:
  - Date range picker
  - Status multi-select
  - Brand filter
  - Sort options (newest, oldest, most views)
- Persist filters in URL params

## Task 6: Integration Polish
- Wire all pages to API client (src/lib/api.ts) with proper loading/error states
- Add optimistic updates for common actions (mark published, edit copy)
- Toast notifications for all mutations (success/error)
- Breadcrumb navigation on all nested pages
- 404 page with return to dashboard link
- Favicon + meta tags + Open Graph

## After completing:
- `npm run build` must pass with 0 errors
- `git add -A && git commit -m "feat: add auth flow, onboarding, notifications, player, search, integration polish"`
- `git push`
