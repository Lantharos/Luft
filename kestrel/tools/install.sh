#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
action="${1:-install}"
prefix="${2:-/opt/kestrel}"
build="$root/kestrel/run/install-build"

installed_links() {
  echo "share/wayland-sessions/kestrel.desktop"
  echo "share/xdg-desktop-portal/kestrel-portals.conf"
  echo "lib/systemd/user/app.slice.d/50-kestrel-oomd.conf"
  for unit in "$prefix"/lib/systemd/user/kestrel*; do
    echo "lib/systemd/user/$(basename "$unit")"
  done
}

as_owner() {
  if [[ -w "$(dirname "$1")" ]]; then "${@:2}"; else sudo "${@:2}"; fi
}

case "$action" in
  install)
    rm -rf "$build"
    mkdir -p "$build"
    python3 "$root/kestrel/compositor/patches.py" prepare
    meson setup "$build/compositor" "$root/kestrel/run/mutter-source" \
      --prefix="$prefix" --libdir=lib --buildtype=release \
      -Dudev_dir="$prefix/lib/udev" -Dtests=disabled \
      -Dcogl_tests=false -Dclutter_tests=false -Dmutter_tests=false -Dinstalled_tests=false
    meson compile -C "$build/compositor"
    as_owner "$prefix" meson install -C "$build/compositor" --no-rebuild

    (cd "$root/kestrel/ui" && bun install --frozen-lockfile)
    meson setup "$build/engine" "$root/kestrel/engine" \
      -Dpkg_config_path="$prefix/lib/pkgconfig" --prefix="$prefix" --buildtype=release
    meson compile -C "$build/engine"
    as_owner "$prefix" meson install -C "$build/engine" --no-rebuild
    as_owner "$prefix" glib-compile-schemas "$prefix/share/glib-2.0/schemas"

    if [[ "$prefix" == /opt/* || "$prefix" == /usr/* ]]; then
      installed_links | while read -r link; do
        sudo mkdir -p "/usr/local/$(dirname "$link")"
        sudo ln -sfn "$prefix/$link" "/usr/local/$link"
      done
      systemctl --user daemon-reload
      echo "Kestrel is installed in $prefix and appears as a session on the login screen."
    else
      echo "Kestrel is installed in $prefix. Session entries are only linked for system prefixes."
    fi
    ;;
  remove)
    installed_links | while read -r link; do
      [[ -L "/usr/local/$link" ]] && sudo rm "/usr/local/$link"
    done
    as_owner "$prefix" rm -rf "$prefix"
    echo "Kestrel was removed from $prefix."
    ;;
  *)
    echo "Usage: kestrel/tools/install.sh [install|remove] [prefix]" >&2
    exit 2
    ;;
esac
