#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../.." && pwd)"
iso="$luft/os/iso"
image="${1:-localhost/luft:45}"
state="${LUFT_ISO:-$iso/state}"
work="$state/work"
fedora=45
label="Luft-$fedora"
published=ghcr.io/lantharos/luft:$fedora
live_image=localhost/luft-live:$fedora
tools=localhost/luft-iso-tools
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

Builds Luft's live USB image from IMAGE (default localhost/luft:45) and IMAGE-nvidia,
pulling them when they aren't here yet. The stick starts Install Luft and carries
both images, so installing needs no network.

Writes os/iso/state/luft-VERSION.iso and its .sha256 (LUFT_ISO picks another folder).
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

image_value() {
  podman image inspect --format "$2" "$1"
}

ensure_images() {
  local reference
  for reference in "$image" "$image-nvidia"; do
    podman image exists "$reference" || podman pull "$reference"
  done
}

build_containers() {
  podman build --quiet --tag "$live_image" --build-arg "IMAGE=$image" "$iso/live" >/dev/null
  podman build --quiet --tag "$tools" "$iso" >/dev/null
}

fill_store() {
  local destination="containers-storage:[overlay@$work/store+$work/run]"
  skopeo copy --quiet "containers-storage:$image" "$destination$published"
  skopeo copy --quiet "containers-storage:$image-nvidia" "$destination$published-nvidia"
  skopeo copy --quiet "containers-storage:$live_image" "$destination$live_image"
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
    --env SOURCE_DATE_EPOCH="$(image_value "$image" '{{.Created.Unix}}')" --env LOADER \
    "$tools" /iso/stages/pack.sh "$label" "$live_image" "/work/$1"
}

ensure_images
name="luft-$(image_value "$image" '{{index .Labels "org.opencontainers.image.version"}}').iso"
build_containers
podman unshare rm -rf "$work"
mkdir -p "$work"
fill_store
make_initramfs
pack "$name"
mv "$work/$name" "$work/$name.sha256" "$state/"
podman unshare rm -rf "$work"
echo "$state/$name"
