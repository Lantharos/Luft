#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_MOVE_VM:-$here/../../target/vm-move}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
image=$image_name-move-check
passphrase='correct horse battery'
drives="$vm/sata.img:sata $vm/nvme.img:nvme $vm/empty.img:nvme"

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
stage_part boot
cargo build --release --quiet --manifest-path "$luft/packages/system/disks/Cargo.toml" --example other-systems
place 755 "${CARGO_TARGET_DIR:-$luft/target}/release/examples/other-systems" /usr/libexec/luft-other-systems
place 755 "$here/prepare.sh" /usr/libexec/luft-move-prepare
place 755 "$here/check.sh" /usr/libexec/luft-move-check
place 755 "$here/flatpak.sh" /usr/libexec/luft-move-flatpak
place 644 "$here/luft-move-prepare.service" /usr/lib/systemd/system/luft-move-prepare.service
place 644 "$here/luft-move-check.service" /usr/lib/systemd/system/luft-move-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-move-check.rules
printf 'kargs = ["systemd.journald.forward_to_console=1"]\n' | install -Dm644 /dev/stdin "$stage/root/usr/lib/bootc/kargs.d/91-move-check.toml"
size="$(podman image inspect --format '{{.Size}}' "$base")"
printf '[images.default]\nsource = "oci-archive:/run/luft-source/luft.ociarchive"\ntarget = "ghcr.io/lantharos/luft:1"\nsize = %s\n' "$size" |
  install -Dm644 /dev/stdin "$stage/root/usr/lib/luft-installer/install.toml"
build_check_image "$base" "$image-system" "systemctl enable luft-move-prepare.service luft-move-check.service"
"$luft/os/image/seal.sh" "$image-system" "$image"
"$luft/apps/system/setup/installer/vm/source.sh" "$image" "$vm/source.img"
make_root_drive "$image"

rm -rf "$vm/sata.img" "$vm/nvme.img" "$vm/empty.img" "$vm"/vars.* "$vm/tpm"
truncate -s 120G "$vm/sata.img"
truncate -s 100G "$vm/nvme.img"
truncate -s 80G "$vm/empty.img"
TPM=2 DRIVES="$drives $vm/source.img:ro" boot_root_drive "$vm/prepare.log" 60
expect_in_log "$vm/prepare.log" luft-move-check PREPARED
rm -f "$vm/root.img" "$vm/source.img"

starts() {
  "$here/../boot.py" --vm "$vm" --drives "$drives" --tpm 2 --log "$vm/$1.log" --check luft-move-check \
    --passphrase "$passphrase" --minutes 120 "${@:2}"
}

starts cut --cut "Moving Luft: 30%"
grep -qa "luft-move-check: MOVING" "$vm/cut.log" && ! grep -qa "luft-move-check: FAIL" "$vm/cut.log"
starts moved
expect_in_log "$vm/moved.log" luft-move-check DONE
