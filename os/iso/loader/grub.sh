#!/usr/bin/env bash
set -euo pipefail

esp="$1"
tree="$2"
label="$3"
arguments="$4"
signed=/boot/efi/EFI
loader="$(dirname "$0")"

config() {
  sed -e "s|@LABEL@|$label|g" "$loader/grub.cfg" | install -Dm644 /dev/stdin "$1"
}

boot_files() {
  install -Dm644 "$signed/BOOT/BOOTX64.EFI" "$1/EFI/BOOT/BOOTX64.EFI"
  install -Dm644 -t "$1/EFI/BOOT" "$signed/fedora/grubx64.efi" "$signed/fedora/mmx64.efi"
}

boot_files "$esp"
boot_files "$tree"
config "$esp/EFI/BOOT/grub.cfg"
config "$tree/EFI/fedora/grub.cfg"
sed -e "s|@ARGUMENTS@|$arguments|" "$loader/menu.cfg" | install -Dm644 /dev/stdin "$tree/boot/menu.cfg"
