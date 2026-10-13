#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
vm="${LUFT_VM:-$os/vm/state}"
ovmf=/usr/share/edk2/ovmf

[[ -f "$vm/disk.qcow2" ]] || "$os/vm/disk.sh"
[[ -f "$vm/OVMF_VARS.fd" ]] || cp "$ovmf/OVMF_VARS.fd" "$vm/OVMF_VARS.fd"

display=(-display "${DISPLAY_BACKEND:-gtk},show-cursor=on")
[[ "${HEADLESS:-0}" == 1 ]] && display=(-display none)

qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 4 -m 8192 \
  -drive "if=pflash,format=raw,readonly=on,file=$ovmf/OVMF_CODE.fd" \
  -drive "if=pflash,format=raw,file=$vm/OVMF_VARS.fd" \
  -drive "file=$vm/disk.qcow2,format=qcow2,if=virtio" \
  -device "virtio-vga,xres=${XRES:-1920},yres=${YRES:-1080}" \
  -device virtio-keyboard-pci -device virtio-tablet-pci \
  -nic user,model=virtio-net-pci \
  -serial "unix:$vm/serial.sock,server=on,wait=off" \
  -qmp "unix:$vm/qmp.sock,server=on,wait=off" \
  -pidfile "$vm/qemu.pid" \
  "${display[@]}"
