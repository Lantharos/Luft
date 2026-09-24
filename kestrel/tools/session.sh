#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
mode="${1:-nested}"
run="$root/kestrel/run"
mkdir -p "$run"/{config,data,cache,state}

dconf dump /org/gnome/desktop/background/ > "$run/background.ini"
dconf dump /org/gnome/desktop/interface/ > "$run/interface.ini"
dconf dump /org/gnome/desktop/input-sources/ > "$run/input-sources.ini"
gsettings get org.gnome.shell favorite-apps > "$run/favorites.txt"

export XDG_DATA_DIRS="${XDG_DATA_HOME:-$HOME/.local/share}:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"
export XDG_CONFIG_HOME="$run/config"
export XDG_DATA_HOME="$run/data"
export XDG_CACHE_HOME="$run/cache"
export XDG_STATE_HOME="$run/state"
glib-compile-schemas "$root/kestrel/build/data"
export GNOME_SHELL_BUILDDIR="$root/kestrel/build/src"
export GI_TYPELIB_PATH="$root/kestrel/build/src:$root/kestrel/build/src/st:$root/kestrel/build/subprojects/gvc${GI_TYPELIB_PATH:+:$GI_TYPELIB_PATH}"
export LD_LIBRARY_PATH="$root/kestrel/build/src:$root/kestrel/build/src/st:$root/kestrel/build/subprojects/gvc${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export GNOME_SHELL_DATADIR="$root/kestrel/build/data"
export GSETTINGS_SCHEMA_DIR="$root/kestrel/build/data"
export KESTREL_CSS_PATH="$root/kestrel/engine/data/theme/kestrel.css"
unset GSETTINGS_BACKEND

exec dbus-run-session -- bash -c '
  set -euo pipefail
  root="$1"
  mode="$2"
  run="$root/kestrel/run"
  dconf load /org/gnome/desktop/background/ < "$run/background.ini"
  dconf load /org/gnome/desktop/interface/ < "$run/interface.ini"
  dconf load /org/gnome/desktop/input-sources/ < "$run/input-sources.ini"
  dconf write /org/gnome/shell/favorite-apps "$(cat "$run/favorites.txt")"
  dconf write /org/gnome/shell/disable-user-extensions true
  if [[ "$mode" == capture ]]; then
    export KESTREL_CAPTURE_DIR="${KESTREL_CAPTURE_DIR:-$root/docs/screenshots}"
    mkdir -p "$KESTREL_CAPTURE_DIR"
    export KESTREL_WINDOW_SCRIPT="$root/kestrel/tools/window.js"
    args=(--headless --virtual-monitor "${KESTREL_CAPTURE_SIZE:-1440x900}" --automation-script "$root/kestrel/tools/capture.js")
    if [[ -n "${KESTREL_CAPTURE_SECONDARY_SIZE:-}" ]]; then
      args+=(--virtual-monitor "$KESTREL_CAPTURE_SECONDARY_SIZE")
    fi
  elif [[ "$mode" == performance ]]; then
    args=(--headless --virtual-monitor "${KESTREL_CAPTURE_SIZE:-1440x900}" --automation-script "$root/kestrel/tools/performance.js")
  elif [[ "$mode" == nested ]]; then
    args=(--wayland --devkit)
  else
    echo "Usage: kestrel/tools/session.sh [nested|capture|performance]" >&2
    exit 2
  fi
  exec meson devenv -C "$root/kestrel/build" "$root/kestrel/build/src/gnome-shell" "${args[@]}"
' kestrel-session "$root" "$mode"
