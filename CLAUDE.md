# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Platform Les Privat: a web app for independent private tutors in Indonesia (Next.js 16 + React 19 + TypeScript, Supabase Postgres/Auth, Tailwind 4, Zod 4). Each tutor (*guru*) has a private workspace (students, session packages, lessons, payments) plus a public, admin-moderated profile that parents can search. Guardians (*wali*) get a read-only summary through an expiring link, with no account.

Product language is Indonesian: UI strings, error messages, comments, and docs are Indonesian. Keep that when adding user-facing text. Use the terms in `GLOSSARY.md` exactly (e.g. *paket habis* ≠ *paket ditutup*; *status menerima murid* ≠ profile publication status). `PRD_Platform_Les_Privat_v0_2.md` holds the decided requirements (Q1–Q38); don't re-open settled decisions.

**Next.js here has breaking changes from your training data** (e.g. `src/proxy.ts` replaces `middleware.ts`). Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code (see `AGENTS.md`).

## Commands

Requires Node ≥ 22 and a running Docker Desktop. Local Supabase setup (one-time network, `supabase start` with the excluded-services flag list, `node scripts/local-env.mjs`, `node scripts/seed-local.mjs`) is in `README.md`.

```
npm run dev -- --port 3000     # binds 127.0.0.1 (the origin check and Playwright expect :3000)
npm run build
npm run typecheck              # tsc --noEmit
npm run lint
npm test                       # vitest: tests/**/*.test.ts, pure logic, no services needed
npx vitest run tests/domain.test.ts          # single file
npx vitest run -t "part of test name"        # single test
npm run test:db                # SQL/RLS/concurrency checks against local Postgres
npx playwright test tests/e2e/api.spec.ts    # API integration; needs local Supabase + .env.local
```

Env vars (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and the server-only `SUPABASE_SECRET_KEY`, `GUARDIAN_TOKEN_SECRET`, `SESSION_ENCRYPTION_KEY` (64 hex chars). `scripts/local-env.mjs` generates `.env.local` and refuses to overwrite one it didn't create.

`npm run test:db` shells out to `docker exec -i supabase_db_les-privat-local psql` (host TCP to Postgres was flaky on Windows), so the container name and the `les-privat-dev` Docker network matter. It refuses non-local database URLs. Each case runs as a fake `authenticated`/`anon` role with injected JWT claims, so it exercises the real RLS and RPC paths.

## Architecture

**All writes go through one RPC.** Mutations are not table inserts from the app. `POST /api/commands` (`src/app/api/commands/route.ts`) does: same-origin check → size-limited JSON body → `getAccount()` (must be active teacher) → `parseCommand(action, payload)` → `supabase.rpc("app_command", {p_action, p_payload, p_request})`. Adding a command means touching three places in step:
1. A strict Zod schema in `src/lib/domain/commands.ts` (action names like `student.create`, `lesson.finish`; the map is the allowlist).
2. The matching branch in the `app_command` plpgsql function in `supabase/migrations/` (add a new migration; don't edit applied ones).
3. A check in `scripts/db-test.mjs` and/or `tests/`.

Every command carries a client `requestId` (UUID) used for idempotency via `private.command_receipts`. A replayed request returns the original result; the same id with a different payload is rejected. Concurrent duplicate `lesson.finish` must consume quota only once; keep that property.

**Business rules live in the database as well as in TypeScript.** `src/lib/domain/rules.ts` (quota, payment balance, lesson charge) mirrors the SQL for unit testing and display; the SQL is the authority. Money is a whole-rupiah string/`BigInt` (never a float). Quota is derived from `quota_events`, not stored as a counter. Overlapping active lessons for one teacher are blocked by an exclusion constraint (error `23P01`), which `src/lib/http.ts` `databaseError` maps to a user message (`P0001` = raised business error, `42501` = access/session invalid).

**Reads** use `workspace_snapshot()` (one JSON document of the whole workspace) and `account_context()`, via `requireWorkspace()` / `requireAccount()` in `src/lib/session.ts` from server components. Private data is isolated per workspace by Postgres RLS and `private.*` helper functions (`session_valid`, `can_access`, `is_admin`). Admins have no access to teachers' private records, only to profile moderation (`review_queue`, `moderate_profile`).

**Sessions are custom, not Supabase cookies.** The browser only holds an opaque `les_session` cookie (random 32 bytes hex). The Supabase access/refresh tokens are AES-256-GCM sealed (`src/lib/session-crypto.ts`) and stored server-side in `private.web_sessions` through `put/get/rotate/clear_server_session` RPCs, which require the secret key (`adminSupabase()`). `serverSupabase()` in `src/lib/supabase/server.ts` rebuilds an authenticated client from that row on each request and rotates tokens when Supabase refreshes them. Only the PKCE code-verifier cookie reaches the browser (`authFlowSupabase`). The DB enforces login age limits (teachers 7 days, admins 8 hours, absolute, not sliding) and revocation by checking `auth.sessions`. There is deliberately **no** idle timeout (Q26 was rejected).

**Guardian links.** Token = HMAC of workspace + request id with `GUARDIAN_TOKEN_SECRET` (`src/lib/security.ts`); only its SHA-256 hash is stored. The link is `/wali#<token>`. It is a URL *fragment* so it never reaches server logs or requests, and the page POSTs it to `/api/guardian` → `guardian_summary(token)`. Links are revoked when a student is archived and are not restored on un-archive.

**Public directory.** `src/lib/directory.ts` and `public-data.ts` serve `/cari` and `/guru/[id]`. Teachers not currently accepting students must still appear in search. Face-to-face search matches on service areas, not home location.

**Routing.** `src/proxy.ts` only sets `Cache-Control: private, no-store` on authenticated/API paths (it does no auth). Authenticated pages live in the `src/app/(workspace)` group. Auth flows are `/masuk`, `/daftar`, `/lupa-kata-sandi`, `/api/auth`, `/auth/callback`.

## Status caveats

`docs/superpowers/progress.md` is the implementation ledger and `docs/HANDOFF.md` has decision context. As of the last entry (2026-11-02), unit tests (21), DB checks (11), typecheck, and build passed, but the Playwright API tests failed at login and are unresolved. Admin moderation UI, recovery codes, sensitive-action re-auth flows, export, account deletion, and backup restore are unfinished. Do not claim the app is secure or verified end to end, and use only seed data.

## Behavioral guidelines

### Think before coding
Don't assume, and don't hide confusion. State assumptions explicitly. If multiple interpretations exist, present them instead of picking silently. If a simpler approach exists, say so. If something is unclear, stop and ask.

### Simplicity first
Write the minimum code that solves the problem: no speculative features, no abstractions for single-use code, no unrequested configurability, no error handling for impossible scenarios. If 200 lines could be 50, rewrite it.

### Surgical changes
Touch only what the request needs. Don't improve adjacent code, comments, or formatting, and match existing style. Mention unrelated dead code instead of deleting it. Remove only the imports and variables that your own changes made unused. Every changed line should trace to the user's request.
