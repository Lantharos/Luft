#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
startup="$root/data/startup"
removable='^(grub2-.*|grubby|os-prober|dracut-config-rescue|shim-ia32|anaconda.*)$'
kept=(shim-x64 mokutil efibootmgr systemd-ukify systemd-boot-unsigned)
backup="/var/lib/trustd/grub-$(date +%Y%m%d-%H%M%S).tar.gz"

say() {
  printf '\n%s\n' "$*"
}

stop() {
  printf '\n%s\n' "$*" >&2
  exit 1
}

preflight() {
  say "Checking that this computer can start without GRUB"
  [[ -d /sys/firmware/efi ]] || stop "This computer doesn't start with UEFI."
  command -v trustctl >/dev/null || stop "trustctl isn't installed. Run security/scripts/install.sh install first."
  local status
  status="$(sudo trustctl status)"
  echo "$status"
  grep -q 'Luft key *enrolled' <<<"$status" || stop "Luft's Secure Boot key isn't enrolled yet."
  grep -q 'installed: yes, this boot: yes' <<<"$status" ||
    stop "This start didn't go through Luft's signed startup. Install it with 'sudo trustctl startup install', restart, and run this again."
  bootctl status 2>/dev/null | grep -q 'Product: SushiBoot' ||
    stop "This start didn't go through SushiBoot. Restart through the Luft entry and run this again."
  rpm -q --quiet shim-x64 || stop "Fedora's shim isn't installed."
  rpm -q --quiet luft-startup && stop "GRUB has already been removed."
  if ! command -v rpmbuild >/dev/null; then
    [[ "$(ask "rpmbuild is needed to make the package that replaces GRUB. Install rpm-build? [y/N]")" == y ]] || exit 1
    sudo dnf install -y rpm-build
  fi
}

ask() {
  local answer
  read -r -p "$1 " answer
  printf '%s' "$answer"
}

offer_recovery_stick() {
  say "A recovery stick starts this computer if its own startup ever can't, and is how GRUB comes back if you want it."
  if [[ "$(ask "Make one now? [Y/n]")" != n ]]; then
    local image
    image="$(ask "Path to a Fedora live image you already have, or Enter to download one:")"
    "$root/scripts/recovery-stick.sh" ${image:+"$image"}
  fi
}

build_package() {
  local work="$1"
  rpmbuild -bb --quiet --define "_topdir $work" --define "_sourcedir $startup" "$startup/luft-startup.spec"
  find "$work/RPMS" -name 'luft-startup-*.rpm' -print -quit
}

removed_packages() {
  awk '
    /^ *replacing / { print $2; next }
    /^[A-Z][A-Za-z ]*:$/ { removing = ($0 ~ /^Removing/); next }
    removing && /^ [a-z0-9]/ { print $1 }
  '
}

review() {
  local package="$1" plan unexpected
  say "Working out exactly what changes"
  plan="$(sudo dnf install --assumeno --allowerasing "$package" 2>&1 || true)"
  echo "$plan"
  grep -q '^Transaction Summary' <<<"$plan" || stop "dnf couldn't work out the change. Nothing was changed."
  unexpected="$(removed_packages <<<"$plan" | grep -Ev "$removable" || true)"
  [[ -z "$unexpected" ]] || stop "Removing GRUB would also remove packages that are still needed: $unexpected. Nothing was changed."
  [[ "$(ask "Type yes to remove GRUB:")" == yes ]] || exit 1
}

remove_grub() {
  local package="$1"
  sudo dnf mark user "${kept[@]}"
  sudo dnf install -y --allowerasing "$package"
  if rpm -q --quiet dracut-config-rescue; then
    sudo dnf remove -y dracut-config-rescue
  fi
}

clear_leftovers() {
  local leftovers=()
  for path in /boot/grub2 /boot/loader/entries /boot/efi/EFI/fedora/grub.cfg /boot/efi/EFI/fedora/grubenv; do
    sudo test -e "$path" && leftovers+=("${path#/}")
  done
  if ((${#leftovers[@]})); then
    sudo tar -C / -czf "$backup" "${leftovers[@]}"
    sudo rm -rf "${leftovers[@]/#//}"
    echo "GRUB's settings and boot entries are saved in $backup."
  fi
  sudo find /boot -maxdepth 1 -name '*-0-rescue-*' -delete
}

take_over() {
  say "Signing SushiBoot as the program shim starts and rebuilding the signed images"
  sudo trustctl startup install
  sudo kernel-install inspect | grep -E "Layout|Initrd Generator"
  sudo trustctl status
}

preflight
offer_recovery_stick
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
package="$(build_package "$work")"
review "$package"
remove_grub "$package"
clear_leftovers
take_over
say "GRUB is gone. The next restart goes straight through shim, SushiBoot and the signed images."
