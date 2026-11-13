#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_HEADLESS_VM:-$luft/target/vm-headless}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
image=$image_name-headless-check

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
stage_part boot
place 755 "$here/check.sh" /usr/libexec/luft-headless-check
place 644 "$here/luft-headless-check.service" /usr/lib/systemd/system/luft-headless-check.service
place 644 "$here/luft-headless-driver.service" /usr/lib/systemd/system/luft-headless-driver.service
place 644 "$here/90-headless-check.rules" /usr/lib/udev/rules.d/90-headless-check.rules
printf 'omit_drivers+=" virtio_gpu "\n' | install -Dm644 /dev/stdin "$stage/root/usr/lib/dracut/dracut.conf.d/90-headless-check.conf"
printf 'blacklist virtio_gpu\n' | install -Dm644 /dev/stdin "$stage/root/usr/lib/modprobe.d/90-headless-check.conf"
build_check_image "$base" "$image-system" "systemctl enable luft-headless-driver.service luft-headless-check.service"
"$luft/os/image/seal.sh" "$image-system" "$image"
make_root_drive "$image"

no_display="sushi systemd.unit=graphical.target initcall_blacklist=sysfb_init video=Virtual-1:d"
starts() {
  APPEND="$no_display $2" boot_root_drive "$vm/$1.log" 10
  expect_in_log "$vm/$1.log" luft-headless-check DONE
}

starts driver-before-login-screen ""
starts driver-after-login-screen "luft-headless-check.late-driver"
