#!/usr/bin/env bash
set -euo pipefail

keyring="$(cd "$(dirname "$0")/../.." && pwd)"
luft="$(cd "$keyring/../.." && pwd)"
vm="${KEYRING_VM:-$luft/kestrel/run/keyring-vm}"

usage() {
  cat <<'USAGE'
Usage: kestrel/keyring/tools/vm/run.sh MODE

Starts the test machine made by tools/vm/build.sh:

  tpm    a fresh copy of it with a security chip
  gone   the same copy again after its security chip is gone
  none   a fresh copy without a security chip
USAGE
}

mode="${1:-}"
tpm=0
case "$mode" in
  tpm | none)
    rm -rf "$vm/work.qcow2" "$vm/tpm"
    qemu-img create -q -f qcow2 -F qcow2 -b "$vm/disk.qcow2" "$vm/work.qcow2"
    ;;
  gone) [[ -f "$vm/work.qcow2" ]] || { echo "Run the tpm series first." >&2; exit 1; } ;;
  -h | --help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac
[[ "$mode" != tpm ]] || tpm=2
log="$vm/serial-$mode.log"

rm -f "$log"
DISK="$vm/work.qcow2" TPM=$tpm NETWORK=0 HEADLESS=1 MEMORY=4096 SERIAL="$log" TIMEOUT="${VM_TIMEOUT:-900}" LUFT_VM="$vm" \
  "$luft/os/vm/qemu.sh" || true

grep -aoE 'keyring-test: .*' "$log" | tr -d '\r' | sed 's/^keyring-test: //'
grep -aq 'LUFT-KEYRING-VM DONE passed=[0-9]* failed=0' "$log"
