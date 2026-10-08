#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
action="${1:-install}"
prefix="${2:-/opt/kestrel}"
destination="${DESTDIR:-}"
data="$root/data"
release="$root/target/release"

usage() {
  cat <<'USAGE'
Usage: kestrel/passkeys/install.sh [ACTION] [PREFIX]

  install   Build Luft Passkeys, install it under PREFIX (default /opt/kestrel) and
            enable it. This is the default action.
  remove    Disable and remove it. The passkeys you saved stay in your keyring.

With DESTDIR set, install only stages the files under it.
USAGE
}

files() {
  echo "$release/luft-passkeys $prefix/libexec/luft-passkeys 755"
  echo "$release/luft-passkeys-relay $prefix/libexec/luft-passkeys-relay 755"
  echo "$data/luft-passkeys-relay.socket /usr/local/lib/systemd/system/luft-passkeys-relay.socket 644"
  echo "$data/luft-passkeys-relay@.service /usr/local/lib/systemd/system/luft-passkeys-relay@.service 644"
  echo "$data/luft-passkeys.service /usr/local/lib/systemd/user/luft-passkeys.service 644"
  echo "$data/com.lantharos.Passkeys.service /usr/local/share/dbus-1/services/com.lantharos.Passkeys.service 644"
}

as_root() {
  if [[ -n "$destination" || "$(id -u)" == 0 ]]; then "$@"; else sudo "$@"; fi
}

place() {
  local source="$1" target="$destination$2" mode="$3"
  if [[ "$source" == "$release/"* ]]; then
    as_root install -DZ -m "$mode" "$source" "$target"
  else
    sed "s|@libexecdir@|$prefix/libexec|g" "$source" | as_root install -DZ -m "$mode" /dev/stdin "$target"
  fi
  [[ -n "$destination" ]] || as_root restorecon "$target"
}

case "$action" in
  install)
    cargo build --release --manifest-path "$root/Cargo.toml"
    files | while read -r source target mode; do place "$source" "$target" "$mode"; done
    [[ -n "$destination" ]] && exit 0
    as_root systemctl daemon-reload
    as_root systemctl enable --now luft-passkeys-relay.socket
    as_root systemctl --global enable luft-passkeys.service
    if systemctl --user is-active --quiet graphical-session.target; then
      systemctl --user daemon-reload
      systemctl --user restart luft-passkeys.service
    fi
    echo "Passkeys are installed. Browsers see them as a security key named Luft Passkeys."
    ;;
  remove)
    if systemctl --user is-active --quiet luft-passkeys.service; then systemctl --user stop luft-passkeys.service; fi
    as_root systemctl --global disable luft-passkeys.service
    as_root systemctl disable --now luft-passkeys-relay.socket
    files | while read -r _ target _; do as_root rm -f "$target"; done
    as_root systemctl daemon-reload
    echo "Passkeys were removed. The passkeys you saved stay in your keyring."
    ;;
  -h | --help) usage ;;
  *) usage >&2; exit 2 ;;
esac
