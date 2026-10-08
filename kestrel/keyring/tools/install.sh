# shellcheck shell=bash disable=SC2154

keyring_root="$root/kestrel/keyring"
keyring_data="$keyring_root/data"
keyring_pam=/usr/local/lib64/security

keyring_system_files() {
  echo "system/luft-keyring-unlock.socket /usr/local/lib/systemd/system/luft-keyring-unlock.socket"
  echo "system/luft-keyring-unlock.service /usr/local/lib/systemd/system/luft-keyring-unlock.service"
  echo "pam/kestrel-unlock /etc/pam.d/kestrel-unlock"
  echo "pam/kestrel-unlock-fingerprint /etc/pam.d/kestrel-unlock-fingerprint"
}

keyring_user_files() {
  echo "user/luft-keyring.service /usr/local/lib/systemd/user/luft-keyring.service"
  echo "user/luft-keyring.socket /usr/local/lib/systemd/user/luft-keyring.socket"
  echo "dbus/org.freedesktop.secrets.service /usr/local/share/dbus-1/services/org.freedesktop.secrets.service"
  echo "dbus/com.lantharos.Keyring1.service /usr/local/share/dbus-1/services/com.lantharos.Keyring1.service"
  echo "dbus/luft-keyring.portal /usr/local/share/xdg-desktop-portal/portals/luft-keyring.portal"
  echo "pam/greetd /etc/pam.d/greetd"
}

gnupg_agent_conf=/etc/gnupg/gpg-agent.conf

use_luft_pinentry() {
  local line="pinentry-program $prefix/libexec/luft-pinentry"
  if [[ ! -e "$gnupg_agent_conf" ]]; then
    printf '%s\n' "$line" | sudo install -DZ -m644 /dev/stdin "$gnupg_agent_conf"
    gpgconf --reload gpg-agent 2>/dev/null || true
  elif ! grep -qxF "$line" "$gnupg_agent_conf"; then
    echo "$gnupg_agent_conf already exists; add \"$line\" to it to have GnuPG ask through Kestrel." >&2
  fi
}

keyring_fill() {
  sed -e "s|@libexecdir@|$prefix/libexec|g" -e "s|@pamdir@|$keyring_pam|g" "$keyring_data/$1"
}

install_keyring() {
  if ! pkg-config --exists tss2-esys; then
    echo "Luft Keyring talks to the security chip through tpm2-tss. On Fedora: sudo dnf install tpm2-tss-devel" >&2
    exit 1
  fi
  cargo build --release --manifest-path "$keyring_root/Cargo.toml"
  local built="$keyring_root/target/release" changed=() program
  for program in luft-keyring luft-keyring-unlock; do
    cmp -s "$built/$program" "$prefix/libexec/$program" && continue
    sudo install -DZ -m755 "$built/$program" "$prefix/libexec/$program"
    changed+=("$program")
  done
  cmp -s "$built/luft-pinentry" "$prefix/libexec/luft-pinentry" || sudo install -DZ -m755 "$built/luft-pinentry" "$prefix/libexec/luft-pinentry"
  sudo install -DZ -m755 "$built/libpam_luft_keyring.so" "$keyring_pam/pam_luft_keyring.so"
  { keyring_system_files; keyring_user_files; } | while read -r source target; do
    keyring_fill "$source" | sudo install -DZ -m644 /dev/stdin "$target"
  done
  sudo semodule -i "$keyring_data/selinux/luft-keyring.cil"
  if command -v authselect >/dev/null && ! authselect current 2>/dev/null | grep -q with-fingerprint; then
    sudo authselect enable-feature with-fingerprint
  fi
  sudo systemctl daemon-reload
  sudo systemctl enable --now luft-keyring-unlock.socket
  sudo restorecon -R /run/luft-keyring
  sudo systemctl --global enable luft-keyring.socket luft-keyring.service
  systemctl --user daemon-reload
  use_luft_pinentry
  restart_keyring "${changed[@]}"
}

restart_keyring() {
  (($#)) || return 0
  [[ " $* " == *" luft-keyring-unlock "* ]] && sudo systemctl try-restart luft-keyring-unlock.service
  if systemctl --user --quiet is-active luft-keyring.service; then
    systemctl --user restart luft-keyring.service
    echo "Luft Keyring restarted on its new version; it asks for your password the next time an app needs it."
  fi
}

remove_keyring() {
  sudo systemctl --global disable luft-keyring.socket luft-keyring.service || true
  sudo systemctl disable --now luft-keyring-unlock.socket || true
  sudo semodule -r luft-keyring 2>/dev/null || true
  { keyring_system_files; keyring_user_files; } | grep -v ' /etc/pam.d/greetd$' | while read -r _ target; do sudo rm -f "$target"; done
  [[ "$(cat "$gnupg_agent_conf" 2>/dev/null)" == "pinentry-program $prefix/libexec/luft-pinentry" ]] && sudo rm "$gnupg_agent_conf"
  sudo rm -f "$keyring_pam/pam_luft_keyring.so"
  sudo systemctl daemon-reload
}
