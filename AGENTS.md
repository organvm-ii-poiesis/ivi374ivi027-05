# Repository Guidelines

Global policy: /Users/4jp/AGENTS.md applies and cannot be overridden.

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages plus API handlers (`src/app/api/**/route.ts`).
- `src/components`: reusable UI and interaction components.
- `src/lib`: domain helpers (`analytics`, `content`, `mirror`, `nodes`).
- `src/content`: canonical markdown documents used by the reader views.
- `src/data`: generated manifests and QA reports.
- `public/mirror`: canonical thesis artifacts served at `/mirror/**`.
- `tests/unit`, `tests/integration`, `tests/e2e`: test layers by scope.
- `scripts/*.ts`: ingestion, manifest generation, and data-fidelity checks.

## Build, Test, and Development Commands
- `npm run dev`: start local development server.
- `npm run build`: run full content pipeline, then production build.
- `npm run start`: serve the production build locally.
- `npm run lint`: run ESLint (`next/core-web-vitals` + TypeScript rules).
- `npm run typecheck`: run strict TypeScript checks (`tsc --noEmit`).
- `npm test`: run Vitest unit + integration suites.
- `npm run test:e2e`: run Playwright desktop/mobile E2E tests.
- `npm run content:build`: rebuild `src/content` and `src/data` from mirror inputs.

## Coding Style & Naming Conventions
- Use TypeScript with strict typing and the `@/*` path alias for `src/*`.
- Follow existing formatting: 2-space indentation, semicolons, double quotes.
- Keep file naming consistent: kebab-case filenames, PascalCase React component names.
- Follow Next.js route conventions (`page.tsx`, `layout.tsx`, `route.ts`).

## Testing Guidelines
- Unit/integration: Vitest + Testing Library (`tests/**/*.test.ts(x)`).
- E2E: Playwright specs in `tests/e2e/*.spec.ts`.
- Add or update tests for every behavior change, especially route/API logic and content transforms.
- No hard coverage threshold is enforced; maintain meaningful coverage of touched code paths.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style used in history (`feat:`, `fix:`, `chore:`).
- Keep commits focused; include generated artifacts when script/output behavior changes.
- PRs should include a clear summary, linked issue/task, and screenshots for UI updates.
- Required CI checks are `lint`, `typecheck`, `unit-integration`, and `build`.
- Add the `e2e` label on PRs when browser-flow validation is needed.

## Security & Configuration Tips
- Copy `.env.example` to `.env.local`; never commit secrets.
- Treat `public/mirror/**` as canonical input artifacts; do not edit them directly.
- If analytics keys are missing, app behavior should still be valid, with forwarding disabled.
