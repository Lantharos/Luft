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

if [[ "${LUKS:-0}" == "1" ]]; then
    CRYPTSETUP="${CRYPTSETUP:-$(command -v cryptsetup)}"
    if [[ -z "$CRYPTSETUP" || ! -x "$CRYPTSETUP" ]]; then
        echo "ERROR: cryptsetup not found. Install cryptsetup-luks or set CRYPTSETUP=" >&2
        exit 1
    fi
    KVER="${KVER:-$(uname -r)}"
    DM_CRYPT_MOD="/lib/modules/${KVER}/kernel/drivers/md/dm-crypt.ko.xz"
    MODPROBE_BIN="${MODPROBE:-$(command -v modprobe)}"
    if [[ ! -f "$DM_CRYPT_MOD" ]]; then
        echo "ERROR: dm_crypt module not found at $DM_CRYPT_MOD (set KVER=)" >&2
        exit 1
    fi
    if [[ -z "$MODPROBE_BIN" || ! -x "$MODPROBE_BIN" ]]; then
        echo "ERROR: modprobe not found. Install kmod." >&2
        exit 1
    fi
    echo "==> LUKS test mode: cryptsetup + dm_crypt module ($KVER) + /etc/crypttab"
    mkdir -p "$ROOTFS/etc"
    cat > "$ROOTFS/etc/crypttab" <<'EOF'
root /dev/vda - luks
EOF
    copy_binary_with_libs "$CRYPTSETUP" "$ROOTFS/usr/bin/cryptsetup"
    mkdir -p "$ROOTFS/lib/modules/${KVER}/kernel/drivers/md"
    cp "$DM_CRYPT_MOD" "$ROOTFS/lib/modules/${KVER}/kernel/drivers/md/"
    depmod -b "$ROOTFS" "$KVER" 2>/dev/null || depmod -b "$ROOTFS" "$KVER"
    mkdir -p "$ROOTFS/usr/sbin"
    copy_binary_with_libs "$MODPROBE_BIN" "$ROOTFS/usr/sbin/modprobe"
fi

mkdir -p "$ROOTFS/run/sushi" "$ROOTFS/run/systemd/ask-password"

# Uncompressed cpio: faster kernel unpack at handoff (VM-only tradeoff).
(cd "$ROOTFS" && find . -print0 | cpio --null -o --format=newc) > "$OUT"
echo "==> Wrote $OUT ($(du -h "$OUT" | awk '{print $1}'), uncompressed cpio)"
if [[ "${LUKS:-0}" == "1" ]]; then
    echo "    sushid unlocks LUKS on /dev/vda -> root=/dev/mapper/root -> switch_root"
else
    echo "    sushid mounts root=/dev/vda -> switch_root -> /sbin/init"
fi