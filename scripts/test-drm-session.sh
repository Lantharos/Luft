#!/usr/bin/env bash
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
profile="${PROFILE:-debug}"
case "$(tty)" in
  /dev/tty[0-9]*) ;;
  *) echo "Run this from a logged-in spare TTY (Ctrl+Alt+F3), not a desktop terminal." >&2; exit 1 ;;
esac
for binary in kestrel luft-shell luft-session luft-portal; do
  if [[ ! -x "$root/target/$profile/$binary" ]]; then
    echo "Build the workspace first: cargo build --workspace --locked" >&2
    exit 1
  fi
done
if [[ ! -f "$root/crates/luft-shell/web/dist/index.html" ]]; then
  echo "Build the shell first: cd crates/luft-shell/web && bun run build" >&2
  exit 1
fi
for binary in dbus-run-session sabine; do
  command -v "$binary" >/dev/null || { echo "Missing required program: $binary" >&2; exit 1; }
done
if [[ -z "${SABINE_HOST_PATH:-}" && -x "$root/target/$profile/sabine-host" ]]; then
  export SABINE_HOST_PATH="$root/target/$profile/sabine-host"
fi
sabine runtime doctor

run_id="$(date +%Y%m%d-%H%M%S)-$$"
state_root="${XDG_STATE_HOME:-$HOME/.local/state}/luft-session-tests/$run_id"
mkdir -p "$state_root/bin"
for binary in kestrel luft-shell luft-session luft-portal; do
  cp --reflink=auto "$root/target/$profile/$binary" "$state_root/bin/$binary"
done
if [[ -n "${SABINE_HOST_PATH:-}" ]]; then
  cp --reflink=auto "$SABINE_HOST_PATH" "$state_root/bin/sabine-host"
  export SABINE_HOST_PATH="$state_root/bin/sabine-host"
fi
cp -a "$root/crates/luft-shell/web/dist" "$state_root/shell"
sha256sum "$state_root/bin/"* "$state_root/shell/index.html" > "$state_root/artifacts.sha256"
printf 'Session logs: %s\nReturn to your existing desktop with Ctrl+Alt+F2. Use Logout to end this session.\n' "$state_root"
export LUFT_PRIVATE_DBUS=1
export LUFT_SKIP_STARTUP_APPS=1
export LUFT_IPC_SOCKET="${XDG_RUNTIME_DIR:?}/luft-drm-test-$run_id.sock"
export LUFT_SHELL_WEB_DIR="$state_root/shell"
export LUFT_SHELL="$state_root/bin/luft-shell"
export LUFT_PORTAL="$state_root/bin/luft-portal"
export XDG_STATE_HOME="$state_root"
export RUST_BACKTRACE=1
unset WAYLAND_DISPLAY WAYLAND_SOCKET DISPLAY
exec dbus-run-session -- "$state_root/bin/luft-session" --session --kestrel "$state_root/bin/kestrel" --socket "luft-drm-test-$run_id" > >(tee "$state_root/compositor.log") 2>&1
