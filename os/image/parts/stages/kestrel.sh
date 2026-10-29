#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
kestrel="$luft/kestrel"
destdir="$1"
out="$2"
work="${LUFT_BUILD:-/var/tmp/luft-build}/kestrel"
prefix=/usr
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-$work/cargo}"
compositor_extras=(
  bin/gdctl bin/gnome-service-client bin/mutter include lib/pkgconfig lib/mutter-51/{Clutter,Cogl,Meta,Mtk}-51.gir
  share/GConf/gsettings/mutter-schemas.convert share/man/man1/gdctl.1 share/man/man1/gnome-service-client.1
  share/man/man1/mutter.1
)

keep_sources_in_work() {
  mkdir -p "$work/run"
  ln -sfn "$work/run" "$kestrel/run"
}

build_compositor() {
  local extra
  "$kestrel/compositor/build.sh" "$work/compositor" "$prefix"
  DESTDIR="$destdir" meson install -C "$work/compositor" --no-rebuild --quiet
  for extra in "${compositor_extras[@]}"; do rm -rf "${destdir:?}$prefix/$extra"; done
}

build_engine() {
  local setup=()
  [[ -f "$work/engine/build.ninja" ]] && setup+=(--reconfigure)
  (cd "$luft" && bun install --frozen-lockfile --filter @luft/kestrel-ui --filter @luft/kestrel-types)
  export NODE_PATH="$kestrel/ui/node_modules"
  meson setup "${setup[@]}" "$work/engine" "$kestrel/engine" \
    -Dpkg_config_path="$prefix/lib/pkgconfig" --prefix="$prefix" --buildtype=release
  meson compile -C "$work/engine"
  DESTDIR="$destdir" meson install -C "$work/engine" --no-rebuild --quiet
}

check_types() {
  bun "$kestrel/types/generate.ts" --check --build "$work/engine" --compositor "$prefix"
}

install_components() {
  bun "$luft/os/image/parts/components/install.ts" "$destdir" --part kestrel
}

list_typelibs() {
  grep -rhoE "gi://[A-Za-z0-9]+" "$kestrel/ui/src" | cut -d/ -f3 | sort -u
}

keep_sources_in_work
build_compositor
build_engine
check_types
install_components
mkdir -p "$out"
list_typelibs > "$out/typelibs.txt"
