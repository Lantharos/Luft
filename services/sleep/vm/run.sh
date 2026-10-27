#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
service="$(dirname "$here")"
vm="${LUFT_SLEEP_VM:-$service/target/vm}"
image=localhost/luft-sleep-check
base="${LUFT_IMAGE:-localhost/luft:45}"
stage="$vm/stage"
serial="$vm/serial.log"

place() {
  install -Dm"$1" "$2" "$stage/root$3"
}

cargo build --release --manifest-path "$service/Cargo.toml"
release="${CARGO_TARGET_DIR:-$luft/target}/release"
rm -rf "$stage"
mkdir -p "$stage" "$vm"
place 755 "$release/luft-sleep" /usr/libexec/luft-sleep
place 644 "$service/data/com.lantharos.Sleep1.conf" /usr/share/dbus-1/system.d/com.lantharos.Sleep1.conf
place 644 "$service/data/com.lantharos.Sleep1.service" /usr/share/dbus-1/system-services/com.lantharos.Sleep1.service
place 644 "$service/data/luft-sleep.service" /usr/lib/systemd/system/luft-sleep.service
place 644 "$service/data/luft-sleep-power-off.service" /usr/lib/systemd/system/luft-sleep-power-off.service
place 644 "$service/data/systemd-suspend-luft.conf" /usr/lib/systemd/system/systemd-suspend.service.d/luft-sleep.conf
place 644 "$service/data/com.lantharos.sleep.policy" /usr/share/polkit-1/actions/com.lantharos.sleep.policy
place 755 "$here/check.sh" /usr/libexec/luft-sleep-check
place 644 "$here/luft-sleep-check.service" /usr/lib/systemd/system/luft-sleep-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-sleep-check.rules
cp "$here/Containerfile" "$stage/"
podman build --quiet --build-arg "BASE=$base" --tag "$image" "$stage" > /dev/null

rm -f "$vm/root.img"
podman unshare sh -c "
  set -e
  tree=\$(podman image mount '$image')
  mkfs.ext4 -q -F -L luft-sleep-check -d \"\$tree\" '$vm/root.img' 16G
  cp \"\$tree\"/boot/EFI/Linux/*.efi '$vm/startup.efi'
  cp \"\$tree\"/usr/lib/luft-sleep-check/initramfs.img '$vm/initramfs.img'
  chmod 644 '$vm/startup.efi' '$vm/initramfs.img'
  podman image unmount '$image' > /dev/null
"
objcopy -O binary --only-section=.linux "$vm/startup.efi" "$vm/vmlinuz"

boot() {
  rm -f "$serial"
  timeout 10m qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 2 -m 3072 -no-reboot -display none \
    -global ICH9-LPC.disable_s3=0 \
    -kernel "$vm/vmlinuz" -initrd "$vm/initramfs.img" \
    -append "root=/dev/vda rw console=ttyS0 selinux=0 systemd.unit=multi-user.target mem_sleep_default=deep $1" \
    -drive "file=$vm/root.img,format=raw,if=virtio" \
    -serial "file:$serial"
  grep -a 'luft-sleep-check:' "$serial"
  if grep -qa 'luft-sleep-check: FAIL' "$serial"; then exit 1; fi
}

boot ""
boot luft.sleep-check=long
grep -qa 'shutting down instead of sleeping on' "$serial"
grep -qa 'luft-sleep-check: logind .*PrepareForShutdown (true' "$serial"
