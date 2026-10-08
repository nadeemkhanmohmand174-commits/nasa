# 🌌 Cosmos Vault

**NASA Research Media & Data Exploration Platform**

Cosmos Vault unifies six NASA data APIs into a single, searchable, exportable platform. Browse APOD, Mars Rover photos, Near-Earth Objects, EPIC Earth imagery, the NASA Image Library, and Tech Transfer patents — then export your findings as PDF, XLSX, CSV, JSON, or ZIP.

## ✨ Features

- **6 NASA Data Sources** — APOD, Mars Rovers, NEO Feed, EPIC Earth, NASA Library, Tech Transfer
- **Advanced Search** — Debounced query with faceted filters (source, kind, year range, rover, camera, hazardous-only)
- **Multi-format Export** — PDF reports with QR codes, Excel spreadsheets with colored tabs, CSV, JSON, ZIP archives
- **Collections** — Create, organize, and share curated collections of NASA media
- **Responsive Design** — Mobile-first with bottom tab bar, desktop sidebar, max-width 1600px
- **Dark/Light Mode** — Deep-space mission control aesthetic with glassmorphism and aurora effects
- **Accessibility** — WCAG AA, keyboard navigation, screen reader support, reduced motion
- **Server-side Caching** — `unstable_cache` with per-endpoint revalidation windows
- **Cloudinary Integration** — Image CDN caching with graceful degradation
- **Supabase Auth** — Email/password, magic link, OAuth (Google + GitHub) with RLS

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser (Client)                │
│  React 18 · TanStack Query · Zustand · Framer   │
│         Tailwind CSS · shadcn/ui · Recharts      │
└────────────────────┬────────────────────────────┘
                     │ /api/*
┌────────────────────▼────────────────────────────┐
│              Next.js Route Handlers              │
│   Zod validation · Rate limiting · Caching      │
└──────┬─────────────────┬────────────────────────┘
       │                 │
┌──────▼──────┐  ┌───────▼───────┐  ┌─────────────┐
│  NASA APIs  │  │   Cloudinary   │  │  Supabase   │
│ api.nasa.gov│  │  Image CDN     │  │  Postgres   │
└─────────────┘  └───────────────┘  └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+ (Node 20 recommended)
- npm or pnpm
- A NASA API key (free at [api.nasa.gov](https://api.nasa.gov))
- Optional: Supabase project, Cloudinary account

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your keys
cp .env.example .env.local

# 3. Fill in .env.local with your values:
#    NASA_API_KEY=your_nasa_key
#    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
#    CLOUDINARY_API_KEY=your_api_key
#    CLOUDINARY_API_SECRET=your_api_secret
#    (Supabase keys are optional — app degrades to browse-only mode)

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_policies.sql`
   - `supabase/migrations/0003_functions.sql`
   - `supabase/seed.sql` (optional demo data)
3. Create Storage buckets:
   - `avatars` (public read, owner write)
   - `user-files` (private)
   - `exports` (private, 7-day lifecycle)
4. Add Supabase URL and anon key to `.env.local`

### Cloudinary Setup

1. Create an account at [cloudinary.com](https://cloudinary.com)
2. Copy your Cloud Name, API Key, and API Secret
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm run format` | Prettier format all files |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |

## 📁 Project Structure

```
cosmos-vault/
├── app/                        # Next.js App Router
│   ├── (marketing)/            # Home page (no sidebar)
│   ├── (app)/                  # App layout (with sidebar)
│   ├── explore/                # Unified search & filter
│   ├── apod/                   # Astronomy Picture of the Day
│   ├── mars/                   # Mars Rover photos
│   ├── neo/                    # Near-Earth Objects
│   ├── earth/                  # EPIC Earth imagery
│   ├── asset/[id]/             # Asset detail viewer
│   ├── collections/            # User collections
│   ├── c/[slug]/               # Public collection share
│   ├── downloads/              # Download history
│   ├── dashboard/              # User dashboard
│   ├── about/                  # About page
│   ├── login/ signup/          # Auth pages
│   ├── api/                    # Route handlers
│   │   ├── nasa/               # NASA proxy routes
│   │   ├── export/             # Export routes (pdf/xlsx/csv/json/zip)
│   │   ├── cloudinary/         # Cloudinary sign & cache
│   │   ├── auth/               # Auth callback
│   │   └── health/             # Health check
│   ├── layout.tsx globals.css  # Root layout & styles
│   ├── error.tsx not-found.tsx # Error boundaries
│   ├── sitemap.ts robots.ts    # SEO
│   ├── manifest.ts             # PWA manifest
│   └── opengraph-image.tsx     # OG image
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/                 # Navbar, Sidebar, Footer
│   ├── media/                  # MediaCard, Grid, Lightbox
│   ├── export/                 # DownloadMenu
│   ├── shared/                 # Starfield, counters, etc.
│   └── providers/              # Theme & Query providers
├── lib/
│   ├── nasa/                   # NASA client + normalizers
│   ├── supabase/               # Supabase clients
│   ├── cloudinary/             # Cloudinary server config
│   ├── export/                 # Client & server export utils
│   ├── api/                    # Error mapper, rate limiter
│   ├── env.ts utils.ts         # Core utilities
│   └── constants.ts logger.ts  # Constants & logger
├── hooks/                      # use-debounce, use-toast, etc.
├── stores/                     # Zustand stores
├── workers/                    # Web Worker for exports
├── types/                      # TypeScript types
├── supabase/migrations/        # SQL migrations
├── tests/                      # Vitest test files
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── .env.example                # Template
├── tailwind.config.ts          # Tailwind config
├── next.config.mjs             # Next.js config
├── tsconfig.json               # TypeScript config
└── vitest.config.ts            # Test config
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NASA_API_KEY` | ✅ | NASA API key (server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Supabase service role (server-only) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ❌ | Cloudinary cloud name |
| `CLOUDINARY_CLOUD_NAME` | ❌ | Same as above (server) |
| `CLOUDINARY_API_KEY` | ❌ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ❌ | Cloudinary API secret (server-only) |
| `UPSTASH_REDIS_REST_URL` | ❌ | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | Upstash Redis token |
| `NEXT_PUBLIC_SITE_URL` | ❌ | Site URL (default: localhost:3000) |
| `NEXT_PUBLIC_APP_NAME` | ❌ | App name (default: Cosmos Vault) |

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **NASA API returns 429** | You've hit the rate limit (1000 req/hr for demo keys). Wait or use a production key. |
| **Images not loading** | Check `next.config.mjs` `remotePatterns`. NASA image hosts are pre-configured. |
| **Supabase auth not working** | Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. Set up the redirect URL in Supabase Auth settings. |
| **Cloudinary uploads fail** | App gracefully falls back to direct NASA URLs. Check API key/secret in `.env.local`. |
| **Build fails on type errors** | Run `npm run typecheck` to see all errors. Ensure no `any` types. |
| **Export ZIP is slow** | ZIP exports cap at 50 images. Large exports use server-side generation via `/api/export/zip`. |
| **Tests fail** | Run `npm run test` — tests use jsdom environment. Ensure `@testing-library/jest-dom` is installed. |
| **Port 3000 in use** | Run `npm run dev -- -p 3001` to use a different port. |

## 🧪 Testing

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
```

Tests cover:
- Utility functions (slugify, formatDate, formatBytes, etc.)
- NASA normalizers (APOD, Mars, EPIC)
- Environment validation
- API error envelopes

## 📄 License

NASA data is in the public domain. Cosmos Vault code is provided as-is for educational purposes.

## 🙏 Credits

- [NASA APIs](https://api.nasa.gov) — Data source
- [Next.js](https://nextjs.org) — React framework
- [shadcn/ui](https://ui.shadcn.com) — UI components
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Supabase](https://supabase.com) — Backend & auth
- [Cloudinary](https://cloudinary.com) — Image CDN
- [Framer Motion](https://www.framer.com/motion) — Animations
- [Recharts](https://recharts.org) — Charts

---

Built with ❤️ for space exploration.
