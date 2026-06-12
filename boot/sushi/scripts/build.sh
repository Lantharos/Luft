#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROFILE="${PROFILE:-release}"

echo "==> Building relay workspace (${PROFILE})"
cargo build --workspace --exclude relayboot --profile "$PROFILE"

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
install -d "${DESTDIR}/usr/lib/relay/themes/default"
install -d "${DESTDIR}/etc/relay"
install -d "${DESTDIR}/usr/lib/dracut/modules.d/90relay"

install -m 0755 "$BIN_DIR/relayd" "${DESTDIR}/usr/bin/relayd"
install -m 0755 "$BIN_DIR/relayctl" "${DESTDIR}/usr/bin/relayctl"
install -m 0644 "$ROOT/themes/default/logo.txt" "${DESTDIR}/usr/lib/relay/themes/default/logo.txt"
install -m 0644 "$ROOT/initramfs/dracut/90relay/relay.conf" "${DESTDIR}/etc/relay/relay.conf"

cp -a "$ROOT/initramfs/dracut/90relay/." "${DESTDIR}/usr/lib/dracut/modules.d/90relay/"

if command -v rustup >/dev/null 2>&1; then
    if rustup target list --installed | grep -q x86_64-unknown-uefi; then
        echo "==> Building RelayBoot.efi"
        cargo build -p relayboot --profile "$PROFILE" \
            -Z build-std=core,alloc \
            -Z build-std-features=compiler-builtins-mem 2>/dev/null \
            || echo "RelayBoot.efi build skipped (install uefi target: rustup target add x86_64-unknown-uefi)"
        if [[ -f "target/x86_64-unknown-uefi/${PROFILE}/relayboot.efi" ]]; then
            install -d "${DESTDIR}/usr/lib/relay/efi"
            install -m 0644 "target/x86_64-unknown-uefi/${PROFILE}/relayboot.efi" \
                "${DESTDIR}/usr/lib/relay/efi/RelayBoot.efi"
        fi
    fi
fi

echo "==> Done"
echo "    dracut: omit plymouth, add relay — then dracut -f"
echo "    cmdline: rd.relay=1 (default on when module installed)"