#!/usr/bin/env bash
set -euo pipefail

# Build with the normal content/QA gates, then test the archive, not the checkout.
npm run build
node scripts/package-runtime.mjs
(cd .release && sha256sum -c met4morfoses-runtime.tar.gz.sha256)
runtime="$(mktemp -d "${RUNNER_TEMP:-/tmp}/met4-runtime.XXXXXX")"
tar -xzf .release/met4morfoses-runtime.tar.gz -C "$runtime"
cd "$runtime"
export HOSTNAME=127.0.0.1
export PORT="${PORT:-3007}"
exec node server.js
