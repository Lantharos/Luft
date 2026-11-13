#!/usr/bin/env bash
set -euo pipefail

stages="$(dirname "$0")/../../stages"
source "$stages/rpmfusion.sh"
source "$stages/koji.sh"
kernel="$(rpm -q kernel-core --qf '%{VERSION}-%{RELEASE}.%{ARCH}\n' | tail -1)"
extra="usr/lib/modules/$kernel/extra"

install_kernel_devel() {
  local version release arch koji
  dnf install -y "kernel-devel-$kernel" && return
  IFS=- read -r version release <<<"${kernel%.*}"
  arch="${kernel##*.}"
  koji="$(koji_signed kernel "$version" "$release" "$arch")"
  dnf install -y --setopt=localpkg_gpgcheck=1 "$koji/kernel-devel-$kernel.rpm" "$koji/kernel-devel-matched-$kernel.rpm"
}

built_modules() {
  find "$1" -name 'nvidia*.ko.xz' -printf '%P\n'
}

keep_unsigned_modules() {
  local out="$1" module modules
  mapfile -t modules < <(built_modules "/$extra")
  ((${#modules[@]})) || { cat /var/cache/akmods/nvidia/*.failed.log >&2; echo "akmods built no NVIDIA modules for $kernel" >&2; exit 1; }
  for module in "${modules[@]}"; do
    [[ -z "$(modinfo -F signer "/$extra/$module")" ]] || { echo "$module is already signed, by a key the build made up" >&2; exit 1; }
    install -Dm644 "/$extra/$module" "$out/$module"
  done
}

keep_driver() {
  local out="$1" version name nevra repo driver=()
  version="$(rpm -q --qf '%{VERSION}' akmod-nvidia)"
  while read -r name nevra repo; do
    case "$name" in
      akmod-* | kmod-* | *-kmodsrc | nvidia-settings) continue ;;
    esac
    if [[ "$repo" == rpmfusion-nonfree* && "$nevra" == *:"$version"-* ]]; then
      driver+=("$nevra")
    fi
  done < <(dnf repoquery --installed --queryformat '%{name} %{full_nevra} %{from_repo}\n')
  mkdir -p "$out"
  cp /var/cache/akmods/nvidia/kmod-nvidia-"$kernel"-*.rpm "$out/"
  dnf download --destdir "$out" "${driver[@]}"
}

build() {
  local out="$1"
  use_rpmfusion
  install_kernel_devel
  dnf install -y akmod-nvidia xorg-x11-drv-nvidia-cuda-libs
  akmods --force --kernels "$kernel" --kmod nvidia
  keep_unsigned_modules "$out/modules"
  keep_driver "$out/rpms"
}

sign() {
  local key="$1" certificate="$2" unsigned="$3" out="$4/$extra" module expected signer
  expected="$(openssl x509 -in "$certificate" -noout -subject -nameopt multiline | sed -n 's/^ *commonName *= *//p')"
  while read -r module; do
    install -Dm644 "$unsigned/$module" "$out/$module"
    xz --decompress "$out/$module"
    "/usr/src/kernels/$kernel/scripts/sign-file" sha256 "$key" "$certificate" "$out/${module%.xz}"
    xz --check=crc32 --lzma2=dict=1MiB "$out/${module%.xz}"
    signer="$(modinfo -F signer "$out/$module")"
    [[ "$signer" == "$expected" ]] || { echo "$module is signed by '$signer', not '$expected'" >&2; exit 1; }
  done < <(built_modules "$unsigned")
}

case "$1" in
  build) build "$2" ;;
  kernel-devel) install_kernel_devel ;;
  sign) sign "${@:2}" ;;
esac
