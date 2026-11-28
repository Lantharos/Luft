#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_SIGN_IN_VM:-$luft/target/vm/sign-in}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
serial="$vm/serial.log"
kestrel_build="${KESTREL_BUILD:-$luft/kestrel/build}"
card_pin=12345678

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

setup="semodule -i /usr/share/selinux/packages/luft/luft-sign-in.cil && dnf install -y -q pcsc-lite pcsc-lite-ccid opensc python3-cryptography && dnf clean all \
  && chgrp luft-keyring /usr/libexec/luft-keyring && chmod 2755 /usr/libexec/luft-keyring \
  && systemctl enable sign-in-check.service luft-sign-in.socket pcscd.socket portguard.service \
  && mkdir -p /var/roothome"

start_stage
if from_this_tree; then
  bun "$luft/os/image/parts/components/install.ts" "$stage/root" security kestrel/keyring
  place 755 "$kestrel_build/src/authenticate/kestrel-authenticate" /usr/libexec/kestrel-authenticate
  place 755 "$kestrel_build/src/authenticate/pam_kestrel_sign_in.so" /usr/lib64/security/pam_kestrel_sign_in.so
fi
for script in "$here"/guest/*.py; do
  place 755 "$script" "/usr/libexec/sign-in-check/$(basename "$script")"
done
place 644 "$here/guest/sign-in-check.service" /usr/lib/systemd/system/sign-in-check.service
place 644 "$here/guest/sign-in-authenticator.service" /usr/lib/systemd/system/sign-in-authenticator.service
place 644 "$here/guest/49-sign-in-check.rules" /etc/polkit-1/rules.d/49-sign-in-check.rules
printf '[terminal]\nvt = 7\n\n[default_session]\ncommand = "/usr/bin/sleep infinity"\nuser = "greetd"\n' |
  install -Dm644 /dev/stdin "$stage/root/etc/greetd/config.toml"
build_check_image "$base" "$image_name-sign-in-check" "$setup"
make_check_disk "$image_name-sign-in-check"
"$here/card.sh" "$vm/card" "$card_pin"

rm -f "$serial"
python3 "$here/plug.py" "$vm" "$serial" "$vm/card" &
plugging=$!
DISK="$vm/disk.qcow2" TPM=0 NETWORK=0 HEADLESS=1 MEMORY=4096 SERIAL="$serial" TIMEOUT=1200 LUFT_VM="$vm" \
  "$luft/os/vm/qemu.sh" \
  -device "piix3-usb-uhci,id=check" \
  -device "usb-ccid,bus=check.0,port=2,id=reader" \
  -device "ccid-card-emulated,backend=certificates,db=sql:$vm/card,cert1=authentication,cert2=signing,cert3=encryption,id=card,bus=reader.0" || true
kill "$plugging" 2>/dev/null || true
expect_in_log "$serial" sign-in-check "DONE passed=[0-9]* failed=0"
