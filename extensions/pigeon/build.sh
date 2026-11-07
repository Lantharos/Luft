#!/usr/bin/env bash
set -euo pipefail

source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
destination="$1"

mkdir -p "$destination"
bun "$source/../build.ts" "$source/src/extension.ts" "$destination/extension.js"
cargo build --release --locked --package pigeon --target-dir "$source/../../target"
cp "$source/../../target/release/pigeon" "$destination/"
cp -r "$source/extension.toml" "$source/icon.svg" "$source/icons" "$source/locales" "$destination/"
