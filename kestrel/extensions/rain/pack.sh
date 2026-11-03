#!/usr/bin/env bash
set -euo pipefail

source="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
out="$1"
id=com.lantharos.Rain
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

mkdir -p "$stage/$id" "$out"
bun "$source/../build.ts" "$source/src/extension.ts" "$stage/$id/extension.js"
rm "$stage/$id/extension.js.d"
cp -r "$source/extension.toml" "$source/locales" "$source/sounds" "$stage/$id/"
read -ra libraries <<<"$(pkg-config --cflags --libs gio-2.0 gstreamer-1.0 libpipewire-0.3)"
cc -O2 -o "$stage/$id/rain-sound" "$source"/helper/*.c "${libraries[@]}" -lm
tar --create --directory "$stage" --owner=0 --group=0 --numeric-owner "$id" | zstd -19 --quiet -o "$out/$id-$(uname -m).tar.zst"
