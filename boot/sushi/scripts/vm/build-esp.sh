#!/usr/bin/env bash
# Build a QEMU FAT ESP with RelayBoot (replaces GRUB) + BLS entry + kernel + relay initramfs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VM_DIR="$ROOT/vm"
ESP="$VM_DIR/esp"
KERNEL="${KERNEL:-$(ls -1 /boot/vmlinuz-* 2>/dev/null | grep -v rescue | tail -1)}"

echo "==> Building Relay release binaries"
cargo build --workspace --exclude relayboot --release -p relayd -p relayctl
cargo build -p relayboot --target x86_64-unknown-uefi --release

mkdir -p "$ESP/EFI/BOOT" "$ESP/loader/entries"

echo "==> Installing RelayBoot as BOOTX64.EFI (GRUB replacement)"
cp "$ROOT/target/x86_64-unknown-uefi/release/relayboot.efi" "$ESP/EFI/BOOT/BOOTX64.EFI"

echo "==> Building relay test initramfs"
INITRD="$VM_DIR/initramfs-relay.img"
if [[ "${USE_DRACUT:-0}" == "1" ]]; then
    "$ROOT/scripts/vm/build-initramfs.sh" "$INITRD"
else
    "$ROOT/scripts/vm/build-minimal-initramfs.sh" "$INITRD"
fi

if [[ -z "$KERNEL" || ! -f "$KERNEL" ]]; then
    echo "ERROR: no kernel found. Set KERNEL=/path/to/vmlinuz" >&2
    exit 1
fi

echo "==> Copying kernel ($KERNEL)"
cp "$KERNEL" "$ESP/vmlinuz"
cp "$INITRD" "$ESP/initramfs.img"

cat > "$ESP/loader/entries/relay-test.conf" <<EOF
title Relay QEMU Test
linux \\vmlinuz
initrd \\initramfs.img
options rd.relay=1 rdinit=/usr/bin/relayd quiet loglevel=3 console=ttyS0,115200n8 fbcon.logo=0 fbcon.logo_centerscreen=0
EOF

echo "==> ESP ready at $ESP"
echo "    Run: $ROOT/scripts/vm/run-qemu.sh"