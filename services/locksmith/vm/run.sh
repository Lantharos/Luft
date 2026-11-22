#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_LOCKSMITH_VM:-$luft/target/vm/locksmith}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"

setup="useradd -m -u 1000 mara && useradd -m checker \
  && systemctl enable locksmith.service locksmith.path trustd-policy.path locksmith-check.service"

start_stage
if from_this_tree; then
  bun "$luft/os/image/parts/components/install.ts" "$stage/root" services/locksmith kestrel/greeter security
  setup="semodule -i /usr/share/selinux/packages/luft/luft-greeter.cil && $setup"
fi
place 755 "$here/check.sh" /usr/libexec/locksmith-check
place 644 "$here/locksmith-check.service" /usr/lib/systemd/system/locksmith-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/90-locksmith-check.rules
build_check_image "$(base_image)" "$image_name-locksmith-check" "$setup"
make_root_drive "$image_name-locksmith-check"
relabel_root_drive "$serial.relabel"

CPUS=2 MEMORY=3072 SELINUX="selinux=1 enforcing=1" boot_root_drive "$serial" 10
expect_in_log "$serial" locksmith-check "PASS everything"
