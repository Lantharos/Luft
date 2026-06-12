#!/usr/bin/env bash
# Build an initramfs with relayd (omits plymouth).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/vm/initramfs-relay.img}"
KVER="${KVER:-$(uname -r)}"
STAGING="$ROOT/vm/staging"

echo "==> Staging relay install"
rm -rf "$STAGING"
DESTDIR="$STAGING" "$ROOT/scripts/build.sh"

echo "==> Installing relayd + dracut module to system paths (requires sudo)"
sudo install -D -m0755 "$ROOT/target/release/relayd" /usr/local/bin/relayd
sudo install -D -m0755 "$ROOT/target/release/relayctl" /usr/local/bin/relayctl
sudo rm -rf /usr/lib/dracut/modules.d/90relay
sudo cp -a "$ROOT/initramfs/dracut/90relay" /usr/lib/dracut/modules.d/90relay
sudo chmod +x /usr/lib/dracut/modules.d/90relay/module-setup.sh
sudo chmod +x /usr/lib/dracut/modules.d/90relay/relay-efi-state.sh

echo "==> dracut: relay initramfs (no plymouth, no hostonly)"
sudo dracut --force --no-hostonly --no-hostonly-cmdline \
    --omit "plymouth" \
    --add "relay systemd systemd-initrd bash" \
    --install /usr/local/bin/relayd \
    --install /usr/local/bin/relayctl \
    "$OUT" "$KVER"

echo "==> Initramfs: $OUT ($(du -h "$OUT" | awk '{print $1}'))"