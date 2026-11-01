#!/usr/bin/env bash
set -euo pipefail

release="$(cd "$(dirname "$0")/../cursors" && pwd)"
destdir="$1"
version="$(cat "$release/version")"
archive="Bibata-Modern-Classic.tar.xz"
work="/var/tmp/cursors"

mkdir -p "$work"
curl -fsSL --retry 5 --retry-all-errors -o "$work/$archive" \
  "https://github.com/ful1e5/Bibata_Cursor/releases/download/$version/$archive"
(cd "$work" && sha256sum --check --quiet "$release/sha256")
install -d "$destdir/usr/share/icons"
tar -xJf "$work/$archive" -C "$destdir/usr/share/icons" --no-same-owner
rm -rf "$work"
