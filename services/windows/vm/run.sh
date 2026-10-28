#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_WINDOWS_VM:-$(dirname "$here")/target/vm}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"

start_stage
stage_part services
cargo run --quiet --manifest-path "$luft/packages/system/windows/Cargo.toml" --features testing --example fake-windows -- \
  "$stage/root/usr/lib/luft-windows-check/fake-windows"
place 755 "$here/check.sh" /usr/libexec/luft-windows-check
place 644 "$here/luft-windows-check.service" /usr/lib/systemd/system/luft-windows-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-windows-check.rules
build_check_image "$image_name:45" "$image_name-windows-check" "systemctl enable luft-windows-check.service"
make_root_drive "$image_name-windows-check"

rm -f "$vm/windows.img"
truncate -s 4G "$vm/windows.img"
CPUS=2 MEMORY=3072 DRIVES="$vm/windows.img" boot_root_drive "$vm/serial.log" 15 -device intel-hda -device hda-duplex
expect_in_log "$vm/serial.log" luft-windows-check DONE
