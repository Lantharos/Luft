#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
run="$root/kestrel/run"
version=51.0
archive="$run/mutter-$version.tar.xz"
source_dir="$run/mutter-$version"
build_dir="$run/mutter-build"
prefix="$run/mutter-install"
checksum=5d28f3ae225692428fcafb96500d673f34328b698b86960c9c1460d0b1d983b3
mkdir -p "$run"

if [[ ! -f "$archive" ]]; then
  curl --fail --location "https://download.gnome.org/sources/mutter/51/mutter-$version.tar.xz" --output "$archive.part"
  mv "$archive.part" "$archive"
fi
printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check

fingerprint="$(cat "$root/kestrel/compositor/rounding.patch" "$root/kestrel/compositor/meta-window-corners.c" "$root/kestrel/compositor/meta-window-corners.h" | sha256sum | cut -d ' ' -f 1)"
if [[ ! -f "$source_dir/.kestrel-patch" ]] || [[ "$(cat "$source_dir/.kestrel-patch")" != "$fingerprint" ]]; then
  rm -rf "$source_dir"
  tar -xf "$archive" -C "$run"
  patch --directory="$source_dir" --strip=1 < "$root/kestrel/compositor/rounding.patch"
  cp "$root/kestrel/compositor/"meta-window-corners.{c,h} "$source_dir/src/compositor/"
  printf '%s\n' "$fingerprint" > "$source_dir/.kestrel-patch"
fi

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
