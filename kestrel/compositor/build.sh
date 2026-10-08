#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
compositor="$root/kestrel/compositor"
run="$root/kestrel/run"
source_dir="$run/mutter-source"
build_dir="${1:-$run/compositor-build}"
prefix="${2:-$run/mutter-install}"
stamp="$build_dir/kestrel-stamp"
options=(
  --prefix="$prefix" --libdir=lib --buildtype=release
  -Dudev_dir="$prefix/lib/udev" -Dtests=disabled
  -Dcogl_tests=false -Dclutter_tests=false -Dmutter_tests=false -Dinstalled_tests=false
)

as_owner() {
  if [[ -w "$(dirname "$1")" ]]; then "${@:2}"; else sudo "${@:2}"; fi
}

fingerprint() {
  {
    printf '%s\n' "${options[@]}"
    git -C "$source_dir" rev-parse HEAD
    cat "$compositor/upstream.json" "$compositor/series" "$compositor"/patches/*.patch
  } | sha256sum | cut -d' ' -f1
}

python3 "$compositor/patches.py" prepare
current="$(fingerprint)"
if [[ -f "$prefix/lib/pkgconfig/libmutter-51.pc" && "$(cat "$stamp" 2>/dev/null)" == "$current" ]]; then
  echo "Mutter is up to date in $prefix"
  exit 0
fi

setup=()
if [[ -f "$build_dir/build.ninja" ]]; then
  setup+=(--reconfigure)
fi
meson setup "${setup[@]}" "$build_dir" "$source_dir" "${options[@]}"
meson compile -C "$build_dir"
as_owner "$prefix" meson install -C "$build_dir" --no-rebuild
echo "$current" > "$stamp"
