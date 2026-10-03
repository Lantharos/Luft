#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
tools="$root/kestrel/tools"
fixtures="$tools/fixtures/greeter"
run="${KESTREL_SESSION_DIR:-$root/kestrel/run}/greeter"
events="$run/events.jsonl"
socket_dir="$(mktemp -d -p "${XDG_RUNTIME_DIR:-/tmp}" kestrel-greetd.XXXXXX)"
socket="$socket_dir/greetd.sock"
pids=()

cleanup() {
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait "${pids[@]}" 2>/dev/null || true
  rm -rf "$socket_dir"
}
trap cleanup EXIT

wait_for() {
  for _ in $(seq 100); do
    if eval "$1"; then return 0; fi
    sleep 0.05
  done
  echo "Timed out waiting for: $1" >&2
  exit 1
}

cargo build --release --quiet --manifest-path "$root/kestrel/greeter/Cargo.toml"

rm -rf "$run"
mkdir -p "$run"/{images,state/users/2001,state/users/2002,data/wayland-sessions,config,cache,state-home}
: > "$events"
gjs -m "$fixtures/images.js" "$run/images"
cp "$run/images/ayesha-wallpaper.png" "$run/state/users/2001/wallpaper.jpg"
cp "$run/images/sam-wallpaper.png" "$run/state/users/2002/wallpaper.jpg"
printf '[Desktop Entry]\nName=Kestrel\nExec=kestrel-session\nDesktopNames=Kestrel;GNOME\n' > "$run/data/wayland-sessions/kestrel.desktop"
printf '[Desktop Entry]\nName=Sway\nExec=sway\n' > "$run/data/wayland-sessions/sway.desktop"
printf '[terminal]\nvt = 1\n\n[default_session]\ncommand = "kestrel-greeter"\nuser = "greetd"\n' > "$run/greetd.toml"

dbus-daemon --session --nofork --print-address=3 3>"$run/system-bus" &
pids+=($!)
wait_for '[[ -s "$run/system-bus" ]]'
DBUS_SYSTEM_BUS_ADDRESS="$(head -n1 "$run/system-bus")"
export DBUS_SYSTEM_BUS_ADDRESS

gjs -m "$fixtures/systemServices.js" "$run/images" "$events" &
pids+=($!)
"$root/kestrel/greeter/target/release/kestrel-greeter-service" --unprivileged \
  --state-dir "$run/state" --greetd-config "$run/greetd.toml" &
pids+=($!)
gjs -m "$fixtures/greetd.js" "$socket" "$events" &
pids+=($!)
wait_for 'gdbus introspect --system --dest org.freedesktop.Accounts --object-path /org/freedesktop/Accounts >/dev/null 2>&1'
wait_for 'gdbus introspect --system --dest com.lantharos.Greeter1 --object-path /com/lantharos/Greeter1 >/dev/null 2>&1'
wait_for '[[ -S "$socket" ]]'

gjs -m "$tools/checks/greeter/loginSettings.js" "$run/images" "$run/state"

export GREETD_SOCK="$socket"
export KESTREL_GREETER_STATE_DIR="$run/state"
export KESTREL_GREETER_EVENTS="$events"
export KESTREL_GREETER_IMAGES="$run/images"
export KESTREL_CAPTURE_DIR="${KESTREL_CAPTURE_DIR:-$root/docs/screenshots}"
export GSETTINGS_BACKEND=memory
export PIPEWIRE_RUNTIME_DIR="$socket_dir" PULSE_SERVER="unix:$socket_dir/pulse"
export XDG_DATA_DIRS="$run/data:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"
cache_link="${XDG_RUNTIME_DIR:-/tmp}/kestrel-cache-$(printf '%s' "$run" | sha1sum | cut -c1-12)"
ln -sfn "$run/cache" "$cache_link"
export XDG_CONFIG_HOME="$run/config" XDG_CACHE_HOME="$cache_link" XDG_STATE_HOME="$run/state-home"
mkdir -p "$KESTREL_CAPTURE_DIR"

dbus-run-session -- meson devenv -C "$root/kestrel/build" "$root/kestrel/build/src/kestrel" --greeter \
  --headless --virtual-monitor "${KESTREL_CAPTURE_SIZE:-1440x900}" --automation-script "$tools/greeter.js"
gjs -m "$tools/checks/greeter/signedIn.js" "$events"
