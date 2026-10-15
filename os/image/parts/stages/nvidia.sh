#!/usr/bin/env bash
set -euo pipefail

key="$1"
certificate="$2"
out="$3"
source "$(dirname "$0")/../../stages/rpmfusion.sh"
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

keep_driver() {
  local version name nevra repo driver=()
  version="$(rpm -q --qf '%{VERSION}' akmod-nvidia)"
  while read -r name nevra repo; do
    case "$name" in
      akmod-* | kmod-* | *-kmodsrc) continue ;;
    esac
    if [[ "$repo" == rpmfusion-nonfree* && "$nevra" == *:"$version"-* ]]; then
      driver+=("$nevra")
    fi
  done < <(dnf repoquery --installed --queryformat '%{name} %{full_nevra} %{from_repo}\n')
  mkdir -p "$out"
  cp /var/cache/akmods/nvidia/kmod-nvidia-"$kernel"-*.rpm "$out/"
  dnf download --destdir "$out" "${driver[@]}"
}

use_rpmfusion
install_kernel_devel
dnf install -y akmod-nvidia xorg-x11-drv-nvidia-cuda-libs
use_signing_key
akmods --force --kernels "$kernel" --kmod nvidia
forget_signing_key
check_signatures
keep_driver
