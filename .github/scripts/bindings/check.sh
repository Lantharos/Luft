#!/usr/bin/env bash
set -euo pipefail

packages=" $* "
status=0

check() {
  local manifest="$1" bindings="$2"
  shift 2
  local package
  package="$(sed -n '0,/^name = /s/^name = "\(.*\)"/\1/p' "$manifest")"
  [[ "$packages" == *" -p $package "* ]] || return 0
  SABINE_BINDINGS="$PWD/$bindings" SABINE_BINDINGS_CHECK=1 cargo run --locked --quiet -p "$package" "$@" || status=1
}

for manifest in apps/*/Sabine.toml; do
  app="$(dirname "$manifest")"
  bindings="$(sed -n '/^\[bindings\]/,/^\[/s/^path = "\(.*\)"/\1/p' "$manifest")"
  [[ -n "$bindings" ]] || continue
  cargo_manifest="$(sed -n 's/^cargo_manifest = "\(.*\)"/\1/p' "$manifest")"
  check "$app/${cargo_manifest:-Cargo.toml}" "$app/$bindings"
done

for manifest in packages/*/Cargo.toml packages/*/*/Cargo.toml; do
  bindings="$(sed -n '/^\[package.metadata.bindings\]/,/^\[/s/^path = "\(.*\)"/\1/p' "$manifest")"
  [[ -n "$bindings" ]] || continue
  check "$manifest" "$(dirname "$manifest")/$bindings" --example bindings
done

exit "$status"
