#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROFILE="${PROFILE:-release}"

echo "==> Building sushi workspace (${PROFILE})"
cargo build --workspace --exclude sushiboot --profile "$PROFILE"

if [[ -d "target/${PROFILE}" ]]; then
    BIN_DIR="target/${PROFILE}"
else
    BIN_DIR="target/$(uname -m)-unknown-linux-gnu/${PROFILE}"
fi

if [[ -z "${DESTDIR:-}" ]]; then
    echo "==> Build complete (set DESTDIR=... or sudo make install to install)"
    exit 0
fi

install -d "${DESTDIR}/usr/bin"
install -d "${DESTDIR}/usr/lib/sushi/themes/default"
install -d "${DESTDIR}/etc/sushi"
install -d "${DESTDIR}/usr/lib/dracut/modules.d/90sushi"

install -m 0755 "$BIN_DIR/sushid" "${DESTDIR}/usr/bin/sushid"
install -m 0755 "$BIN_DIR/sushictl" "${DESTDIR}/usr/bin/sushictl"
install -m 0644 "$ROOT/themes/default/logo.txt" "${DESTDIR}/usr/lib/sushi/themes/default/logo.txt"
install -m 0644 "$ROOT/initramfs/dracut/90sushi/sushi.conf" "${DESTDIR}/etc/sushi/sushi.conf"

cp -a "$ROOT/initramfs/dracut/90sushi/." "${DESTDIR}/usr/lib/dracut/modules.d/90sushi/"

if command -v rustup >/dev/null 2>&1; then
    if rustup target list --installed | grep -q x86_64-unknown-uefi; then
        echo "==> Building SushiBoot.efi"
        cargo build -p sushiboot --profile "$PROFILE" \
            -Z build-std=core,alloc \
            -Z build-std-features=compiler-builtins-mem 2>/dev/null \
            || echo "SushiBoot.efi build skipped (install uefi target: rustup target add x86_64-unknown-uefi)"
        if [[ -f "target/x86_64-unknown-uefi/${PROFILE}/sushiboot.efi" ]]; then
            install -d "${DESTDIR}/usr/lib/sushi/efi"
            install -m 0644 "target/x86_64-unknown-uefi/${PROFILE}/sushiboot.efi" \
                "${DESTDIR}/usr/lib/sushi/efi/SushiBoot.efi"
        fi
    fi
fi

echo "==> Done"
echo "    dracut: omit plymouth, add sushi — then dracut -f"
echo "    cmdline: rd.sushi=1 (default on when module installed)"