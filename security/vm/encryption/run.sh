#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_ENCRYPTION_VM:-$luft/target/vm/encryption}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
image=$image_name-encryption-check

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
bun "$luft/os/image/parts/components/install.ts" "$stage/root" security
place 644 "$here/policy.toml" /usr/share/luft/policy.d/10-encryption-check.toml
build_check_image "$base" "$image-system" true
"$luft/os/image/seal.sh" "$image-system" "$image"
LUFT_VM="$vm" "$luft/os/vm/disk.sh" "$image"
python3 "$luft/os/vm/check.py" --vm "$vm" --minutes 30 encryption
