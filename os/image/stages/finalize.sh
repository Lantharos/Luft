#!/usr/bin/env bash
set -euo pipefail

variant="$1"
version="$2"
fedora="$(rpm -E %fedora)"

write_os_release() {
  rm -f /usr/lib/os-release
  cat >/usr/lib/os-release <<EOF
NAME="Luft"
ID=luft
ID_LIKE=fedora
VERSION="$version"
VERSION_ID=$fedora
PRETTY_NAME="Luft"
IMAGE_ID=$variant
IMAGE_VERSION=$version
PLATFORM_ID="platform:f$fedora"
DEFAULT_HOSTNAME="luft"
HOME_URL="https://github.com/Lantharos/Luft"
BUG_REPORT_URL="https://github.com/Lantharos/Luft/issues"
EOF
}

preset_units() {
  awk '$1 == "enable" {print $2}' "$@"
}

enable_units() {
  systemctl set-default graphical.target
  mapfile -t system < <(preset_units /usr/lib/systemd/system-preset/40-luft-*.preset)
  mapfile -t user < <(preset_units /usr/lib/systemd/user-preset/40-luft-*.preset)
  systemctl preset "${system[@]}"
  systemctl --global preset "${user[@]}"
  systemctl mask bootc-fetch-apply-updates.timer
}

write_image_reference() {
  echo "ghcr.io/lantharos/luft:$fedora" | install -Dm644 /dev/stdin /usr/share/luft/image-reference
}

configure_security() {
  local module modules=()
  for module in /usr/share/selinux/packages/luft-*.cil; do
    modules+=(-i "$module")
  done
  semodule "${modules[@]}"
  authselect enable-feature with-fingerprint
}

refresh_caches() {
  glib-compile-schemas /usr/share/glib-2.0/schemas
  fc-cache -f
  gtk-update-icon-cache -f -t /usr/share/icons/hicolor
  update-desktop-database /usr/share/applications
  update-mime-database /usr/share/mime
}

rebuild_initramfs() {
  local kernel
  for kernel in /usr/lib/modules/*/vmlinuz; do
    kernel="$(basename "$(dirname "$kernel")")"
    dracut --force --kver "$kernel" "/usr/lib/modules/$kernel/initramfs.img"
  done
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

write_os_release
write_image_reference
enable_units
configure_security
check_typelibs
refresh_caches
rebuild_initramfs
clean_build_state
