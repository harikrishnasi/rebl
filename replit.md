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
- **Brand colors**: primary `#0F0F1A`, accent `#E63946`, cream `#F1FAEE`, muted `#8D99AE`, gold `#FFB703`, card `#16162A`
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
