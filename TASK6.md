# MediaClaw Frontend Task 6: Final Polish + WeChat + Error Handling

## Task 1: WeChat Login Integration
- Add WeChat OAuth button on auth page (green WeChat icon)
- Flow: click → redirect to WeChat OAuth URL → callback → set JWT
- Mock the OAuth flow for now (simulate redirect + callback with URL params)
- Store auth tokens in httpOnly cookie + Zustand
- "Bind WeChat" option in settings page

## Task 2: Payment Pages
- Create `/dashboard/billing/checkout/page.tsx`:
  - Video pack purchase: show pack options (10/50/200/500 videos)
  - Price display with unit price calculation
  - QR code payment display area (placeholder for WeChat/Alipay QR)
  - Order status polling (pending → paid → success animation)
  - Order history table
- Create `/dashboard/billing/subscription/page.tsx`:
  - Current plan display
  - Upgrade/downgrade options
  - Usage bar (credits used / total)
  - Auto-renewal toggle
  - Invoice download links

## Task 3: Real-time Features
- WebSocket connection manager in `src/lib/ws.ts`:
  - Auto-connect on dashboard mount
  - Reconnect with exponential backoff
  - Event handlers: video_completed, video_failed, credit_low, notification
- Video production progress:
  - Real-time progress bar on video cards (0% → 100%)
  - Status transitions: queued → processing → rendering → completed
  - Toast on completion/failure
- Live notification updates (bell badge auto-increment)

## Task 4: Mobile Responsive Deep Pass
- Test and fix all pages for mobile (375px width):
  - Dashboard: stack cards vertically
  - Video list: single column
  - Brand detail: tabs instead of side-by-side
  - Calendar: day view default on mobile
  - Analytics charts: horizontal scroll
  - Settings: full-width form fields
- Bottom tab navigation on mobile (Home/Videos/Create/Analytics/Settings)
- Pull-to-refresh on list pages
- Swipe actions on video cards (delete, download)

## Task 5: Performance + SEO
- Add `loading.tsx` skeletons for all dashboard pages
- Dynamic imports for heavy components (charts, calendar, video player)
- Image optimization with next/image
- Meta tags and Open Graph for landing + pricing pages
- Sitemap generation (`src/app/sitemap.ts`)
- robots.txt

## After completing:
- `npm run build` must pass with 0 errors
- Commit: `git add -A && git commit -m "feat: add wechat auth, payment pages, websocket, mobile responsive, performance"`
- `git push`
