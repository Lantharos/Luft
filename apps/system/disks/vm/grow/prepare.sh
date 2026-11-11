#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Installer1 /com/lantharos/Installer1 com.lantharos.Installer1)
SOURCE=/run/luft-source
TARGET=/run/luft-check/target
DRIVE=/dev/vdb
INSTALL_TIMEOUT=1800
ROOT_TYPE=4f68bce3-e8cd-4db1-96e7-fbcaf984b709
RECOVERY_KEY='legal winner thank year wave sausage worth useful legal winner thank yellow'
PASSPHRASE='correct horse battery'
GIB=$((1024 ** 3))

report() { echo "luft-grow-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u luft-installer --no-pager -n 40 > /dev/ttyS0
  exit 1
}
call() { busctl --json=short call "${BUS[@]}" "$@"; }
property() { busctl --json=short get-property "${BUS[@]}" "$1" | jq -r .data; }
number_of() { lsblk -no PARTN "$1"; }
start_of() { echo $(($(cat "/sys/class/block/${1#/dev/}/start") * 512)); }
size_of() { lsblk -dbno SIZE "$1"; }
root_partition() { lsblk -lnpo PATH,PARTTYPE "$DRIVE" | awk -v type="$ROOT_TYPE" '$2 == type { print $1 }'; }
resize_partition() { echo ",$(($2 / 1024 ** 2))MiB" | sfdisk --quiet --force -N "$(number_of "$1")" "$DRIVE" && udevadm settle; }

make_windows() {
  printf 'label: gpt\nsize=100MiB, type=uefi\nsize=16MiB, type=e3c9e316-0b5c-4db8-817d-f92df00215ae\nsize=110GiB, type=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7\nsize=1GiB, type=de94bba4-06d1-4d40-a16a-bfd50179d6ac\n' |
    sfdisk --quiet "$DRIVE" || fail "the Windows drive couldn't be partitioned"
  udevadm settle
  mkfs.vfat -F 32 -n SYSTEM "${DRIVE}1" > /dev/null && mkntfs -Q -q -L Windows "${DRIVE}3" && mkntfs -Q -q "${DRIVE}4" ||
    fail "Windows' partitions couldn't be formatted"
  mkdir -p "$TARGET" && mount "${DRIVE}1" "$TARGET"
  mkdir -p "$TARGET/EFI/Microsoft/Boot" "$TARGET/EFI/Boot"
  head -c 2M /dev/urandom > "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi"
  cp "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi" "$TARGET/EFI/Boot/bootx64.efi"
  umount "$TARGET"
  ntfs-3g "${DRIVE}3" "$TARGET" || fail "Windows' partition doesn't mount"
  mkdir -p "$TARGET/Windows/System32/config" "$TARGET/Users/Ada/Documents"
  cp "$SOURCE/windows/SYSTEM" "$TARGET/Windows/System32/config/SYSTEM"
  umount "$TARGET"
  efibootmgr --quiet --create --disk "$DRIVE" --part 1 --label "Windows Boot Manager" --loader '\EFI\Microsoft\Boot\bootmgfw.efi' ||
    fail "Windows Boot Manager couldn't be added to the firmware"
  report "PASS a Windows-like drive with a small EFI system partition, reserved, system and recovery partitions"
}

install_alongside() {
  local survey block
  survey="$(call Survey | jq -r '.data[0]')" || fail "the survey failed"
  block="$(jq -r ".drives[] | select(.device == \"$DRIVE\") | .block" <<< "$survey")"
  [[ "$(jq -r ".drives[] | select(.device == \"$DRIVE\") | .windows.blocked" <<< "$survey")" == null ]] ||
    fail "Windows can't be shared: $(jq -c ".drives[] | select(.device == \"$DRIVE\")" <<< "$survey")"
  call Configure s '{"locale":"en_US.UTF-8","keyboard":{"layout":"us","variant":""},"timezone":"UTC","hostname":"ada-laptop"}' > /dev/null
  call Install s "{\"target\":{\"kind\":\"alongside\",\"drive\":\"$block\",\"size\":$((40 * GIB))},\"variant\":\"default\",\"encryption\":{\"recoveryKey\":\"$RECOVERY_KEY\",\"passphrase\":\"$PASSPHRASE\"}}" > /dev/null ||
    fail "installing next to Windows didn't start"
  call CreateAccount sss ada "Ada Lovelace" "correct horse" > /dev/null
  local deadline=$((SECONDS + INSTALL_TIMEOUT))
  until [[ "$(property Stage)" == finished ]]; do
    [[ "$(property Stage)" == failed ]] && fail "installing failed: $(property Error)"
    ((SECONDS < deadline)) || fail "installing took longer than $INSTALL_TIMEOUT seconds"
    sleep 2
  done
  report "PASS Luft is installed encrypted next to Windows: $(lsblk -no PARTTYPE,FSTYPE "$DRIVE" | xargs)"
}

shrink_windows() {
  local windows="${DRIVE}3" size
  size=$(($(size_of "$windows") - 30 * GIB))
  ntfsresize --force --size "$size" "$windows" <<< y > /dev/null || fail "Windows' file system didn't shrink"
  resize_partition "$windows" "$size" || fail "Windows' partition didn't shrink"
  report "PASS Windows gave up 30 GB, which is now free between Windows and Luft's startup partition"
}

shrink_luft() {
  local root size
  root="$(root_partition)"
  size=$(($(size_of "$root") - 12 * GIB))
  printf '%s' "$PASSPHRASE" | cryptsetup open --key-file - "$root" luft-shrink || fail "Luft's encryption doesn't open"
  mount /dev/mapper/luft-shrink "$TARGET" && btrfs -q filesystem resize -13G "$TARGET" && umount "$TARGET" ||
    fail "Luft's file system didn't shrink"
  cryptsetup close luft-shrink
  resize_partition "$root" "$size" || fail "Luft's partition didn't shrink"
  printf '%s' "$PASSPHRASE" | cryptsetup open --key-file - "$root" luft-shrink &&
    mount /dev/mapper/luft-shrink "$TARGET" && btrfs -q filesystem resize max "$TARGET" ||
    fail "Luft's file system didn't fill its partition again"
  install -Dm644 <(echo 1) "$TARGET/state/os/default/var/lib/luft-grow-check/stage"
  umount "$TARGET"
  cryptsetup close luft-shrink
  echo "start=$((($(start_of "$root") + size + 4 * GIB) / 512)), size=$((4 * GIB / 512)), type=linux" |
    sfdisk --quiet --force --append "$DRIVE" && udevadm settle || fail "the data partition couldn't be made"
  mkfs.ext4 -q -L Data "$(sfdisk -d "$DRIVE" | awk '/^\/dev/ { last = $1 } END { print last }')" ||
    fail "the data partition couldn't be formatted"
  report "PASS Luft has 4 GB free right after it, then a data partition, then more free space"
}

mkdir -p "$SOURCE" && mount -o ro LABEL=luft-source "$SOURCE" || fail "the source disk doesn't mount"
make_windows
install_alongside
shrink_windows
shrink_luft
report "layout $(sfdisk -d "$DRIVE" | grep '^/dev' | tr -s ' ' | xargs)"
report PREPARED
