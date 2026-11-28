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
VERSION="$major"
VERSION_ID=$fedora
VERSION_CODENAME=alize
PRETTY_NAME="Luft $codename"
LOGO=luft
ANSI_COLOR="0;39"
IMAGE_ID=$variant
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
  systemctl mask bootc-fetch-apply-updates.timer debug-shell.service systemd-oomd.service systemd-oomd.socket
}

write_base_image() {
  echo "$base" | install -Dm644 /dev/stdin /usr/share/luft/base-image
}

said() {
  if [[ "$1" == 1 ]]; then echo true; else echo false; fi
}

write_release_facts() {
  printf 'early=%s\nstable-released=%s\n' "$(said "$early")" "$(said "$stable_released")" |
    install -Dm644 /dev/stdin /usr/share/luft/release
}

keep_usr_local_in_var() {
  # shellcheck disable=SC2114
  rm -rf /usr/local /usr/lib/tmpfiles.d/rpm-ostree-0-integration-opt-usrlocal.conf
  ln -s ../var/usrlocal /usr/local
  systemd-tmpfiles --create /usr/lib/tmpfiles.d/luft-usr-local.conf
}

configure_security() {
  local module modules=()
  for module in /usr/share/selinux/packages/luft/*.cil; do
    modules+=(-i "$module")
  done
  semodule "${modules[@]}"
  authselect enable-feature with-fingerprint
  shelter_helpers /
}

sheltered=(luft-keyring)

shelter_helpers() {
  local tree="$1" helper fixed
  for helper in "${sheltered[@]}"; do
    [[ -f "$tree/usr/libexec/$helper" ]] || continue
    systemd-sysusers "/usr/lib/sysusers.d/$helper.conf"
    fixed="$(awk '$1 == "g" {print $3}' "/usr/lib/sysusers.d/$helper.conf")"
    [[ "$(getent group "$helper" | cut -d: -f3)" == "$fixed" ]] ||
      { echo "$helper didn't get its fixed group ID $fixed" >&2; exit 1; }
    chgrp "$fixed" "/usr/libexec/$helper"
    chmod 2755 "/usr/libexec/$helper"
  done
}

check_sabine_apps() {
  /usr/lib/sabine/bin/current/sabine-service check-apps
}

write_default_apps() {
  "$(dirname "$0")/default-apps.sh" /usr/share/applications
}

leave_out_other_languages() {
  local languages folder language
  languages=" $(sed -n "s/.*posix: '\([a-z]*\)_.*/\1/p" "$(dirname "$0")/../locales.ts" | xargs) "
  for folder in /usr/share/locale/*/; do
    folder="${folder%/}"
    language="${folder##*/}"
    language="${language%%[_@.]*}"
    [[ "$languages" == *" $language "* ]] || rm -rf "$folder"
  done
}

refresh_caches() {
  glib-compile-schemas /usr/share/glib-2.0/schemas
  gtk-update-icon-cache -f -t /usr/share/icons/hicolor
  gtk-update-icon-cache -f -t /usr/share/icons/Mochi
  update-desktop-database /usr/share/applications
  update-mime-database /usr/share/mime
}

let_line_out_play_beside_headphones() {
  local path=/usr/share/alsa-card-profile/mixer/paths/analog-output-lineout.conf
  sed -i '/^\.include analog-output\.conf\.common$/i [Element Auto-Mute Mode]\nenumeration = select\n\n[Option Auto-Mute Mode:Disabled]\nname = analog-output-lineout\n' "$path"
  grep -q '^\[Option Auto-Mute Mode:Disabled\]$' "$path" || { echo "$path no longer ends with the common include" >&2; exit 1; }
}

keep_network_profiles_private() {
  chmod 600 /usr/lib/NetworkManager/system-connections/*.nmconnection
}

make_efi_mountpoint() {
  install -d -m 0755 /efi
}

leave_greetd_config_to_the_greeter() {
  rm -f /etc/greetd/config.toml
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
major="$2"
base="$3"
early="$4"
stable_released="$5"
write_os_release
write_base_image
write_release_facts
enable_units
keep_usr_local_in_var
configure_security
check_typelibs
check_sabine_apps
write_default_apps
leave_out_other_languages
refresh_caches
let_line_out_play_beside_headphones
keep_network_profiles_private
make_efi_mountpoint
leave_greetd_config_to_the_greeter
clean_build_state
