#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_USB_VM:-$luft/target/vm/usb}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
serial="$vm/serial.log"
initramfs=/usr/lib/modules/portguard-check.img

setup="useradd -m checker && systemctl enable portguard.service portguard-check.service \
  && mkdir -p /var/roothome && dracut --quiet --force --no-hostonly --kver \"\$(ls /usr/lib/modules)\" $initramfs"

start_stage
if from_this_tree; then
  bun "$luft/os/image/parts/components/install.ts" "$stage/root" security
fi
place 755 "$here/check.sh" /usr/libexec/portguard-check
place 644 "$here/portguard-check.service" /usr/lib/systemd/system/portguard-check.service
build_check_image "$(base_image)" "$image_name-usb-check" "$setup"
make_root_drive "$image_name-usb-check"
podman unshare sh -c "
  tree=\$(podman image mount '$image_name-usb-check')
  cp \"\$tree$initramfs\" '$vm/initramfs.img'
  podman image unmount '$image_name-usb-check' > /dev/null
"
relabel_root_drive "$serial.relabel"

for stick in stick-a stick-b stick-c stick-d; do
  truncate -s 16M "$vm/$stick.img"
done

controller=(-device "qemu-xhci,id=check,p2=8,p3=8" -device "usb-kbd,bus=check.0,port=1,id=keyboard-a,serial=KBDA")
before_start=(-drive "if=none,id=stick-d,format=raw,file=$vm/stick-d.img" -device "usb-storage,bus=check.0,port=2,drive=stick-d,serial=STICKD")

boot() {
  local boot="$1"
  shift
  python3 "$here/plug.py" "$vm" "$serial.$boot" "$vm" &
  local plugging=$!
  CPUS=2 MEMORY=3072 SELINUX="selinux=1 enforcing=1" APPEND="portguard.check=$boot" \
    boot_root_drive "$serial.$boot" 10 "${controller[@]}" "$@"
  kill "$plugging" 2>/dev/null || true
  expect_in_log "$serial.$boot" portguard-check "PASS $boot"
}

boot first
boot second "${before_start[@]}"
