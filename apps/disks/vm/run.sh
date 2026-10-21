#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
vm="${LUFT_REMOVE_VM:-$here/../target/vm}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
base="${LUFT_SYSTEM:-$image_name-system:45}"
system=$image_name-remove-check-system
image=$image_name-remove-check
stage="$vm/stage"
firmware=/usr/share/edk2/ovmf

# shellcheck source=os/image/throwaway-keys.sh
source "$luft/os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$base"

place() {
  install -Dm"$1" "$2" "$stage/root$3"
}

mkdir -p "$vm"
vm="$(cd "$vm" && pwd)"
rm -rf "$stage"
LIBEXECDIR=/usr/libexec "$luft/security/scripts/build.sh" "$stage/root"
cargo build --release --quiet --manifest-path "$luft/packages/disks/Cargo.toml" --example other-systems
place 755 "${CARGO_TARGET_DIR:-$luft/target}/release/examples/other-systems" /usr/libexec/luft-other-systems
place 755 "$here/prepare.sh" /usr/libexec/luft-remove-prepare
place 755 "$here/check.sh" /usr/libexec/luft-remove-check
place 644 "$here/luft-remove-prepare.service" /usr/lib/systemd/system/luft-remove-prepare.service
place 644 "$here/luft-remove-check.service" /usr/lib/systemd/system/luft-remove-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-remove-check.rules
printf 'kargs = ["console=ttyS0,115200"]\n' | install -Dm644 /dev/stdin "$stage/root/usr/lib/bootc/kargs.d/90-check.toml"
size="$(podman image inspect --format '{{.Size}}' "$base")"
printf '[images.default]\nsource = "oci-archive:/run/luft-source/luft.ociarchive"\nsize = %s\n' "$size" |
  install -Dm644 /dev/stdin "$stage/root/usr/lib/luft-installer/install.toml"
cp "$here/Containerfile" "$stage/"
podman build --quiet --build-arg "BASE=$base" --tag "$system" "$stage" > /dev/null
"$luft/os/image/seal.sh" "$system" "$image"

rm -rf "$vm/source" && mkdir -p "$vm/source/windows"
podman save --quiet --format oci-archive --output "$vm/source/luft.ociarchive" "$image"
"$luft/apps/setup/installer/vm/windows-hive.py" "$vm/source/windows/SYSTEM"
rm -f "$vm/source.img" "$vm/root.img" "$vm/drive.img"
mkfs.ext4 -q -F -L luft-source -d "$vm/source" "$vm/source.img" "$(($(du -sm "$vm/source" | cut -f1) + 512))M"
rm -rf "$vm/source"
podman unshare sh -c "
  set -e
  tree=\$(podman image mount '$image')
  mkfs.ext4 -q -F -L luft-check-root -d \"\$tree\" '$vm/root.img' 16G
  cp \"\$tree\"/usr/lib/modules/*/vmlinuz '$vm/vmlinuz'
  cp \"\$tree\"/boot/EFI/Linux/*.efi '$vm/startup.efi'
  chmod 644 '$vm/vmlinuz' '$vm/startup.efi'
  podman image unmount '$image' > /dev/null
"
objcopy -O binary --only-section=.initrd "$vm/startup.efi" "$vm/initramfs.img"
truncate -s 120G "$vm/drive.img"
cp "$firmware/OVMF_VARS.fd" "$vm/vars.fd"

rm -f "$vm/prepare.log"
timeout 1h qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 4 -m 6144 -no-reboot -display none \
  -drive "if=pflash,format=raw,readonly=on,file=$firmware/OVMF_CODE.fd" \
  -drive "if=pflash,format=raw,file=$vm/vars.fd" \
  -kernel "$vm/vmlinuz" -initrd "$vm/initramfs.img" \
  -append "root=/dev/vda rw console=ttyS0 selinux=0 systemd.unit=multi-user.target" \
  -drive "file=$vm/root.img,format=raw,if=virtio" \
  -drive "file=$vm/drive.img,format=raw,if=virtio" \
  -drive "file=$vm/source.img,format=raw,if=virtio,readonly=on" \
  -serial "file:$vm/prepare.log"
grep -a 'luft-remove-check:' "$vm/prepare.log"
grep -qa 'luft-remove-check: PREPARED' "$vm/prepare.log"
rm -f "$vm/root.img" "$vm/source.img"

rm -f "$vm/installed.log"
timeout 30m qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 4 -m 4096 -display none \
  -drive "if=pflash,format=raw,readonly=on,file=$firmware/OVMF_CODE.fd" \
  -drive "if=pflash,format=raw,file=$vm/vars.fd" \
  -drive "file=$vm/drive.img,format=raw,if=virtio" \
  -serial "file:$vm/installed.log"
grep -a 'luft-remove-check:' "$vm/installed.log"
grep -qa 'luft-remove-check: DONE' "$vm/installed.log"
