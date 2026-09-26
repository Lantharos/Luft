#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
action="${1:-install}"
prefix="${2:-/opt/kestrel}"
build="$root/kestrel/run/install-build"
links=(
  "share/wayland-sessions/kestrel.desktop"
  "lib/systemd/user/kestrel.service"
  "lib/systemd/user/gnome-session@kestrel.target.d"
)

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
      -Dpkg_config_path="$prefix/lib/pkgconfig" --prefix="$prefix" --buildtype=release \
      -Dtests=false -Dman=false
    meson compile -C "$build/engine"
    as_owner "$prefix" meson install -C "$build/engine" --no-rebuild
    as_owner "$prefix" glib-compile-schemas "$prefix/share/glib-2.0/schemas"

    if [[ "$prefix" == /opt/* || "$prefix" == /usr/* ]]; then
      for link in "${links[@]}"; do
        sudo mkdir -p "/usr/local/$(dirname "$link")"
        sudo ln -sfn "$prefix/$link" "/usr/local/$link"
      done
      echo "Kestrel is installed in $prefix and appears as a session on the login screen."
    else
      echo "Kestrel is installed in $prefix. Session entries are only linked for system prefixes."
    fi
    ;;
  remove)
    for link in "${links[@]}"; do
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
