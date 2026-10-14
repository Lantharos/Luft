#!/usr/bin/env bash
set -euo pipefail

key="$1"
certificate="$2"
source "$(dirname "$0")/rpmfusion.sh"
kernel="$(rpm -q kernel-core --qf '%{VERSION}-%{RELEASE}.%{ARCH}\n' | tail -1)"
akmods_keys=/etc/pki/akmods

install_kernel_devel() {
  local version release arch koji
  dnf install -y "kernel-devel-$kernel" && return
  IFS=- read -r version release <<<"${kernel%.*}"
  arch="${kernel##*.}"
  koji="https://kojipkgs.fedoraproject.org/packages/kernel/$version/$release/$arch"
  dnf install -y "$koji/kernel-devel-$kernel.rpm" "$koji/kernel-devel-matched-$kernel.rpm"
}

use_signing_key() {
  install -Dm640 -g akmods "$key" "$akmods_keys/private/private_key.priv"
  openssl x509 -in "$certificate" -outform DER | install -Dm644 /dev/stdin "$akmods_keys/certs/public_key.der"
}

forget_signing_key() {
  rm -rf "$akmods_keys/private" "$akmods_keys/certs"
}

check_signatures() {
  local module signer expected modules
  expected="$(openssl x509 -in "$certificate" -noout -subject -nameopt multiline | sed -n 's/^ *commonName *= *//p')"
  mapfile -t modules < <(find "/usr/lib/modules/$kernel/extra" -name 'nvidia*.ko*')
  ((${#modules[@]})) || { cat /var/cache/akmods/nvidia/*.failed.log >&2; echo "akmods built no NVIDIA modules for $kernel" >&2; exit 1; }
  for module in "${modules[@]}"; do
    signer="$(modinfo -F signer "$module")"
    [[ "$signer" == "$expected" ]] || { echo "$module is signed by '$signer', not '$expected'" >&2; exit 1; }
  done
}

use_rpmfusion
install_kernel_devel
dnf install -y akmod-nvidia xorg-x11-drv-nvidia-cuda-libs libva-nvidia-driver
use_signing_key
akmods --force --kernels "$kernel" --kmod nvidia
forget_signing_key
check_signatures
dnf remove -y akmod-nvidia akmods kernel-devel kernel-devel-matched
forget_rpmfusion
dnf clean all

printf 'kargs = ["rd.driver.blacklist=nouveau", "modprobe.blacklist=nouveau", "nvidia-drm.modeset=1"]\n' |
  install -Dm644 /dev/stdin /usr/lib/bootc/kargs.d/20-nvidia.toml
sed -i 's/^IMAGE_ID=.*/IMAGE_ID=luft-nvidia/' /usr/lib/os-release
sed -i 's/$/-nvidia/' /usr/share/luft/image-reference
userdel akmods
rm -rf /run/akmods /run/dnf /var/log/akmods /var/cache/akmods /var/log/dnf5.log* /var/lib/dnf /var/cache/ldconfig
