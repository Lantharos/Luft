#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
state="${MEET_VM:-$(dirname "$here")/state}"
name="${1:-}"
from="${2:-}"
vm="$state/$name"
sockets="${XDG_RUNTIME_DIR:-/tmp}/meet-vm/$name"
ovmf=/usr/share/edk2/ovmf

usage() {
  cat <<'USAGE'
Usage: apps/meet/vm/linux/run.sh NAME [FROM]

Starts the Linux VM in apps/meet/vm/state/NAME with Secure Boot, a TPM and the QEMU
guest agent. With FROM, a VM NAME that doesn't exist yet starts as a copy of FROM that
keeps its own changes, so tests can start over by deleting state/NAME.

  HEADLESS=0        show a window
  MEMORY=6144       memory in MB
  ISO=path          also attach a Luft ISO as a USB stick, and start from it
  STICK=path        also attach a disk image as a writable USB stick
  SHARE=folder      share a folder read-only, as the 9p tag "share"

Control it with apps/meet/vm/control.py NAME.
USAGE
}

case "$name" in
  "" | -h | --help) usage; exit 0 ;;
esac

if [[ ! -f "$vm/disk.qcow2" ]]; then
  [[ -n "$from" && -f "$state/$from/disk.qcow2" ]] || { echo "Install it first: apps/meet/vm/linux/install.sh" >&2; exit 1; }
  mkdir -p "$vm/tpm"
  qemu-img create -q -f qcow2 -F qcow2 -b "$state/$from/disk.qcow2" "$vm/disk.qcow2"
  [[ -f "$state/$from/data.qcow2" ]] && qemu-img create -q -f qcow2 -F qcow2 -b "$state/$from/data.qcow2" "$vm/data.qcow2"
  cp "$state/$from/vars.qcow2" "$vm/vars.qcow2"
  cp -r "$state/$from/tpm/." "$vm/tpm/"
  cp "$state/$from/guest" "$vm/guest"
fi

media=()
disk_boot=",bootindex=1"
if [[ -n "${INSTALL_ISO:-}" ]]; then
  media=(-drive "if=none,id=setup,media=cdrom,readonly=on,file=$INSTALL_ISO" -device "ide-cd,drive=setup,bootindex=0"
    -drive "if=none,id=kickstart,format=raw,file=$KICKSTART" -device usb-storage,bus=usb.0,drive=kickstart)
elif [[ -n "${ISO:-}" ]]; then
  media=(-drive "if=none,id=stick,format=raw,readonly=on,file=$ISO" -device "usb-storage,bus=usb.0,drive=stick,removable=on,bootindex=0")
fi
stick=()
[[ -n "${STICK:-}" ]] && stick=(-drive "if=none,id=usbstick,format=raw,cache=unsafe,file=$STICK" -device "usb-storage,bus=usb.0,drive=usbstick,removable=on,serial=MEETSTICK01")
data=()
[[ -f "$vm/data.qcow2" ]] && data=(-drive "if=virtio,format=qcow2,cache=unsafe,discard=unmap,file=$vm/data.qcow2")
share=()
[[ -n "${SHARE:-}" ]] && share=(-virtfs "local,path=$SHARE,mount_tag=share,security_model=none,readonly=on")

mkdir -p "$sockets"
rm -f "$sockets"/*.sock
swtpm socket --tpm2 --tpmstate "dir=$vm/tpm" --ctrl "type=unixio,path=$sockets/tpm.sock" --terminate &
swtpm=$!
trap 'kill "$swtpm" 2>/dev/null || true' EXIT
until [[ -S "$sockets/tpm.sock" ]]; do sleep 0.1; done

display=(-display none)
[[ "${HEADLESS:-1}" == 0 ]] && display=(-display gtk,show-cursor=on)

qemu-system-x86_64 -machine q35,accel=kvm,smm=on -cpu host -smp 4 -m "${MEMORY:-6144}" \
  -global driver=cfi.pflash01,property=secure,value=on \
  -drive "if=pflash,format=qcow2,readonly=on,file=$ovmf/OVMF_CODE_4M.secboot.qcow2" \
  -drive "if=pflash,format=qcow2,file=$vm/vars.qcow2" \
  -device qemu-xhci,id=usb -device usb-tablet,bus=usb.0 -device usb-kbd,bus=usb.0 \
  -drive "if=none,id=nvme,format=qcow2,cache=unsafe,discard=unmap,file=$vm/disk.qcow2" -device "nvme,serial=MEETVM0002,drive=nvme$disk_boot" \
  "${data[@]}" "${media[@]}" "${stick[@]}" "${share[@]}" \
  -chardev "socket,id=tpm,path=$sockets/tpm.sock" -tpmdev emulator,id=tpm,chardev=tpm -device tpm-tis,tpmdev=tpm \
  -device virtio-vga,xres=1600,yres=1000 \
  -nic user,model=virtio-net-pci \
  -device virtio-serial -chardev "socket,id=agent,path=$sockets/agent.sock,server=on,wait=off" \
  -device virtserialport,chardev=agent,name=org.qemu.guest_agent.0 \
  -serial "file:$vm/serial.log" \
  -qmp "unix:$sockets/qmp.sock,server=on,wait=off" \
  -pidfile "$vm/qemu.pid" \
  "${display[@]}"
