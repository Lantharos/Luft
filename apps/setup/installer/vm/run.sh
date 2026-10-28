#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
installer="$(dirname "$here")"
luft="$(cd "$installer/../../.." && pwd)"
# shellcheck source=os/vm/check.sh
source "$luft/os/vm/check.sh" "${LUFT_INSTALLER_VM:-$installer/target/vm}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
image=$image_name-installer-check
carried="${LUFT_STICK_IMAGE:-default}"

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

start_stage
stage_part services
place 755 "$here/check.sh" /usr/libexec/luft-installer-check
place 644 "$here/luft-installer-check.service" /usr/lib/systemd/system/luft-installer-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-installer-check.rules
size="$(podman image inspect --format '{{.Size}}' "$base")"
followed=ghcr.io/lantharos/luft:1
[[ "$carried" != nvidia ]] || followed+=-nvidia
printf '[images.%s]\nsource = "oci-archive:/run/luft-source/luft.ociarchive"\ntarget = "%s"\nsize = %s\n' "$carried" "$followed" "$size" |
  install -Dm644 /dev/stdin "$stage/root/usr/lib/luft-installer/install.toml"
build_check_image "$base" "$image-system" "systemctl enable luft-installer-check.service"
"$luft/os/image/seal.sh" "$image-system" "$image"
"$here/source.sh" "$image" "$vm/source.img"
make_root_drive "$image"

rm -f "$vm/whole.img" "$vm/free.img" "$vm/windows.img" "$vm/vars.qcow2"
truncate -s 40G "$vm/whole.img"
truncate -s 80G "$vm/windows.img"
truncate -s 60G "$vm/free.img"
printf 'label: gpt\nsize=8GiB, type=linux\n' | sfdisk --quiet "$vm/free.img"
mkdir -p "$vm/kept" && echo "still here" > "$vm/kept/kept"
mkfs.ext4 -q -F -E offset=1048576 -d "$vm/kept" "$vm/free.img" 8G

DRIVES="$vm/whole.img $vm/free.img $vm/source.img:ro $vm/windows.img" boot_root_drive "$vm/serial.log" 60
expect_in_log "$vm/serial.log" luft-installer-check DONE

starts() {
  local drive="$1" what="$2" log="$vm/installed-$1.log"
  rm -f "$log" "$vm/qemu.pid"
  DISK="$vm/$drive.img" TPM=0 NETWORK=0 HEADLESS=1 CPUS=2 MEMORY=4096 SERIAL="$log" LUFT_VM="$vm" "$luft/os/vm/qemu.sh" &
  local qemu=$!
  for _ in $(seq 180); do
    grep -qa 'login:' "$log" 2> /dev/null && break
    sleep 1
  done
  kill "$(cat "$vm/qemu.pid")"
  wait "$qemu" 2> /dev/null || true
  if grep -qa 'login:' "$log"; then
    echo "luft-installer-check: PASS $what starts on its own"
  else
    echo "luft-installer-check: FAIL $what didn't start, see $log"
    exit 1
  fi
}

starts whole "the installed drive"
starts windows "Luft next to Windows"
