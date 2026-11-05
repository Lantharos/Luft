#!/usr/bin/env bash
set -euo pipefail

source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
destination="$1"
fonts="$source/../../packages/web/ui/fonts"
spotify="$destination/themes/spotify"
steam="$destination/themes/steam"
vesktop="$destination/themes/vesktop"

mkdir -p "$spotify/assets" "$steam" "$vesktop"
bun "$source/../build.ts" "$source/src/extension.ts" "$destination/extension.js"
cargo build --release --locked --package tailor --target-dir "$source/../../target"
cp "$source/../../target/release/tailor" "$destination/"
cp -r "$source/extension.toml" "$source/icon.svg" "$source/locales" "$destination/"
cp "$source/themes/spotify/color.ini" "$source/themes/spotify/theme.js" "$spotify/"
cat "$source"/themes/spotify/styles/*.css > "$spotify/user.css"
cp "$fonts"/OpenRunde-*.woff2 "$spotify/assets/"
cp "$source/themes/steam/steam.css" "$fonts"/OpenRunde-*.woff2 "$steam/"
for weight in 'Regular 400' 'Medium 500' 'Semibold 600 900'; do
  read -r name range <<< "$weight"
  printf "@font-face { font-family: 'Open Runde'; font-weight: %s; src: url(data:font/woff2;base64,%s) format('woff2'); }\n" \
    "$range" "$(base64 -w0 "$fonts/OpenRunde-$name.woff2")"
done > "$vesktop/fonts.css"
