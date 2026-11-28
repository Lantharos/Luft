#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_SWAP_VM:-$luft/target/vm/swap}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
serial="$vm/serial.log"
fixtures=/usr/libexec/luft-memory-check

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
place 755 "$here/hog.py" "$fixtures/hog.py"
place 644 "$luft/kestrel/tools/fixtures/clients/wayland/client.py" "$fixtures/client.py"
place 755 "$here/plain.sh" /usr/libexec/luft-swap-plain-check
place 644 "$here/luft-swap-plain-check.service" /usr/lib/systemd/system/luft-swap-plain-check.service
build_check_image "$image_name:45" "$image_name-swap-plain-check" "systemctl enable luft-swap-plain-check.service"
make_root_drive "$image_name-swap-plain-check"
relabel_root_drive "$serial"
SELINUX="selinux=1 enforcing=1" APPEND="luft.swap-check=plain" boot_root_drive "$serial" 5
expect_in_log "$serial" luft-swap-check "PASS"

build_check_image "$base" "$image_name-swap-check" true
VM_ENCRYPTED=1 make_check_disk "$image_name-swap-check"
MEMORY=6144 python3 "$luft/os/vm/check.py" --vm "$vm" --minutes 75 memory
