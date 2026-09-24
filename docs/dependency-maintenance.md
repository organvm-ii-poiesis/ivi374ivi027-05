# Dependency maintenance contract

Owner: @4444J99. Established by PR #59; recurrence repaired by PR #62 on 2026-09-24.

## Why the second grouped update failed

PR #62 proposed React/DOM 19.3 while the retained Fiber 9.7.0 requires `>=19 <19.3`. CI run 36010364153 failed at `npm ci`; lint, typecheck, tests and build never executed. It also proposed ESLint 10, TypeScript 7 and Node 26 type declarations, contrary to the accepted lint-tool peer ranges and Node 24 runtime.

The earlier repair fixed the manifest, lockfile and runtime, but `.github/dependabot.yml` still grouped every available version without the corresponding compatibility exclusions. Manifest pinning alone was not a durable automation policy.

## Accepted compatibility boundaries

| Packages | Current line | Remove the limit when |
| --- | --- | --- |
| React / React DOM and their types | 19.2 | A coordinated Fiber/renderer update accepts the new React line and the full application/browser suite passes |
| Node runtime / Node types | 24 | Development, CI, deployment runtime and type declarations migrate together |
| ESLint | 9 | Every installed Next/import lint plugin accepts the new major |
| TypeScript | 6.0 | Every installed lint/parser consumer accepts the new compiler line |
| Vitest / coverage-v8 | Same resolved version | Upgrade the pair together; prove actual test execution |

Routine minor/patch npm updates are grouped. Unrelated major updates are separate proposals. Narrow version exclusions encode only the boundaries above; other packages and compatible security fixes remain eligible. New npm PRs receive `e2e` so their browser checks cannot be silently omitted.

These exclusions are temporary consumer constraints, not a claim that older software is permanently safe. Version exclusions may also prevent an otherwise desired security update: if a security fix requires crossing a boundary, prioritize the coordinated consumer/runtime migration. Do not suppress the audit, force an invalid installation, dismiss the advisory as resolved, or remove the boundary without evidence. `npm audit --audit-level=low` remains mandatory.

## Validation and maintenance

`tests/unit/dependency-contract.test.ts` verifies manifest/lockfile agreement, React pairing/type alignment, Node runtime/type alignment, supported lint-tool lines, Vitest/coverage pairing, and strict npm settings. Update those tests deliberately with a validated migration; do not relax them merely to accept a bot's latest-version proposal.

Use the existing owner-only `Refresh dependency lockfile` workflow on the exact open same-repository PR head. It resolves and audits dependencies without lifecycle scripts, commits only the lockfile, and does not force-push. Its work is preparation, not application validation. Normal CI must subsequently execute clean installation, lint, typecheck, tests, the full content/production build, security audit and both production browser projects on the final head. Repeat validation on the actual merge commit.

Evidence for PR #62's final resolution belongs in its exact-head review and accepted-main receipt; a document or a successful lockfile-maintenance job alone is not proof of a green merge.

References:
- https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference
- https://github.com/organvm-ii-poiesis/ivi374ivi027-05/pull/59
- https://github.com/organvm-ii-poiesis/ivi374ivi027-05/pull/62
- https://github.com/organvm-ii-poiesis/ivi374ivi027-05/actions/runs/36010364153
