#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../.." && pwd)"
iso="$luft/os/iso"
image="${1:-localhost/luft:45}"
state="${LUFT_ISO:-$iso/state}"
work="$state/work"
store="$work/store"
fedora=45
label="Luft-$fedora"
published=ghcr.io/lantharos/luft:$fedora
live_image=localhost/luft-live:$fedora
live_system=localhost/luft-live-system:$fedora
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
Usage: os/iso/build.sh [IMAGE [EDITION...]]

Builds Luft's live USB images from IMAGE (default localhost/luft:45) and
IMAGE-nvidia, pulling them when they aren't here yet. Each stick starts the
regular image and installs without a network. EDITION picks what it carries:

  universal   both images (the default)
  standard    only IMAGE, for computers without NVIDIA graphics
  nvidia      only IMAGE-nvidia

Writes os/iso/state/luft-VERSION.iso, luft-VERSION-standard.iso and
luft-VERSION-nvidia.iso, each with a .sha256 (LUFT_ISO picks another folder).
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac
editions=("${@:2}")
((${#editions[@]})) || editions=(universal)

image_value() {
  podman image inspect --format "$2" "$1"
}

variants_of() {
  case "$1" in
    universal) echo default nvidia ;;
    standard) echo default ;;
    nvidia) echo nvidia ;;
    *) usage >&2; exit 2 ;;
  esac
}

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
  local version
  version="$(image_value "$image" '{{index .Labels "org.opencontainers.image.version"}}')"
  case "$1" in
    universal) echo "luft-$version.iso" ;;
    *) echo "luft-$version-$1.iso" ;;
  esac
}

ensure_images() {
  local edition variant reference
  for edition in "${editions[@]}"; do
    for variant in $(variants_of "$edition"); do
      reference="$(image_of "$variant")"
      podman image exists "$reference" || podman pull "$reference"
    done
  done
  podman image exists "$image" || podman pull "$image"
}

unsealed() {
  local sealed="$1" target="$2" copy="$work/unsealed" config
  rm -rf "$copy"
  podman unshare skopeo copy --quiet "containers-storage:$sealed" "dir:$copy"
  config="$(jq -r '.config.digest | sub("sha256:"; "")' "$copy/manifest.json")"
  jq -c '([.history | to_entries[] | select(.value.empty_layer != true) | .key] | last) as $top |
    .rootfs.diff_ids |= .[:-1] | .history |= del(.[$top])' \
    "$copy/$config" >"$copy/config.json"
  rm "$copy/$config" "$copy/$(jq -r '.layers[-1].digest | sub("sha256:"; "")' "$copy/manifest.json")"
  config="$(sha256sum "$copy/config.json" | cut -d' ' -f1)"
  mv "$copy/config.json" "$copy/$config"
  jq -c --arg digest "sha256:$config" --argjson size "$(stat -c %s "$copy/$config")" \
    '.layers |= .[:-1] | .config.digest = $digest | .config.size = $size' "$copy/manifest.json" >"$copy/manifest.next"
  mv "$copy/manifest.next" "$copy/manifest.json"
  podman unshare skopeo copy --quiet "dir:$copy" "containers-storage:$target"
  podman unshare rm -rf "$copy"
}

live_system() {
  if [[ " ${editions[*]} " == *" nvidia "* ]]; then
    unsealed "$image" "$live_system"
    echo "$live_system"
  else
    echo "$image"
  fi
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
system="$(live_system)"
build_live "$system"
make_initramfs
for edition in "${editions[@]}"; do
  read -ra variants <<<"$(variants_of "$edition")"
  build_live "$system" "${variants[@]}"
  fill_store "${variants[@]}"
  pack "$(iso_name "$edition")"
done
remove_work
