keyring_root="$root/kestrel/keyring"
keyring_data="$keyring_root/data"
keyring_pam=/usr/local/lib64/security

keyring_system_files() {
  echo "system/luft-keyring-unlock.socket /usr/local/lib/systemd/system/luft-keyring-unlock.socket"
  echo "system/luft-keyring-unlock.service /usr/local/lib/systemd/system/luft-keyring-unlock.service"
  echo "pam/kestrel-unlock /etc/pam.d/kestrel-unlock"
  echo "pam/kestrel-unlock-fingerprint /etc/pam.d/kestrel-unlock-fingerprint"
}

keyring_staged_files() {
  echo "user/luft-keyring.service lib/systemd/user/luft-keyring.service"
  echo "user/luft-keyring.socket lib/systemd/user/luft-keyring.socket"
  echo "user/gnome-keyring-autostart.conf lib/systemd/user/gnome-keyring-autostart.conf"
  echo "dbus/org.freedesktop.secrets.service share/dbus-1/services/org.freedesktop.secrets.service"
  echo "dbus/com.lantharos.Keyring1.service share/dbus-1/services/com.lantharos.Keyring1.service"
  echo "dbus/luft-keyring.portal share/xdg-desktop-portal/portals/luft-keyring.portal"
  echo "pam/greetd share/luft-keyring/greetd"
  echo "selinux/luft-keyring.cil share/luft-keyring/luft-keyring.cil"
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
  sudo install -DZ -m755 "$built/libpam_luft_keyring.so" "$keyring_pam/pam_luft_keyring.so"
  keyring_system_files | while read -r source target; do
    keyring_fill "$source" | sudo install -DZ -m644 /dev/stdin "$target"
  done
  keyring_staged_files | while read -r source target; do
    keyring_fill "$source" | sudo install -DZ -m644 /dev/stdin "$prefix/$target"
  done
  sudo systemctl daemon-reload
  restart_keyring "${changed[@]}"
  echo "Luft Keyring is installed; kestrel/keyring/tools/switch.sh on makes it your keyring."
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
  keyring_system_files | while read -r _ target; do sudo rm -f "$target"; done
  sudo rm -f "$keyring_pam/pam_luft_keyring.so"
  sudo systemctl daemon-reload
}
