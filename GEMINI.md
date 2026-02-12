# MET4MORFOSES Web Edition - Project Context

## Project Overview
MET4MORFOSES Web Edition is a digital representation of Anthony James Padavano's MFA thesis project. It is implemented as an immersive, multi-mode web experience using Next.js 16 and TypeScript. The site serves as a creative archive and exploration of a thesis reimagining Ovid's *Metamorphoses*.

### Core Technologies
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS 4
- **Validation:** Zod
- **Analytics:** PostHog (Client-side tracking with server-side proxy)
- **Testing:** Vitest (Unit/Integration), Playwright (E2E)
- **Content:** Markdown (Generated from source PDFs)

### Architectural Modes
The application features several viewing modes:
- `/`: **Mythic Node Map** - An interactive constellation of narrative nodes.
- `/feed`: **Faux Social Feed** - A simulated social media experience reflecting thesis motifs.
- `/scroll`: **Three-Cycle Scroll** - A continuous scroll experience of the three thesis cycles.
- `/read/[docSlug]`: **Canonical Reader** - An inline reader for the primary thesis texts.
- `/archive`: **Mirror Downloads** - A directory of original thesis artifacts (PDFs, Pages, etc.).
- `/about`: **Portfolio Context** - Contextual information about the project.

## Content Pipeline
The project features a custom build-time pipeline that ingests source PDFs and generates the data required for the web experience.

### Source Data
Canonical PDFs are stored in `public/mirror/2018-03-20 - met4 - sixth draft/`. These are treated as immutable source artifacts.

### Ingestion Scripts (`scripts/*.ts`)
1.  **`ingest-canonical`**: Extracts text from PDFs using `pdftotext` (requires Poppler installed on the system) and writes to `src/content/*.md`.
2.  **`build-mirror-manifest`**: Catalogs all files in `public/mirror` with metadata and SHA-256 hashes.
3.  **`build-node-map-data`**: Generates the narrative graph and feed items.
4.  **`qa-canonical-fidelity`**: Validates extraction quality, enforcing a ≤8% character delta between PDF and Markdown.
5.  **`verify-mirror-integrity`**: Checks data invariants and links.

The full pipeline is run via `npm run content:build`.

## Key Commands

### Development
- `npm run dev`: Starts the development server (using Turbopack).
- `npm run start`: Serves the production build.

### Building
- `npm run build`: Runs the content pipeline followed by the Next.js production build.
- `npm run content:build`: Runs the data ingestion and verification scripts only.
- `npm run build:analyze`: Build with bundle analyzer.

### Testing and Linting
- `npm run lint`: Runs ESLint.
- `npm run typecheck`: Runs strict TypeScript checks.
- `npm test`: Runs Vitest unit and integration tests.
- `npm run test:e2e`: Runs Playwright E2E tests (default port 3007).

## Development Conventions

### Coding Style
- **TypeScript:** Strict typing is mandatory. Use `@/*` path aliases for `src/*`.
- **Formatting:** 2-space indentation, semicolons, double quotes.
- **Naming:** kebab-case for filenames, PascalCase for React components.
- **React:** Functional components with standard Next.js file conventions (`page.tsx`, `layout.tsx`).

### Testing Practices
- **Layers:** Unit tests for logic, Integration tests for routes/components, E2E for critical user flows.
- **Mocks:** `next/link` and `next/navigation` are mocked in `vitest.setup.tsx`.
- **Coverage:** Meaningful coverage is expected for new logic or transforms.

### Git Conventions
- **Commits:** Use Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
- **Workflow:** PRs should include summaries and screenshots for UI changes.

## File Structure Highlights
- `src/app`: Routes and API handlers.
- `src/components`: UI components.
- `src/lib`: Domain logic (content loading, node map helpers, mirror utilities).
- `src/data`: Generated JSON manifests and reports.
- `src/content`: Generated Markdown files.
- `public/mirror`: Canonical thesis artifacts.
- `tests/`: Organized by `unit`, `integration`, and `e2e`.

## Environment Configuration
Set the following in `.env.local` (refer to `.env.example`):
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `POSTHOG_KEY`
- `POSTHOG_HOST`

If analytics keys are missing, the application will function correctly but events will not be forwarded.
