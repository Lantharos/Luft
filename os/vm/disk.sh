#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
image="${1:-${LUFT_IMAGE_NAME:-localhost/luft}:45}"
user="${VM_USER:-luft}"
password="${VM_PASSWORD:-luft-vm}"
followed="${VM_FOLLOWS:-ghcr.io/lantharos/luft:1}"

usage() {
  cat <<'USAGE'
Usage: os/vm/disk.sh [IMAGE]

Installs the sealed image IMAGE (default localhost/luft:45 from
os/image/build.sh, or LUFT_IMAGE_NAME:45) onto LUFT_VM/disk.qcow2 (default
os/vm/state) the way Install Luft does, without root on this computer: a
helper VM started from the image itself runs the image's own installer onto
an empty drive and creates the account VM_USER (default luft) with the
password VM_PASSWORD (default luft-vm).

The installed system is set up and starts at the login screen. root has the
same password on the serial console, and Luft's Secure Boot key is queued
for shim with that password as the code, which os/vm/control.py enroll types.
Updates follow VM_FOLLOWS (default ghcr.io/lantharos/luft:1).
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

mkdir -p "${LUFT_VM:-$os/vm/state}"
vm="$(cd "${LUFT_VM:-$os/vm/state}" && pwd)"
work="$vm/install"
rm -rf "$work"
mkdir -p "$work/source"

podman save --quiet --format oci-archive --output "$work/source/luft.ociarchive" "$image"
cp "$os/vm/guest/install.sh" "$work/source/install.sh"
printf '%s\n%s\n' "$user" "$password" >"$work/source/account"
mkfs.ext4 -q -L luft-source -d "$work/source" "$work/source.img" "$(($(du -sm "$work/source" | cut -f1) + 256))M"
rm -rf "$work/source"

podman unshare sh -c '
  set -e
  tree="$(podman image mount "$1")"
  mkfs.ext4 -q -F -L luft-helper -d "$tree" "$2/helper.img" 16G
  cat "$tree"/boot/EFI/Linux/*.efi >"$2/startup.efi"
  podman image unmount "$1" >/dev/null
' sh "$image" "$work"
objcopy -O binary --only-section=.linux "$work/startup.efi" "$work/vmlinuz"
objcopy -O binary --only-section=.initrd "$work/startup.efi" "$work/initramfs.img"

printf '[images.default]\nsource = "oci-archive:/run/luft-source/luft.ociarchive"\ntarget = "%s"\nsize = %s\n' \
  "$followed" "$(podman image inspect --format '{{.Size}}' "$image")" >"$work/install.toml"
debugfs -w "$work/helper.img" -f - >/dev/null <<COMMANDS
rm /usr/lib/luft-installer/install.toml
write $work/install.toml /usr/lib/luft-installer/install.toml
write $os/vm/guest/luft-vm-install.service /etc/systemd/system/luft-vm-install.service
symlink /etc/systemd/system/multi-user.target.wants/luft-vm-install.service /etc/systemd/system/luft-vm-install.service
COMMANDS

rm -rf "$vm/disk.qcow2" "$vm"/vars.* "$vm/tpm" "$vm/second.qcow2"
qemu-img create -q -f qcow2 "$vm/disk.qcow2" "${DISK_SIZE:-48G}"
DISK="$work/helper.img" DRIVES="$vm/disk.qcow2 $work/source.img:ro" KERNEL="$work/vmlinuz" INITRD="$work/initramfs.img" \
  APPEND="root=LABEL=luft-helper rw selinux=0 console=ttyS0 systemd.unit=multi-user.target" \
  TPM=0 NETWORK=0 HEADLESS=1 MEMORY=6144 SERIAL="$vm/install.log" TIMEOUT=1800 LUFT_VM="$vm" "$os/vm/qemu.sh" -no-reboot
rm -rf "$work"
grep -a 'luft-vm-install:' "$vm/install.log"
grep -qa 'luft-vm-install: DONE' "$vm/install.log" || { echo "Installing failed, see $vm/install.log" >&2; exit 1; }
echo "Luft is installed on $vm/disk.qcow2. Start it with SECURE_BOOT=1 os/vm/qemu.sh and add Luft's key"
echo "on shim's blue screen with os/vm/control.py enroll."
