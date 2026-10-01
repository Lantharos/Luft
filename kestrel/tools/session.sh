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
cache_link="${XDG_RUNTIME_DIR:-/tmp}/kestrel-cache-$(printf '%s' "$session" | sha1sum | cut -c1-12)"
ln -sfn "$session/cache" "$cache_link"
export XDG_CACHE_HOME="$cache_link"
export XDG_STATE_HOME="$session/state"
export XCURSOR_PATH="$XDG_DATA_HOME/icons:$HOME/.local/share/icons:$HOME/.icons:/usr/share/icons:/usr/share/pixmaps"
mkdir -p "$session/data/dbus-1/services"
printf '[D-BUS Service]\nName=org.freedesktop.portal.Documents\nExec=%s -m %s %s\n' "$(command -v gjs)" "$root/kestrel/tools/fixtures/documentPortal.js" "$session/documents" > "$session/data/dbus-1/services/org.freedesktop.portal.Documents.service"
mkdir -p "$session/data/xdg-desktop-portal/portals" "$session/config/xdg-desktop-portal"
ln -sfn "$root/kestrel/engine/data/session/kestrel.portal" "$session/data/xdg-desktop-portal/portals/kestrel.portal"
ln -sfn "$root/kestrel/engine/data/session/kestrel-portals.conf" "$session/config/xdg-desktop-portal/kestrel-portals.conf"
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

cargo build --release --quiet --manifest-path "$root/kestrel/settings/Cargo.toml"

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
  coproc system_bus { exec dbus-daemon --session --nofork --print-address; }
  trap "kill $system_bus_PID" EXIT
  read -r KESTREL_SYSTEM_BUS <&"${system_bus[0]}"
  export KESTREL_SYSTEM_BUS
  DBUS_SYSTEM_BUS_ADDRESS="$KESTREL_SYSTEM_BUS" gjs -m "$root/kestrel/tools/fixtures/systemBus.js" &
  timeout 5 gdbus wait --address "$KESTREL_SYSTEM_BUS" com.lantharos.KestrelChecks
  runtime="${XDG_RUNTIME_DIR:-/tmp}/kestrel-$(printf "%s" "$session" | sha1sum | cut -c1-12)"
  export PIPEWIRE_RUNTIME_DIR="$runtime-pipewire" CUPS_SERVER="$runtime-cups.sock" KESTREL_AUTHENTICATE_SOCK="$runtime-authenticate.sock"
  export KESTREL_APP_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp}/ka-$(printf "%s" "$session" | sha1sum | cut -c1-8)"
  mkdir -p "$PIPEWIRE_RUNTIME_DIR"
  mkdir -m 700 -p "$KESTREL_APP_RUNTIME_DIR"
  rm -f "$KESTREL_AUTHENTICATE_SOCK"
  pipewire -c "$root/kestrel/tools/fixtures/services/pipewire.conf" &
  pipewire_pid=$!
  DBUS_SYSTEM_BUS_ADDRESS="$KESTREL_SYSTEM_BUS" "$root/kestrel/tools/fixtures/services/printServer.sh" "$session/cups" "$CUPS_SERVER" &
  print_server_pid=$!
  gjs -m "$root/kestrel/tools/fixtures/auth/authenticator.js" "$KESTREL_AUTHENTICATE_SOCK" &
  authenticator_pid=$!
  trap "kill $system_bus_PID $pipewire_pid $print_server_pid $authenticator_pid; rm -rf \"$PIPEWIRE_RUNTIME_DIR\" \"$KESTREL_APP_RUNTIME_DIR\" \"$KESTREL_AUTHENTICATE_SOCK\"" EXIT
  timeout 5 gdbus wait --session com.lantharos.KestrelChecks.Authenticator
  timeout 10 bash -c "until [[ \"\$(lpstat -d 2> /dev/null)\" == *Office* ]]; do sleep 0.1; done"
  DBUS_SYSTEM_BUS_ADDRESS="$KESTREL_SYSTEM_BUS" GIO_USE_VFS=local "$root/kestrel/settings/target/release/kestrel-settings" \
    --modules a11y,housekeeping,keyboard,night-light,power,printers,sound,timezone,xsettings &
  timeout 5 gdbus wait --session com.lantharos.Settings
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
    export KESTREL_X11_CURSOR_SCRIPT="$root/kestrel/tools/fixtures/x11Cursor.js"
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
  meson devenv -C "$root/kestrel/build" "$root/kestrel/build/src/kestrel" "${args[@]}"
' kestrel-session "$root" "$mode" "$session"

if [[ "$mode" == capture ]]; then
  exec "$root/kestrel/tools/greeter.sh"
fi
