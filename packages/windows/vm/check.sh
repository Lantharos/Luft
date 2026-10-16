#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Windows1 /com/lantharos/Windows1 com.lantharos.Windows1)
DISK=/dev/vdb
PART=/dev/vdb1
WINDOWS=/usr/lib/luft-windows-check/fake-windows
MOUNT=/run/luft-windows-check
ADAPTER=/var/lib/bluetooth/C8:E2:65:A1:B2:C3
BASIC_DATA=EBD0A0A2-B9E5-4433-87C0-68B6B72699C7

report() { echo "luft-windows-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -t luft-windows --no-pager -n 30 > /dev/ttyS0
  exit 1
}
pass() { report "PASS $*"; }
call() { busctl --json=short call "${BUS[@]}" "$@"; }
data() { call "$@" | jq -r '.data[0]'; }
windows() { data Status | jq -c ".installations[] | select(.device == \"$PART\")"; }
expect() { [[ "$(windows | jq -r "$1")" == "$2" ]] || fail "$3: $(windows)"; }

make_windows() {
  printf 'label: gpt\nsize=2GiB, type=%s\n' "$BASIC_DATA" | sfdisk --quiet "$DISK"
  udevadm settle
  mkntfs -Q -q -L Windows "$PART" || fail "mkntfs"
  mkdir -p "$MOUNT"
  ntfs-3g "$PART" "$MOUNT" && cp -r "$WINDOWS/." "$MOUNT/" && umount "$MOUNT" || fail "filling Windows' drive"
  udevadm trigger --settle "$PART"
}

hibernate_windows() {
  ntfs-3g "$PART" "$MOUNT" || fail "opening Windows' drive"
  printf 'HIBR' | dd of="$MOUNT/hiberfil.sys" conv=notrunc status=none
  umount "$MOUNT"
}

make_windows

drive="$(data Drives | jq -c ".[] | select(.device == \"$PART\")")"
[[ "$(jq -r '.hibernated, .label' <<<"$drive" | xargs)" == "false Windows" ]] || fail "Drives: $drive"
pass "finds Windows' drive"

expect '.version' "Windows 11 Pro" "the version"
expect '[.fastStartup, .universalClock, (.bluetooth | length)] | join(" ")' "true false 2" "Windows as made"
pass "reads Fast Startup, the clock and two Bluetooth pairings"

ntfs-3g -o ro "$PART" "$MOUNT" || fail "opening Windows' drive read-only"
call Change sas "$PART" 1 fastStartupOff > /dev/null 2>&1 && fail "changed Windows while its drive was open"
umount "$MOUNT"
pass "leaves Windows alone while its drive is open"

call Change sas "$PART" 2 fastStartupOff universalClock > /dev/null || fail "Change"
expect '[.fastStartup, .universalClock] | join(" ")' "false true" "after Change"
call Change sas "$PART" 2 fastStartupOff universalClock > /dev/null || fail "Change a second time"
ntfsfix --no-action "$PART" > /dev/null || fail "ntfsfix finds Windows' drive damaged"
ntfs-3g -o ro "$PART" "$MOUNT" || fail "opening Windows' drive read-only"
cmp -s "$MOUNT/Windows/System32/config/SYSTEM.luft-backup" "$WINDOWS/Windows/System32/config/SYSTEM" ||
  fail "the backup isn't the hive as it was"
umount "$MOUNT"
pass "turns off Fast Startup, keeps the clock in UTC and keeps a backup"

[[ "$(data ImportBluetooth)" == "2" ]] || fail "ImportBluetooth didn't bring two devices"
grep -qx 'Key=101112131415161718191A1B1C1D1E1F' "$ADAPTER/00:11:22:33:44:55/info" || fail "the headphones' link key"
grep -qx 'Name=Studio Buds' "$ADAPTER/00:11:22:33:44:55/info" || fail "the headphones' name"
grep -qx 'Authenticated=3' "$ADAPTER/D0:D1:D2:D3:D4:D5/info" || fail "the mouse's long-term key"
expect '.bluetooth | length' "0" "pairings left after importing"
pass "brings Bluetooth devices from Windows"

hibernate_windows
systemctl stop alsa-state.service alsa-restore.service
startup="$(/usr/libexec/luft-windows boot 2>&1)" || fail "the startup check: $startup"
[[ -f /run/luft-windows/hibernated ]] || fail "the startup check didn't notice the hibernated Windows"
[[ "$(data Drives | jq -r ".[] | select(.device == \"$PART\") | .hibernated")" == "true" ]] || fail "Drives after hibernating"
call Change sas "$PART" 1 universalClock > /dev/null 2>&1 && fail "changed a hibernated Windows"
if [[ -e /dev/snd/hwC0D0 ]]; then
  grep -q 'Reset hwC0D0 after Windows' <<<"$startup" || fail "the sound codec wasn't reset: $startup"
  pass "resets the sound codec after a hibernated Windows"
fi
pass "notices a hibernated Windows and leaves it alone"

report "DONE"
