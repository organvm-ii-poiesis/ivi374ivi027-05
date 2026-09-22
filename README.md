# MET4MORFOSES Web Edition

Digital representation of Anthony James Padavano's MFA thesis project, implemented as an immersive multi-mode web experience.

## Activation Status

The application is implemented and maintained with executable validation. Public-edition versus reference-only disposition remains owner-controlled in [issue #20](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/issues/20). See [activation status and release boundary](docs/activation-status.md) for exact evidence, existing Pages hosting, and the unresolved publication/rights decision. Successful CI or a Jekyll Pages deployment is not a verified deployment of the Next.js application.

## Stack
- Next.js 16 + TypeScript (App Router)
- PostHog (client + server proxy)
- Zod runtime validation
- Vitest + React Testing Library
- Playwright E2E

## System Dependencies
Use Node.js 24, as selected by `.nvmrc` and required by `package.json`. CI and browser validation read the same `.nvmrc` file. The committed `.npmrc` rejects unsupported engines and conflicting dependency peers.

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
- `npm run content:build` rebuilds the core content, manifests, node data, and QA reports
- `npm run content:build-full` additionally runs analysis, evolution, generation, export, and broadcast stages

`npm run build` runs `content:build-full` before `next build --webpack`. Standalone production builds, bundle analysis, and the production browser server all use this same command.

### Production bundler

Production uses Next.js's supported [Webpack build option](https://nextjs.org/docs/app/api-reference/cli/next#next-build-options). After the successful #60 PR checks, fresh main run [35742409618](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/actions/runs/35742409618) failed while the browser job built its production server: Turbopack rejected `next/font/google` queries for Space Grotesk with `next/font/google queries have exactly one entry`. The separate main build job passed, so the failure was not treated as proof that accepted-main validation was entirely green.

The production command explicitly selects Webpack rather than retrying the failing bundler, removing fonts, or returning browser CI to a development server. The three original font families and weights remain unchanged. A browser regression loads each named custom font family and requires actual loaded font faces, not merely drawable fallback text. Development retains its existing `next dev` configuration. Removing the production flag requires separately verified build and browser evidence; a successful PR-only build is not sufficient evidence for that change.

## Local Development
With nvm installed:
```bash
nvm install
nvm use
npm ci
npm run dev
```

Other Node version managers are supported as long as they select Node 24. Use `npm ci` for reproducible installation from the committed lockfile. Dependency updates must preserve peer compatibility; do not use `--force` or `--legacy-peer-deps` to hide conflicts.

## Verification
```bash
npm ci
npm audit --audit-level=low
npm run lint
npm run typecheck
npm test
npx playwright install --with-deps chromium webkit
CI=1 npm run test:e2e
```

With `CI=1`, Playwright builds the full application and starts a fresh production server on port 3007. It refuses to reuse an existing server and runs desktop Chromium and mobile WebKit checks. The activation suite verifies every canonical reader, both manifest APIs, a real missing-reader 404, the about route, and actual PDF/Pages/Numbers/ZIP/DOCX downloads against their byte sizes and SHA-256 hashes. JSON results and download receipts are retained in the `production-browser-verification` CI artifact. A production server on the CI runner is not a public deployment.

Without `CI`, `npm run test:e2e` retains the local development-server workflow. Run `npm run build` independently for the full build and content QA reports.

Bundle profile:
```bash
npm run build:analyze
```

## Dependency Maintenance
React and React DOM remain paired on 19.2 while Fiber 9.7 requires both below 19.3. ESLint remains on 9 and TypeScript on 6.0 to satisfy the peers of the installed Next lint tooling. Reassess these constraints together when upgrading their consumers; a newer version alone is not compatibility evidence.

The owner-only `Refresh dependency lockfile` workflow supports manual regeneration for an open, same-repository PR. Select the PR branch and provide its number and exact 40-character head SHA. It verifies repository identity and head stability, disables dependency lifecycle scripts, enforces engine and peer requirements, applies only security fixes compatible with the manifest, and requires a successful post-fix audit. It commits only `package-lock.json` without force-pushing and does not run application validation or merge. A bot-generated lockfile commit still needs a fresh normal CI run on the resulting PR head.

## Environment
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `POSTHOG_KEY`
- `POSTHOG_HOST`

If PostHog keys are missing, analytics responses remain valid and events are not forwarded.

## APIs
- `POST /api/analytics`
- `GET /api/manifest/canonical`: JSON array of ordered `id`, `slug`, `title`, `order`, `wordCount`, `sectionCount`, and `readerUrl` metadata. Manuscript bodies and local file paths are excluded.
- `GET /api/manifest/mirror`: JSON array of existing archive `id`, `fileName`, `ext`, `sizeBytes`, `downloadUrl`, and `sha256` metadata.

## CI/CD
- `.github/workflows/ci.yml` runs lint, typecheck, unit/integration tests, build, and a full dependency audit that fails on low-or-higher advisories. The audit also records the checked commit and lockfile digest/version inventory.
- CI calls `.github/workflows/e2e.yml` at the same commit for PRs with the `e2e` label and for every push to `main`. Adding the label also starts CI.
- `stale-preview` exercises the upgraded stale action with a read-only token and dry-run mode. Scheduled stewardship labels inactivity without automatically closing issues/PRs or deleting branches.

Recommended required status checks on `main`:
- `lint`
- `typecheck`
- `unit-integration`
- `build`
- `dependency-audit`

## Launch Operations
- Activation evidence and owner disposition: [docs/activation-status.md](docs/activation-status.md)
- Editorial checklist: `docs/content-editorial-checklist.md`
- Launch QA + rollback checklist: `docs/launch-qa.md`

All thesis artifacts are mirrored under `public/mirror` and exposed at `/mirror/**` when the application is served. The inputs are preserved; their presence is not new publication authorization.

<!-- SYSTEM-NAV-START -->

---

<sub>[Portfolio](https://4444j99.github.io/portfolio/) · [System Directory](https://4444j99.github.io/portfolio/directory/) · [ORGAN II · Poiesis](https://organvm-ii-poiesis.github.io/) · Part of the <a href="https://4444j99.github.io/portfolio/directory/">ORGANVM eight-organ system</a></sub>

<!-- SYSTEM-NAV-END -->
