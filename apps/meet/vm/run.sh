#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
state="${MEET_VM:-$here/state}"
name="${1:-base}"
vm="$state/$name"
base="$state/base"

usage() {
  cat <<'USAGE'
Usage: apps/meet/vm/run.sh [NAME]

Starts a Windows 11 VM with Secure Boot, Microsoft's keys and a TPM, from
apps/meet/vm/state/NAME. The first run of "base" installs Windows unattended
from state/windows11-eval.iso (account ada, password meet-vm) and switches off
once it's ready. Any other NAME starts as a copy of base that keeps its own
changes, so tests can start over by deleting state/NAME.

  HEADLESS=0        show a window
  MEMORY=8192       memory in MB
  SECOND=64G        add an empty second drive of that size, kept in state/NAME

Control it with os/vm/control.py --vm apps/meet/vm/state/NAME.
USAGE
}

case "$name" in
  -h | --help) usage; exit 0 ;;
esac

installer=()
mkdir -p "$vm"
if [[ "$name" == base && ! -f "$vm/disk.qcow2" ]]; then
  qemu-img create -q -f qcow2 "$vm/disk.qcow2" 128G
  rm -f "$vm/vars.qcow2" "$state/unattend.img"
  mkfs.fat -C -n UNATTEND "$state/unattend.img" 4096 >/dev/null
  mcopy -i "$state/unattend.img" "$here/windows/autounattend.xml" "$here/windows/first-logon.ps1" ::/
  export ISO="$state/windows11-eval.iso" MEDIA=cd
  installer=(-drive "if=none,id=drivers,media=cdrom,readonly=on,file=$(ls "$state"/virtio-win-*.iso)" -device ide-cd,drive=drivers
    -drive "if=none,id=unattend,format=raw,file=$state/unattend.img" -device usb-storage,bus=usb.0,drive=unattend,removable=on)
elif [[ ! -f "$vm/disk.qcow2" ]]; then
  [[ -f "$base/disk.qcow2" ]] || { echo "Install Windows first: apps/meet/vm/run.sh base" >&2; exit 1; }
  qemu-img create -q -f qcow2 -F qcow2 -b "$base/disk.qcow2" "$vm/disk.qcow2"
  cp "$base/vars.qcow2" "$vm/vars.qcow2"
  cp -r "$base/tpm" "$vm/tpm"
fi

LUFT_VM="$vm" DISK="$vm/disk.qcow2" WINDOWS=1 SECURE_BOOT=1 AGENT=1 XRES=1600 YRES=1000 HEADLESS="${HEADLESS:-1}" \
  "$luft/os/vm/qemu.sh" "${installer[@]}" -debugcon "file:$vm/firmware.log" -global isa-debugcon.iobase=0x402
