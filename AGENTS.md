# Repository Guidelines

## Project Structure & Module Organization
- `app/` – Next.js 15 app (TypeScript, App Router).
  - `app/src/app/` – routes (`page.tsx`, `layout.tsx`) and API routes under `api/*/route.ts`.
  - `app/src/components/` – React components; primitives in `ui/`.
  - `app/src/lib/` – API clients, stores, utils, and prompt templates.
  - `app/src/types/` – shared TypeScript types.
- `docs/` – integration notes and API docs.
- `test/` – ad‑hoc Node scripts (e.g., `api-test.js`).

## Build, Test, and Development Commands
- Local dev (from `app/`): `npm run dev` – start Next.js with Turbopack.
- Type check: `npm run type-check` – strict TS, no emit.
- Lint: `npm run lint` | Auto-fix: `npm run lint:fix`.
- Format: `npm run format` | Check only: `npm run format:check`.
- Build: `npm run build` – production bundle; `npm start` to serve.
- API smoke test (from repo root): `node test/api-test.js` (requires `ZHIPU_API_KEY`).

## Coding Style & Naming Conventions
- TypeScript, 2-space indent, single quotes or Prettier default. Path alias: `@/*` → `app/src/*`.
- Components: PascalCase filenames (e.g., `StatsDashboard.tsx`). UI primitives live in `components/ui`.
- Routes: lowercase segments; files `page.tsx`, `layout.tsx`; API routes `app/src/app/api/<name>/route.ts`.
- Modules in `lib/`: descriptive camelCase filenames (`utils.ts`, `store.ts`). Keep functions pure where possible.
- Run `npm run lint` and `npm run format` before pushing.

## Testing Guidelines
- No Jest/Vitest configured. Use `test/api-test.js` for API connectivity.
- If adding tests, prefer colocated `*.test.ts(x)` next to source or under `test/`; avoid global state and network by default.
- No coverage gate yet; include meaningful assertions and error-path checks.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. Keep subject ≤ 72 chars.
  - Example: `feat: add radar chart to StatsDashboard`
- PRs must include: what/why, testing steps, screenshots for UI, and linked issues.
- Ensure CI-like checks pass locally: `type-check`, `lint`, `format:check`, `build`.

## Security & Configuration Tips
- Create `app/.env.local`; never commit secrets. Required: `ZHIPU_API_KEY`. Prefer server-side access (avoid exposing non-`NEXT_PUBLIC_` vars to the client).
- Keep image domains and headers in `app/next.config.ts` up to date; follow `output: 'standalone'` for Docker.
