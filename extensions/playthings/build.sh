#!/usr/bin/env bash
set -euo pipefail

source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
destination="$1"

mkdir -p "$destination"
bun "$source/../build.ts" "$source/src/extension.ts" "$destination/extension.js"
cp -r "$source/extension.toml" "$source/locales" "$source/sheets" "$source/icons" "$destination/"
