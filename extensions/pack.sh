#!/usr/bin/env bash
set -euo pipefail

extension="$(cd "$1" && pwd)"
out="$2"
id="$(sed -n 's/^id = "\(.*\)"$/\1/p' "$extension/extension.toml")"
if ! sed -n '/^\[luft\]/,/^\[/p' "$extension/extension.toml" | grep -q '^minimum = "'; then
  echo "$id names no [luft] minimum in extension.toml, the oldest version of Luft it runs on" >&2
  exit 1
fi
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

suffix=""
grep -q '^\[helper\]' "$extension/extension.toml" && suffix="-$(uname -m)"

"$extension/build.sh" "$stage/$id"
mkdir -p "$out"
tar --create --directory "$stage" --owner=0 --group=0 --numeric-owner "$id" | zstd -19 --quiet -o "$out/$id$suffix.tar.zst"
