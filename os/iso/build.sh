#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../.." && pwd)"
iso="$luft/os/iso"
image_name="${LUFT_IMAGE_NAME:-localhost/luft}"
image="${1:-$image_name:45}"
state="${LUFT_ISO:-$iso/state}"
work="$state/work"
store="$work/store"
fedora=45
major=1
label="Luft-$major"
published=ghcr.io/lantharos/luft:$major
live_image=$image_name-live:$fedora
tools=$image_name-iso-tools
initramfs_omitted=(
  ostree bootc plymouth trustd crypt systemd-cryptsetup lvm mdraid dmraid multipath resume btrfs nvdimm
  clevis clevis-pin-tpm2 clevis-pin-file clevis-pin-null clevis-pin-sss clevis-pin-tang tpm2-tss systemd-pcrextend
  fido2 pkcs11 pcsc fips fips-crypto-policies network network-manager nfs iscsi nbd nvmf fcoe fcoe-uefi cifs
  virtiofs virtfs kdumpbase memstrack walinuxagent qemu-net
)
initramfs_omitted_drivers=(nouveau nvidia amdgpu radeon i915 xe)

usage() {
  cat <<'USAGE'
Usage: os/iso/build.sh [IMAGE]

Builds Luft's live USB image from IMAGE (default localhost/luft:45) and
IMAGE-nvidia, pulling them when they aren't here yet. LUFT_IMAGE_NAME names
its own images something other than localhost/luft. The stick starts the
regular image and carries both, so it installs the right one for the computer
without a network.

Writes os/iso/state/luft-VERSION.iso with a .sha256 (LUFT_ISO picks another
folder).
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

image_value() {
  podman image inspect --format "$2" "$1"
}

variants=(default nvidia)

image_of() {
  case "$1" in
    default) echo "$image" ;;
    nvidia) echo "$image-nvidia" ;;
  esac
}

published_of() {
  case "$1" in
    default) echo "$published" ;;
    nvidia) echo "$published-nvidia" ;;
  esac
}

iso_name() {
  echo "luft-$(image_value "$image" '{{index .Labels "org.opencontainers.image.version"}}').iso"
}

ensure_images() {
  local variant reference
  for variant in "${variants[@]}"; do
    reference="$(image_of "$variant")"
    podman image exists "$reference" || podman pull "$reference"
  done
}

install_images() {
  local variant
  for variant; do
    printf '\n[images.%s]\nsource = "containers-storage:%s"\nsize = %s\n' \
      "$variant" "$(published_of "$variant")" "$(image_value "$(image_of "$variant")" '{{.Size}}')"
  done
}

build_live() {
  podman build --quiet --tag "$live_image" --build-arg "IMAGE=$1" \
    --build-arg "INSTALL_IMAGES=$(install_images "${@:2}")" "$iso/live" >/dev/null
}

remove_store() {
  podman unshare sh -c 'if mountpoint -q "$1/overlay"; then umount "$1/overlay"; fi; rm -rf "$1" "$2"' sh "$store" "$work/run"
}

fill_store() {
  local destination="containers-storage:[overlay@$store+$work/run]" variant
  remove_store
  for variant; do
    podman push --quiet "$(image_of "$variant")" "$destination$(published_of "$variant")"
  done
  podman push --quiet "$live_image" "$destination$live_image"
}

make_initramfs() {
  podman run --rm --security-opt label=disable --volume "$work:/work" "$live_image" sh -c '
    kernel="$(ls /usr/lib/modules)"
    mkdir -p /var/roothome
    dracut --quiet --force --no-hostonly --reproducible --add luft-live --omit "$1" --omit-drivers "$2" --kver "$kernel" /work/initrd.img
  ' sh "${initramfs_omitted[*]}" "${initramfs_omitted_drivers[*]}"
}

pack() {
  podman run --rm --security-opt label=disable --volume "$work:/work" --volume "$iso:/iso:ro" \
    --mount "type=image,source=$live_image,destination=/live" \
    --env SOURCE_DATE_EPOCH="$(image_value "$image" '{{.Created.Unix}}')" \
    "$tools" /iso/stages/pack.sh "$label" "$live_image" "/work/$1"
  mv "$work/$1" "$work/$1.sha256" "$state/"
  echo "$state/$1"
}

remove_work() {
  remove_store
  podman unshare rm -rf "$work"
}

ensure_images
remove_work
mkdir -p "$work"
podman build --quiet --tag "$tools" "$iso" >/dev/null
build_live "$image"
make_initramfs
build_live "$image" "${variants[@]}"
fill_store "${variants[@]}"
pack "$(iso_name)"
remove_work
