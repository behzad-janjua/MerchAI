#!/usr/bin/env bash
set -e

if command -v rbenv >/dev/null 2>&1; then
  export PATH="$HOME/.rbenv/shims:$PATH"
fi

export BUNDLE_USER_HOME="${BUNDLE_USER_HOME:-$PWD/tmp/bundle}"
mkdir -p "$BUNDLE_USER_HOME"

exec "$@"
