#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
run="$root/kestrel/run"
source_dir="$run/mutter-source"
build_dir="$run/compositor-build"
prefix="$run/mutter-install"
python3 "$root/kestrel/compositor/patches.py" prepare

setup=()
if [[ -f "$build_dir/build.ninja" ]]; then
  setup+=(--reconfigure)
fi
meson setup "${setup[@]}" "$build_dir" "$source_dir" \
  --prefix="$prefix" --libdir=lib --buildtype=release \
  -Dudev_dir="$prefix/lib/udev" -Dtests=disabled \
  -Dcogl_tests=false -Dclutter_tests=false -Dmutter_tests=false -Dinstalled_tests=false
meson compile -C "$build_dir"
meson install -C "$build_dir" --no-rebuild
