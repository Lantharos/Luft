#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Installer1 /com/lantharos/Installer1 com.lantharos.Installer1)
SOURCE=/run/luft-source
TARGET=/run/luft-check/target
DRIVE=/dev/vdb
INSTALL_TIMEOUT=1800
ROOT_TYPE=4f68bce3-e8cd-4db1-96e7-fbcaf984b709

report() { echo "luft-remove-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u luft-installer --no-pager -n 40 > /dev/ttyS0
  exit 1
}
call() { busctl --json=short call "${BUS[@]}" "$@"; }
property() { busctl --json=short get-property "${BUS[@]}" "$1" | jq -r .data; }

guid_bytes() {
  local hex="${1//-/}"
  printf "$(sed 's/../\\x&/g' <<< "${hex:6:2}${hex:4:2}${hex:2:2}${hex:0:2}${hex:10:2}${hex:8:2}${hex:14:2}${hex:12:2}${hex:16:16}")"
}

partuuid() { lsblk -no PARTUUID "$1"; }

make_windows() {
  printf 'label: gpt\nsize=100MiB, type=uefi\nsize=16MiB, type=e3c9e316-0b5c-4db8-817d-f92df00215ae\nsize=90GiB, type=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7\nsize=2GiB, type=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7\nsize=1GiB, type=de94bba4-06d1-4d40-a16a-bfd50179d6ac\n' |
    sfdisk --quiet "$DRIVE" || fail "the Windows drive couldn't be partitioned"
  udevadm settle
  mkfs.vfat -F 32 -n SYSTEM "${DRIVE}1" > /dev/null && mkntfs -Q -q -L Windows "${DRIVE}3" && mkfs.exfat -L Luft "${DRIVE}4" > /dev/null &&
    mkntfs -Q -q "${DRIVE}5" || fail "Windows' partitions couldn't be formatted"
  mkdir -p "$TARGET" && mount "${DRIVE}1" "$TARGET"
  mkdir -p "$TARGET/EFI/Microsoft/Boot" "$TARGET/EFI/Boot"
  head -c 2M /dev/urandom > "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi"
  { head -c 4096 /dev/urandom; guid_bytes "$(partuuid "${DRIVE}3")"; head -c 4096 /dev/urandom; guid_bytes "$(partuuid "${DRIVE}5")"; } > "$TARGET/EFI/Microsoft/Boot/BCD"
  cp "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi" "$TARGET/EFI/Boot/bootx64.efi"
  umount "$TARGET"
  ntfs-3g "${DRIVE}3" "$TARGET" || fail "Windows' partition doesn't mount"
  mkdir -p "$TARGET/Windows/System32/config" "$TARGET/Users/Ada/Documents"
  cp "$SOURCE/windows/SYSTEM" "$TARGET/Windows/System32/config/SYSTEM"
  umount "$TARGET"
  efibootmgr --quiet --create --disk "$DRIVE" --part 1 --label "Windows Boot Manager" --loader '\EFI\Microsoft\Boot\bootmgfw.efi' ||
    fail "Windows Boot Manager couldn't be added to the firmware"
  report "PASS a Windows-like drive with an EFI system partition, reserved, system, Meet Luft and recovery partitions"
}

install_alongside() {
  local survey block
  survey="$(call Survey | jq -r '.data[0]')" || fail "the survey failed"
  block="$(jq -r ".drives[] | select(.device == \"$DRIVE\") | .block" <<< "$survey")"
  [[ "$(jq -r ".drives[] | select(.device == \"$DRIVE\") | .windows.blocked" <<< "$survey")" == null ]] ||
    fail "Windows can't be shared: $(jq -c ".drives[] | select(.device == \"$DRIVE\")" <<< "$survey")"
  call Configure s '{"locale":"en_US.UTF-8","keyboard":{"layout":"us","variant":""},"timezone":"UTC","hostname":"ada-laptop"}' > /dev/null
  call Install s "{\"target\":{\"kind\":\"alongside\",\"drive\":\"$block\",\"size\":$((40 * 1024 ** 3))},\"variant\":\"default\"}" > /dev/null ||
    fail "installing next to Windows didn't start"
  call CreateAccount sss ada "Ada Lovelace" "correct horse" > /dev/null
  local deadline=$((SECONDS + INSTALL_TIMEOUT))
  until [[ "$(property Stage)" == finished ]]; do
    [[ "$(property Stage)" == failed ]] && fail "installing failed: $(property Error)"
    ((SECONDS < deadline)) || fail "installing took longer than $INSTALL_TIMEOUT seconds"
    sleep 2
  done
  report "PASS Luft is installed next to Windows: $(lsblk -no PARTTYPE,FSTYPE "$DRIVE" | xargs)"
}

keep_old_system() {
  local root esp var
  root="$(lsblk -lnpo PATH,PARTTYPE "$DRIVE" | awk -v type="$ROOT_TYPE" '$2 == type { print $1 }')"
  [[ -n "$root" ]] || fail "Luft's partition isn't on the drive"
  mount "$root" "$TARGET" || fail "Luft's partition doesn't mount"
  btrfs -q subvolume create "$TARGET/old-system" && btrfs -q subvolume create "$TARGET/old-system/home" || fail "the old system couldn't be made"
  mkdir -p "$TARGET/old-system/etc" "$TARGET/old-system/home/ada"
  printf 'NAME="Fedora Linux"\nPRETTY_NAME="Fedora Linux 42 (Workstation Edition)"\n' > "$TARGET/old-system/etc/os-release"
  head -c 300M /dev/urandom > "$TARGET/old-system/home/ada/photos.bin"
  var="$TARGET/state/os/default/var"
  install -Dm644 /dev/stdin "$var/lib/luft-installer/old-system.json" << EOF
{"name": "Fedora Linux 42 (Workstation Edition)", "size": $((300 * 1024 ** 2)), "subvolume": "old-system", "partitions": [], "startups": ["EFI/fedora"]}
EOF
  install -Dm644 <(echo 1) "$var/lib/luft-remove-check/stage"
  umount "$TARGET"

  esp="${DRIVE}1"
  mount "$esp" "$TARGET"
  mkdir -p "$TARGET/EFI/fedora"
  head -c 1M /dev/urandom > "$TARGET/EFI/fedora/shimx64.efi"
  head -c 1M /dev/urandom > "$TARGET/EFI/fedora/grubx64.efi"
  head -c 64K /dev/urandom > "$TARGET/EFI/BOOT/fbx64.efi"
  printf 'search --no-floppy --fs-uuid --set=dev %s\nset prefix=($dev)/grub2\nconfigfile $prefix/grub.cfg\n' "$(lsblk -no UUID "$root")" > "$TARGET/EFI/fedora/grub.cfg"
  printf 'shimx64.efi,Fedora,,This is the boot entry for Fedora\n' | iconv -t UTF-16 > "$TARGET/EFI/fedora/BOOTX64.CSV"
  umount "$TARGET"
  efibootmgr --quiet --create-only --disk "$DRIVE" --part 1 --label Fedora --loader '\EFI\fedora\shimx64.efi' ||
    fail "Fedora's start entry couldn't be added"
  report "PASS the old Linux is kept as a subvolume with its own boot loader and start entry: $(efibootmgr | grep '^Boot0' | xargs)"
}

mkdir -p "$SOURCE" && mount -o ro LABEL=luft-source "$SOURCE" || fail "the source disk doesn't mount"
make_windows
install_alongside
keep_old_system
report PREPARED
