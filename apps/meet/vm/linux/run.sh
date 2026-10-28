#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../../.." && pwd)"
state="${MEET_VM:-$(dirname "$here")/state}"
name="${1:-}"
from="${2:-}"
vm="$state/$name"

usage() {
  cat <<'USAGE'
Usage: apps/meet/vm/linux/run.sh NAME [FROM]

Starts the Linux VM in apps/meet/vm/state/NAME with Secure Boot, a TPM and the QEMU
guest agent. With FROM, a VM NAME that doesn't exist yet starts as a copy of FROM that
keeps its own changes, so tests can start over by deleting state/NAME. FROM empty
starts it with an empty 64 GB drive instead, to install Luft onto from a stick.

  HEADLESS=0        show a window
  MEMORY=6144       memory in MB
  ISO=path          also attach a Luft ISO as a USB stick, and start from it
  STICK=path        also attach a disk image as a writable USB stick
  SHARE=folder      share a folder read-only, as the 9p tag "share"

Control it with os/vm/control.py --vm apps/meet/vm/state/NAME.
USAGE
}

case "$name" in
  "" | -h | --help) usage; exit 0 ;;
esac

mkdir -p "$vm"
if [[ ! -f "$vm/disk.qcow2" && "$from" == empty ]]; then
  qemu-img create -q -f qcow2 "$vm/disk.qcow2" 64G
elif [[ ! -f "$vm/disk.qcow2" ]]; then
  [[ -n "$from" && -f "$state/$from/disk.qcow2" ]] || { echo "Install it first: apps/meet/vm/linux/install.sh" >&2; exit 1; }
  qemu-img create -q -f qcow2 -F qcow2 -b "$state/$from/disk.qcow2" "$vm/disk.qcow2"
  [[ ! -f "$state/$from/data.qcow2" ]] || qemu-img create -q -f qcow2 -F qcow2 -b "$state/$from/data.qcow2" "$vm/data.qcow2"
  cp "$state/$from/vars.qcow2" "$vm/vars.qcow2"
  cp -r "$state/$from/tpm" "$vm/tpm"
fi

extra=()
[[ ! -f "$vm/data.qcow2" ]] ||
  extra+=(-drive "if=none,id=data,format=qcow2,cache=unsafe,discard=unmap,file=$vm/data.qcow2" -device virtio-blk-pci,drive=data)
[[ -z "${KICKSTART:-}" ]] || extra+=(-drive "if=none,id=kickstart,format=raw,file=$KICKSTART" -device usb-storage,bus=usb.0,drive=kickstart)
[[ -z "${STICK:-}" ]] || extra+=(-drive "if=none,id=usbstick,format=raw,cache=unsafe,file=$STICK"
  -device usb-storage,bus=usb.0,drive=usbstick,removable=on,serial=MEETSTICK01)

LUFT_VM="$vm" DISK="$vm/disk.qcow2" DISK_BUS=nvme SECURE_BOOT=1 AGENT=1 XRES=1600 YRES=1000 MEMORY="${MEMORY:-6144}" \
  HEADLESS="${HEADLESS:-1}" SERIAL="$vm/serial.log" "$luft/os/vm/qemu.sh" "${extra[@]}"
