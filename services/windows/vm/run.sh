#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
service="$(dirname "$here")"
vm="${LUFT_WINDOWS_VM:-$service/target/vm}"
image=localhost/luft-windows-check
base="${LUFT_IMAGE:-localhost/luft:45}"
stage="$vm/stage"

place() {
  install -Dm"$1" "$2" "$stage/root$3"
}

cargo build --release --manifest-path "$service/Cargo.toml"
service_target="${CARGO_TARGET_DIR:-$luft/target}"
rm -rf "$stage"
mkdir -p "$stage" "$vm"
cargo run --quiet --manifest-path "$luft/packages/system/windows/Cargo.toml" --features testing --example fake-windows -- \
  "$stage/root/usr/lib/luft-windows-check/fake-windows"
place 755 "$service_target/release/luft-windows" /usr/libexec/luft-windows
place 644 "$service/data/com.lantharos.Windows1.conf" /usr/share/dbus-1/system.d/com.lantharos.Windows1.conf
place 644 "$service/data/com.lantharos.Windows1.service" /usr/share/dbus-1/system-services/com.lantharos.Windows1.service
place 644 "$service/data/luft-windows.service" /usr/lib/systemd/system/luft-windows.service
place 644 "$service/data/com.lantharos.windows.policy" /usr/share/polkit-1/actions/com.lantharos.windows.policy
place 755 "$here/check.sh" /usr/libexec/luft-windows-check
place 644 "$here/luft-windows-check.service" /usr/lib/systemd/system/luft-windows-check.service
place 644 "$here/check.rules" /etc/polkit-1/rules.d/50-luft-windows-check.rules
cp "$here/Containerfile" "$stage/"
podman build --quiet --build-arg "BASE=$base" --tag "$image" "$stage" > /dev/null

rm -f "$vm/root.img" "$vm/windows.img"
podman unshare sh -c "
  set -e
  tree=\$(podman image mount '$image')
  mkfs.ext4 -q -F -L luft-win-check -d \"\$tree\" '$vm/root.img' 16G
  cp \"\$tree\"/usr/lib/modules/*/vmlinuz '$vm/vmlinuz'
  cp \"\$tree\"/usr/lib/luft-windows-check/initramfs.img '$vm/initramfs.img'
  chmod 644 '$vm/vmlinuz' '$vm/initramfs.img'
  podman image unmount '$image' > /dev/null
"
truncate -s 4G "$vm/windows.img"

rm -f "$vm/serial.log"
timeout 15m qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 2 -m 3072 -no-reboot -display none \
  -kernel "$vm/vmlinuz" -initrd "$vm/initramfs.img" \
  -append "root=/dev/vda rw console=ttyS0 selinux=0 systemd.unit=multi-user.target" \
  -drive "file=$vm/root.img,format=raw,if=virtio" \
  -drive "file=$vm/windows.img,format=raw,if=virtio" \
  -device intel-hda -device hda-duplex \
  -serial "file:$vm/serial.log"

grep -a 'luft-windows-check:' "$vm/serial.log"
grep -qa 'luft-windows-check: DONE' "$vm/serial.log"
