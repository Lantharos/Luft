#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_GROW_VM:-$here/../../target/vm-grow}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
image=$image_name-grow-check
passphrase='correct horse battery'

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
stage_part boot
cargo build --release --quiet --manifest-path "$luft/packages/system/disks/Cargo.toml" --example other-systems
place 755 "${CARGO_TARGET_DIR:-$luft/target}/release/examples/other-systems" /usr/libexec/luft-other-systems
place 755 "$here/prepare.sh" /usr/libexec/luft-grow-prepare
place 755 "$here/check.sh" /usr/libexec/luft-grow-check
place 644 "$here/luft-grow-prepare.service" /usr/lib/systemd/system/luft-grow-prepare.service
place 644 "$here/luft-grow-check.service" /usr/lib/systemd/system/luft-grow-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-grow-check.rules
size="$(podman image inspect --format '{{.Size}}' "$base")"
printf '[images.default]\nsource = "oci-archive:/run/luft-source/luft.ociarchive"\ntarget = "ghcr.io/lantharos/luft:1"\nsize = %s\n' "$size" |
  install -Dm644 /dev/stdin "$stage/root/usr/lib/luft-installer/install.toml"
build_check_image "$base" "$image-system" "systemctl enable luft-grow-prepare.service luft-grow-check.service"
"$luft/os/image/seal.sh" "$image-system" "$image"
"$luft/apps/system/setup/installer/vm/source.sh" "$image" "$vm/source.img"
make_root_drive "$image"

rm -f "$vm/drive.img" "$vm/vars.qcow2"
truncate -s 120G "$vm/drive.img"
DRIVES="$vm/drive.img $vm/source.img:ro" boot_root_drive "$vm/prepare.log" 60
expect_in_log "$vm/prepare.log" luft-grow-check PREPARED
rm -f "$vm/root.img" "$vm/source.img"

starts() {
  "$here/boot.py" --vm "$vm" --drive "$vm/drive.img" --log "$vm/$1.log" --passphrase "$passphrase" "${@:2}"
}

starts installed --cut "trustd Changing Luft's partition: Leave"
grep -qa "luft-grow-check: MOVING" "$vm/installed.log" && ! grep -qa "luft-grow-check: FAIL" "$vm/installed.log"
starts resumed
expect_in_log "$vm/resumed.log" luft-grow-check DONE
