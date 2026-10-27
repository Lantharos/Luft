#!/usr/bin/env bash
set -euo pipefail

packages=" $* "
status=0
for manifest in apps/*/Sabine.toml; do
  app="$(dirname "$manifest")"
  bindings="$(sed -n '/^\[bindings\]/,/^\[/s/^path = "\(.*\)"/\1/p' "$manifest")"
  [[ -n "$bindings" ]] || continue
  cargo_manifest="$(sed -n 's/^cargo_manifest = "\(.*\)"/\1/p' "$manifest")"
  package="$(sed -n '0,/^name = /s/^name = "\(.*\)"/\1/p' "$app/${cargo_manifest:-Cargo.toml}")"
  [[ "$packages" == *" -p $package "* ]] || continue
  SABINE_BINDINGS="$PWD/$app/$bindings" SABINE_BINDINGS_CHECK=1 cargo run --locked --quiet -p "$package" || status=1
done
exit "$status"
