#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_REMOVE_VM:-$here/../target/vm}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
image=$image_name-remove-check

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
stage_part boot
cargo build --release --quiet --manifest-path "$luft/packages/system/disks/Cargo.toml" --example other-systems
place 755 "${CARGO_TARGET_DIR:-$luft/target}/release/examples/other-systems" /usr/libexec/luft-other-systems
place 755 "$here/prepare.sh" /usr/libexec/luft-remove-prepare
place 755 "$here/check.sh" /usr/libexec/luft-remove-check
place 644 "$here/luft-remove-prepare.service" /usr/lib/systemd/system/luft-remove-prepare.service
place 644 "$here/luft-remove-check.service" /usr/lib/systemd/system/luft-remove-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-remove-check.rules
size="$(podman image inspect --format '{{.Size}}' "$base")"
printf '[images.default]\nsource = "oci-archive:/run/luft-source/luft.ociarchive"\ntarget = "ghcr.io/lantharos/luft:1"\nsize = %s\n' "$size" |
  install -Dm644 /dev/stdin "$stage/root/usr/lib/luft-installer/install.toml"
build_check_image "$base" "$image-system" "systemctl enable luft-remove-prepare.service luft-remove-check.service"
"$luft/os/image/seal.sh" "$image-system" "$image"
"$luft/apps/setup/installer/vm/source.sh" "$image" "$vm/source.img"
make_root_drive "$image"

rm -f "$vm/drive.img" "$vm/vars.qcow2"
truncate -s 120G "$vm/drive.img"
DRIVES="$vm/drive.img $vm/source.img:ro" boot_root_drive "$vm/prepare.log" 60
expect_in_log "$vm/prepare.log" luft-remove-check PREPARED
rm -f "$vm/root.img" "$vm/source.img"

boot_drive drive.img "$vm/installed.log" 30
expect_in_log "$vm/installed.log" luft-remove-check DONE
