#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
installer="$(dirname "$here")"
luft="$(cd "$installer/../../.." && pwd)"
vm="${LUFT_INSTALLER_VM:-$installer/target/vm}"
system=localhost/luft-installer-check-system
image=localhost/luft-installer-check
base="${LUFT_SYSTEM:-localhost/luft-system:45}"
stage="$vm/stage"

if [[ -z "${LUFT_SECUREBOOT_KEY:-}" ]]; then
  keys="$luft/os/image/state/keys"
  export LUFT_SECUREBOOT_KEY="$keys/secureboot.key" LUFT_SECUREBOOT_CERT="$keys/secureboot.crt" LUFT_PCR_KEY="$keys/pcr.key"
fi

place() {
  install -Dm"$1" "$2" "$stage/root$3"
}

cargo build --release --manifest-path "$installer/Cargo.toml"
rm -rf "$stage"
mkdir -p "$stage" "$vm"
place 755 "$installer/target/release/luft-installer" /usr/libexec/luft-installer
place 644 "$installer/data/com.lantharos.Installer1.conf" /usr/share/dbus-1/system.d/com.lantharos.Installer1.conf
place 644 "$installer/data/com.lantharos.Installer1.service" /usr/share/dbus-1/system-services/com.lantharos.Installer1.service
place 644 "$installer/data/luft-installer.service" /usr/lib/systemd/system/luft-installer.service
place 644 "$installer/data/com.lantharos.installer.policy" /usr/share/polkit-1/actions/com.lantharos.installer.policy
place 755 "$here/check.sh" /usr/libexec/luft-installer-check
place 644 "$here/luft-installer-check.service" /usr/lib/systemd/system/luft-installer-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-installer-check.rules
printf 'kargs = ["console=ttyS0,115200"]\n' | install -Dm644 /dev/stdin "$stage/root/usr/lib/bootc/kargs.d/90-check.toml"
size="$(podman image inspect --format '{{.Size}}' "$base")"
printf '[images.default]\nsource = "oci-archive:/run/luft-source/luft.ociarchive"\nsize = %s\n' "$size" |
  install -Dm644 /dev/stdin "$stage/root/usr/lib/luft-installer/install.toml"
cp "$here/Containerfile" "$stage/"
podman build --quiet --build-arg "BASE=$base" --tag "$system" "$stage"
"$luft/os/image/seal.sh" "$system" "$image"

rm -rf "$vm/source" && mkdir -p "$vm/source"
podman save --quiet --format oci-archive --output "$vm/source/luft.ociarchive" "$image"
rm -f "$vm/source.img" "$vm/root.img"
mkfs.ext4 -q -F -L luft-source -d "$vm/source" "$vm/source.img" "$(($(du -sm "$vm/source" | cut -f1) + 512))M"
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

rm -f "$vm/whole.img" "$vm/free.img"
truncate -s 40G "$vm/whole.img"
truncate -s 60G "$vm/free.img"
printf 'label: gpt\nsize=8GiB, type=linux\n' | sfdisk --quiet "$vm/free.img"
mkdir -p "$vm/kept" && echo "still here" > "$vm/kept/kept"
mkfs.ext4 -q -F -E offset=1048576 -d "$vm/kept" "$vm/free.img" 8G

firmware=/usr/share/edk2/ovmf
cp "$firmware/OVMF_VARS.fd" "$vm/vars.fd"
timeout 1h qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 4 -m 6144 -no-reboot -display none \
  -drive "if=pflash,format=raw,readonly=on,file=$firmware/OVMF_CODE.fd" \
  -drive "if=pflash,format=raw,file=$vm/vars.fd" \
  -kernel "$vm/vmlinuz" -initrd "$vm/initramfs.img" \
  -append "root=/dev/vda rw console=ttyS0 selinux=0 systemd.unit=multi-user.target" \
  -drive "file=$vm/root.img,format=raw,if=virtio" \
  -drive "file=$vm/whole.img,format=raw,if=virtio" \
  -drive "file=$vm/free.img,format=raw,if=virtio" \
  -drive "file=$vm/source.img,format=raw,if=virtio,readonly=on" \
  -serial "file:$vm/serial.log"

grep 'luft-installer-check:' "$vm/serial.log"
grep -q 'luft-installer-check: DONE' "$vm/serial.log"

rm -f "$vm/installed.log"
qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 2 -m 4096 -display none \
  -drive "if=pflash,format=raw,readonly=on,file=$firmware/OVMF_CODE.fd" \
  -drive "if=pflash,format=raw,file=$vm/vars.fd" \
  -drive "file=$vm/whole.img,format=raw,if=virtio" \
  -serial "file:$vm/installed.log" &
qemu=$!
for _ in $(seq 180); do
  grep -qa 'login:' "$vm/installed.log" 2> /dev/null && break
  sleep 1
done
kill "$qemu"
wait "$qemu" 2> /dev/null || true
if grep -qa 'login:' "$vm/installed.log"; then
  echo "luft-installer-check: PASS the installed drive starts on its own"
else
  echo "luft-installer-check: FAIL the installed drive didn't start, see $vm/installed.log"
  exit 1
fi
