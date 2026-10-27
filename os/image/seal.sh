#!/usr/bin/env bash
set -euo pipefail

image="$(cd "$(dirname "$0")" && pwd)"
kernel="${LUFT_IMAGE_NAME:-localhost/luft}-kernel:45"

usage() {
  cat <<'USAGE'
Usage: os/image/seal.sh SYSTEM SEALED

Seals the image SYSTEM into SEALED: adds a startup image (kernel, initramfs and
command line in one file) that names SYSTEM's exact root file system, signed for
Secure Boot, with its TPM policy signed too, and checks that it names the
system bootc installs from SEALED. The kernel comes from
localhost/luft-kernel:45 (LUFT_IMAGE_NAME-kernel:45), made by os/image/build.sh.
Signs with the keys named by LUFT_SECUREBOOT_KEY, LUFT_SECUREBOOT_CERT and
LUFT_PCR_KEY.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac
(($# == 2)) || { usage >&2; exit 2; }
system="$1"
sealed="$2"
: "${LUFT_SECUREBOOT_KEY:?}" "${LUFT_SECUREBOOT_CERT:?}" "${LUFT_PCR_KEY:?}"

installed_digest() {
  local work
  work="$(mktemp -d "${TMPDIR:-/var/tmp}/luft-seal.XXXXXX")"
  podman save --quiet --format oci-archive --output "$work/sealed.tar" "$sealed"
  podman run --rm --security-opt label=disable --network none --volume "$work:/work" "$sealed" sh -c '
    bootc internals cfs --repo /work/repo init --insecure >/dev/null
    bootc internals cfs --repo /work/repo --insecure oci pull oci-archive:/work/sealed.tar sealed >/dev/null
    bootc internals cfs --repo /work/repo --insecure oci compute-id --bootable sealed
  '
  podman unshare rm -rf "$work"
}

named_digest() {
  podman run --rm --network none "$sealed" \
    sh -c 'grep -aom1 "composefs\.digest=[^ ]*" /boot/EFI/Linux/luft.efi' | sed 's/.*://'
}

echo "Sealing $system as $sealed" >&2
version="$(podman image inspect --format '{{index .Labels "org.opencontainers.image.version"}}' "$system")"
podman build --quiet --layers --file "$image/startup/Containerfile" \
  --annotation "org.opencontainers.image.version=$version" \
  --build-arg "IMAGE=$system" --build-arg "KERNEL=$kernel" \
  --build-arg "SIGNED_BY=$(openssl x509 -in "$LUFT_SECUREBOOT_CERT" -noout -fingerprint -sha256)" \
  --secret "id=secureboot-key,src=$LUFT_SECUREBOOT_KEY" \
  --secret "id=secureboot-cert,src=$LUFT_SECUREBOOT_CERT" \
  --secret "id=pcr-key,src=$LUFT_PCR_KEY" \
  --tag "$sealed" "$image/startup" >/dev/null
installed="$(installed_digest)"
named="$(named_digest)"
[[ "$installed" == "$named" ]] || {
  echo "The startup image names $named, but bootc installs $sealed as $installed." >&2
  exit 1
}
