#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
vm="${LUFT_VM:-$os/vm/state}"
disk="$vm/encryption.qcow2"
trust=(com.lantharos.Trust1 /com/lantharos/Trust1 com.lantharos.Trust1)
header_room=$((32 << 20))

usage() {
  cat <<'USAGE'
Usage: os/vm/encryption.sh meet|grown-back|tampered|secure-boot

Checks device encryption on a copy of os/vm/state/disk.qcow2 (made by
os/vm/disk.sh), which stays as it is:

  meet         Meet Luft's partitions after Luft's are taken back at the first
               start, before trustd or the login screen start, and encryption
               turned on afterwards starts at the next restart.
  grown-back   encryption is turned on, then the file system grows back over
               the room kept for its header. The next start leaves the disk
               unencrypted, says so, and turning it on again works.
  tampered     plans changed on the EFI system partition are refused at the
               restart: odd IDs, a header outside the plan's folder, another
               partition, and a plan the TPM didn't seal. Each leaves the disk
               unencrypted. An untouched plan encrypts it, and turning
               encryption off with a changed plan asks for the recovery key
               before the header is used.
  secure-boot  with SECURE_BOOT=1 and Luft's key enrolled: the disk encrypts
               and unlocks by itself. A change to PCR 7 Luft didn't predict
               keeps the TPM sealed as it was, also after the restart that
               needs the recovery key, until it's confirmed. Turning
               encryption off then decrypts without a prompt.
USAGE
}

case "${1:-}" in
  meet | grown-back | tampered | secure-boot) scenario=$1 ;;
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
  "$os/vm/control.py" shell 'systemctl reboot' --timeout 5 > /dev/null
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
disk_value() { value "busctl --json=short get-property ${trust[*]} Disk | jq -r .data.$1.data"; }
disk_state() { disk_value State; }

turn_on_encryption() {
  [[ "$(value "busctl --json=short get-property ${trust[*]} Tpm | jq -r .data.Usable.data")" == true ]] ||
    fail "the VM's TPM can't unlock the disk, so starting would wait for a passphrase"
  recovery_key="$(value "busctl --json=short call ${trust[*]} GenerateRecoveryKey | jq -r '.data[0]'")"
  [[ ${#recovery_key} == 71 ]] || fail "trustd didn't make a recovery key"
  in_vm "busctl call ${trust[*]} TurnOnEncryption sss '$recovery_key' '' ''" > /dev/null || fail "encryption didn't turn on"
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

on_esp() {
  in_vm "(esp=\$(lsblk --list --noheadings --paths --output PATH,PARTTYPE | awk '/c12a7328-f81f-11d2-ba4b-00a0c93ec93b/{print \$1}') &&
    mkdir -p /run/esp-check && mount \"\$esp\" /run/esp-check && cd /run/esp-check/EFI/luft/encryption && { $1; }; status=\$?;
    cd /; umount /run/esp-check; [ \$status = 0 ])"
}

restart_with_recovery_key() {
  "$os/vm/control.py" shell 'systemctl reboot' --timeout 5 > /dev/null || true
  sleep 30
  for _ in $(seq 30); do
    in_vm true 10 > /dev/null 2>&1 && return
    "$os/vm/control.py" type "$recovery_key"
    "$os/vm/control.py" key ret
    sleep 15
  done
  fail "the VM didn't start after the recovery key"
}

wait_for_disk_state() {
  for _ in $(seq 240); do
    [[ "$(disk_state)" == "$1" ]] && return
    sleep 10
  done
  fail "the disk never became $1: $(disk_state)"
}

refused_plan() {
  local change="$1" journal="$2" root
  turn_on_encryption
  on_esp "jq -c '$change' plan.json > plan.changed && mv plan.changed plan.json" > /dev/null || fail "the plan couldn't be changed"
  restart
  root="$(root_partition)"
  [[ "$(value "cryptsetup isLuks $root && echo encrypted")" == "" ]] || fail "a changed plan ($change) encrypted the disk"
  [[ "$(value "journalctl -b -u trustd-encrypt --no-pager | grep -c \"$journal\"")" -ge 1 ]] ||
    fail "the startup didn't say why it refused the plan ($change)"
  [[ "$(disk_state)" == failed ]] || fail "Settings doesn't say encryption didn't start: $(disk_state)"
  pass "a plan with $change is refused and Luft starts unencrypted"
}

check_tampered() {
  local other
  other="$(value "cat /proc/sys/kernel/random/uuid")"
  refused_plan '.uuid = "../../../../run/systemd/system/trustd-check.service"' "didn't check out"
  [[ "$(value "test -e /run/systemd/system/trustd-check.service && echo written")" == "" ]] || fail "the plan wrote outside its folder"
  refused_plan '.header = "../../../../etc/passwd"' "didn't check out"
  refused_plan ".partuuid = \"$other\"" "doesn't start from"
  refused_plan ".uuid = \"$other\"" "isn't the one Luft sealed"
  turn_on_encryption
  restart
  check_encrypted
  wait_for_disk_state on
  restart
  [[ "$(disk_value TpmRefused)" == false ]] || fail "the TPM didn't unlock the encrypted disk"
  pass "the TPM unlocks the encrypted disk"
  in_vm "busctl call ${trust[*]} TurnOffEncryption s '' && systemctl mask --runtime --now trustd.service" > /dev/null ||
    fail "encryption didn't turn off"
  on_esp "jq . plan.json > plan.changed && mv plan.changed plan.json" > /dev/null || fail "the plan couldn't be changed"
  restart_with_recovery_key
  [[ "$(value "journalctl -b -u trustd-encrypt --no-pager | grep -c \"isn't the one Luft sealed\"")" -ge 1 ]] ||
    fail "a changed decrypting plan was used without the recovery key"
  wait_for_disk_state off
  pass "a changed decrypting plan waits for the recovery key, then the disk decrypts"
}

sealed_to() { value "cat /var/lib/trustd/tpm-sealed-to"; }
pcr7() { value "cat /sys/class/tpm/tpm0/pcr-sha256/7 | tr A-F a-f"; }

check_secure_boot() {
  local sealed
  [[ "$(value "busctl --json=short get-property ${trust[*]} SecureBoot | jq -r .data")" == on ]] ||
    fail "Secure Boot isn't on: start with SECURE_BOOT=1 and enroll Luft's key"
  turn_on_encryption
  restart
  check_encrypted
  wait_for_disk_state on
  restart
  [[ "$(disk_value TpmRefused)" == false ]] || fail "the TPM didn't unlock the encrypted disk"
  pass "with Secure Boot on, the TPM unlocks the encrypted disk"
  sealed="$(sealed_to)"
  in_vm "/usr/lib/systemd/systemd-pcrextend --pcr=7 trustd-check && systemctl restart trustd" > /dev/null || fail "PCR 7 couldn't be changed"
  [[ "$(disk_value SecureBootChanged)" == true ]] || fail "Settings doesn't say the startup changed"
  [[ "$(sealed_to)" == "$sealed" ]] || fail "trustd sealed the disk key to an unexpected PCR 7 by itself"
  pass "an unexpected PCR 7 leaves the disk key sealed as it was"
  in_vm "busctl call ${trust[*]} AcceptSecureBootChange" > /dev/null || fail "the change couldn't be confirmed"
  [[ "$(sealed_to)" == "$(pcr7)" && "$(disk_value SecureBootChanged)" == false ]] || fail "confirming didn't seal the disk key again"
  restart_with_recovery_key
  [[ "$(disk_value TpmRefused)" == true ]] || fail "the TPM unlocked a disk sealed to another PCR 7"
  [[ "$(disk_value SecureBootChanged)" == true ]] || fail "Settings doesn't say the startup changed after the recovery key"
  [[ "$(sealed_to)" != "$(pcr7)" ]] || fail "trustd sealed the disk key again after the recovery key without asking"
  pass "after the recovery key, the disk key stays sealed until the change is confirmed"
  in_vm "busctl call ${trust[*]} AcceptSecureBootChange" > /dev/null || fail "the change couldn't be confirmed"
  restart
  [[ "$(disk_value TpmRefused)" == false ]] || fail "confirming didn't let the TPM unlock the disk again"
  pass "once confirmed, the TPM unlocks the disk again"
  in_vm "busctl call ${trust[*]} TurnOffEncryption s ''" > /dev/null || fail "encryption didn't turn off"
  restart
  wait_for_disk_state off
  pass "turning encryption off decrypts without a prompt"
}

rm -f "$disk"
qemu-img create -q -f qcow2 -F qcow2 -b "$vm/disk.qcow2" "$disk"
trap stop EXIT
start
case "$scenario" in
  meet) check_meet ;;
  grown-back) check_grown_back ;;
  tampered) check_tampered ;;
  secure-boot) check_secure_boot ;;
esac
report DONE
