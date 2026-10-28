#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_SLEEP_VM:-$(dirname "$here")/target/vm}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"

start_stage
stage_part services
place 755 "$here/check.sh" /usr/libexec/luft-sleep-check
place 644 "$here/luft-sleep-check.service" /usr/lib/systemd/system/luft-sleep-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-sleep-check.rules
build_check_image "$image_name:45" "$image_name-sleep-check" "systemctl enable luft-sleep-check.service"
make_root_drive "$image_name-sleep-check"

BIOS=1 CPUS=2 MEMORY=3072 APPEND="mem_sleep_default=deep" boot_root_drive "$serial" 10 -global ICH9-LPC.disable_s3=0
expect_in_log "$serial" luft-sleep-check "PASS sleeps as usual"
BIOS=1 CPUS=2 MEMORY=3072 APPEND="mem_sleep_default=deep luft.sleep-check=long" boot_root_drive "$serial" 10 -global ICH9-LPC.disable_s3=0
expect_in_log "$serial" luft-sleep-check "SLEEPING long"
grep -qa 'shutting down instead of sleeping on' "$serial"
grep -qa 'luft-sleep-check: logind .*PrepareForShutdown (true' "$serial"
