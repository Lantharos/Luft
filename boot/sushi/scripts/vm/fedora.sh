#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
vm="${SUSHI_VM:-$root/vm}"
tree="$vm/tree"
kernel="$1"
passphrase="${VM_PASSWORD:-sushi-vm}"
root_mb="${ROOT_SIZE_MB:-12288}"
esp_mb=600
boot_mb=1024
work="$vm/fedora"
disk="$vm/disk.img"
contexts="$tree/etc/selinux/targeted/contexts/files/file_contexts"

root_uuid=2f9b0dc9-0000-45ee-8c1a-6042d69fc27a
boot_uuid=8c2f0086-0000-405d-8f42-f760509466ef
esp_id=68610303
esp_uuid=6861-0303
machine_id="$(podman unshare cat "$tree/etc/machine-id")"

options="root=UUID=$root_uuid ro rootflags=subvol=root"
luks_uuid=""
fs_mb=$root_mb
if [[ "${LUKS:-0}" == 1 ]]; then
  luks_uuid="$(cat /proc/sys/kernel/random/uuid)"
  fs_mb=$((root_mb - 32))
  options+=" rd.luks.uuid=luks-$luks_uuid"
fi
options+=" sushi plymouth.enable=0 quiet loglevel=3 systemd.show_status=false rd.udev.log_level=3 udev.log_level=3"
options+=" vt.global_cursor_default=0 fbcon=vc:0-5 console=ttyS0,115200 console=tty0"

podman unshare sh -c "
  set -e
  printf '%s\n' \
    'UUID=$root_uuid / btrfs subvol=root,compress=zstd:1 0 0' \
    'UUID=$boot_uuid /boot ext4 defaults 1 2' \
    'UUID=$esp_uuid /boot/efi vfat umask=0077,shortname=winnt 0 2' \
    'UUID=$root_uuid /home btrfs subvol=home,compress=zstd:1 0 0' > '$tree/etc/fstab'
  rm -f '$tree/etc/crypttab'
  if [ -n '$luks_uuid' ]; then
    echo 'luks-$luks_uuid UUID=$luks_uuid none discard' > '$tree/etc/crypttab'
  fi
  printf '%s\n' '$options' > '$tree/etc/kernel/cmdline'
  cat '$tree/lib/modules/$kernel/vmlinuz' > '$tree/boot/vmlinuz-$kernel'
  mkdir -p '$tree/boot/loader/entries'
  printf '%s\n' 'title Fedora Linux ($kernel)' 'version $kernel' 'linux /vmlinuz-$kernel' \
    'initrd /initramfs-$kernel.img' 'options $options' 'grub_users \$grub_users' 'grub_arg --unrestricted' \
    'grub_class fedora' > '$tree/boot/loader/entries/$machine_id-$kernel.conf'
  printf '%s\n' 'set timeout=0' 'insmod part_gpt' 'insmod ext2' 'search --no-floppy --fs-uuid --set=root $boot_uuid' \
    'insmod blscfg' 'blscfg' > '$tree/boot/grub2/grub.cfg'
  printf '%s\n' 'search --no-floppy --fs-uuid --set=dev $boot_uuid' 'set prefix=(\$dev)/grub2' \
    'export \$prefix' 'configfile \$prefix/grub.cfg' > '$tree/boot/efi/EFI/fedora/grub.cfg'
  setfiles -r '$tree' '$contexts' '$tree/etc/fstab' '$tree/etc/kernel' '$tree/boot'
"
[[ -z "$luks_uuid" ]] || podman unshare setfiles -r "$tree" "$contexts" "$tree/etc/crypttab"

podman unshare rm -rf "$work"
mkdir -p "$work"
podman unshare sh -c "
  set -e
  mkdir -p '$work/btrfs' '$work/boot'
  cp -a --reflink=auto '$tree' '$work/btrfs/root'
  mv '$work/btrfs/root/home' '$work/btrfs/home'
  mkdir '$work/btrfs/root/home'
  mv '$work/btrfs/root/boot/'* '$work/boot/'
  rm -rf '$work/boot/efi/'*
  truncate -s ${fs_mb}M '$work/root.img'
  mkfs.btrfs -q -f -U $root_uuid -L fedora -r '$work/btrfs' -u rw:root -u rw:home '$work/root.img'
  truncate -s ${root_mb}M '$work/root.img'
  truncate -s ${boot_mb}M '$work/boot.img'
  mkfs.ext4 -q -F -U $boot_uuid -d '$work/boot' '$work/boot.img'
"
mkfs.fat -C -F 32 -i "$esp_id" -n ESP "$work/esp.img" $((esp_mb * 1024)) >/dev/null
podman unshare env MTOOLS_SKIP_CHECK=1 mcopy -s -i "$work/esp.img" "$tree/boot/efi/EFI" ::/

if [[ -n "$luks_uuid" ]]; then
  printf '%s' "$passphrase" | podman unshare cryptsetup reencrypt --encrypt --disable-locks --type luks2 \
    --reduce-device-size 32M --uuid "$luks_uuid" --batch-mode --key-file - "$work/root.img"
fi

rm -f "$disk"
truncate -s $((1 + esp_mb + boot_mb + root_mb + 1))M "$disk"
sfdisk --quiet "$disk" <<EOF
label: gpt
start=1MiB, size=${esp_mb}MiB, type=uefi, name="EFI System Partition"
size=${boot_mb}MiB, type=linux
size=${root_mb}MiB, type=linux
EOF
place() {
  podman unshare dd if="$1" of="$disk" bs=1M seek="$2" conv=notrunc,sparse status=none
}
place "$work/esp.img" 1
place "$work/boot.img" $((1 + esp_mb))
place "$work/root.img" $((1 + esp_mb + boot_mb))
podman unshare rm -rf "$work"
rm -rf "$vm/esp" "$vm/root.img"
