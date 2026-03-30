# MediaClaw Frontend Full Code Review + Build Verification

## Context
Next.js 15 + shadcn/ui. 17 pages, ~30 components, API layer + stores.

## Phase 1: Build & Lint Verification
1. `npm run build` — must pass with 0 errors, 0 warnings
2. `npx next lint` — fix all lint errors
3. Check for TypeScript strict mode issues
4. Verify all imports resolve (no missing deps)

## Phase 2: Full Code Review

### Security
- [ ] No API keys/secrets hardcoded in client code
- [ ] Auth tokens stored securely (httpOnly cookies preferred, not localStorage)
- [ ] All API calls include auth headers
- [ ] No XSS vectors (dangerouslySetInnerHTML, unescaped user input)
- [ ] CSRF protection on mutation endpoints
- [ ] Sensitive routes protected by auth check (middleware or client guard)

### Data & State
- [ ] Zustand stores have proper types (no `any`)
- [ ] API error handling on ALL fetch calls (try/catch + user-facing error)
- [ ] Loading states on ALL async operations
- [ ] No stale data issues (proper cache invalidation after mutations)
- [ ] Form validation on ALL input forms (auth, brand, settings, payment)
- [ ] Pagination implemented correctly (no off-by-one, proper empty state)

### Architecture
- [ ] No prop drilling >3 levels (use context or stores)
- [ ] Components are properly split (no 500+ line single files)
- [ ] Consistent file naming (kebab-case for files, PascalCase for components)
- [ ] All pages have proper metadata (title, description)
- [ ] Dynamic imports for heavy components (charts, calendar, video player)
- [ ] Proper error boundaries on all dashboard pages
- [ ] 404 page works

### UI/UX Quality
- [ ] All interactive elements have hover/focus/active states
- [ ] Loading skeletons on data-fetching pages (not blank white)
- [ ] Empty states have helpful message + CTA
- [ ] Toast notifications for all mutations (success + error)
- [ ] Responsive: test at 375px, 768px, 1024px, 1440px breakpoints
- [ ] Dark mode consistency (no unstyled light elements)
- [ ] Keyboard navigation works (tab order, enter to submit)
- [ ] All images use next/image with proper alt text

### Performance
- [ ] No unnecessary re-renders (check memo/useMemo usage)
- [ ] API calls not duplicated (proper useEffect deps)
- [ ] Large lists virtualized or paginated
- [ ] Images optimized (next/image, proper sizes)
- [ ] Bundle size reasonable (check for heavy unused deps)

## Phase 3: Fix All Issues
- Fix ALL security issues immediately
- Fix ALL data/state issues
- Fix architecture issues where straightforward
- Fix UI/UX issues that are quick wins
- Document remaining issues as TODO comments

## Phase 4: Final Pass
1. `npm run build` — 0 errors
2. `npx next lint` — 0 errors
3. Commit: `fix: frontend code review — security, data handling, UI polish`
4. `git push`

Print "FRONTEND CODE REVIEW COMPLETE" at end.
