#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: kestrel/tools/session/services.sh MODE SESSION_DIR KESTREL_ARGS..." >&2
  echo "Starts the stand-in services of one session on its private bus, then Kestrel." >&2
  exit 2
fi
mode="$1"
session="$2"
shift 2
# shellcheck source-path=SCRIPTDIR
source "$(dirname "$0")/environment.sh"
fixtures="$tools/fixtures"
pids=()

stop_services() {
  kill "${pids[@]}" 2> /dev/null || true
  wait "${pids[@]}" 2> /dev/null || true
}
trap stop_services EXIT

restore_settings() {
  if [[ "$mode" == nested ]]; then
    for section in background interface input-sources; do
      dconf reset -f "/org/gnome/desktop/$section/"
      dconf load "/org/gnome/desktop/$section/" < "$session/$section.ini"
    done
  else
    dconf reset -f /
  fi
  if [[ -s "$session/favorites.txt" ]]; then
    dconf write /com/lantharos/kestrel/favorite-apps "$(cat "$session/favorites.txt")"
  fi
  case "${KESTREL_CAPTURE_SCHEME:-}" in
    light) dconf write /org/gnome/desktop/interface/color-scheme "'default'" ;;
    dark) dconf write /org/gnome/desktop/interface/color-scheme "'prefer-dark'" ;;
  esac
  if [[ -n "${KESTREL_CAPTURE_WALLPAPER:-}" ]]; then
    local uri
    uri="'$(python3 -c 'import pathlib, sys; print(pathlib.Path(sys.argv[1]).resolve().as_uri())' "$KESTREL_CAPTURE_WALLPAPER")'"
    dconf write /org/gnome/desktop/background/picture-uri "$uri"
    dconf write /org/gnome/desktop/background/picture-uri-dark "$uri"
  fi
}

start_system_bus() {
  start dbus-daemon --session --nofork --print-address=3 3> "$session/system-bus"
  wait_until "the stand-in system bus" test -s "$session/system-bus"
  system_bus="$(head -n1 "$session/system-bus")"
  [[ "$mode" == nested ]] && return
  export DBUS_SYSTEM_BUS_ADDRESS="$system_bus"
  dbus-update-activation-environment DBUS_SYSTEM_BUS_ADDRESS
}

start() {
  "$@" &
  pids+=($!)
}

printer_ready() {
  [[ "$(lpstat -d)" == *Office* ]]
}

ulimit -n "$(ulimit -Hn)"
restore_settings
mkdir -p "$XDG_RUNTIME_DIR/dconf"
install -d -m 700 "$KESTREL_APP_RUNTIME_DIR" "$PIPEWIRE_RUNTIME_DIR" "$PULSE_RUNTIME_PATH"
ln -sfn "$XDG_RUNTIME_DIR/dconf" "$KESTREL_APP_RUNTIME_DIR/dconf"
rm -f "$KESTREL_AUTHENTICATE_SOCK" "$KESTREL_READY_SOCK"
start_system_bus
start gjs -m "$build/js/ui/kestrel-session.js"
system_services="$fixtures/system/systemBus.js"
[[ "$mode" == setup ]] && system_services="$fixtures/setup/systemBus.js"
DBUS_SYSTEM_BUS_ADDRESS="$system_bus" start gjs -m "$system_services"
DBUS_SYSTEM_BUS_ADDRESS="$system_bus" start "$fixtures/session/printServer.sh" "$session/cups" "$CUPS_SERVER"
start gjs -m "$fixtures/auth/authenticator.js" "$KESTREL_AUTHENTICATE_SOCK"
start pipewire -c "$fixtures/session/pipewire.conf"
gdbus wait --session --timeout 10 org.gnome.SessionManager
gdbus wait --address "$system_bus" --timeout 10 com.lantharos.KestrelChecks
gdbus wait --session --timeout 10 com.lantharos.KestrelChecks.Authenticator
wait_until "the sound server" test -S "$PULSE_RUNTIME_PATH/native"
start "$fixtures/session/soundDefaults.sh"
wait_until "the print server" printer_ready
DBUS_SYSTEM_BUS_ADDRESS="$system_bus" GIO_USE_VFS=local start "$root/target/release/kestrel-settings" \
  --modules a11y,housekeeping,keyboard,night-light,power,printers,sound,timezone,watchdog,xsettings
gdbus wait --session --timeout 10 com.lantharos.Settings
DBUS_SYSTEM_BUS_ADDRESS="$system_bus" start "$root/target/release/kestrel-search"
gdbus wait --session --timeout 10 com.lantharos.Search
start python3 "$fixtures/session/portalFrontend.py" "$KESTREL_READY_SOCK" /usr/libexec/xdg-desktop-portal
wait_until "the readiness socket" test -S "$KESTREL_READY_SOCK"
NOTIFY_SOCKET="$KESTREL_READY_SOCK" meson devenv -C "$build" "$build/src/kestrel" "$@"
