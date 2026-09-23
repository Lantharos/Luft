#!/usr/bin/env bash
# Build a LUKS2-wrapped ext4 root disk for QEMU LUKS unlock testing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VM_DIR="$ROOT/vm"
ROOTFS_IMG="${1:-$VM_DIR/rootfs.img}"
ROOTFS_DIR="$VM_DIR/rootfs-tree"
SIZE_MB="${ROOTFS_SIZE_MB:-256}"
LUKS_NAME="${LUKS_NAME:-root}"
PASSPHRASE="${LUKS_PASSPHRASE:-sushi}"

if ! command -v cryptsetup >/dev/null 2>&1; then
    echo "ERROR: cryptsetup not found (dnf install cryptsetup-luks)" >&2
    exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
    echo "ERROR: LUKS root disk build needs root for loop devices (sudo $0)" >&2
    exit 1
fi

echo "==> Building busybox rootfs tree"
ROOTFS_TREE_ONLY=1 "$ROOT/scripts/vm/build-rootfs.sh" "$ROOTFS_IMG"

echo "==> Creating LUKS2 container ($ROOTFS_IMG, ${SIZE_MB}MB)"
rm -f "$ROOTFS_IMG"
truncate -s "${SIZE_MB}M" "$ROOTFS_IMG"

LOOP="$(losetup -f --show --partscan "$ROOTFS_IMG")"
MAPPER="/dev/mapper/${LUKS_NAME}"
MNT="$VM_DIR/luks-mnt"

cleanup() {
    umount "$MNT" 2>/dev/null || true
    rmdir "$MNT" 2>/dev/null || true
    cryptsetup close "$LUKS_NAME" 2>/dev/null || true
    losetup -d "$LOOP" 2>/dev/null || true
}
trap cleanup EXIT

echo -n "$PASSPHRASE" | cryptsetup luksFormat --type luks2 --batch-mode "$LOOP" -
echo -n "$PASSPHRASE" | cryptsetup open "$LOOP" "$LUKS_NAME"
mkfs.ext4 -F -L sushi-root "$MAPPER" >/dev/null

mkdir -p "$MNT"
mount "$MAPPER" "$MNT"
cp -a "$ROOTFS_DIR"/. "$MNT/"
sync
umount "$MNT"
rmdir "$MNT"

# Created as root — hand the image back to the user running sudo so QEMU can open it.
if [[ -n "${SUDO_UID:-}" && -n "${SUDO_GID:-}" ]]; then
    chown "$SUDO_UID:$SUDO_GID" "$ROOTFS_IMG"
fi
chmod a+r "$ROOTFS_IMG"

echo "==> LUKS root disk ready: $ROOTFS_IMG"
echo "    Mapper name: $LUKS_NAME  (guest: /dev/mapper/$LUKS_NAME)"
echo "    LUKS device: /dev/vda    (whole virtio disk in QEMU)"
echo "    Test passphrase: $PASSPHRASE"