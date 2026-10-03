#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../.." && pwd)"
startup="$luft/security/data/startup"
certificate=/var/lib/trustd/secure-boot.crt
typelibs=/usr/lib64/girepository-1.0
backup="/var/lib/trustd/grub-$(date +%Y%m%d-%H%M%S).tar.gz"
replaced=(
  mutter mutter-common gnome-settings-daemon xdg-desktop-portal-gnome xdg-desktop-portal-gtk
  gnome-keyring gnome-keyring-pam oo7-daemon oo7-portal pam_oo7
)
removable='^(grub2-.*|grubby|os-prober|shim-ia32|dracut-config-rescue|anaconda(-.*)?|kdump-anaconda-addon|slitherer|mutter(-.*)?|gnome-settings-daemon(-devel)?|xdg-desktop-portal-(gnome|gtk)|gnome-keyring(-pam)?|oo7-(daemon|portal)|pam_oo7|NetworkManager-[a-z]+-gnome)$'
kept=(shim-x64 mokutil efibootmgr systemd-ukify systemd-boot-unsigned)
kestrel_services=(xdg-desktop-portal geoclue2 iio-sensor-proxy)

say() {
  printf '\n%s\n' "$*"
}

stop() {
  printf '\n%s\n' "$*" >&2
  exit 1
}

ask() {
  local answer
  read -r -p "$1 " answer
  printf '%s' "$answer"
}

find_esp() {
  local mount
  for mount in /boot/efi /efi /boot; do
    if [[ "$(findmnt -n -o FSTYPE --mountpoint "$mount" 2>/dev/null)" == vfat ]]; then
      esp="$mount"
      return
    fi
  done
  stop "The EFI system partition isn't mounted."
}

find_kestrel() {
  local session
  session="$(readlink -e /usr/local/share/wayland-sessions/kestrel.desktop)" ||
    stop "Kestrel isn't installed as a login session. Install it with kestrel/tools/install.sh install first."
  prefix="${session%/share/wayland-sessions/kestrel.desktop}"
  grep -q "libmutter-51.so.0 => $prefix/" <<<"$(LD_LIBRARY_PATH="" ldd "$prefix/bin/kestrel")" ||
    stop "Kestrel in $prefix uses the system's Mutter. Reinstall it with kestrel/tools/install.sh install first."
  [[ -e /usr/local/share/xdg-desktop-portal/kestrel-portals.conf ]] ||
    stop "Kestrel doesn't answer apps' portal requests yet. Reinstall it with kestrel/tools/install.sh install first."
  [[ -e /usr/local/share/dbus-1/services/org.freedesktop.secrets.service ]] ||
    stop "Luft Keyring isn't your keyring yet. Run kestrel/keyring/tools/switch.sh on, sign in once, and run this again."
}

install_tools() {
  local missing=()
  command -v rpmbuild >/dev/null || missing+=(rpm-build)
  command -v sbverify >/dev/null || missing+=(sbsigntools)
  ((${#missing[@]})) || return 0
  [[ "$(ask "${missing[*]} is needed to build the package that replaces GRUB and check signatures. Install it? [y/N]")" == y ]] || exit 1
  sudo dnf install -y "${missing[@]}"
}

kept_kernels() {
  local images=(/usr/lib/modules/*/vmlinuz)
  printf '%s\n' "${images[@]}" | awk -F/ '{print $5}' | sort -rV | head -3
}

check_images() {
  local running versions=() version image
  running="$(uname -r)"
  mapfile -t versions < <(kept_kernels)
  ((${#versions[@]} >= 2)) || stop "Only one kernel is installed, so there would be nothing to go back to. Wait for the next kernel update and run this again."
  grep -qxF "$running" < <(printf '%s\n' "${versions[@]}") ||
    stop "Linux $running isn't one of the three newest kernels. Restart into the newest one and run this again."
  for version in "${versions[@]}"; do
    image="$(sudo find "$esp/EFI/Linux" -maxdepth 1 \( -name "luft-$version.efi" -o -name "luft-$version+*.efi" \) -print -quit)"
    [[ -n "$image" ]] || stop "There's no signed image for Linux $version. Run 'sudo trustctl startup rebuild' and run this again."
    sudo sbverify --cert "$certificate" "$image" >/dev/null 2>&1 ||
      stop "The image for Linux $version isn't signed with this computer's Luft key. Run 'sudo trustctl startup rebuild' and run this again."
    echo "Linux $version: signed image present"
  done
}

check_fallback() {
  sudo cmp -s "$esp/EFI/BOOT/BOOTX64.EFI" "$esp/EFI/fedora/shimx64.efi" ||
    stop "The firmware's fallback, \\EFI\\BOOT\\BOOTX64.EFI, isn't Fedora's shim. Run 'sudo dnf reinstall shim-x64' and run this again."
  sudo test -f "$esp/EFI/BOOT/fbx64.efi" && sudo test -f "$esp/EFI/fedora/BOOTX64.CSV" ||
    stop "Shim's fallback program or its list of boot entries is missing. Run 'sudo dnf reinstall shim-x64' and run this again."
  grep -qE '^Boot[0-9A-F]{4}\* Luft' <<<"$(efibootmgr)" ||
    stop "The Luft boot entry is missing. Run 'sudo trustctl startup install' and run this again."
  echo "Fallback: \\EFI\\BOOT\\BOOTX64.EFI is Fedora's shim, and the Luft entry is there"
}

preflight() {
  say "Checking that this computer can start without GRUB and work without GNOME's services"
  [[ -d /sys/firmware/efi ]] || stop "This computer doesn't start with UEFI."
  command -v trustctl >/dev/null || stop "trustctl isn't installed. Run security/scripts/install.sh install first."
  grep -q '^SushiBoot ' <<<"$(tail -c +5 /sys/firmware/efi/efivars/LoaderInfo-4a67b082-0a4c-41cf-b6c7-440b29bb8c4f 2>/dev/null | tr -d '\0')" ||
    stop "This start didn't go through SushiBoot. Restart through the Luft entry and run this again."
  local status
  status="$(sudo trustctl status)"
  echo "$status"
  grep -qE '^Secure Boot +on$' <<<"$status" ||
    stop "Secure Boot is off. Turn it on in the firmware settings, restart through the Luft entry, and run this again."
  grep -qE '^Luft key +enrolled' <<<"$status" || stop "Luft's Secure Boot key isn't enrolled yet."
  grep -q 'installed: yes, this boot: yes' <<<"$status" ||
    stop "This start didn't go through a signed image. Run 'sudo trustctl startup install', restart, and run this again."
  rpm -q --quiet shim-x64 || stop "Fedora's shim isn't installed."
  find_esp
  find_kestrel
  install_tools
  check_images
  check_fallback
}

offer_recovery_stick() {
  say "A recovery stick starts this computer if its own startup ever can't, and is how GRUB comes back if you want it."
  if [[ "$(ask "Make one now? [Y/n]")" != n ]]; then
    local image
    image="$(ask "Path to a Fedora live image you already have, or Enter to download one:")"
    "$luft/security/scripts/recovery-stick.sh" ${image:+"$image"}
  fi
}

build_package() {
  local work="$1"
  rpmbuild -bb --quiet --define "_topdir $work" --define "_sourcedir $startup" "$startup/luft-startup.spec"
  find "$work/RPMS" -name 'luft-startup-*.rpm' -print -quit
}

build_modules() {
  local info
  for info in "$luft"/kestrel/run/install-build/*/meson-info/intro-dependencies.json; do
    [[ -f "$info" ]] || continue
    python3 -c 'import json, sys; [print(d["name"]) for d in json.load(open(sys.argv[1])) if d.get("type") == "pkgconfig"]' "$info"
  done | awk '!/^(libmutter|mutter)-/' | sort -u
}

runtime_files() {
  local folders=() folder binary import
  for folder in "$prefix" /usr/local/lib64 /usr/local/libexec; do
    [[ -d "$folder" ]] && folders+=("$folder")
  done
  find "${folders[@]}" -type f \( -perm -u+x -o -name '*.so*' \) -print0 |
    xargs -0 -r file -N --mime-type | awk -F': ' '$2 ~ /x-(pie-)?executable|x-sharedlib/ {print $1}' |
    while read -r binary; do
      LD_LIBRARY_PATH="$prefix/lib:$prefix/lib/mutter-51:$prefix/lib64/kestrel" ldd "$binary" 2>/dev/null || true
    done | awk -v prefix="$prefix/" '/=> \// && index($3, prefix) != 1 {print $3}'
  for import in $(grep -rhoE 'gi://[A-Za-z0-9]+' "$luft/kestrel/engine/js" "$luft/kestrel/ui/src" | sort -u); do
    compgen -G "$typelibs/${import#gi://}-*.typelib" || true
  done
}

kestrel_needs() {
  local files modules
  mapfile -t files < <(runtime_files | sort -u)
  mapfile -t modules < <(build_modules)
  {
    rpm -qf --qf '%{NAME}\n' "${files[@]}" || true
    printf 'pkgconfig(%s)\n' "${modules[@]}" | xargs -r -d '\n' rpm -q --whatprovides --qf '%{NAME}\n' || true
    printf '%s\n' "${kestrel_services[@]}"
  } 2>/dev/null | awk 'NF == 1' | sort -u
}

section() {
  awk -v wanted="$1" '
    /^ *replacing / { if (wanted == "Removing") print $2; next }
    /^[A-Z][A-Za-z ]*:$/ { inside = ($0 ~ "^" wanted); next }
    inside && /^ [A-Za-z0-9]/ { print $1 }
  ' | sort -u
}

transaction() {
  local clean="$1"
  shift
  local removing=()
  mapfile -t removing < <(rpm -q --qf '%{NAME}\n' "${replaced[@]}" 2>/dev/null | grep -v ' ')
  sudo dnf do "$@" --allowerasing --setopt=clean_requirements_on_remove="$clean" \
    --action=install "$package" ${removing[*]:+--action=remove "${removing[@]}"}
}

review() {
  local plan unexpected needs lost orphans
  say "Working out exactly what changes"
  plan="$(transaction False --assumeno 2>&1 || true)"
  echo "$plan"
  grep -q '^Transaction Summary' <<<"$plan" || grep -q 'Nothing to do' <<<"$plan" ||
    stop "dnf couldn't work out the change. Nothing was changed."
  unexpected="$(section Removing <<<"$plan" | grep -Ev "$removable" || true)"
  [[ -z "$unexpected" ]] || stop "This would also remove packages that are still needed: $unexpected. Nothing was changed."
  needs="$(kestrel_needs)"
  lost="$(comm -12 <(section Removing <<<"$plan") <(echo "$needs") | grep -vxF -f <(printf '%s\n' "${replaced[@]}") || true)"
  [[ -z "$lost" ]] || stop "This would remove packages Kestrel uses: $lost. Nothing was changed."
  orphans="$(transaction True --assumeno 2>&1 | section 'Removing unused' || true)"
  keep="$(comm -12 <(echo "$orphans") <(echo "$needs") || true)"
  if [[ -n "$keep" ]]; then
    say "Only GNOME's services asked for these, and Kestrel uses them, so they're marked as wanted on their own:"
    echo "$keep"
  fi
  [[ "$(ask "Type yes to remove GRUB and GNOME's services:")" == yes ]] || exit 1
}

remove_packages() {
  sudo dnf mark -y user "${kept[@]}" $keep
  transaction False -y
}

clear_leftovers() {
  local leftovers=() path
  for path in /boot/grub2 /boot/loader/entries /etc/default/grub /etc/default/grub.rpmsave \
    "$esp/EFI/fedora/grub.cfg" "$esp/EFI/fedora/grub.cfg.rpmsave" "$esp/EFI/fedora/grubenv"; do
    sudo test -e "$path" && leftovers+=("${path#/}")
  done
  if ((${#leftovers[@]})); then
    sudo tar -C / -czf "$backup" "${leftovers[@]}"
    sudo rm -rf "${leftovers[@]/#//}"
    echo "GRUB's settings and boot entries are saved in $backup."
  fi
  sudo find /boot -maxdepth 1 \( -name '*-0-rescue-*' -o -name 'initramfs-*.img' \) -delete
}

take_over() {
  say "Signing SushiBoot as the program shim starts and rebuilding the signed images"
  sudo trustctl startup install
}

verify() {
  say "Checking the result"
  ! grep -qE '^grub2-' <<<"$(rpm -qa --qf '%{NAME}\n')" || stop "GRUB's packages are still installed."
  sudo sbverify --cert "$certificate" "$esp/EFI/fedora/grubx64.efi" >/dev/null 2>&1 ||
    stop "Shim's default program isn't SushiBoot signed with the Luft key. Run 'sudo trustctl startup install' before restarting."
  echo "Shim's default program, \\EFI\\fedora\\grubx64.efi, is SushiBoot"
  sudo kernel-install inspect | grep -E "Layout|Initrd Generator"
  check_images
  check_fallback
}

preflight
offer_recovery_stick
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
package="$(build_package "$work")"
review
remove_packages
clear_leftovers
take_over
verify
say "GRUB and GNOME's services are gone. Every start now goes through shim, SushiBoot and the signed images."
