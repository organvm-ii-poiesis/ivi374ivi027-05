# Activation status and release boundary

Assessment date: 2026-09-22. Tracking issue: [#20](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/issues/20). Maintenance and disposition owner: @4444J99.

## Engineering state

This is an implemented Next.js application, not a documentation-only shell. The historical `docs-only-shell` classification in issue #20 is superseded by executed build, route, unit/integration, browser, and dependency-audit evidence. `ACTIVE` implementation and `LOCAL` promotion in seed.yaml do not mean a public artistic release is approved.

Accepted baseline: [#59](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/pull/59), commit `1dcf4af535ea81dec7f5cee593d58e322c68abf3`, with [fresh main CI](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/actions/runs/35537682117). Subsequent Actions upgrade: [#39](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/pull/39), commit `521e8df666422822bea816e02738e6a8f1f0b301`, with [seven successful main validation jobs](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/actions/runs/35738243269).

The activation-verification change adds the two documented manifest handlers and regression tests. It makes CI run Playwright against a fresh `next build` / `next start` server, without reusing a development server. Its own PR and accepted-main run, not the earlier baseline runs, are the evidence for these new checks. See the completion receipt on issue #20 for the exact accepted revision and results.

| Surface | Automated verification |
| --- | --- |
| Node map, feed, scroll, archive | Existing navigation and accessibility browser tests |
| Every canonical reader | Manifest completeness, HTTP 200 and document heading for each canonical entry |
| Unknown canonical reader | HTTP 404 |
| About / portfolio context | HTTP 200 and main heading |
| Canonical manifest API | Ordered metadata; no manuscript bodies or local file paths |
| Mirror manifest API | All existing archive entries; download URLs, byte sizes and SHA-256 |
| PDF, Pages, Numbers, ZIP, DOCX | One nonempty representative per format downloaded over HTTP; exact size and SHA-256 comparison |
| Analytics without keys | Existing integration tests; no claim that configured events reach a remote PostHog project |
| Source fidelity / integrity | Full content build and generated QA artifacts |

The browser job retains `production-browser-verification`, including per-download receipts. Passing representative downloads is not an exhaustive human rights review or a test of every archive file. No canonical input under `public/mirror/**` is modified by this work.

## Existing hosting: evidence is not interchangeable

GitHub's existing Pages workflow used **Jekyll**, not the Next.js application build, on commit `521e8df666422822bea816e02738e6a8f1f0b301`. [Pages run 35738241626](https://github.com/organvm-ii-poiesis/ivi374ivi027-05/actions/runs/35738241626) reports a successful deployment to `https://organvm-ii-poiesis.github.io/ivi374ivi027-05/`. That is a deployment receipt for the existing Pages surface; it is not evidence that Next.js routes or APIs work there. Live page contents were not independently retrieved during this assessment.

The connected Vercel project inventory did not identify a project by this repository's name. One generically named project had no repository metadata establishing a match. A verified Next.js deployment URL therefore remains **not established**, not presumed absent everywhere. No new hosting project, Next.js deployment, visibility change, or publication approval was created for this activation-verification change. Existing hosting settings were not altered.

## Decision still owned by the author

The August 31 execution plan on issue #20 reserves publication and thesis/media rights decisions for the owner. Repairing software does not resolve those decisions. Neither a public source repository, an institutional thesis deposit, nor a successful Pages run is sufficient release authorization.

| Disposition | Required owner record | Engineering continuation after the record |
| --- | --- | --- |
| Maintained public web edition | Explicit approval, approved artifact scope, asset-specific rights/privacy and credit review, maintenance owner, hosting target | Bind approved build to a deployment ID and URL; verify all routes/downloads on that URL; record rollback target and analytics choice |
| Preserved reference artifact | Explicit reference-only decision and rationale; reactivation condition | Document preservation and maintenance policy in README/seed; retain source assets/history and reproducible verification; do not silently archive or delete |

Issue #20 remains open until one disposition has its full acceptance evidence. Do not mark every item in the launch checklist complete based only on CI.

A sufficient owner decision records: disposition; approved artifact paths or manifest identity; rights/privacy/credit evidence references (sensitive evidence remains private); named maintenance owner; hosting target or reference-only reactivation condition. Implementation then records the exact accepted commit, deployment or preservation receipt, and verified rollback path. Credentials must use the authorized secret-management channel, never issue text.
