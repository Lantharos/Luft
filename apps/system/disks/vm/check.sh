#!/usr/bin/env bash
set -uo pipefail

STATE=/var/lib/luft-remove-check
TOP=/run/luft-check
DRIVE=/dev/vda
ROOT_TYPE=4f68bce3-e8cd-4db1-96e7-fbcaf984b709
WINDOWS_TYPES='e3c9e316-0b5c-4db8-817d-f92df00215ae|ebd0a0a2-b9e5-4433-87c0-68b6b72699c7|de94bba4-06d1-4d40-a16a-bfd50179d6ac'

report() { echo "luft-remove-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u trustd -u udisks2 --no-pager -n 30 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }
as_ada() { runuser -u ada -- "$@"; }
types() { lsblk -no PARTTYPE "$DRIVE" | xargs; }
root_size() { lsblk -bno SIZE "$(lsblk -lnpo PATH,PARTTYPE "$DRIVE" | awk -v type="$ROOT_TYPE" '$2 == type { print $1 }')"; }
esp_has() {
  local at found=0
  at="$(findmnt -nro TARGET --source "${DRIVE}1" | head -n1)"
  if [[ -z "$at" ]]; then
    at="$TOP/esp"
    systemctl stop trustd.service
    mkdir -p "$at" && mount "${DRIVE}1" "$at" 2> /dev/ttyS0 || fail "the EFI system partition doesn't mount"
  fi
  [[ -e "$at/$1" ]] && found=1
  [[ "$at" == "$TOP/esp" ]] && umount "$at"
  ((found))
}
entry() { efibootmgr | grep -qP "^Boot[0-9A-F]{4}\*? \Q$1\E(\t|$)"; }
system_id() { jq -r ".[] | select($1) | .id" <<< "$2"; }

remove_windows() {
  local listed id before removed
  listed="$(as_ada /usr/libexec/luft-other-systems list)" || fail "the other systems couldn't be listed"
  report "found $(jq -c '[.[] | {name, kind, size, parts: [.parts[].role], startups: [.startups[].folder]}]' <<< "$listed")"
  id="$(system_id '.kind == "windows" and any(.parts[]; .role == "system")' "$listed")"
  [[ -n "$id" ]] || fail "Windows isn't offered"
  [[ "$(jq -r ".[] | select(.id == \"$id\") | [.parts[].role] | sort | join(\",\")" <<< "$listed")" == meet,recovery,reserved,system &&
    "$(jq -r ".[] | select(.id == \"$id\") | .startups[].folder" <<< "$listed")" == EFI/Microsoft ]] ||
    fail "Windows doesn't come with exactly its own partitions and boot loader"
  pass "Disks finds Windows with its reserved, recovery and Meet Luft partitions and Windows Boot Manager"
  before="$(root_size)"
  removed="$(as_ada /usr/libexec/luft-other-systems remove "$id" 2> >(while read -r step; do report "step $step"; done))" ||
    fail "removing Windows failed: $removed"
  report "removed $removed"
  [[ ! "$(types)" =~ $WINDOWS_TYPES ]] || fail "Windows' partitions are still there: $(types)"
  [[ "$(lsblk -no PARTTYPE "${DRIVE}1")" == c12a7328-f81f-11d2-ba4b-00a0c93ec93b ]] || fail "the EFI system partition is gone"
  pass "Windows' partitions are gone and the EFI system partition stays: $(types)"
  ! entry "Windows Boot Manager" && ! esp_has EFI/Microsoft && esp_has EFI/luft/grubx64.efi && esp_has EFI/BOOT/BOOTX64.EFI ||
    fail "Windows Boot Manager is still there, or Luft's own startup is gone"
  pass "Windows Boot Manager is gone from the firmware and the EFI system partition, Luft's startup stays"
  (($(root_size) > before)) && [[ "$(jq -r .grown <<< "$removed")" -gt 0 ]] || fail "Luft didn't grow into the space after it"
  [[ "$(jq -r '.free.size' <<< "$removed")" -gt $((40 * 1024 ** 3)) ]] || fail "the space before Luft isn't offered"
  pass "Luft grew from $before to $(root_size) bytes, and $(jq -r '.free.size' <<< "$removed") bytes before it are offered as a new partition"
}

remove_old_system() {
  local listed removed
  listed="$(as_ada /usr/libexec/luft-other-systems list)" || fail "the other systems couldn't be listed"
  [[ "$(system_id '.kind == "old-system"' "$listed")" == old-system &&
    "$(jq -r '.[] | select(.kind == "old-system") | .name + " " + (.kept | tostring) + " " + .startups[0].folder' <<< "$listed")" == "Fedora Linux 42 (Workstation Edition) 314572800 EFI/fedora" ]] ||
    fail "the old system isn't offered: $listed"
  pass "Disks finds the old system Luft kept, its size and its boot loader"
  removed="$(as_ada /usr/libexec/luft-other-systems remove old-system 2> >(while read -r step; do report "step $step"; done))" ||
    fail "removing the old system failed: $removed"
  mkdir -p "$TOP/top" && mount -o subvolid=5 "$(lsblk -lnpo PATH,PARTTYPE "$DRIVE" | awk -v type="$ROOT_TYPE" '$2 == type { print $1 }')" "$TOP/top"
  [[ ! -e "$TOP/top/old-system" ]] && ! btrfs subvolume list "$TOP/top" | grep -q old-system || fail "the old system's subvolumes are still there"
  umount "$TOP/top"
  [[ ! -e /var/lib/luft-installer/old-system.json ]] || fail "the old system's record is still there"
  pass "the old system's subvolumes and its record are gone"
  ! entry Fedora && ! esp_has EFI/fedora && ! esp_has EFI/BOOT/fbx64.efi || fail "Fedora's start entry or boot loader is still there"
  pass "Fedora's start entry, its boot loader and shim's fallback are gone"
}

case "$(cat "$STATE/stage")" in
  1)
    report "PASS Luft starts next to Windows and the old system: $(efibootmgr | grep '^Boot0' | xargs)"
    remove_windows
    remove_old_system
    echo 2 > "$STATE/stage"
    sync
    systemctl reboot
    ;;
  2)
    pass "Luft starts again after removing both: $(efibootmgr | grep -e '^BootCurrent' -e '^Boot0' | xargs)"
    rm -r "$STATE"
    report DONE
    systemctl poweroff --no-block
    ;;
esac
