#!/usr/bin/env bash
# Build a dracut initramfs with sushid — uses vm/staging only (no install to host /usr).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/vm/initramfs-sushi.img}"
KVER="${KVER:-$(uname -r)}"
STAGING="$ROOT/vm/staging"

echo "==> Staging sushi install tree"
rm -rf "$STAGING"
DESTDIR="$STAGING" "$ROOT/scripts/build.sh"

if ! command -v dracut >/dev/null 2>&1; then
    echo "ERROR: dracut not found. Install dracut or use build-minimal-initramfs.sh" >&2
    exit 1
fi

MODULE_SRC="$STAGING/usr/lib/dracut/modules.d/90sushi"
SUSHID_BIN="$STAGING/usr/bin/sushid"
SUSHICTL_BIN="$STAGING/usr/bin/sushictl"

echo "==> dracut: sushi initramfs (staging-only, no host install)"
sudo dracut --force --no-hostonly --no-hostonly-cmdline \
    --omit "plymouth" \
    --add "sushi systemd systemd-initrd bash" \
    --install "$SUSHID_BIN" \
    --install "$SUSHICTL_BIN" \
    --install "$STAGING/usr/lib/sushi/themes/default/logo.txt" \
    --install "$STAGING/etc/sushi/sushi.conf" \
    --include "$MODULE_SRC" "/usr/lib/dracut/modules.d/90sushi" \
    --kmoddir "/lib/modules/${KVER}" \
    --drivers "virtio_blk ext4 virtio_pci virtio_mmio" \
    "$OUT" "$KVER"

echo "==> Initramfs: $OUT ($(du -h "$OUT" | awk '{print $1}'))"
echo "    Built from staging — nothing installed to host /usr/local"