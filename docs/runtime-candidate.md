# Verified runtime candidate

This is release engineering, not a public launch or a reference-only disposition. Issue #20 retains the author's publication decision. No host, domain, DNS, visibility, analytics credential or media-rights decision is changed by packaging.

## Build and verification

Use a fresh checkout with Node 24, Poppler, and the locked dependencies:

```bash
npm ci
npx playwright install --with-deps chromium webkit
CI=1 npm run test:e2e
```

The CI browser command runs the normal full content/QA and Webpack production build with Next.js standalone output, then packages the server and its traced dependencies, static assets, public archive and generated reader data/content. Every packaged mirror entry must have the manifest's exact size and SHA-256. The packager rejects credential/configuration files, symlinks escaping the package, invalid commit identifiers, and attempts to overwrite an existing candidate. Those guardrails have negative fixture tests; they are not a general-purpose secret scanner.

CI verifies the tarball checksum, extracts it to a new temporary directory outside the repository, changes into that directory and launches `node server.js` on loopback only. The existing complete Chromium/WebKit suite must pass against that extracted runtime. There is no fallback to a development server or npm installation inside the extracted package.

Only after the browser tests pass does the job upload `verified-runtime-candidate`, with:
- `met4morfoses-runtime.tar.gz`;
- its `.sha256` sidecar;
- `release-candidate.json` recording the checked source commit, dependency-lock and mirror-manifest digests, archive digest, runtime/platform, asset count, and `publicationApproved: false`.

The same run retains the production browser verification report. The candidate has 14-day artifact retention. A failed build or browser test must not publish a verified-candidate artifact. The bundle is platform-specific (CI builds Linux x64); it is not a claim of byte-identical reproducibility across different builds or runner images.

## Running the accepted candidate privately

Use the accepted-main run's candidate, not a superseded PR run. Validate the recorded artifact/source identity and checksum first. On a compatible Linux x64 host with Node 24, extract into a fresh directory:

```bash
sha256sum -c met4morfoses-runtime.tar.gz.sha256
mkdir runtime
 tar -xzf met4morfoses-runtime.tar.gz -C runtime
cd runtime
HOSTNAME=127.0.0.1 PORT=3007 node server.js
```

Poppler and the build toolchain are build-time requirements; runtime completeness is established by the extracted-package browser test, not assumed from the build. The candidate is built without private environment files. It does not establish a configured remote analytics connection. Keep it on loopback until the release scope is explicitly approved; expose it only through a separately authorized hosting configuration.

For rollback, retain the prior accepted candidate and its digest/receipt and restart that verified version rather than rebuilding an unpinned branch. A real host-specific rollback exercise and stable public URL remain release acceptance work after the owner's decision. The candidate receipt must never be edited to manufacture publication approval.

Implementation reference: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
