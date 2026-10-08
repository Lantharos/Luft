#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: kestrel/tools/session/desktop.sh nested|capture|performance" >&2
  echo "Starts one Kestrel session. kestrel/tools/session.sh is the way to run it." >&2
  exit 2
}

[[ $# -eq 1 ]] || usage
mode="$1"
# shellcheck source-path=SCRIPTDIR
source "$(dirname "$0")/environment.sh"
size="${KESTREL_CAPTURE_SIZE:-1440x900}"
case "$mode" in
  nested) args=(--wayland --devkit) ;;
  capture) args=(--headless --virtual-monitor "$size" --automation-script "$tools/automation/capture.js") ;;
  performance) args=(--headless --virtual-monitor "$size" --automation-script "$tools/automation/performance.js") ;;
  *) usage ;;
esac
if [[ "$mode" != nested && -n "${KESTREL_CAPTURE_SECONDARY_SIZE:-}" ]]; then
  args+=(--virtual-monitor "$KESTREL_CAPTURE_SECONDARY_SIZE")
fi

prepare_session "${KESTREL_SESSION_DIR:-$root/kestrel/run}"
home="$session/state/luft-home"
mkdir -p "$home/.local/share"
ln -sfn "$HOME/.local/share/sabine" "$home/.local/share/sabine"
export RUSTUP_HOME="${RUSTUP_HOME:-$HOME/.rustup}" CARGO_HOME="${CARGO_HOME:-$HOME/.cargo}"
export HOME="$home"

runtime="${XDG_RUNTIME_DIR:-/tmp}/kestrel-$(session_hash "$session" 12)"
app_runtime="${XDG_RUNTIME_DIR:-/tmp}/ka-$(session_hash "$session" 8)"
export PIPEWIRE_RUNTIME_DIR="$runtime-pipewire" PULSE_RUNTIME_PATH="$runtime-pulse"
export CUPS_SERVER="$runtime-cups.sock" KESTREL_AUTHENTICATE_SOCK="$runtime-authenticate.sock"
export PULSE_SERVER="unix:$PULSE_RUNTIME_PATH/native"
export KESTREL_APP_RUNTIME_DIR="$app_runtime"

scope="kestrel-session-$(session_hash "$session" 12)"
trap 'systemctl --user stop "$scope.scope" 2> /dev/null || true; rm -rf "$cache_link" "$app_runtime" "$runtime"-*' EXIT
trap 'exit 143' TERM INT

systemd-run --user --scope --quiet --collect --expand-environment=no --unit="$scope" \
  dbus-run-session -- "$tools/session/services.sh" "$mode" "$session" "${args[@]}" &
wait $!
