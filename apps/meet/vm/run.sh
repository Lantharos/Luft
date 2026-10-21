#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
state="${MEET_VM:-$here/state}"
name="${1:-base}"
vm="$state/$name"
base="$state/base"
sockets="${XDG_RUNTIME_DIR:-/tmp}/meet-vm/$name"
ovmf=/usr/share/edk2/ovmf

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

Control it with apps/meet/vm/control.py NAME.
USAGE
}

case "$name" in
  -h | --help) usage; exit 0 ;;
esac

unattended_media() {
  local image="$state/unattend.img"
  rm -f "$image"
  mkfs.fat -C -n UNATTEND "$image" 4096 >/dev/null
  mcopy -i "$image" "$here/windows/autounattend.xml" "$here/windows/first-logon.ps1" ::/
  installer=(
    -drive "if=none,id=setup,media=cdrom,readonly=on,file=$state/windows11-eval.iso" -device "ide-cd,bus=ide.0,drive=setup,bootindex=0"
    -drive "if=none,id=drivers,media=cdrom,readonly=on,file=$(ls "$state"/virtio-win-*.iso)" -device ide-cd,bus=ide.1,drive=drivers
    -drive "if=none,id=unattend,format=raw,file=$image" -device usb-storage,bus=usb.0,drive=unattend,removable=on
  )
}

prepare() {
  mkdir -p "$vm/tpm"
  installer=()
  disk_boot=""
  if [[ "$name" == base ]]; then
    [[ -f "$vm/disk.qcow2" ]] && return
    qemu-img create -q -f qcow2 "$vm/disk.qcow2" 128G
    cp "$ovmf/OVMF_VARS_4M.secboot.qcow2" "$vm/vars.qcow2"
    unattended_media
    disk_boot=",bootindex=1"
  elif [[ ! -f "$vm/disk.qcow2" ]]; then
    [[ -f "$base/disk.qcow2" ]] || { echo "Install Windows first: apps/meet/vm/run.sh base" >&2; exit 1; }
    qemu-img create -q -f qcow2 -F qcow2 -b "$base/disk.qcow2" "$vm/disk.qcow2"
    cp "$base/vars.qcow2" "$vm/vars.qcow2"
    cp -r "$base/tpm/." "$vm/tpm/"
  fi
}

second_drive() {
  second=()
  [[ -n "${SECOND:-}" ]] || return 0
  [[ -f "$vm/second.qcow2" ]] || qemu-img create -q -f qcow2 "$vm/second.qcow2" "$SECOND"
  second=(-drive "if=none,id=second,format=qcow2,cache=unsafe,discard=unmap,file=$vm/second.qcow2" -device "nvme,serial=MEETVM0002,drive=second")
}

prepare
second_drive

mkdir -p "$sockets"
rm -f "$sockets"/*.sock
swtpm socket --tpm2 --tpmstate "dir=$vm/tpm" --ctrl "type=unixio,path=$sockets/tpm.sock" --terminate &
swtpm=$!
trap 'kill "$swtpm" 2>/dev/null || true' EXIT
until [[ -S "$sockets/tpm.sock" ]]; do sleep 0.1; done

display=(-display none)
[[ "${HEADLESS:-1}" == 0 ]] && display=(-display gtk,show-cursor=on)

qemu-system-x86_64 -machine q35,accel=kvm,smm=on -cpu host,-svm,-vmx,hv_relaxed,hv_vapic,hv_spinlocks=0x1fff,hv_time,hv_vpindex,hv_synic,hv_stimer -smp 4 -m "${MEMORY:-8192}" \
  -global driver=cfi.pflash01,property=secure,value=on \
  -drive "if=pflash,format=qcow2,readonly=on,file=$ovmf/OVMF_CODE_4M.secboot.qcow2" \
  -drive "if=pflash,format=qcow2,file=$vm/vars.qcow2" \
  -drive "if=none,id=nvme,format=qcow2,cache=unsafe,discard=unmap,file=$vm/disk.qcow2" -device "nvme,serial=MEETVM0001,drive=nvme$disk_boot" \
  "${second[@]}" \
  -chardev "socket,id=tpm,path=$sockets/tpm.sock" -tpmdev emulator,id=tpm,chardev=tpm -device tpm-tis,tpmdev=tpm \
  -device qemu-xhci,id=usb -device usb-tablet,bus=usb.0 -device usb-kbd,bus=usb.0 \
  "${installer[@]}" \
  -device VGA,xres=1600,yres=1000,edid=on \
  -nic user,model=e1000e \
  -device virtio-serial -chardev "socket,id=agent,path=$sockets/agent.sock,server=on,wait=off" \
  -device virtserialport,chardev=agent,name=org.qemu.guest_agent.0 \
  -qmp "unix:$sockets/qmp.sock,server=on,wait=off" \
  -debugcon "file:$vm/firmware.log" -global isa-debugcon.iobase=0x402 \
  -pidfile "$vm/qemu.pid" \
  "${display[@]}"
