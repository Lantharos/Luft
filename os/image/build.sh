#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../.." && pwd)"
image="$luft/os/image"
state="${LUFT_IMAGE_STATE:-$image/state}"
fedora=45

usage() {
  cat <<'USAGE'
Usage: os/image/build.sh [luft | luft-nvidia] [PODMAN BUILD OPTIONS...]

Builds the Luft image with Podman and seals it as localhost/luft:45 or
localhost/luft:45-nvidia, with localhost/luft-system:45(-nvidia) as the system
before sealing. Signs with the keys named by LUFT_SECUREBOOT_KEY,
LUFT_SECUREBOOT_CERT (PEM) and LUFT_PCR_KEY, or with throwaway keys kept in
os/image/state/keys, which Secure Boot only accepts once they're enrolled.
USAGE
}

variant="${1:-luft}"
case "$variant" in
  luft) suffix="" ;;
  luft-nvidia) suffix="-nvidia" ;;
  -h | --help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac
shift $(($# > 0 ? 1 : 0))

throwaway_keys() {
  local keys="$state/keys"
  mkdir -p -m 700 "$keys"
  [[ -f "$keys/secureboot.key" ]] || openssl req -quiet -x509 -newkey rsa:2048 -nodes -days 3650 \
    -subj "/CN=Luft throwaway Secure Boot key/" -keyout "$keys/secureboot.key" -out "$keys/secureboot.crt"
  [[ -f "$keys/pcr.key" ]] || openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$keys/pcr.key"
  export LUFT_SECUREBOOT_KEY="$keys/secureboot.key" LUFT_SECUREBOOT_CERT="$keys/secureboot.crt" LUFT_PCR_KEY="$keys/pcr.key"
  echo "Signing with the throwaway keys in $keys." >&2
}

public_keys() {
  local public="$state/public"
  mkdir -p "$public"
  openssl x509 -in "$LUFT_SECUREBOOT_CERT" -outform DER -out "$public/luft-secureboot.der"
  openssl pkey -in "$LUFT_PCR_KEY" -pubout -out "$public/luft-pcr-policy.pub.pem"
  echo "$public"
}

if [[ -z "${LUFT_SECUREBOOT_KEY:-}" || -z "${LUFT_SECUREBOOT_CERT:-}" || -z "${LUFT_PCR_KEY:-}" ]]; then
  throwaway_keys
fi

system="localhost/luft-system:$fedora$suffix"
podman build --layers --jobs 3 --target "$variant" --file "$image/Containerfile" \
  --build-context "public-keys=$(public_keys)" \
  --secret "id=secureboot-key,src=$LUFT_SECUREBOOT_KEY" \
  --secret "id=secureboot-cert,src=$LUFT_SECUREBOOT_CERT" \
  --build-arg "SIGNED_BY=$(openssl x509 -in "$LUFT_SECUREBOOT_CERT" -noout -fingerprint -sha256)" \
  --build-arg "VERSION=$fedora.$(date -u +%Y%m%d).dev" "$@" --tag "$system" "$luft"
"$image/seal.sh" "$system" "localhost/luft:$fedora$suffix"
