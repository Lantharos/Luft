#!/usr/bin/env bash
set -euo pipefail

fedora="$(rpm -E %fedora)"
codename="Alizé"

write_os_release() {
  rm -f /usr/lib/os-release
  cat >/usr/lib/os-release <<EOF
NAME="Luft"
ID=luft
ID_LIKE=fedora
VERSION="$version"
VERSION_ID=$fedora
VERSION_CODENAME=alize
PRETTY_NAME="Luft $codename"
LOGO=luft
ANSI_COLOR="0;39"
IMAGE_ID=$variant
IMAGE_VERSION=$version
PLATFORM_ID="platform:f$fedora"
DEFAULT_HOSTNAME="luft"
HOME_URL="https://github.com/Lantharos/Luft"
BUG_REPORT_URL="https://github.com/Lantharos/Luft/issues"
EOF
}

preset_units() {
  awk '$1 == "enable" || $1 == "disable" {print $2}' "$@"
}

enable_units() {
  systemctl set-default graphical.target
  mapfile -t system < <(preset_units /usr/lib/systemd/system-preset/40-luft-*.preset)
  mapfile -t user < <(preset_units /usr/lib/systemd/user-preset/40-luft-*.preset)
  systemctl preset "${system[@]}"
  systemctl --global preset "${user[@]}"
  systemctl mask bootc-fetch-apply-updates.timer
}

write_base_image() {
  echo "$base" | install -Dm644 /dev/stdin /usr/share/luft/base-image
}

configure_toolbox() {
  printf '[general]\ndistro = "fedora"\nrelease = "%s"\n' "$fedora" >/etc/containers/toolbox.conf
}

configure_security() {
  local module modules=()
  for module in /usr/share/selinux/packages/luft-*.cil; do
    modules+=(-i "$module")
  done
  semodule "${modules[@]}"
  authselect enable-feature with-fingerprint
  systemd-sysusers /usr/lib/sysusers.d/luft-keyring.conf
  give_keyring_its_group
}

give_keyring_its_group() {
  chgrp luft-keyring /usr/libexec/luft-keyring
  chmod 2755 /usr/libexec/luft-keyring
}

write_default_apps() {
  "$(dirname "$0")/default-apps.py" "$(dirname "$0")/../apps" /usr/share/applications/kestrel-mimeapps.list
}

refresh_caches() {
  glib-compile-schemas /usr/share/glib-2.0/schemas
  fc-cache -f
  gtk-update-icon-cache -f -t /usr/share/icons/hicolor
  update-desktop-database /usr/share/applications
  update-mime-database /usr/share/mime
}

let_line_out_play_beside_headphones() {
  local path=/usr/share/alsa-card-profile/mixer/paths/analog-output-lineout.conf
  sed -i '/^\.include analog-output\.conf\.common$/i [Element Auto-Mute Mode]\nenumeration = select\n\n[Option Auto-Mute Mode:Disabled]\nname = analog-output-lineout\n' "$path"
  grep -q '^\[Option Auto-Mute Mode:Disabled\]$' "$path" || { echo "$path no longer ends with the common include" >&2; exit 1; }
}

make_efi_mountpoint() {
  install -d -m 0755 /efi
}

leave_greetd_config_to_the_greeter() {
  rm -f /etc/greetd/config.toml
}

leave_initramfs_to_the_startup_image() {
  rm -f /usr/lib/modules/*/initramfs.img
}

check_typelibs() {
  local namespace missing=()
  while read -r namespace; do
    compgen -G "/usr/lib*/*/$namespace-*.typelib" >/dev/null || missing+=("$namespace")
  done <"$(dirname "$0")/../typelibs.txt"
  ((${#missing[@]} == 0)) || { echo "Kestrel imports missing typelibs: ${missing[*]}" >&2; exit 1; }
}

clean_build_state() {
  rm -rf /tmp/* /run/cups /run/dnf /run/openvpn-client /run/openvpn-server /run/selinux-policy \
    /var/log/dnf5.log* /var/lib/dnf /var/cache/ibus /var/cache/ldconfig /var/cache/libX11 /var/cache/swcatalog
}

[[ "${BASH_SOURCE[0]}" == "$0" ]] || return 0

variant="$1"
version="$2"
base="$3"
write_os_release
write_base_image
enable_units
configure_toolbox
configure_security
check_typelibs
write_default_apps
refresh_caches
let_line_out_play_beside_headphones
make_efi_mountpoint
leave_greetd_config_to_the_greeter
leave_initramfs_to_the_startup_image
clean_build_state
