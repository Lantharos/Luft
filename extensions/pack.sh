#!/usr/bin/env bash
set -euo pipefail

extension="$(cd "$1" && pwd)"
out="$2"
id="$(sed -n 's/^id = "\(.*\)"$/\1/p' "$extension/extension.toml")"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

"$extension/build.sh" "$stage/$id"
mkdir -p "$out"
tar --create --directory "$stage" --owner=0 --group=0 --numeric-owner "$id" | zstd -19 --quiet -o "$out/$id.tar.zst"
