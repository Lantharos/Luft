#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../.." && pwd)"
variant="${1:-luft}"
fedora=45

usage() {
  cat <<'USAGE'
Usage: os/image/build.sh [luft | luft-nvidia]

Builds the Luft image with Podman as localhost/luft:45 or localhost/luft:45-nvidia.
The NVIDIA image signs its driver with the key and certificate (PEM) named by
LUFT_SECUREBOOT_KEY and LUFT_SECUREBOOT_CERT, or with a throwaway key.
USAGE
}

case "$variant" in
  luft) tag="localhost/luft:$fedora" ;;
  luft-nvidia) tag="localhost/luft:$fedora-nvidia" ;;
  -h | --help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac

secrets=()
if [[ "$variant" == luft-nvidia ]]; then
  if [[ -z "${LUFT_SECUREBOOT_KEY:-}" || -z "${LUFT_SECUREBOOT_CERT:-}" ]]; then
    keys="$(mktemp -d)"
    trap 'rm -rf "$keys"' EXIT
    openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj "/CN=Luft throwaway key" \
      -keyout "$keys/key.pem" -out "$keys/cert.pem" 2>/dev/null
    LUFT_SECUREBOOT_KEY="$keys/key.pem" LUFT_SECUREBOOT_CERT="$keys/cert.pem"
    echo "Signing NVIDIA's driver with a throwaway key; Secure Boot won't accept it." >&2
  fi
  secrets=(--secret "id=secureboot-key,src=$LUFT_SECUREBOOT_KEY" --secret "id=secureboot-cert,src=$LUFT_SECUREBOOT_CERT")
fi

podman build --layers --jobs 3 --target "$variant" --file "$luft/os/image/Containerfile" \
  --build-arg "VERSION=$fedora.$(date -u +%Y%m%d).dev" "${secrets[@]}" --tag "$tag" "$luft"
