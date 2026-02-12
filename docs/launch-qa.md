# Launch QA and Operational Readiness

## Environment
- [ ] Vercel Preview deployment healthy.
- [ ] Vercel Production deployment healthy.
- [ ] PostHog keys set in Preview and Production.

## Core Functional Checks
- [ ] `/` Node Map loads and nodes are keyboard navigable.
- [ ] `/feed` loads and reader links resolve.
- [ ] `/scroll` loads and chapter jumps resolve.
- [ ] `/read/intro` and all canonical docs render.
- [ ] `/archive` search/filter functions and list is complete.
- [ ] `/about` renders portfolio framing.

## Download Verification
- [ ] Representative `.pdf` file returns `200`.
- [ ] Representative `.pages` file returns `200`.
- [ ] Representative `.numbers` file returns `200`.
- [ ] Representative `.zip` file returns `200`.
- [ ] Representative `.docx` file returns `200`.

## Text Fidelity
- [ ] `src/data/canonical-fidelity-report.json` indicates zero failing docs.
- [ ] Editorial checklist completed.

## Analytics
- [ ] `mode_viewed` appears in PostHog.
- [ ] `node_opened` appears in PostHog.
- [ ] `section_opened` appears in PostHog.
- [ ] `doc_progress` appears in PostHog.
- [ ] `download_started` and `download_completed` appear in PostHog.

## Quality Gates
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] `npm run test:e2e` passes.
- [ ] `npm run build` passes.

## Rollback Readiness
- [ ] Previous production deployment ID recorded.
- [ ] Revert tag prepared (e.g., `v1.0.0-rollback-prep`).
- [ ] Incident response contact + escalation path documented.
- [ ] Rollback command validated in Vercel dashboard.

## Sign-off
- QA owner:
- Date:
- Production go/no-go:
- Notes:
