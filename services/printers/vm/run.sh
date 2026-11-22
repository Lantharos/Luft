#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_PRINTERS_VM:-$(dirname "$here")/target/vm}"
base="${LUFT_IMAGE:-localhost/luft:45}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
settings="${KESTREL_SETTINGS:-$luft/target/release/kestrel-settings}"

start_stage
stage_part services
place 755 "$settings" /usr/libexec/kestrel-settings
place 755 "$here/check.sh" /usr/libexec/printers-check
place 755 "$here/session.sh" /usr/libexec/printers-check-session
place 755 "$here/gadget.py" /usr/libexec/printers-check-gadget
place 644 "$here/printers-check.service" /usr/lib/systemd/system/printers-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-printers-check.rules
build_check_image "$base" "$image_name-printers-check" \
  "dnf install -y --setopt=install_weak_deps=False cups-printerapp gutenprint-cups avahi-tools && dnf clean all && systemctl enable printers-check.service"
make_root_drive "$image_name-printers-check"

relabel_root_drive "$vm/relabel.log"
SELINUX="selinux=1 enforcing=1" CPUS=4 MEMORY=4096 boot_root_drive "$serial" 15
expect_in_log "$serial" printers-check "PASS everything"
