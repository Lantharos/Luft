#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
vm="$root/vm"
tree="$vm/tree"
release="${FEDORA_RELEASE:-45}"
user="${VM_USER:-sushi}"
password="${VM_PASSWORD:-sushi-vm}"

packages=(
  systemd systemd-udev dracut kernel-core kernel-modules-core kbd
  cryptsetup e2fsprogs util-linux passwd shadow-utils sudo
  dbus-broker dbus-daemon systemd-pam polkit accountsservice greetd
  gnome-shell xorg-x11-server-Xwayland mesa-dri-drivers
  glibc-langpack-en procps-ng less gnome-backgrounds
)

if [[ -f "$vm/.tree-ready" ]]; then
  exit 0
fi

if [[ ! -f "$vm/.tree-packages" ]]; then
  podman unshare rm -rf "$tree"
  mkdir -p "$tree"
  podman run --rm --security-opt label=disable -v "$tree:/installroot" "registry.fedoraproject.org/fedora:$release" \
    dnf install -y --releasever="$release" --installroot=/installroot --use-host-config \
    --setopt=install_weak_deps=False --nodocs "${packages[@]}"
  touch "$vm/.tree-packages"
fi

podman run --rm --security-opt label=disable --rootfs "$tree" bash -c "
  systemd-firstboot --locale=en_US.UTF-8 --keymap=us --timezone=UTC --setup-machine-id --force
  useradd -m -G wheel '$user'
  echo '$user:$password' | chpasswd
  echo 'root:$password' | chpasswd
  systemctl set-default graphical.target
  systemctl disable gdm.service
  systemctl enable greetd.service serial-getty@ttyS0.service
"
podman unshare sh -c "echo sushi-vm > '$tree/etc/hostname'"
touch "$vm/.tree-ready"
