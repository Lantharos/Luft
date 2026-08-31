#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="${BIN_DIR:-/usr/local/bin}"
SESSION_DIR="${SESSION_DIR:-/usr/share/wayland-sessions}"
PORTAL_DIR="${PORTAL_DIR:-/usr/share/xdg-desktop-portal}"
DBUS_SERVICE_DIR="${DBUS_SERVICE_DIR:-/usr/share/dbus-1/services}"
PROFILE="${PROFILE:-release}"
DATA_DIR="${DATA_DIR:-$(dirname "$BIN_DIR")/share/luft}"

usage() {
  echo "usage: $0 [--uninstall]"
}

destination_command() {
  local destination="$1"
  local ancestor
  ancestor="$(dirname "$destination")"
  while [[ ! -e "$ancestor" ]]; do
    ancestor="$(dirname "$ancestor")"
  done
  if [[ -w "$ancestor" ]]; then
    return
  fi
  printf '%s\0' sudo
}

install_file() {
  local mode="$1" source="$2" destination="$3"
  local -a privilege=()
  mapfile -d '' -t privilege < <(destination_command "$destination")
  "${privilege[@]}" install -Dm"$mode" "$source" "$destination"
}

remove_file() {
  local destination="$1"
  local -a privilege=()
  mapfile -d '' -t privilege < <(destination_command "$destination")
  "${privilege[@]}" rm -f -- "$destination"
}

remove_tree() {
  local destination="$1"
  local -a privilege=()
  mapfile -d '' -t privilege < <(destination_command "$destination")
  "${privilege[@]}" rm -rf -- "$destination"
}

if [[ $# -gt 1 ]] || [[ $# -eq 1 && "$1" != "--uninstall" ]]; then
  usage >&2
  exit 2
fi

if [[ "${1:-}" == "--uninstall" ]]; then
  remove_file "$BIN_DIR/kestrel"
  remove_file "$BIN_DIR/luft-shell"
  remove_file "$BIN_DIR/luft-session"
  remove_file "$BIN_DIR/luft-portal"
  remove_file "$SESSION_DIR/luft.desktop"
  remove_file "$PORTAL_DIR/luft-portals.conf"
  remove_file "$PORTAL_DIR/portals/luft.portal"
  remove_file "$DBUS_SERVICE_DIR/org.freedesktop.impl.portal.desktop.luft.service"
  remove_tree "$DATA_DIR/shell"
  echo "Uninstalled Luft."
  exit 0
fi

if [[ "$PROFILE" != "release" && "$PROFILE" != "debug" ]]; then
  echo "PROFILE must be release or debug" >&2
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required to build luft-shell web assets" >&2
  exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
  echo "cargo is required to build Luft" >&2
  exit 1
fi

build_args=()
target_dir="$ROOT/target/debug"
if [[ "$PROFILE" == "release" ]]; then
  build_args+=(--release)
  target_dir="$ROOT/target/release"
fi

cd "$ROOT/crates/luft-shell/web"
bun install --frozen-lockfile
bun run build

cd "$ROOT"
cargo build --locked "${build_args[@]}" \
  -p kestrel \
  -p luft-shell \
  -p luft-session \
  -p luft-portal \
  --features kestrel/session-backend

install_file 755 "$target_dir/kestrel" "$BIN_DIR/kestrel"
install_file 755 "$target_dir/luft-shell" "$BIN_DIR/luft-shell"
install_file 755 "$target_dir/luft-session" "$BIN_DIR/luft-session"
install_file 755 "$target_dir/luft-portal" "$BIN_DIR/luft-portal"
while IFS= read -r -d '' asset; do
  relative="${asset#"$ROOT/crates/luft-shell/web/dist/"}"
  install_file 644 "$asset" "$DATA_DIR/shell/$relative"
done < <(find "$ROOT/crates/luft-shell/web/dist" -type f -print0)

desktop_entry="$(mktemp)"
portal_service=""
trap 'rm -f "$desktop_entry" "$portal_service"' EXIT
cat >"$desktop_entry" <<EOF
[Desktop Entry]
Name=Luft
Comment=Luft Desktop Environment
Exec=$BIN_DIR/luft-session --session
TryExec=$BIN_DIR/luft-session
Type=Application
DesktopNames=Luft
Keywords=wayland;desktop;session;
EOF

install_file 644 "$desktop_entry" "$SESSION_DIR/luft.desktop"
install_file 644 \
  "$ROOT/data/xdg-desktop-portal/luft-portals.conf" \
  "$PORTAL_DIR/luft-portals.conf"
install_file 644 \
  "$ROOT/data/xdg-desktop-portal/portals/luft.portal" \
  "$PORTAL_DIR/portals/luft.portal"

portal_service="$(mktemp)"
cat >"$portal_service" <<EOF
[D-BUS Service]
Name=org.freedesktop.impl.portal.desktop.luft
Exec=$BIN_DIR/luft-portal
EOF
install_file 644 \
  "$portal_service" \
  "$DBUS_SERVICE_DIR/org.freedesktop.impl.portal.desktop.luft.service"

echo "Installed Luft session:"
echo "  binaries: $BIN_DIR"
echo "  resources: $DATA_DIR"
echo "  session:  $SESSION_DIR/luft.desktop"
echo "  portals:  $PORTAL_DIR/luft-portals.conf"
echo "  portal backend: $PORTAL_DIR/portals/luft.portal"
echo
echo "Pick Luft from your display manager's session menu."
