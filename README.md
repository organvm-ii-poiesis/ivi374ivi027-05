# MET4MORFOSES Web Edition

Digital representation of Anthony James Padavano's MFA thesis project, implemented as an immersive multi-mode web experience.

## Stack
- Next.js 16 + TypeScript (App Router)
- PostHog (client + server proxy)
- Zod runtime validation
- Vitest + React Testing Library
- Playwright E2E

## System Dependencies
The content ingestion pipeline requires `pdftotext` (part of the Poppler library) to extract text from thesis PDFs.

You can install it using the provided setup script:
```bash
./scripts/setup-deps.sh
```

Or manually:
- **macOS:** `brew install poppler`
- **Linux:** `sudo apt-get install poppler-utils`

## Modes
- `/` Mythic Node Map (default)
- `/feed` Faux Social Feed
- `/scroll` Three-Cycle Scroll
- `/read/[docSlug]` Canonical inline reader
- `/archive` Full mirror downloads
- `/about` Portfolio context

## Canonical Source Assembly
Canonical inline text is ingested from sixth-draft PDFs under:
`public/mirror/2018-03-20 - met4 - sixth draft/*`

Docs assembled in order:
1. Preliminary Pages
2. Intro
3. Sikl 1
4. Sikl 2
5. Sikl 3
6. Bibliography

## Data + Build Pipeline
- `npm run content:ingest` extracts canonical PDF text to `src/content/*.md`
- `npm run content:mirror` builds `src/data/mirror-manifest.json` (with SHA-256)
- `npm run content:nodes` builds `src/data/node-map.json` and `src/data/feed-items.json`
- `npm run content:qa` writes `src/data/canonical-fidelity-report.json` and enforces <= 8% delta
- `npm run content:integrity` writes `src/data/data-integrity-report.json` and verifies invariants
- `npm run content:build` runs the full pipeline

`npm run build` runs `content:build` before `next build`.

## Local Development
```bash
npm install
npm run dev
```

## Verification
```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Bundle profile:
```bash
npm run build:analyze
```

## Environment
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `POSTHOG_KEY`
- `POSTHOG_HOST`

If PostHog keys are missing, analytics responses remain valid and events are not forwarded.

## APIs
- `POST /api/analytics`
- `GET /api/manifest/canonical`
- `GET /api/manifest/mirror`

## CI/CD
- `.github/workflows/ci.yml` runs lint, typecheck, unit/integration tests, and build.
- `.github/workflows/e2e.yml` runs Playwright when PR has label `e2e`.

Recommended required status checks on `main`:
- `lint`
- `typecheck`
- `unit-integration`
- `build`

## Launch Operations
- Editorial checklist: `docs/content-editorial-checklist.md`
- Launch QA + rollback checklist: `docs/launch-qa.md`

All thesis artifacts are mirrored under `public/mirror` and exposed at `/mirror/**`.
