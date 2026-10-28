#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
compositor="$root/kestrel/compositor"
run="$root/kestrel/run"
source_dir="$run/mutter-source"
options=(
  --libdir=lib --buildtype=release -Dtests=disabled
  -Dcogl_tests=false -Dclutter_tests=false -Dmutter_tests=false -Dinstalled_tests=false
)

fingerprint() {
  {
    printf '%s\n' "${options[@]}"
    git -C "$source_dir" rev-parse HEAD
    cat "$compositor/upstream.json" "$compositor/series" "$compositor"/patches/*.patch
  } | sha256sum | cut -d' ' -f1
}

python3 "$compositor/patches.py" prepare
current="$(fingerprint)"

if [[ $# -eq 0 && -n "${KESTREL_MUTTER_CACHE:-}" ]]; then
  mkdir -p "$KESTREL_MUTTER_CACHE"
  exec 9>"$KESTREL_MUTTER_CACHE/$current.lock"
  flock 9
  build_dir="$KESTREL_MUTTER_CACHE/$current-build"
  prefix="$KESTREL_MUTTER_CACHE/$current"
  rm -rf "$run/mutter-install"
  ln -s "$prefix" "$run/mutter-install"
else
  build_dir="${1:-$run/compositor-build}"
  prefix="${2:-$run/mutter-install}"
fi
stamp="$build_dir/kestrel-stamp"
options+=(--prefix="$prefix" -Dudev_dir="$prefix/lib/udev")
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
meson install -C "$build_dir" --no-rebuild
echo "$current" > "$stamp"
