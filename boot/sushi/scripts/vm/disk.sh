#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
vm="${SUSHI_VM:-$root/vm}"
tree="$vm/tree"
esp="$vm/esp"
disk="$vm/root.img"
passphrase="${VM_PASSWORD:-sushi-vm}"
size_mb="${ROOT_SIZE_MB:-8192}"

"$root/scripts/vm/tree.sh"
stage="$vm/sushi"
contexts="$tree/etc/selinux/targeted/contexts/files"
rm -rf "$stage"
"$root/scripts/build.sh" "$stage"

omitted=""
[[ "${DRIVER:-initramfs}" == system ]] && omitted="virtio_gpu bochs"
deferred="$tree/etc/modprobe.d/sushi.conf"
podman unshare sh -c "
  cp -a '$stage/.' '$tree/'
  echo 'LABEL=luft-root / ext4 defaults 0 1' > '$tree/etc/fstab'
  mkdir -p '$tree/etc/dracut.conf.d'
  printf '%s\n' 'add_dracutmodules+=\" sushi crypt tpm2-tss \"' 'omit_drivers+=\" $omitted \"' > '$tree/etc/dracut.conf.d/90-sushi-vm.conf'
  rm -f '$deferred'
  [ '${DRIVER:-initramfs}' = initramfs ] && printf '%s\n' 'blacklist nvidia_drm' 'blacklist bochs' > '$deferred'
  echo '$HOME /opt' > '$contexts/file_contexts.subs'
  echo 'SUBSYSTEM==\"drm\", KERNEL==\"card[0-9]*\", ACTION==\"add\", PROGRAM=\"/usr/bin/sleep 0.5\"' > '$tree/etc/udev/rules.d/50-slow-drm.rules'
"
kernel="$(ls "$tree/lib/modules")"
podman run --rm --security-opt label=disable --rootfs "$tree" sh -c "
  systemctl enable sushi.service sushi-quit.service sushi-shutdown.service sushi-drivers.service
  dracut --quiet --force --no-hostonly --kver '$kernel'
"
[[ "${DRIVER:-}" == system ]] && podman unshare sh -c "printf '%s\n' 'blacklist nvidia_drm' 'blacklist bochs' > '$deferred'"
podman unshare setfiles -r "$tree" "$contexts/file_contexts" "$tree"
[[ "${LAYOUT:-}" == fedora ]] && exec "$root/scripts/vm/fedora.sh" "$kernel"

cargo build --release --manifest-path "$root/scripts/vm/display/Cargo.toml" --target x86_64-unknown-uefi --target-dir "$root/target"
rm -rf "$esp"
mkdir -p "$esp/EFI/BOOT" "$esp/EFI/sushi" "$esp/loader/entries"
cp "$root/target/x86_64-unknown-uefi/release/vm-display.efi" "$esp/EFI/BOOT/BOOTX64.EFI"
cp "$root/target/x86_64-unknown-uefi/release/sushiboot.efi" "$esp/EFI/sushi/SushiBoot.efi"
podman unshare sh -c "cat '$tree/lib/modules/$kernel/vmlinuz' > '$esp/vmlinuz'; cat '$tree/boot/initramfs-$kernel.img' > '$esp/initramfs.img'"

rm -f "$disk"
truncate -s "${size_mb}M" "$disk"
fs_mb=$size_mb
[[ "${LUKS:-0}" == 1 ]] && fs_mb=$((size_mb - 32))
podman unshare mkfs.ext4 -q -F -L luft-root -d "$tree" "$disk" "${fs_mb}M"
unlock=""
if [[ "${LUKS:-0}" == 1 ]]; then
  printf '%s' "$passphrase" | cryptsetup reencrypt --encrypt --disable-locks --type luks2 --reduce-device-size 32M \
    --batch-mode --key-file - "$disk"
  unlock="rd.luks.uuid=$(cryptsetup luksUUID --disable-locks "$disk")"
fi

options="root=LABEL=luft-root rw $unlock sushi plymouth.enable=0 quiet loglevel=3 systemd.show_status=false"
options+=" rd.udev.log_level=3 udev.log_level=3 vt.global_cursor_default=0 fbcon=vc:0-5 console=ttyS0,115200 console=tty0"
printf 'timeout %s\ndefault luft\n' "${MENU_TIMEOUT:-0}" > "$esp/loader/loader.conf"
printf 'title Luft\nlinux /vmlinuz\ninitrd /initramfs.img\noptions %s\n' "$options" > "$esp/loader/entries/luft.conf"
printf 'title Luft without the splash\nlinux /vmlinuz\ninitrd /initramfs.img\noptions %s\n' "${options/ sushi / }" > "$esp/loader/entries/plain.conf"
