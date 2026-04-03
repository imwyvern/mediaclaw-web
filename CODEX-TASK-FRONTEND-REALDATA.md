# Codex Task: 前端各板块对齐 PRD — 接真实后端接口

## 目标
当前前端 dashboard 各页面骨架已搭好，部分已接 API，但仍有页面用 mock 数据或缺少 API 调用。
逐页对齐后端真实接口，确保每个页面都调真实 API，无 hardcode 假数据。

**原则**：
- 每个页面修改一个 commit，Conventional Commits 格式
- 深色主题，保持现有设计风格一致
- Anti-AI-Slop 自查：布局有节奏感、空状态有温度、loading/error/success 状态全覆盖
- 提交前确保 `npm run build` 通过
- **不要改 `src/app/auth/page.tsx`**（已手动修复，不要碰）

## API Base
后端 API base: `/api/mediaclaw/` (通过 next.config.ts rewrites 代理到后端)
API client 文件: `src/lib/api/mediaclaw.ts`

## 页面清单

### 1. calendar — 完全 mock，0 个 API 调用
文件: `src/app/dashboard/calendar/page.tsx` (175 行)
- 当前：`MOCK_VIDEOS` 硬编码 4 条假数据
- 改为：
  - 调 GET `/api/mediaclaw/task-mgmt/tasks?status=scheduled&month={YYYY-MM}` 获取排期任务
  - 日历格子显示真实待发布/已发布视频
  - 点击日期弹窗显示当日任务详情
  - loading 骨架屏 + empty state（"本月暂无排期，去创建视频吧"）

### 2. admin — 0 个 API 调用（197 行静态 UI）
文件: `src/app/dashboard/admin/page.tsx`
- 当前：纯 UI shell，Tabs 里内容全是占位
- 改为：
  - 客户管理 tab: GET `/api/mediaclaw/client-mgmt/clients` 列表
  - 系统状态 tab: GET `/api/mediaclaw/health/status` 显示服务健康度
  - 审计日志 tab: GET `/api/mediaclaw/audit/logs?page=1&limit=20` 分页列表
  - 用户列表: GET `/api/mediaclaw/org/members`

### 3. campaigns — 有 1 处 mock fallback
文件: `src/app/dashboard/campaigns/page.tsx`
- 当前：有 API 调用但有 fallback mock
- 改为：去掉 mock fallback，API 失败时显示 error state 而非假数据
- 确保：创建 campaign → POST `/api/mediaclaw/campaign/create`
- 列表、详情、状态更新全部走真实 API

### 4. brands — 有 1 处 mock fallback
文件: `src/app/dashboard/brands/page.tsx`
- 类似 campaigns，去掉 mock fallback
- GET `/api/mediaclaw/brand/list` + POST `/api/mediaclaw/brand/create`
- 品牌资产（logo/色板/字体）上传走 `/api/mediaclaw/asset/upload`

### 5. discovery — page.tsx 只有 5 行（委托给 component）
文件: `src/app/dashboard/discovery/components/discovery-page-client.tsx`
- 当前：已有 9 个 API 引用，基本已接 ✅
- 检查：确保爆款列表、viral score、拆解结果都从真实 API 返回
- 补充：如果 "一键复刻" 按钮还是 disabled/假的，接上 POST `/api/mediaclaw/discovery/remix`

### 6. analytics — 已有 8 个 API 引用
文件: `src/app/dashboard/analytics/page.tsx`
- 当前：大部分已接 API ✅
- 检查：
  - 效果趋势图数据来自 GET `/api/mediaclaw/analytics/overview`
  - 单视频详情来自 GET `/api/mediaclaw/analytics/video/:id`
  - benchmark 对比数据来自 GET `/api/mediaclaw/analytics/benchmark`
  - 确保无 hardcode 的 `sampleSize` 等字段

### 7. content — 已有 4 个 API 引用
文件: `src/app/dashboard/content/page.tsx`
- 当前：基本已接 ✅
- 检查：
  - 内容审核列表 GET `/api/mediaclaw/content-mgmt/list`
  - 审核操作 POST `/api/mediaclaw/content-mgmt/review`
  - 确保状态流转（pending → approved/rejected）在 UI 即时更新

### 8. billing — 已有 4 个 API 引用
文件: `src/app/dashboard/billing/page.tsx` + `billing/checkout/page.tsx`
- 当前：基本已接 ✅
- 检查：checkout 页面的支付 URL 跳转是否用真实 xorpay 返回的 payUrl
- 补充：账单历史 GET `/api/mediaclaw/billing/invoices`

### 9. usage — 已有 4 个 API 引用
文件: `src/app/dashboard/usage/page.tsx`
- 当前：已接 ✅
- 检查：余额显示、扣费历史、包列表数据源正确

### 10. settings — 已有 17 个 API 引用
文件: `src/app/dashboard/settings/page.tsx`
- 当前：已接 ✅ (最完善的页面)
- 检查：BYOK key 保存/列表/删除 全链路正确

### 11. videos — 已有 1 个 API 引用
文件: `src/app/dashboard/videos/page.tsx`
- 当前：只有 1 个 API 调用，可能不够
- 确保：
  - 视频列表 GET `/api/mediaclaw/video/list`
  - 视频详情 GET `/api/mediaclaw/video/:id`
  - 创建视频任务 POST `/api/mediaclaw/video/create`
  - 视频状态（处理中/完成/失败）实时刷新

### 12. subscription — 已有 4 个 API 引用
文件: `src/app/dashboard/subscription/page.tsx`
- 当前：已接 ✅
- 检查套餐列表和当前订阅状态正确

### 13. onboarding — 已有 6 个 API 引用
文件: `src/app/dashboard/onboarding/page.tsx`
- 当前：大部分已接 ✅
- 去掉 mock fallback（第 691 行的 hint 说"不是 mock"——但确保数据源确实不是 mock）

## 优先级
**高优先**（还在用 mock 数据）：calendar、admin、campaigns、brands
**检查确认**（可能已经 OK）：discovery、analytics、videos
**低优先**（基本已接好）：content、billing、usage、settings、subscription、onboarding

## 注意
- API client 在 `src/lib/api/mediaclaw.ts`，已有 fetch wrapper
- 所有新增 API 方法加到这个文件
- 如果后端接口还没实现（返回 404），前端做 graceful handling：显示 "Coming soon" 或 empty state，不 crash
- 用 `useSWR` 或 `useEffect + fetch` 均可，保持与现有页面一致的 pattern
