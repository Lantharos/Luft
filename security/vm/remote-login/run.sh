#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_REMOTE_LOGIN_VM:-$luft/target/vm/remote-login}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
forwarded=$((20000 + RANDOM % 20000))

setup="systemctl enable luft-firewall.service luft-remote-login-check.service"

start_stage
if from_this_tree; then
  bun "$luft/os/image/parts/components/install.ts" "$stage/root" security
  setup="semodule -i /usr/share/selinux/packages/luft-remote-login.cil && $setup"
fi
place 755 "$here/check.sh" /usr/libexec/luft-remote-login-check
place 644 "$here/luft-remote-login-check.service" /usr/lib/systemd/system/luft-remote-login-check.service
build_check_image "$(base_image)" "$image_name-remote-login-check" "$setup"
make_root_drive "$image_name-remote-login-check"
relabel_root_drive "$serial.relabel"

boot_check() {
  CPUS=2 MEMORY=3072 SELINUX="selinux=1 enforcing=1" APPEND="luft.remote-login-check=$forwarded" \
    boot_root_drive "$serial.$1" "$2" -nic "user,model=virtio-net-pci,hostfwd=tcp:127.0.0.1:$forwarded-:22"
  expect_in_log "$serial.$1" luft-remote-login-check "$3"
}

boot_check first 12 "PASS first"
boot_check went-back 6 "PASS went-back"
boot_check on-at-start 6 "PASS on-at-start"
