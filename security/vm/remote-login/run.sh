#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_REMOTE_LOGIN_VM:-$luft/target/vm/remote-login}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
forwarded=$((20000 + RANDOM % 20000))

start_stage
bun "$luft/os/image/parts/components/install.ts" "$stage/root" security
place 755 "$here/check.sh" /usr/libexec/luft-remote-login-check
place 644 "$here/luft-remote-login-check.service" /usr/lib/systemd/system/luft-remote-login-check.service
build_check_image "${LUFT_REMOTE_LOGIN_BASE:-$image_name:45}" "$image_name-remote-login-check" \
  "systemctl enable luft-firewall.service luft-remote-login-check.service"
make_root_drive "$image_name-remote-login-check"
relabel_root_drive "$serial.relabel"

CPUS=2 MEMORY=3072 SELINUX="selinux=1 enforcing=1" APPEND="luft.remote-login-check=$forwarded" \
  boot_root_drive "$serial.check" 12 -nic "user,model=virtio-net-pci,hostfwd=tcp:127.0.0.1:$forwarded-:22"
expect_in_log "$serial.check" luft-remote-login-check PASS
