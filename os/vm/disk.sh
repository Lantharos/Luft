#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
vm="${LUFT_VM:-$os/vm/state}"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
system="${1:-$image_name-system:45}"
user="${VM_USER:-luft}"
password="${VM_PASSWORD:-luft-vm}"
vm_system=$image_name-vm-system:latest
test_image=$image_name-vm:latest

usage() {
  cat <<'USAGE'
Usage: os/vm/disk.sh [SYSTEM]

Installs the system image SYSTEM (default localhost/luft-system:45, from
os/image/build.sh, or LUFT_IMAGE_NAME-system:45) onto a virtual disk with bootc, the way it lands on a real
drive, without root on this computer: a helper VM booted from the image itself
runs `bootc install to-disk` and puts shim and SushiBoot on the EFI system
partition. Adds the account luft (password luft-vm, also root's) and a serial
console, then seals the result with os/image/seal.sh and the same keys
os/image/build.sh signs with.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

# shellcheck source=os/image/throwaway-keys.sh
source "$os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$system"

mkdir -p "$vm/share"

podman build --quiet --no-hosts --no-hostname --tag "$vm_system" --build-arg "IMAGE=$system" --build-arg "USER=$user" \
  --build-arg "PASSWORD=$password" --file - "$os/vm" >/dev/null <<'CONTAINERFILE'
ARG IMAGE
FROM ${IMAGE}
ARG USER PASSWORD
RUN useradd --create-home --groups wheel "$USER" && \
    echo "$USER:$PASSWORD" | chpasswd && echo "root:$PASSWORD" | chpasswd && \
    systemctl enable serial-getty@ttyS0.service && \
    printf 'kargs = ["console=tty0", "console=ttyS0,115200"]\n' > /usr/lib/bootc/kargs.d/90-vm.toml
CONTAINERFILE
"$os/image/seal.sh" "$vm_system" "$test_image"
rm -f "$vm/share/image.tar"
podman save --quiet --format oci-archive --output "$vm/share/image.tar" "$test_image"

{
  printf '#!/bin/sh\nimage=%s\n' "$test_image"
  cat <<'SCRIPT'
set -eux
podman load --input /mnt/share/image.tar
podman run --rm --privileged --pid=host --security-opt label=type:unconfined_t \
  -v /dev:/dev -v /var/lib/containers:/var/lib/containers \
  -v /sys/firmware/efi/efivars:/sys/firmware/efi/efivars \
  "$image" sh -c '
    bootc install to-disk --wipe --target-imgref ghcr.io/lantharos/luft:1 /dev/vdb
    esp="$(lsblk --list --noheadings --paths --output PATH,PARTTYPE /dev/vdb | grep c12a7328-f81f-11d2-ba4b-00a0c93ec93b | cut -d" " -f1)"
    mkdir -p /run/esp
    mount "$esp" /run/esp
    trustctl startup install --esp /run/esp
    umount /run/esp'
echo LUFT-INSTALL-DONE
SCRIPT
} >"$vm/share/install.sh"

tree="$(podman unshare podman image mount "$test_image")"
helper="$vm/helper.img"
rm -f "$helper"
truncate -s 64G "$helper"
podman unshare mkfs.ext4 -q -F -L luft-helper -d "$tree" "$helper"
podman unshare sh -c "cat '$tree'/boot/EFI/Linux/*.efi" >"$vm/helper-startup.efi"
podman unshare podman image unmount "$test_image" >/dev/null
objcopy -O binary --only-section=.linux "$vm/helper-startup.efi" "$vm/helper-vmlinuz"
objcopy -O binary --only-section=.initrd "$vm/helper-startup.efi" "$vm/helper-initramfs.img"

unit="$vm/luft-vm-install.service"
cat >"$unit" <<'UNIT'
[Unit]
Description=Install Luft onto the second disk
After=local-fs.target

[Service]
Type=oneshot
ExecStartPre=/usr/bin/mkdir -p /mnt/share
ExecStartPre=/usr/bin/mount -t 9p -o trans=virtio,version=9p2000.L,msize=1048576 share /mnt/share
ExecStart=/bin/sh /mnt/share/install.sh
ExecStopPost=/usr/bin/systemctl poweroff
StandardOutput=journal+console
StandardError=journal+console
UNIT
debugfs -w "$helper" -f - >/dev/null <<COMMANDS
write $unit /etc/systemd/system/luft-vm-install.service
symlink /etc/systemd/system/multi-user.target.wants/luft-vm-install.service /etc/systemd/system/luft-vm-install.service
COMMANDS
rm "$unit"

rm -rf "$vm/disk.qcow2" "$vm/OVMF_VARS_4M.qcow2" "$vm/tpm"
cp /usr/share/edk2/ovmf/OVMF_VARS_4M.secboot.qcow2 "$vm/OVMF_VARS_4M.secboot.qcow2"
qemu-img create -q -f qcow2 "$vm/disk.qcow2" "${DISK_SIZE:-48G}"
qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 4 -m 6144 -nographic \
  -drive "if=pflash,format=qcow2,readonly=on,file=/usr/share/edk2/ovmf/OVMF_CODE_4M.qcow2" \
  -drive "if=pflash,format=qcow2,file=$vm/OVMF_VARS_4M.secboot.qcow2" \
  -kernel "$vm/helper-vmlinuz" -initrd "$vm/helper-initramfs.img" \
  -append "root=LABEL=luft-helper rw selinux=0 console=ttyS0 systemd.unit=multi-user.target" \
  -drive "file=$helper,format=raw,if=virtio" \
  -drive "file=$vm/disk.qcow2,format=qcow2,if=virtio" \
  -virtfs "local,path=$vm/share,mount_tag=share,security_model=none" >"$vm/install.log"
grep -q LUFT-INSTALL-DONE "$vm/install.log"
rm -f "$helper" "$vm/helper-vmlinuz" "$vm/helper-startup.efi" "$vm/helper-initramfs.img" "$vm/share/image.tar"
echo "Luft is installed on $vm/disk.qcow2. Start it with os/vm/run.sh, or SECURE_BOOT=1 os/vm/run.sh"
echo "and add Luft's key from disk with os/vm/control.py enroll-from-disk."
