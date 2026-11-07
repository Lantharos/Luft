#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Installer1 /com/lantharos/Installer1 com.lantharos.Installer1)
SOURCE=/run/luft-source
TARGET=/run/luft-check/target
SATA=/dev/sda
NVME=/dev/nvme0n1
INSTALL_TIMEOUT=1800
ROOT_TYPE=4f68bce3-e8cd-4db1-96e7-fbcaf984b709
RECOVERY_KEY=cbdefghi-jklnrtuv-cbdefghi-jklnrtuv-cbdefghi-jklnrtuv-cbdefghi-jklnrtuv
PASSPHRASE='correct horse battery'
GIB=$((1024 ** 3))

report() { echo "luft-move-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u luft-installer --no-pager -n 40 > /dev/ttyS0
  exit 1
}
call() { busctl --json=short call "${BUS[@]}" "$@"; }
property() { busctl --json=short get-property "${BUS[@]}" "$1" | jq -r .data; }
root_partition() { lsblk -lnpo PATH,PARTTYPE "$SATA" | awk -v type="$ROOT_TYPE" '$2 == type { print $1 }'; }

make_windows() {
  printf 'label: gpt\nsize=100MiB, type=uefi\nsize=16MiB, type=e3c9e316-0b5c-4db8-817d-f92df00215ae\nsize=110GiB, type=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7\nsize=1GiB, type=de94bba4-06d1-4d40-a16a-bfd50179d6ac\n' |
    sfdisk --quiet "$SATA" || fail "the SATA drive couldn't be partitioned"
  udevadm settle
  mkfs.vfat -F 32 -n SYSTEM "${SATA}1" > /dev/null && mkntfs -Q -q -L Windows "${SATA}3" && mkntfs -Q -q "${SATA}4" ||
    fail "Windows' partitions couldn't be formatted"
  mkdir -p "$TARGET" && mount "${SATA}1" "$TARGET"
  mkdir -p "$TARGET/EFI/Microsoft/Boot" "$TARGET/EFI/Boot"
  head -c 2M /dev/urandom > "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi"
  cp "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi" "$TARGET/EFI/Boot/bootx64.efi"
  umount "$TARGET"
  ntfs-3g "${SATA}3" "$TARGET" || fail "Windows' partition doesn't mount"
  mkdir -p "$TARGET/Windows/System32/config" "$TARGET/Users/Ada/Documents"
  cp "$SOURCE/windows/SYSTEM" "$TARGET/Windows/System32/config/SYSTEM"
  umount "$TARGET"
  efibootmgr --quiet --create --disk "$SATA" --part 1 --label "Windows Boot Manager" --loader '\EFI\Microsoft\Boot\bootmgfw.efi' ||
    fail "Windows Boot Manager couldn't be added to the firmware"
  report "PASS a SATA drive with Windows: a small EFI system partition, reserved, system and recovery partitions"
}

make_data() {
  printf 'label: gpt\ntype=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7, name="Data"\n' | sfdisk --quiet "$NVME" ||
    fail "the NVMe drive couldn't be partitioned"
  udevadm settle
  mkntfs -Q -q -L Data "${NVME}p1" || fail "the data partition couldn't be formatted"
  ntfs-3g "${NVME}p1" "$TARGET" || fail "the data partition doesn't mount"
  mkdir -p "$TARGET/Photos" && head -c 64M /dev/urandom > "$TARGET/Photos/holiday.raw"
  sha256sum "$TARGET/Photos/holiday.raw" | cut -d' ' -f1 > /run/luft-check/data.sha256
  umount "$TARGET"
  report "PASS an NVMe drive holding one NTFS data partition"
}

install_alongside() {
  local survey block
  survey="$(call Survey | jq -r '.data[0]')" || fail "the survey failed"
  block="$(jq -r ".drives[] | select(.device == \"$SATA\") | .block" <<< "$survey")"
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
  report "PASS Luft is installed encrypted next to Windows: $(lsblk -no PARTTYPE,FSTYPE "$SATA" | xargs)"
}

mark_first_stage() {
  printf '%s' "$PASSPHRASE" | cryptsetup open --key-file - "$(root_partition)" luft-check || fail "Luft's encryption doesn't open"
  mount /dev/mapper/luft-check "$TARGET" || fail "Luft's file system doesn't mount"
  install -Dm644 <(echo 1) "$TARGET/state/os/default/var/lib/luft-move-check/stage"
  install -Dm644 /run/luft-check/data.sha256 "$TARGET/state/os/default/var/lib/luft-move-check/data.sha256"
  umount "$TARGET"
  cryptsetup close luft-check
}

mkdir -p "$SOURCE" /run/luft-check && mount -o ro LABEL=luft-source "$SOURCE" || fail "the source disk doesn't mount"
make_windows
make_data
install_alongside
mark_first_stage
report "layout $(sfdisk -d "$SATA" | grep '^/dev' | tr -s ' ' | xargs)"
report PREPARED
