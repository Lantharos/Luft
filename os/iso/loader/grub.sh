#!/usr/bin/env bash
set -euo pipefail

esp="$1"
tree="$2"
label="$3"
arguments="$4"
signed=/boot/efi/EFI

config() {
  sed -e "s|@LABEL@|$label|" -e "s|@ARGUMENTS@|$arguments|" "$(dirname "$0")/grub.cfg" | install -Dm644 /dev/stdin "$1"
}

install -Dm644 "$signed/BOOT/BOOTX64.EFI" "$esp/EFI/BOOT/BOOTX64.EFI"
install -Dm644 -t "$esp/EFI/BOOT" "$signed/fedora/grubx64.efi" "$signed/fedora/mmx64.efi"
config "$esp/EFI/BOOT/grub.cfg"
config "$tree/EFI/fedora/grub.cfg"
