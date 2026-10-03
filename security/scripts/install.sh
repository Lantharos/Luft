#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
action="${1:-}"
manifest=/usr/lib/luft-security/installed-files
units="luft-usb-protection.service trustd.service trustd-refresh.path trustd-refresh-at-shutdown.service"
usb_state="/var/lib/luft-usb-protection"

usage() {
  cat <<'USAGE'
Usage: security/scripts/install.sh ACTION

  install   Put Luft's device security services on this computer and start them.
  remove    Stop and remove them. USB devices behave as usual again right away.
USAGE
  exit 2
}

install_files() {
  local stage files file
  stage="$(mktemp -d)"
  files="$(mktemp)"
  trap 'rm -rf "$stage" "$files"' RETURN
  "$root/scripts/build.sh" "$stage"
  (cd "$stage" && find . -type f | sed 's|^\.||' | sort) > "$files"
  while IFS= read -r file; do
    sudo install -DZ -o root -g root -m "$(stat -c %a "$stage$file")" "$stage$file" "$file"
  done < "$files"
  sudo install -DZ -m644 "$files" "$manifest"
  sudo systemctl daemon-reload
  sudo systemctl reload dbus.service
  sudo systemctl enable $units
  sudo systemctl restart $units
}

remove_everything() {
  sudo systemctl disable --now $units
  if [[ -f "$manifest" ]]; then
    xargs -a "$manifest" sudo rm -f
    xargs -a "$manifest" -n1 dirname | sort -ru | xargs sudo rmdir --ignore-fail-on-non-empty 2>/dev/null || true
    sudo rm -f "$manifest"
    sudo rmdir --ignore-fail-on-non-empty "$(dirname "$manifest")"
  fi
  sudo rm -rf "$usb_state"
  sudo systemctl daemon-reload
  sudo systemctl reload dbus.service
  echo "Luft's device security services are removed."
}

case "$action" in
  install) install_files ;;
  remove) remove_everything ;;
  *) usage ;;
esac
