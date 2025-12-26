# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
bun install

# Development (all apps)
bun run dev

# Development (individual)
bun run dev:web      # Frontend only (port 3001)
bun run dev:server   # Convex backend only

# First-time Convex setup
bun run dev:setup

# Build all apps
bun run build

# Type checking
bun run check-types

# Generate PWA assets
cd apps/web && bun run generate-pwa-assets
```

## Architecture

This is a Bun monorepo using workspaces with the Better-T-Stack pattern.

### Packages

- **apps/web** - React 19 frontend with TanStack Router (file-based routing in `src/routes/`)
- **packages/backend** - Convex functions and schema (in `convex/` directory)
- **packages/env** - Type-safe environment variables using `@t3-oss/env-core` + Zod
- **packages/config** - Shared TypeScript configuration

### Key Integrations

**Authentication flow:**
1. Frontend uses `authClient` from `apps/web/src/lib/auth-client.ts` (Better-Auth React client)
2. Backend auth is in `packages/backend/convex/auth.ts` using `@convex-dev/better-auth`
3. HTTP routes registered in `packages/backend/convex/http.ts`
4. Provider wraps app in `apps/web/src/main.tsx` via `ConvexBetterAuthProvider`

**Convex patterns:**
- Schema defined in `packages/backend/convex/schema.ts`
- Use `authComponent.safeGetAuthUser(ctx)` in queries/mutations to get authenticated user
- Convex component config in `packages/backend/convex/convex.config.ts`

### Path Aliases

- `@/` maps to `apps/web/src/` in frontend code
- `@my-app/env` - Environment variables package
- `@my-app/backend` - Backend functions (auto-generated types in `convex/_generated/`)
- `@my-app/config` - Shared TypeScript config

## Environment Variables

**Frontend (apps/web/.env):**
- `VITE_CONVEX_URL` - Convex deployment URL
- `VITE_CONVEX_SITE_URL` - Convex site URL (ends in `.site`)

**Backend (Convex dashboard or CLI):**
- `BETTER_AUTH_SECRET` - Auth secret (generate with `openssl rand -base64 32`)
- `SITE_URL` - Frontend URL for CORS (e.g., `http://localhost:3001`)
