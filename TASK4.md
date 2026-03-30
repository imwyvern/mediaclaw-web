# MediaClaw Frontend Task 4: Final Polish + Missing Pages

## Context
Next.js 15 + shadcn/ui. 11 pages exist (landing, auth, dashboard overview + 8 sub-pages).
API layer (src/lib/api.ts) and Zustand stores (src/lib/store.ts) ready.

## Task: Complete remaining frontend features

### 1. Pricing Page (/pricing)
- Hero section with headline "为每一条爆款视频，赋予品牌灵魂"
- Toggle: 个人版 | 企业版
- Individual pricing cards:
  - 体验版 ¥0 (1条免费) | 单条 ¥29 | 10条包 ¥199 | 30条包 ¥499 | 100条包 ¥1,299
- Enterprise pricing cards:
  - 团队 ¥980/月+¥25/条 | 专业 ¥2,980/月+¥20/条 | 旗舰 定制+¥15/条
- Feature comparison table
- FAQ accordion section
- CTA buttons linking to /auth

### 2. Video Detail Page (/dashboard/videos/[id])
- Video preview player (placeholder for now)
- Metadata panel: title, brand, status, created/completed dates, credits used
- Copy editing section: title, subtitle, hashtags (editable)
- AI suggestions sidebar: "Regenerate Copy", "A/B Variants"
- Timeline: task status history (vertical timeline component)
- Distribution status (published platforms, dates)

### 3. Brand Detail Page (/dashboard/brands/[id])
- Brand header: logo, name, category, created date
- Tabs: Overview | Assets | Videos | Settings
- Overview: stats cards (total videos, active pipelines, success rate)
- Assets: grid of uploaded assets with version history
- Videos: filtered video list for this brand
- Settings: edit brand details form

### 4. Data Export Dialog Component
- Reusable dialog component at `src/components/export-dialog.tsx`
- Format selector: CSV | Excel | JSON
- Date range picker
- Field selection checkboxes
- "Export" button with loading state
- Wire into Analytics and Videos pages

### 5. Responsive Navigation Enhancement
- Mobile hamburger menu for dashboard sidebar
- Slide-out drawer on mobile
- Breadcrumb component for nested pages
- Active route highlighting in sidebar

### 6. Error & Empty States
- Create reusable `src/components/empty-state.tsx`: icon + title + description + CTA button
- Create reusable `src/components/error-boundary.tsx`: error display + retry button
- Apply to ALL dashboard pages (replace any placeholder empty states)
- Loading skeletons for all data-dependent sections

### 7. Theme & Design Polish
- Ensure dark mode support (Next.js theme provider)
- Consistent color palette across all pages
- Hover effects on interactive elements
- Page transition animations (subtle)
- Focus/accessibility indicators

## After completing:
- `npm run build` must pass with 0 errors
- `git add -A && git commit -m "feat: add pricing, video detail, brand detail, export, responsive nav, polish"`
- `git push`
