#!/bin/sh
# Installs the packed tarball into an empty project and uses it the way a consumer does.
# The tests measure the source; this measures the tarball a consumer installs.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/node_modules/.bin"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cd "$ROOT"
TARBALL="$ROOT/$(npm pack --silent --pack-destination "$WORK" | tail -n 1)"
TARBALL="$WORK/$(basename "$TARBALL")"

mkdir "$WORK/consumer"
cp "$ROOT"/scripts/smoke/* "$WORK/consumer/"
cd "$WORK/consumer"
npm init -y >/dev/null
npm install --ignore-scripts --no-audit --no-fund "$TARBALL" >/dev/null

node esm.mjs
node cjs.cjs
"$BIN/tsc" -p tsconfig.bundler.json
"$BIN/tsc" -p tsconfig.node.json
echo "TypeScript consumers OK"
"$BIN/sass" --pkg-importer=node --no-source-map consumer.scss consumer.css
node scss.mjs
