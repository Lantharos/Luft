#!/usr/bin/env bash
set -euo pipefail

prefix="${2:-/opt/kestrel}"
staged="$prefix/share/luft-keyring"
user_units=/usr/local/lib/systemd/user
backup=/etc/pam.d/greetd.before-luft-keyring
autostart_units=(gnome-keyring-secrets gnome-keyring-ssh gnome-keyring-pkcs11)

links() {
  echo "lib/systemd/user/luft-keyring.service $user_units/luft-keyring.service"
  echo "lib/systemd/user/luft-keyring.socket $user_units/luft-keyring.socket"
  echo "share/dbus-1/services/org.freedesktop.secrets.service /usr/local/share/dbus-1/services/org.freedesktop.secrets.service"
  echo "share/dbus-1/services/com.lantharos.Keyring1.service /usr/local/share/dbus-1/services/com.lantharos.Keyring1.service"
  echo "share/xdg-desktop-portal/portals/luft-keyring.portal /usr/local/share/xdg-desktop-portal/portals/luft-keyring.portal"
  for unit in "${autostart_units[@]}"; do
    echo "lib/systemd/user/gnome-keyring-autostart.conf $user_units/app-${unit//-/\\x2d}@autostart.service.d/50-luft-keyring.conf"
  done
}

turn_on() {
  if [[ ! -x "$prefix/libexec/luft-keyring" || ! -f "$staged/greetd" ]]; then
    echo "Install Kestrel first: kestrel/tools/install.sh install $prefix" >&2
    exit 1
  fi
  links | while read -r source target; do
    sudo install -DZ -m644 "$prefix/$source" "$target"
  done
  if [[ -f /etc/pam.d/greetd && ! -f "$backup" ]]; then
    sudo cp --preserve=all /etc/pam.d/greetd "$backup"
  fi
  sudo install -DZ -m644 "$staged/greetd" /etc/pam.d/greetd
  sudo semodule -i "$staged/luft-keyring.cil"
  if command -v authselect >/dev/null && ! authselect current 2>/dev/null | grep -q with-fingerprint; then
    sudo authselect enable-feature with-fingerprint
  fi
  sudo systemctl daemon-reload
  sudo systemctl enable --now luft-keyring-unlock.socket
  sudo restorecon -R /run/luft-keyring
  sudo systemctl --global enable luft-keyring.socket luft-keyring.service
  systemctl --user daemon-reload
  systemctl --user disable --now oo7-daemon.service oo7-portal.service gnome-keyring-daemon.socket gnome-keyring-daemon.service 2>/dev/null || true
  cat <<'DONE'
Luft Keyring takes over the next time you sign in to Kestrel. Sign out, then sign in with your password once:
your passwords from GNOME Keyring and oo7 are brought in, and from then on a fingerprint unlocks them too.

Once you're happy with it, these packages are no longer needed:
  sudo dnf remove pam_oo7 oo7-portal oo7-daemon gnome-keyring-pam
gnome-keyring itself is still required by niri and NetworkManager-vpnc-gnome; it stays idle in Kestrel.
DONE
}

turn_off() {
  sudo systemctl --global disable luft-keyring.socket luft-keyring.service || true
  sudo systemctl disable --now luft-keyring-unlock.socket || true
  sudo semodule -r luft-keyring 2>/dev/null || true
  links | while read -r _ target; do sudo rm -f "$target"; done
  for unit in "${autostart_units[@]}"; do
    sudo rmdir --ignore-fail-on-non-empty "$user_units/app-${unit//-/\\x2d}@autostart.service.d" 2>/dev/null || true
  done
  if [[ -f "$backup" ]]; then
    sudo mv "$backup" /etc/pam.d/greetd
    sudo restorecon /etc/pam.d/greetd
  else
    sudo rm -f /etc/pam.d/greetd
  fi
  sudo systemctl daemon-reload
  systemctl --user daemon-reload
  echo "GNOME Keyring is your keyring again after you sign out and back in. Your Luft Keyring stays in ~/.local/share/luft-keyring."
}

case "${1:-}" in
  on) turn_on ;;
  off) turn_off ;;
  *)
    echo "Usage: kestrel/keyring/tools/switch.sh on|off [prefix]" >&2
    exit 2
    ;;
esac
