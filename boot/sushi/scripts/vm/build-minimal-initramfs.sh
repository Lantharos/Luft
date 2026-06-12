#!/usr/bin/env bash
# Build a minimal initramfs that runs sushid (no dracut/sudo required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/vm/initramfs-sushi.img}"
ROOTFS="$ROOT/vm/initramfs-root"
SUSHID="$ROOT/target/release/sushid"

if [[ ! -x "$SUSHID" ]]; then
    cargo build -p sushid --release
fi

echo "==> Building minimal sushi initramfs"
rm -rf "$ROOTFS"
mkdir -p "$ROOTFS"/{bin,sbin,usr/bin,usr/lib/sushi,run/sushi,run/systemd/ask-password,proc,sys,dev,dev/dri,tmp,sysroot}

cp "$SUSHID" "$ROOTFS/usr/bin/sushid"
cp "$ROOT/initramfs/dracut/90sushi/sushi-efi-state.sh" "$ROOTFS/usr/lib/sushi/sushi-efi-state.sh"
chmod +x "$ROOTFS/usr/lib/sushi/sushi-efi-state.sh"

copy_binary_with_libs() {
    local bin="$1"
    local dest="$2"
    cp "$bin" "$dest"
    while IFS= read -r lib; do
        [[ -f "$lib" ]] || continue
        mkdir -p "$ROOTFS$(dirname "$lib")"
        cp -L "$lib" "$ROOTFS$lib"
    done < <(ldd "$bin" | awk '/=> \// {print $3}')
    local interp
    interp=$(readelf -l "$bin" | awk '/interpreter/ {print $NF}' | tr -d '[]')
    if [[ -f "$interp" ]]; then
        mkdir -p "$ROOTFS$(dirname "$interp")"
        cp -L "$interp" "$ROOTFS$interp"
    fi
}

echo "==> Bundling sushid"
copy_binary_with_libs "$SUSHID" "$ROOTFS/usr/bin/sushid"

mkdir -p "$ROOTFS/run/sushi" "$ROOTFS/run/systemd/ask-password"

# Uncompressed cpio: faster kernel unpack at handoff (VM-only tradeoff).
(cd "$ROOTFS" && find . -print0 | cpio --null -o --format=newc) > "$OUT"
echo "==> Wrote $OUT ($(du -h "$OUT" | awk '{print $1}'), uncompressed cpio)"
echo "    sushid mounts root=/dev/vda -> switch_root -> /sbin/init"