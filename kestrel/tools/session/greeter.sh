#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 0 ]]; then
  echo "Usage: kestrel/tools/session/greeter.sh" >&2
  echo "Runs the login screen checks headless. kestrel/tools/session.sh greeter is the way to run it." >&2
  exit 2
fi
# shellcheck source-path=SCRIPTDIR
source "$(dirname "$0")/environment.sh"
fixtures="$tools/fixtures/greeter"
prepare_session "${KESTREL_SESSION_DIR:-$root/kestrel/run}"
run="$session/greeter"
events="$run/events.jsonl"
socket_dir="$(mktemp -d -p "${XDG_RUNTIME_DIR:-/tmp}" kestrel-greetd.XXXXXX)"
socket="$socket_dir/greetd.sock"
pids=()

cleanup() {
  kill "${pids[@]}" 2> /dev/null || true
  wait "${pids[@]}" 2> /dev/null || true
  rm -rf "$socket_dir"
  rm -f "$cache_link"
}
trap cleanup EXIT

start() {
  "$@" &
  pids+=($!)
}

rm -rf "$run"
mkdir -p "$run"/{images,state/users/2001,state/users/2002,data/wayland-sessions,config,cache,state-home}
: > "$events"
gjs -m "$fixtures/images.js" "$run/images"
cp "$run/images/ayesha-wallpaper.png" "$run/state/users/2001/wallpaper.jpg"
cp "$run/images/sam-wallpaper.png" "$run/state/users/2002/wallpaper.jpg"
printf '[Desktop Entry]\nName=Kestrel\nExec=kestrel-session\nDesktopNames=Kestrel;GNOME\n' > "$run/data/wayland-sessions/kestrel.desktop"
printf '[Desktop Entry]\nName=Sway\nExec=sway\n' > "$run/data/wayland-sessions/sway.desktop"
printf '[terminal]\nvt = 1\n\n[default_session]\ncommand = "kestrel-greeter"\nuser = "greetd"\n' > "$run/greetd.toml"

start dbus-daemon --session --nofork --print-address=3 3> "$run/system-bus"
wait_until "the stand-in system bus" test -s "$run/system-bus"
DBUS_SYSTEM_BUS_ADDRESS="$(head -n1 "$run/system-bus")"
export DBUS_SYSTEM_BUS_ADDRESS

start gjs -m "$fixtures/systemServices.js" "$run/images" "$events"
start "$root/kestrel/greeter/target/release/kestrel-greeter-service" --unprivileged \
  --state-dir "$run/state" --greetd-config "$run/greetd.toml"
start gjs -m "$fixtures/greetd.js" "$socket" "$events"
wait_until "the accounts service" gdbus introspect --system --dest org.freedesktop.Accounts --object-path /org/freedesktop/Accounts
wait_until "the greeter service" gdbus introspect --system --dest com.lantharos.Greeter1 --object-path /com/lantharos/Greeter1
wait_until "the greetd socket" test -S "$socket"

gjs -m "$fixtures/loginSettings.js" "$run/images" "$run/state"

export GREETD_SOCK="$socket"
export KESTREL_GREETER_STATE_DIR="$run/state" KESTREL_GREETER_EVENTS="$events" KESTREL_GREETER_IMAGES="$run/images"
export GSETTINGS_BACKEND=memory
export PIPEWIRE_RUNTIME_DIR="$socket_dir" PULSE_SERVER="unix:$socket_dir/pulse"
export XDG_DATA_DIRS="$run/data:$XDG_DATA_DIRS"
ln -sfn "$run/cache" "$cache_link"
export XDG_CONFIG_HOME="$run/config" XDG_STATE_HOME="$run/state-home"
mkdir -p "$KESTREL_CAPTURE_DIR"

dbus-run-session -- meson devenv -C "$build" "$build/src/kestrel" --greeter \
  --headless --virtual-monitor "${KESTREL_CAPTURE_SIZE:-1440x900}" --automation-script "$tools/automation/greeter.js"
gjs -m "$fixtures/signedIn.js" "$events"
