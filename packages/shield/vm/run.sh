#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_SHIELD_VM:-$luft/target/vm/shield}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
environment="$luft/kestrel/engine/src/environment"
setup="systemctl enable usr.mount luft-shield-check.service && useradd --create-home --uid 1000 mara && echo mara:luft-vm | chpasswd"

start_stage
if from_this_tree; then
  launch_flags=()
  for list in "$environment/allowed.list" "$environment/development.list" "$luft/packages/identity/unsafe.list"; do
    name=$(basename "$list" .list)
    launch_flags+=("-DLUFT_${name^^}_ENVIRONMENT=\"$(tr -s '[:space:]' ' ' <"$list" | sed 's/ $//')\"")
  done
  cc -O2 -o "$vm/luft-launch" "${launch_flags[@]}" "$environment/environment.c" "$environment/luft-launch.c"
  bun "$luft/os/image/parts/components/install.ts" "$stage/root" kestrel/keyring
  place 755 "$vm/luft-launch" /usr/libexec/luft-launch
  place 644 "$luft/os/image/stages/finalize.sh" /usr/share/luft-shield-check/finalize.sh
  setup="bash -c 'source /usr/share/luft-shield-check/finalize.sh && shield_helpers /' && $setup"
fi
place 644 "$luft/kestrel/keyring/tools/session/prompter.py" /usr/share/luft-shield-check/prompter.py
place 755 "$here/check.sh" /usr/libexec/luft-shield-check
place 644 "$here/luft-shield-check.service" /usr/lib/systemd/system/luft-shield-check.service
place 644 "$here/usr.mount" /usr/lib/systemd/system/usr.mount
build_check_image "$(base_image)" "$image_name-shield-check" "$setup"
make_root_drive "$image_name-shield-check"

CPUS=2 MEMORY=3072 boot_root_drive "$serial" 10
expect_in_log "$serial" luft-shield-check "PASS everything"
