#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_PACKAGES_VM:-$luft/target/vm/system-packages}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
serial="$vm/serial.log"

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
(cd "$luft" && bun os/image/parts/components/install.ts "$stage/root" services/packages)
podman run --rm --network host --security-opt label=disable --volume "$here:/check:ro" --volume "$stage/root:/out" "$base" \
  /check/scriptlets.sh /out "$FEDORA"
place 755 "$here/check.sh" /usr/libexec/luft-system-packages-check
place 644 "$here/luft-system-packages-check.service" /usr/lib/systemd/system/luft-system-packages-check.service
build_check_image "$base" "$image_name-system-packages-check" "systemctl enable luft-system-packages-check.service"
make_check_disk "$image_name-system-packages-check"

rm -f "$serial"
DISK="$vm/disk.qcow2" TPM=0 HEADLESS=1 MEMORY=4096 SERIAL="$serial" TIMEOUT=2400 LUFT_VM="$vm" \
  "$luft/os/vm/qemu.sh" || true
expect_in_log "$serial" luft-system-packages-check "PASS everything"
