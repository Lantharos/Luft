#!/usr/bin/env bash
set -euo pipefail

source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
destination="$1"
fonts="$source/../../packages/web/ui/fonts"

mkdir -p "$destination/theme/assets"
bun "$source/../build.ts" "$source/src/extension.ts" "$destination/extension.js"
cargo build --release --locked --package spotify-style --target-dir "$source/../../target"
cp "$source/../../target/release/spotify-style" "$destination/"
cp -r "$source/extension.toml" "$source/icon.svg" "$source/locales" "$destination/"
cp "$source/theme/color.ini" "$source/theme/theme.js" "$destination/theme/"
cat "$source"/theme/styles/*.css > "$destination/theme/user.css"
cp "$fonts"/OpenRunde-*.woff2 "$destination/theme/assets/"
