#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ESP="$ROOT/vm/esp"
ROOTFS="$ROOT/vm/rootfs.img"
OVMF_CODE="${OVMF_CODE:-/usr/share/OVMF/OVMF_CODE.fd}"
OVMF_VARS="${OVMF_VARS:-$ROOT/vm/OVMF_VARS.fd}"
MEMORY="${MEMORY:-2048}"
SMP="${SMP:-2}"
HEADLESS="${HEADLESS:-0}"
DISPLAY_BACKEND="${DISPLAY_BACKEND:-gtk}"

if [[ ! -f "$ESP/EFI/BOOT/BOOTX64.EFI" ]]; then
    echo "ESP missing. Run: $ROOT/scripts/vm/build-esp.sh" >&2
    exit 1
fi

if [[ ! -f "$ROOTFS" ]]; then
    echo "Root disk missing. Run: $ROOT/scripts/vm/build-esp.sh" >&2
    exit 1
fi

if [[ ! -f "$OVMF_VARS" ]]; then
    cp /usr/share/OVMF/OVMF_VARS.fd "$OVMF_VARS"
fi

QEMU_ARGS=(
    -machine q35,accel=kvm:tcg
    -cpu max
    -smp "$SMP"
    -m "$MEMORY"
    -drive "if=pflash,format=raw,readonly=on,file=$OVMF_CODE"
    -drive "if=pflash,format=raw,file=$OVMF_VARS"
    -drive "file=fat:rw:$ESP,format=raw"
    -drive "file=$ROOTFS,if=none,format=raw,id=rootdisk"
    -device virtio-blk-pci,drive=rootdisk
    -device ramfb
    -no-reboot
)

if [[ "$HEADLESS" == "1" ]]; then
    echo "==> Starting QEMU headless (serial on stdout)"
    QEMU_ARGS+=(-display none -serial mon:stdio)
else
    echo "==> Starting QEMU with graphics window ($DISPLAY_BACKEND)"
    echo "    Serial log: $ROOT/vm/serial.log"
    QEMU_ARGS+=(-display "$DISPLAY_BACKEND,show-cursor=on" -serial "file:$ROOT/vm/serial.log")
fi

echo "    ESP: $ESP"
echo "    Root: $ROOTFS"
echo "    Close the QEMU window or Ctrl+C to stop"

exec qemu-system-x86_64 "${QEMU_ARGS[@]}"