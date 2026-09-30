#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
mode="${1:-nested}"
run="$root/kestrel/run"
session="${KESTREL_SESSION_DIR:-$run}"
mkdir -p "$session"/{config,data,cache,state}

compositor="$run/mutter-install/lib"
if [[ ! -f "$compositor/libmutter-51.so" ]]; then
  echo "Build Kestrel's compositor first: kestrel/compositor/build.sh" >&2
  exit 1
fi
export LD_LIBRARY_PATH="$compositor:$compositor/mutter-51${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export GI_TYPELIB_PATH="$compositor/mutter-51${GI_TYPELIB_PATH:+:$GI_TYPELIB_PATH}"

dconf dump /org/gnome/desktop/background/ > "$session/background.ini"
dconf dump /org/gnome/desktop/interface/ > "$session/interface.ini"
dconf dump /org/gnome/desktop/input-sources/ > "$session/input-sources.ini"
dconf read /com/lantharos/kestrel/favorite-apps > "$session/favorites.txt"

export XDG_DATA_DIRS="${XDG_DATA_HOME:-$HOME/.local/share}:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"
export XDG_CONFIG_HOME="$session/config"
export XDG_DATA_HOME="$session/data"
export XDG_CACHE_HOME="$session/cache"
export XDG_STATE_HOME="$session/state"
mkdir -p "$session/data/dbus-1/services"
printf '[D-BUS Service]\nName=org.freedesktop.portal.Documents\nExec=/bin/false\n' > "$session/data/dbus-1/services/org.freedesktop.portal.Documents.service"
export GVFS_DISABLE_FUSE=1
glib-compile-schemas "$root/kestrel/build/data"
export GNOME_SHELL_BUILDDIR="$root/kestrel/build/src"
export GI_TYPELIB_PATH="$root/kestrel/build/src:$root/kestrel/build/src/st:$root/kestrel/build/subprojects/gvc${GI_TYPELIB_PATH:+:$GI_TYPELIB_PATH}"
export LD_LIBRARY_PATH="$root/kestrel/build/src:$root/kestrel/build/src/st:$root/kestrel/build/subprojects/gvc${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export GNOME_SHELL_DATADIR="$root/kestrel/build/data"
export GSETTINGS_SCHEMA_DIR="$root/kestrel/build/data"
export KESTREL_CSS_PATH="$root/kestrel/engine/data/theme/kestrel.css"
unset GSETTINGS_BACKEND GDK_BACKEND

if [[ "$mode" == greeter ]]; then
  exec "$root/kestrel/tools/greeter.sh"
fi

dbus-run-session -- bash -c '
  set -euo pipefail
  root="$1"
  mode="$2"
  session="$3"
  for section in background interface input-sources; do
    dconf reset -f "/org/gnome/desktop/$section/"
    dconf load "/org/gnome/desktop/$section/" < "$session/$section.ini"
  done
  if [[ -s "$session/favorites.txt" ]]; then
    dconf write /com/lantharos/kestrel/favorite-apps "$(cat "$session/favorites.txt")"
  fi
  gjs -m "$root/kestrel/build/js/ui/kestrel-session.js" &
  timeout 5 gdbus wait --session org.gnome.SessionManager
  if [[ "$mode" == capture ]]; then
    dconf reset /com/lantharos/kestrel/quick-tile-order
    dconf reset /com/lantharos/kestrel/quick-tiles-removed
    dconf reset /com/lantharos/kestrel/live-wallpaper
    dconf reset /com/lantharos/kestrel/live-wallpaper-dark
    export KESTREL_CAPTURE_DIR="${KESTREL_CAPTURE_DIR:-$root/docs/screenshots}"
    mkdir -p "$KESTREL_CAPTURE_DIR"
    export KESTREL_WINDOW_SCRIPT="$root/kestrel/tools/fixtures/window.js"
    export KESTREL_MEDIA_SCRIPT="$root/kestrel/tools/fixtures/mediaPlayer.js"
    export KESTREL_TRAY_SCRIPT="$root/kestrel/tools/fixtures/trayApp.js"
    export KESTREL_SESSION_CLIENT_SCRIPT="$root/kestrel/tools/fixtures/sessionClient.js"
    export KESTREL_LAPTOP_SCRIPT="$root/kestrel/tools/fixtures/laptopServices.js"
    args=(--headless --virtual-monitor "${KESTREL_CAPTURE_SIZE:-1440x900}" --automation-script "$root/kestrel/tools/capture.js")
    if [[ -n "${KESTREL_CAPTURE_SECONDARY_SIZE:-}" ]]; then
      args+=(--virtual-monitor "$KESTREL_CAPTURE_SECONDARY_SIZE")
    fi
  elif [[ "$mode" == performance ]]; then
    args=(--headless --virtual-monitor "${KESTREL_CAPTURE_SIZE:-1440x900}" --automation-script "$root/kestrel/tools/performance.js")
  elif [[ "$mode" == nested ]]; then
    args=(--wayland --devkit)
  else
    echo "Usage: kestrel/tools/session.sh [nested|capture|performance|greeter]" >&2
    exit 2
  fi
  exec meson devenv -C "$root/kestrel/build" "$root/kestrel/build/src/kestrel" "${args[@]}"
' kestrel-session "$root" "$mode" "$session"

if [[ "$mode" == capture ]]; then
  exec "$root/kestrel/tools/greeter.sh"
fi
