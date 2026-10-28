#!/usr/bin/env bash
set -euo pipefail

check="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$check/../../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${PASSKEYS_VM:-$luft/kestrel/run/passkeys-vm}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
stage_fingerprint_reader
for file in index.html serve.py firefox-user.js; do
  place 644 "$check/$file" "/usr/share/passkeys-check/$file"
done
build_check_image "$base" "$image_name-passkeys-check" "dnf install -y --setopt=install_weak_deps=False chromium firefox && \
  dnf clean all && systemctl enable luft-vm-fingerprint.service && systemctl mask fprintd.service"
make_check_disk "$image_name-passkeys-check"
echo "The passkeys test machine is ready in $vm"
