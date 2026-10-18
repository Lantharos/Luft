#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
vm="${LUFT_VM:-$os/vm/state}"
disk="$vm/encryption.qcow2"
trust=(com.lantharos.Trust1 /com/lantharos/Trust1 com.lantharos.Trust1)
header_room=$((32 << 20))

usage() {
  cat <<'USAGE'
Usage: os/vm/encryption.sh meet|grown-back

Checks device encryption on a copy of os/vm/state/disk.qcow2 (made by
os/vm/disk.sh), which stays as it is:

  meet        Meet Luft's partitions after Luft's are taken back at the first
              start, before trustd or the login screen start, and encryption
              turned on afterwards starts at the next restart.
  grown-back  encryption is turned on, then the file system grows back over
              the room kept for its header. The next start leaves the disk
              unencrypted, says so, and turning it on again works.
USAGE
}

case "${1:-}" in
  meet | grown-back) scenario=$1 ;;
  -h | --help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac
[[ -f "$vm/disk.qcow2" ]] || { echo "Make the VM's disk first: os/vm/disk.sh" >&2; exit 1; }

report() { echo "encryption-check: $*"; }
fail() { report "FAIL $*"; exit 1; }
pass() { report "PASS $*"; }

in_vm() {
  local heard
  heard="$("$os/vm/control.py" shell "$1" --timeout "${2:-120}" | tr -d '\r')"
  grep -q 'LUFT-DONE-0' <<< "$heard" || { printf '%s\n' "$heard" >&2; return 1; }
  sed -n 's/.*OUT://p' <<< "$heard" | tail -n1
}

value() { in_vm "printf '\\117UT:%s\\n' \"\$($1)\""; }

wait_for_login() {
  for _ in $(seq 60); do
    in_vm true 10 > /dev/null 2>&1 && return
    sleep 5
  done
  fail "the VM didn't reach the login prompt"
}

start() {
  HEADLESS=1 DISK="$disk" "$os/vm/run.sh" > "$vm/encryption-qemu.log" 2>&1 &
  qemu=$!
  wait_for_login
}

restart() {
  "$os/vm/control.py" shell 'systemctl reboot' --timeout 5 > /dev/null || true
  sleep 20
  wait_for_login
}

stop() {
  kill "$(cat "$vm/qemu.pid")" 2> /dev/null || true
  wait "$qemu" 2> /dev/null || true
}

root_partition() { value "findmnt --noheadings --output SOURCE --target /sysroot"; }
partition_size() { value "blockdev --getsize64 $1"; }
file_system_size() { value "btrfs inspect-internal dump-super $1 | awk '/^dev_item.total_bytes/{print \$2}'"; }
disk_state() { value "busctl --json=short get-property ${trust[*]} Disk | jq -r .data.State.data"; }

turn_on_encryption() {
  [[ "$(value "busctl --json=short get-property ${trust[*]} Tpm | jq -r .data.Usable.data")" == true ]] ||
    fail "the VM's TPM can't unlock the disk, so starting would wait for a passphrase"
  in_vm "key=\$(busctl --json=short call ${trust[*]} GenerateRecoveryKey | jq -r '.data[0]') &&
    busctl call ${trust[*]} TurnOnEncryption sss \"\$key\" '' ''" > /dev/null || fail "encryption didn't turn on"
}

check_room_kept() {
  local root size
  root="$(root_partition)"
  size="$(partition_size "$root")"
  (($(file_system_size "$root") <= size - header_room)) || fail "the file system doesn't leave room for the header"
  [[ "$(disk_state)" == starting ]] || fail "encryption isn't waiting for the restart: $(disk_state)"
  pass "the file system leaves 32 MB for the header and encryption waits for the restart"
}

check_encrypted() {
  [[ "$(value "cryptsetup status root | awk '/type:/{print \$2}'")" == LUKS2 ]] || fail "the disk isn't encrypted after the restart"
  [[ "$(disk_state)" =~ ^(encrypting|on)$ ]] || fail "Settings doesn't see the encryption: $(disk_state)"
  pass "the restart encrypted the disk and Luft started from it"
}

pretend_meet_installed() {
  local start live size
  size="$(value "blockdev --getsize64 /dev/vda")"
  [[ "$size" =~ ^[0-9]+$ ]] || fail "the VM's disk size couldn't be read"
  "$os/vm/control.py" grow-disk $((size + (4 << 30)))
  in_vm "sfdisk --quiet --no-reread --relocate gpt-bak-std /dev/vda &&
    printf 'size=1GiB,type=linux\nsize=1GiB,type=linux\n' | sfdisk --quiet --no-reread --force --append /dev/vda &&
    partx --add --nr 4:5 /dev/vda && udevadm settle" > /dev/null ||
    fail "Meet Luft's partitions couldn't be made"
  start="$(value "lsblk --noheadings --raw --output PARTUUID /dev/vda | tail -n2 | head -n1")"
  live="$(value "lsblk --noheadings --raw --output PARTUUID /dev/vda | tail -n1")"
  in_vm "mkdir -p /var/lib/luft-installer && printf '%s' '{\"intent\":\"install\",\"bootEntry\":4660,\"start\":\"$start\",\"live\":\"$live\"}' > /var/lib/luft-installer/meet.json" > /dev/null
  echo "$start $live"
}

check_meet() {
  local partitions root reclaimed trustd
  partitions="$(pretend_meet_installed)"
  restart
  [[ "$(value "systemctl show --property Result --value luft-installer-reclaim.service")" == success ]] ||
    fail "giving back Meet Luft's space failed: $(value "journalctl -b -u luft-installer-reclaim --no-pager -n 5 | tr '\n' ' '")"
  for partition in $partitions; do
    [[ -z "$(value "lsblk --noheadings --raw --output PARTUUID /dev/vda | grep -x $partition")" ]] || fail "Meet Luft's partition $partition is still there"
  done
  [[ "$(value "test -e /var/lib/luft-installer/meet.json && echo kept")" == "" ]] || fail "Meet Luft's notes are still there"
  root="$(root_partition)"
  [[ "$(file_system_size "$root")" == "$(partition_size "$root")" ]] || fail "Luft didn't grow into Meet Luft's space"
  pass "Meet Luft's partitions are gone and Luft grew into their space"
  reclaimed="$(value "systemctl show --property ExecMainExitTimestampMonotonic --value luft-installer-reclaim.service")"
  trustd="$(value "systemctl show --property ExecMainStartTimestampMonotonic --value trustd.service")"
  ((reclaimed > 0 && reclaimed < trustd)) || fail "trustd started before Meet Luft's space was given back"
  pass "Meet Luft's space is given back before trustd starts"
  turn_on_encryption
  check_room_kept
  restart
  check_encrypted
}

check_grown_back() {
  local root
  turn_on_encryption
  check_room_kept
  in_vm "btrfs filesystem resize max /var" > /dev/null || fail "the file system didn't grow back"
  root="$(root_partition)"
  [[ "$(file_system_size "$root")" == "$(partition_size "$root")" ]] || fail "the file system didn't grow back"
  restart
  [[ "$(value "cryptsetup isLuks $root && echo encrypted")" == "" ]] || fail "the disk was encrypted anyway"
  [[ "$(value "journalctl -b -u trustd-encrypt --no-pager | grep -c 'room for encryption'")" -ge 1 ]] ||
    fail "the startup didn't say why it left the disk alone"
  [[ "$(disk_state)" == failed ]] || fail "Settings doesn't say encryption didn't start: $(disk_state)"
  [[ "$(value "test -e /var/lib/trustd/encryption.json && echo staged")" == "" ]] || fail "the plan is still staged"
  pass "the disk stays unencrypted, Luft starts, and Settings says encryption didn't start"
  turn_on_encryption
  check_room_kept
  restart
  check_encrypted
}

rm -f "$disk"
qemu-img create -q -f qcow2 -F qcow2 -b "$vm/disk.qcow2" "$disk"
trap stop EXIT
start
case "$scenario" in
  meet) check_meet ;;
  grown-back) check_grown_back ;;
esac
report DONE
