#!/usr/bin/env bash
# Build a QEMU FAT ESP with SushiBoot + BLS entry + kernel + sushi initramfs + root disk.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VM_DIR="$ROOT/vm"
ESP="$VM_DIR/esp"
KERNEL="${KERNEL:-$(ls -1 /boot/vmlinuz-* 2>/dev/null | grep -v rescue | tail -1)}"

SUSHI_UEFI_RUSTFLAGS='-C link-arg=-Wl,--subsystem,efi_application'

echo "==> Building Sushi release binaries"
cargo build --workspace --exclude sushiboot --release -p sushid -p sushictl
RUSTFLAGS="$SUSHI_UEFI_RUSTFLAGS" cargo build -p sushiboot --target x86_64-unknown-uefi --release

mkdir -p "$ESP/EFI/BOOT" "$ESP/loader/entries"
rm -f "$ESP/loader/entries/"*.conf

echo "==> Installing SushiBoot as BOOTX64.EFI"
cp "$ROOT/target/x86_64-unknown-uefi/release/sushiboot.efi" "$ESP/EFI/BOOT/BOOTX64.EFI"

echo "==> Building VM root disk (busybox console)"
"$ROOT/scripts/vm/build-rootfs.sh" "$VM_DIR/rootfs.img"

echo "==> Building sushi test initramfs"
INITRD="$VM_DIR/initramfs-sushi.img"
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

cat > "$ESP/loader/entries/sushi-test.conf" <<EOF
title Sushi QEMU Test
linux \\vmlinuz
initrd \\initramfs.img
options rd.sushi=1 rdinit=/usr/bin/sushid root=/dev/vda rw loglevel=4 console=ttyS0,115200n8 console=tty0 fbcon.logo=0 fbcon.logo_centerscreen=0
EOF

echo "==> ESP ready at $ESP"
echo "    Root disk: $VM_DIR/rootfs.img (attach with virtio in run-qemu.sh)"
echo "    Run: $ROOT/scripts/vm/run-qemu.sh"