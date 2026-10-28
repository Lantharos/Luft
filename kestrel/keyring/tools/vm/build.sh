#!/usr/bin/env bash
set -euo pipefail

keyring="$(cd "$(dirname "$0")/../.." && pwd)"
luft="$(cd "$keyring/../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${KEYRING_VM:-$luft/kestrel/run/keyring-vm}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
settings=/usr/lib/sabine/com.lantharos.settings/settings

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
stage_fingerprint_reader
for script in "$keyring"/tools/vm/guest/*.py "$keyring"/tools/vm/guest/greeter.sh "$keyring"/tools/session/prompter.py; do
  place 755 "$script" "/usr/libexec/keyring-check/$(basename "$script")"
done
place 644 "$keyring/tools/vm/guest/keyring-check.service" /usr/lib/systemd/system/keyring-check.service
printf '[terminal]\nvt = 7\n\n[default_session]\ncommand = "/usr/libexec/keyring-check/greeter.sh"\nuser = "greetd"\n' |
  install -Dm644 /dev/stdin "$stage/root/etc/greetd/config.toml"
build_check_image "$base" "$image_name-keyring-check" "systemctl enable keyring-check.service luft-vm-fingerprint.service && \
  systemctl mask fprintd.service && install -Dm755 \"\$(readlink -f /usr/bin/python3)\" $settings"
make_check_disk "$image_name-keyring-check"
echo "The keyring test machine is ready in $vm"
