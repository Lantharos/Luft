#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
vm="${SUSHI_VM:-$root/vm}"
ovmf=/usr/share/edk2/ovmf

[[ -f "$vm/disk.img" || -f "$vm/root.img" ]] || "$root/scripts/vm/disk.sh"

firmware=(-machine q35,accel=kvm)
code="$ovmf/OVMF_CODE.fd"
vars="$vm/OVMF_VARS.fd"
template="$ovmf/OVMF_VARS.fd"
format=raw
if [[ "${SECURE_BOOT:-0}" == 1 ]]; then
  firmware=(-machine q35,accel=kvm,smm=on -global driver=cfi.pflash01,property=secure,value=on)
  code="$ovmf/OVMF_CODE_4M.secboot.qcow2"
  vars="$vm/OVMF_VARS_4M.secboot.qcow2"
  template="$ovmf/OVMF_VARS_4M.secboot.qcow2"
  format=qcow2
fi
[[ -f "$vars" ]] || cp "$template" "$vars"

disks=(-drive "file=fat:rw:$vm/esp,format=raw" -drive "file=$vm/root.img,format=raw,if=virtio")
[[ -f "$vm/disk.img" ]] && disks=(-drive "file=$vm/disk.img,format=raw,if=virtio")

tpm=()
case "${TPM:-}" in
  2 | 1.2)
    state="$vm/tpm$TPM"
    mkdir -p "$state"
    version=(--tpm2)
    device=tpm-crb
    [[ "$TPM" == 1.2 ]] && version=() && device=tpm-tis
    swtpm socket "${version[@]}" --tpmstate "dir=$state" --ctrl "type=unixio,path=$state/swtpm.sock" \
      --pid "file=$state/swtpm.pid" --terminate --daemon
    tpm=(-chardev "socket,id=tpm,path=$state/swtpm.sock" -tpmdev emulator,id=tpm0,chardev=tpm -device "$device,tpmdev=tpm0")
    ;;
esac

display=(-display "${DISPLAY_BACKEND:-gtk},show-cursor=on")
[[ "${HEADLESS:-0}" == 1 ]] && display=(-display none)

exec qemu-system-x86_64 \
  "${firmware[@]}" -cpu host -smp 4 -m 4096 \
  -drive "if=pflash,format=$format,readonly=on,file=$code" \
  -drive "if=pflash,format=$format,file=$vars" \
  "${disks[@]}" \
  "${tpm[@]}" \
  -device "virtio-vga,xres=${XRES:-1920},yres=${YRES:-1080}" \
  -device virtio-keyboard-pci -device virtio-tablet-pci -device qemu-xhci,id=usb \
  -serial "unix:$vm/serial.sock,server=on,wait=off" \
  -qmp "unix:$vm/qmp.sock,server=on,wait=off" \
  -pidfile "$vm/qemu.pid" \
  "${display[@]}"
