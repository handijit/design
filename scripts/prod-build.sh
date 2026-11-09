#!/bin/sh
set -e

# A leftover from an earlier build must never reach the tarball.
rm -rf build
rollup -c
# The generated files have to agree with each other and with the JavaScript entry.
node ./scripts/verify-build.mjs
