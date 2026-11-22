#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
destdir="$1"

install -d "$destdir/usr/share/icons"
cargo run --quiet --release --locked --manifest-path "$luft/Cargo.toml" -p luft-cursors -- "$destdir/usr/share/icons"
