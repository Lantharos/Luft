#!/usr/bin/env bash
set -euo pipefail

source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
destination="$1"

mkdir -p "$destination"
bun "$source/../build.ts" "$source/src/extension.ts" "$destination/extension.js"
cp -r "$source/extension.toml" "$source/locales" "$source/sounds" "$destination/"
read -ra libraries <<<"$(pkg-config --cflags --libs gio-2.0 gstreamer-1.0 libpipewire-0.3)"
cc -O2 -o "$destination/rain-sound" "$source"/helper/*.c "${libraries[@]}" -lm
