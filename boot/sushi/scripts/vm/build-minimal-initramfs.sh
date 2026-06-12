#!/usr/bin/env bash
# Build a minimal initramfs that runs relayd (no dracut/sudo required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/vm/initramfs-relay.img}"
ROOTFS="$ROOT/vm/initramfs-root"
RELAYD="$ROOT/target/release/relayd"
DEMO_INIT="$ROOT/target/release/relay-demo-init"

if [[ ! -x "$RELAYD" ]]; then
    cargo build -p relayd --release
fi
if [[ ! -x "$DEMO_INIT" ]]; then
    cargo build -p relay-demo-init --release
fi

echo "==> Building minimal relay initramfs"
rm -rf "$ROOTFS"
mkdir -p "$ROOTFS"/{bin,sbin,usr/bin,usr/lib/relay,run/relay,run/systemd/ask-password,proc,sys,dev,dev/dri,tmp,sysroot/sbin,sysroot/lib,sysroot/lib64}

cp "$RELAYD" "$ROOTFS/usr/bin/relayd"
cp "$ROOT/initramfs/dracut/90relay/relay-efi-state.sh" "$ROOTFS/usr/lib/relay/relay-efi-state.sh"
chmod +x "$ROOTFS/usr/lib/relay/relay-efi-state.sh"

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

echo "==> Bundling relayd"
copy_binary_with_libs "$RELAYD" "$ROOTFS/usr/bin/relayd"

echo "==> Bundling demo sysroot (/sysroot/sbin/init)"
copy_binary_with_libs "$DEMO_INIT" "$ROOTFS/sysroot/sbin/init"
while IFS= read -r lib; do
    [[ -f "$lib" ]] || continue
    mkdir -p "$ROOTFS/sysroot$(dirname "$lib")"
    cp -L "$lib" "$ROOTFS/sysroot$lib"
done < <(ldd "$DEMO_INIT" | awk '/=> \// {print $3}')
demo_interp=$(readelf -l "$DEMO_INIT" | awk '/interpreter/ {print $NF}' | tr -d '[]')
if [[ -f "$demo_interp" ]]; then
    mkdir -p "$ROOTFS/sysroot$(dirname "$demo_interp")"
    cp -L "$demo_interp" "$ROOTFS/sysroot$demo_interp"
fi

mkdir -p "$ROOTFS/run/relay" "$ROOTFS/run/systemd/ask-password"

(cd "$ROOTFS" && find . -print0 | cpio --null -o --format=newc | gzip -9) > "$OUT"
echo "==> Wrote $OUT ($(du -h "$OUT" | awk '{print $1}'))"
echo "    relayd -> switch_root -> /sysroot/sbin/init after splash"