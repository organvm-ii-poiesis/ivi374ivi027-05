# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

MET4MORFOSES Web Edition — a Next.js 16 App Router site that presents an MFA thesis as an immersive multi-mode web experience. The thesis content (Ovid's Metamorphoses reinterpretation) is stored as canonical PDFs in `public/mirror/` and ingested through a build pipeline into markdown and JSON data files.

## Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Full content pipeline + Next.js production build
npm run lint             # ESLint (next/core-web-vitals + TypeScript)
npm run typecheck        # tsc --noEmit (strict mode)
npm test                 # Vitest unit + integration tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # Playwright E2E (desktop Chrome + mobile iPhone 13, port 3007)
npm run content:build    # Run full content pipeline (ingest → mirror → nodes → qa → integrity)
npm run build:analyze    # Production build with bundle analyzer
```

The content pipeline (`content:build`) uses `tsx` to run scripts that require `pdftotext` (poppler-utils) on the system for PDF ingestion.

## Architecture

### Content Pipeline (build-time, `scripts/`)

Source PDFs in `public/mirror/2018-03-20 - met4 - sixth draft/` flow through five sequential scripts:

1. **ingest-canonical** → extracts PDF text → `src/content/*.md` (6 markdown files: preliminary-pages, intro, sikl-1/2/3, bibliography)
2. **build-mirror-manifest** → catalogs all `public/mirror/` files with SHA-256 → `src/data/mirror-manifest.json`
3. **build-node-map-data** → generates narrative graph + feed data → `src/data/node-map.json`, `src/data/feed-items.json`
4. **qa-canonical-fidelity** → validates text extraction quality, enforces ≤8% delta → `src/data/canonical-fidelity-report.json`
5. **verify-mirror-integrity** → checks data invariants → `src/data/data-integrity-report.json`

`npm run build` automatically runs `content:build` before `next build`.

### Viewing Modes (routes)

| Route | Mode | Component |
|---|---|---|
| `/` | Mythic Node Map | `node-map-experience.tsx` |
| `/feed` | Faux Social Feed | `feed-view.tsx` |
| `/scroll` | Three-Cycle Scroll | `scroll-view.tsx` |
| `/read/[docSlug]` | Canonical Reader | `reader-sections.tsx`, `reader-nav.tsx`, `reader-progress.tsx` |
| `/archive` | Mirror Downloads | `archive-browser.tsx` |
| `/about` | Portfolio Context | static page |

Mode navigation is handled by `mode-nav.tsx` in the layout.

### Domain Libraries (`src/lib/`)

- **content.ts** — reads canonical manifest + markdown, parses sections with anchors (server-side, uses `fs`)
- **nodes.ts** — loads node map and feed items from generated JSON
- **mirror.ts** — loads mirror manifest, filtering, byte formatting
- **analytics.ts** — client-side PostHog init + event tracking via `/api/analytics` (uses `sendBeacon`)

### Type System (`src/types/`)

- **content.ts** — `CanonicalDoc`, `CanonicalSection`, `NarrativeNode`, `FeedItem`, `MirrorAsset`, `AnalyticsEvent`
- **api.ts** — API response types for analytics and manifest endpoints

### APIs

- `POST /api/analytics` — proxies analytics events to PostHog server-side
- `GET /api/manifest/canonical` — returns canonical document manifest
- `GET /api/manifest/mirror` — returns mirror asset manifest

### Fonts

Three Google Fonts loaded via CSS variables: `--font-headline` (Barlow Condensed), `--font-body` (Space Grotesk), `--font-literary` (Cormorant Garamond).

## Conventions

- Path alias: `@/*` → `src/*`
- 2-space indentation, semicolons, double quotes
- Kebab-case filenames, PascalCase component names
- Conventional Commits (`feat:`, `fix:`, `chore:`)
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/` — Vitest uses jsdom environment with `next/link` and `next/navigation` mocked in `vitest.setup.tsx`
- Playwright runs on port 3007 with desktop and mobile projects
- `public/mirror/**` files are canonical input artifacts — never edit directly
- Analytics gracefully degrades when PostHog keys are absent

## CI

`.github/workflows/ci.yml` runs lint, typecheck, unit-integration, and build on push to main and PRs. E2E runs separately via `.github/workflows/e2e.yml` when PR has `e2e` label. Required status checks: `lint`, `typecheck`, `unit-integration`, `build`.
