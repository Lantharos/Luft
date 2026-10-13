#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
vm="${LUFT_VM:-$os/vm/state}"
image="${1:-localhost/luft:45}"
user="${VM_USER:-luft}"
password="${VM_PASSWORD:-luft-vm}"
test_image=localhost/luft-vm:latest

usage() {
  cat <<'USAGE'
Usage: os/vm/disk.sh [IMAGE]

Installs IMAGE (default localhost/luft:45) onto a virtual disk with bootc, the way
it lands on a real drive, without root on this computer: a helper VM booted from
the image itself runs `bootc install to-disk`. Adds the account luft (password
luft-vm, also root's) so the login screen has someone to sign in.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

mkdir -p "$vm/share"

podman build --tag "$test_image" --build-arg "IMAGE=$image" --build-arg "USER=$user" \
  --build-arg "PASSWORD=$password" --file - "$os/vm" <<'CONTAINERFILE'
ARG IMAGE
FROM ${IMAGE}
ARG USER PASSWORD
RUN useradd --create-home --groups wheel "$USER" && \
    echo "$USER:$PASSWORD" | chpasswd && echo "root:$PASSWORD" | chpasswd && \
    systemctl enable serial-getty@ttyS0.service
CONTAINERFILE
rm -f "$vm/share/image.tar"
podman save --format oci-archive --output "$vm/share/image.tar" "$test_image"

cat >"$vm/share/install.sh" <<'SCRIPT'
#!/bin/sh
set -eux
podman load --input /mnt/share/image.tar
podman run --rm --privileged --pid=host --security-opt label=type:unconfined_t \
  -v /dev:/dev -v /var/lib/containers:/var/lib/containers \
  localhost/luft-vm:latest sh -c 'bootc install to-disk --wipe --generic-image \
    --target-imgref "$(cat /usr/share/luft/image-reference)" \
    --karg console=tty0 --karg console=ttyS0,115200 /dev/vdb'
echo LUFT-INSTALL-DONE
SCRIPT

tree="$(podman unshare podman image mount "$image")"
helper="$vm/helper.img"
rm -f "$helper"
truncate -s 64G "$helper"
podman unshare mkfs.ext4 -q -F -L luft-helper -d "$tree" "$helper"
kernel="$(podman unshare sh -c "ls '$tree/usr/lib/modules'")"
podman unshare sh -c "cat '$tree/usr/lib/modules/$kernel/vmlinuz'" >"$vm/helper-vmlinuz"
podman unshare sh -c "cat '$tree/usr/lib/modules/$kernel/initramfs.img'" >"$vm/helper-initramfs.img"
podman unshare podman image unmount "$image" >/dev/null

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

rm -f "$vm/disk.qcow2"
qemu-img create -q -f qcow2 "$vm/disk.qcow2" "${DISK_SIZE:-48G}"
qemu-system-x86_64 -machine q35,accel=kvm -cpu host -smp 4 -m 6144 -nographic \
  -kernel "$vm/helper-vmlinuz" -initrd "$vm/helper-initramfs.img" \
  -append "root=LABEL=luft-helper rw selinux=0 console=ttyS0 systemd.unit=multi-user.target" \
  -drive "file=$helper,format=raw,if=virtio" \
  -drive "file=$vm/disk.qcow2,format=qcow2,if=virtio" \
  -virtfs "local,path=$vm/share,mount_tag=share,security_model=none" | tee "$vm/install.log"
grep -q LUFT-INSTALL-DONE "$vm/install.log"
rm -f "$helper" "$vm/helper-vmlinuz" "$vm/helper-initramfs.img" "$vm/share/image.tar"
echo "Luft is installed on $vm/disk.qcow2. Start it with os/vm/run.sh."
