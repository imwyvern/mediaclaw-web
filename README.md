# 🎬 MediaClaw Web Dashboard

<div align="center">

**AI-Powered Content Monetization Dashboard**

Built with Next.js 15 · shadcn/ui · TypeScript

[Backend API](https://github.com/imwyvern/mediaclaw-server)

</div>

---

## Overview

MediaClaw Web is the frontend dashboard for the [MediaClaw platform](https://github.com/imwyvern/mediaclaw-server) — an AI-powered system that automatically discovers viral video content, integrates brand elements, and distributes across multiple platforms.

### Features

- 📊 **Analytics Dashboard** — Real-time metrics on content performance, views, and revenue
- 🎥 **Video Management** — Browse, filter, and manage AI-processed video content
- 🏷️ **Brand Integration** — Configure brand assets, logos, and overlay settings
- 📱 **Multi-Platform Distribution** — Manage publishing across TikTok, YouTube Shorts, Instagram Reels
- 🤖 **AI Pipeline Monitor** — Track the status of automated video processing workflows
- 🌙 **Dark Mode** — Full dark/light theme support via shadcn/ui

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript
- **State:** React Server Components + Client hooks
- **Auth:** Session-based authentication
- **API:** REST client connecting to [mediaclaw-server](https://github.com/imwyvern/mediaclaw-server)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API endpoint

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
src/
├── app/            # Next.js App Router pages
├── components/     # Reusable UI components (shadcn/ui)
├── lib/            # API clients, utilities
├── hooks/          # Custom React hooks
└── types/          # TypeScript type definitions
```

## Related

- [mediaclaw-server](https://github.com/imwyvern/mediaclaw-server) — Backend API & AI pipeline
- [viral-brand-video](https://github.com/imwyvern/viral-brand-video) — Video processing engine

## License

MIT
