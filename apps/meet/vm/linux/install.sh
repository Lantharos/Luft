#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
state="${MEET_VM:-$(dirname "$here")/state}"
layout="${1:-}"
name="${2:-$layout}"
vm="$state/$name"
compose=https://dl.fedoraproject.org/pub/fedora/linux/development/45/Everything/x86_64/iso

usage() {
  cat <<'USAGE'
Usage: apps/meet/vm/linux/install.sh LAYOUT [NAME]

Installs Fedora 45 unattended into apps/meet/vm/state/NAME (default: LAYOUT), with
Secure Boot on and Microsoft's keys enrolled, then switches off. The account is ada,
password meet-vm, which is also root's.

  fedora    Fedora Workstation as it installs by default: a 600 MB EFI system partition,
            a 2 GB ext4 /boot and btrfs with the subvolumes root and home, plus a second
            drive mounted at /mnt/data
  home      Fedora with ext4 for / and a separate ext4 /home
  single    Fedora on one ext4 partition, with /home inside it

Start it with apps/meet/vm/linux/run.sh NAME.
USAGE
}

case "$layout" in
  fedora | home | single) ;;
  -h | --help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac

netinst() {
  local iso
  iso="$(curl -fsSL "$compose/" | grep -o 'Fedora-Everything-netinst-x86_64-[^"]*\.iso' | head -n1)"
  if [[ ! -f "$state/$iso" ]]; then
    curl -fsSL --output "$state/$iso.part" "$compose/$iso"
    mv "$state/$iso.part" "$state/$iso"
  fi
  echo "$state/$iso"
}

kickstart_disk() {
  local image="$vm/kickstart.img" config="$vm/ks.cfg"
  cat "$here/kickstart/common.ks" "$here/kickstart/$layout.ks" > "$config"
  rm -f "$image"
  mkfs.fat -C -n OEMDRV "$image" 1024 > /dev/null
  mcopy -i "$image" "$config" ::/ks.cfg
  echo "$image"
}

mkdir -p "$state"
[[ ! -e "$vm/disk.qcow2" ]] || { echo "$vm already has a disk; delete it to install again" >&2; exit 1; }
mkdir -p "$vm"
iso="$(netinst)"
kickstart="$(kickstart_disk)"
qemu-img create -q -f qcow2 "$vm/disk.qcow2" 64G
qemu-img create -q -f qcow2 "$vm/data.qcow2" 8G
ISO="$iso" MEDIA=cd KICKSTART="$kickstart" "$here/run.sh" "$name"
rm -f "$kickstart" "$vm/ks.cfg"
echo "Fedora is installed in $vm"
