#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
vm="${LUFT_VM:-$os/vm/state}"
ovmf=/usr/share/edk2/ovmf
disk="${DISK:-$vm/disk.qcow2}"

usage() {
  cat <<'USAGE'
Usage: os/vm/run.sh

Starts the Luft VM from os/vm/state/disk.qcow2, made by os/vm/disk.sh when missing,
with a TPM whose state stays in os/vm/state/tpm.

  ISO=luft.iso      also attach a live USB image and start from it, with an empty
                    os/vm/state/target.qcow2 to install onto
  MEDIA=cd          attach the ISO as a DVD instead of a USB stick
  DISK=path         start from another virtual disk
  SECURE_BOOT=1     firmware with Secure Boot on and Microsoft's keys enrolled
  NETWORK=0         no network card
  MEMORY=4096       memory in MB (default 8192)
  HEADLESS=1        no window
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

machine=q35,accel=kvm,kernel-irqchip=split
code="$ovmf/OVMF_CODE_4M.qcow2"
vars_template="$ovmf/OVMF_VARS_4M.qcow2"
vars="$vm/OVMF_VARS_4M.qcow2"
secure=()
if [[ "${SECURE_BOOT:-0}" == 1 ]]; then
  machine+=,smm=on
  code="$ovmf/OVMF_CODE_4M.secboot.qcow2"
  vars_template="$ovmf/OVMF_VARS_4M.secboot.qcow2"
  vars="$vm/OVMF_VARS_4M.secboot.qcow2"
  secure=(-global "driver=cfi.pflash01,property=secure,value=on")
fi

media=()
if [[ -n "${ISO:-}" ]]; then
  [[ -n "${DISK:-}" ]] || disk="$vm/target.qcow2"
  mkdir -p "$vm"
  [[ -f "$disk" ]] || qemu-img create -q -f qcow2 "$disk" 64G
  case "${MEDIA:-usb}" in
    usb) media=(-device qemu-xhci -drive "if=none,id=stick,format=raw,readonly=on,file=$ISO"
      -device "usb-storage,drive=stick,removable=on,bootindex=0") ;;
    cd) media=(-drive "if=none,id=dvd,media=cdrom,readonly=on,file=$ISO" -device "ide-cd,drive=dvd,bootindex=0") ;;
    *) usage >&2; exit 2 ;;
  esac
fi

[[ -f "$disk" ]] || "$os/vm/disk.sh"
[[ -f "$vars" ]] || cp "$vars_template" "$vars"

network=(-nic "user,model=virtio-net-pci")
[[ "${NETWORK:-1}" == 0 ]] && network=(-nic none)

display=(-display "${DISPLAY_BACKEND:-gtk},show-cursor=on")
[[ "${HEADLESS:-0}" == 1 ]] && display=(-display none)

mkdir -p "$vm/tpm"
rm -f "$vm/tpm.sock"
swtpm socket --tpm2 --tpmstate "dir=$vm/tpm" --ctrl "type=unixio,path=$vm/tpm.sock" --terminate &
swtpm=$!
trap 'kill "$swtpm" 2>/dev/null || true' EXIT
until [[ -S "$vm/tpm.sock" ]]; do sleep 0.1; done

qemu-system-x86_64 -machine "$machine" -cpu host -smp 4 -m "${MEMORY:-8192}" "${secure[@]}" \
  -device intel-iommu,intremap=on \
  -drive "if=pflash,format=qcow2,readonly=on,file=$code" \
  -drive "if=pflash,format=qcow2,file=$vars" \
  -drive "file=$disk,format=qcow2,if=virtio" \
  -chardev "socket,id=tpm,path=$vm/tpm.sock" -tpmdev emulator,id=tpm,chardev=tpm -device tpm-tis,tpmdev=tpm \
  "${media[@]}" \
  -device "virtio-vga,xres=${XRES:-1920},yres=${YRES:-1080}" \
  -device virtio-keyboard-pci -device virtio-tablet-pci \
  "${network[@]}" \
  -serial "unix:$vm/serial.sock,server=on,wait=off" \
  -qmp "unix:$vm/qmp.sock,server=on,wait=off" \
  -pidfile "$vm/qemu.pid" \
  "${display[@]}"
