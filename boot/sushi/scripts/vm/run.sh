#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
vm="${SUSHI_VM:-$root/vm}"
ovmf=/usr/share/edk2/ovmf

[[ -f "$vm/root.img" ]] || "$root/scripts/vm/disk.sh"
[[ -f "$vm/OVMF_VARS.fd" ]] || cp "$ovmf/OVMF_VARS.fd" "$vm/OVMF_VARS.fd"

display=(-display "${DISPLAY_BACKEND:-gtk},show-cursor=on")
[[ "${HEADLESS:-0}" == 1 ]] && display=(-display none)

exec qemu-system-x86_64 \
  -machine q35,accel=kvm -cpu host -smp 4 -m 4096 \
  -drive "if=pflash,format=raw,readonly=on,file=$ovmf/OVMF_CODE.fd" \
  -drive "if=pflash,format=raw,file=$vm/OVMF_VARS.fd" \
  -drive "file=fat:rw:$vm/esp,format=raw" \
  -drive "file=$vm/root.img,format=raw,if=virtio" \
  -device "virtio-vga,xres=${XRES:-1920},yres=${YRES:-1080}" \
  -device virtio-keyboard-pci -device virtio-tablet-pci -device qemu-xhci,id=usb \
  -serial "unix:$vm/serial.sock,server=on,wait=off" \
  -qmp "unix:$vm/qmp.sock,server=on,wait=off" \
  -pidfile "$vm/qemu.pid" \
  "${display[@]}"
