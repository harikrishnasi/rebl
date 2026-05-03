# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### rebl (`artifacts/rebl`)
- **Type**: React + Vite web app
- **Preview path**: `/`
- **Stack**: React 19, Vite, React Router v6, Supabase, Tailwind v4, Recharts, Radix UI, Lucide, react-hot-toast
- **Auth**: Supabase Auth (`src/lib/supabase.js`)
- **AI**: Anthropic Claude via direct API (`src/lib/anthropic.js`)
- **Brand identity**: Void Black `#000000` (80%) · Pure White `#FFFFFF` (15%) · Steel Gray `#A6A6A6` (5%)
- **Brand accent**: `#E63946` (accent/danger/cta only) — NOT a primary accent color
- **Fonts**: Cinzel (DISPLAY/headlines), Satoshi (BODY), Poppins 800 (logo only), Space Mono (MONO/labels)
- **Symbols**: ◈ ⊕ ◎ ✦ · — NO emojis anywhere in UI
- **No rounded corners**: `borderRadius` is 0 everywhere except `'50%'` on avatar/spinner circles, `12` on toggle pill, `4` on checkbox
- **Brand colors (C object)**: `primary:'#000'`, `card:'#0D0D0D'`, `border:'#1A1A1A'`, `cream:'#FFFFFF'`, `accent:'#E63946'`, `gold:'#A6A6A6'`, `muted:'#555555'`
- **Env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ANTHROPIC_API_KEY`

#### Routes
| Path | Component | Protection |
|------|-----------|-----------|
| `/` | LandingPage | — |
| `/login` | AuthPage (login) | — |
| `/signup` | AuthPage (signup) | — |
| `/brand/signup` | BrandSignup | — |
| `/profile/:username` | CollectorProfile | — |
| `/vault/:username` | Vault | — |
| `/brand/:slug` | BrandPage | — |
| `/s/:brandSlug` | BrandSubdomainPage | — |
| `/post-purchase/:id` | PostPurchase | — |
| `/add-item` | AddItem | ProtectedRoute |
| `/dashboard` | Dashboard | ProtectedRoute |
| `/tribe` | TribePage | ProtectedRoute |
| `/brand-dashboard` | BrandDashboard | BrandRoute (role=brand) |
| `/drops` | DropsHome | — |
| `/drops/product/:id` | ProductPage | — |

#### BrandDashboard tabs
- **Customers** — collector list, tiers, smart contact queue, contact log
- **Campaigns** — template grid + campaign composer (subject, body, AI improve, channels, schedule)
- **Backstage** — event type cards, event table, posts, BSCreateEventModal, BSCreatePostModal
- **Settings** — brand info, tiers, theme colors, subdomain

### api-server (`artifacts/api-server`)
- **Type**: Express 5 API
- **Preview path**: `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/rebl run dev` — run rebl frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
