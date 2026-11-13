# shellcheck shell=bash
# shellcheck source=os/versions.env
source "$(dirname "${BASH_SOURCE[0]}")/../versions.env"

throwaway_keys() {
  local keys="${LUFT_THROWAWAY_KEYS:-${XDG_STATE_HOME:-$HOME/.local/state}/luft/throwaway-keys}"
  mkdir -p "$keys"
  chmod 700 "$keys"
  [[ -f "$keys/secureboot.key" ]] || openssl req -quiet -x509 -newkey rsa:2048 -nodes -days 3650 \
    -subj "/CN=Luft throwaway Secure Boot key/" -keyout "$keys/secureboot.key" -out "$keys/secureboot.crt"
  export LUFT_SECUREBOOT_KEY="$keys/secureboot.key" LUFT_SECUREBOOT_CERT="$keys/secureboot.crt"
  local generation
  for generation in ${PCR_GENERATIONS//,/ }; do
    [[ -f "$keys/pcr-$generation.key" ]] ||
      openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$keys/pcr-$generation.key"
    export "LUFT_PCR_KEY_$generation=$keys/pcr-$generation.key"
  done
}

pcr_keys() {
  local generation name
  for generation in ${PCR_GENERATIONS//,/ }; do
    name="LUFT_PCR_KEY_$generation"
    [[ -z "${!name:-}" ]] || echo "$generation ${!name}"
  done
}

use_signing_keys() {
  [[ -n "${LUFT_SECUREBOOT_KEY:-}" ]] || throwaway_keys
}

require_signed_by_keys() {
  local image="$1" built wanted
  built="$(podman run --rm --network none "$image" \
    openssl x509 -inform DER -in /usr/share/luft/secure-boot/luft.der -noout -fingerprint -sha256)"
  wanted="$(openssl x509 -in "$LUFT_SECUREBOOT_CERT" -noout -fingerprint -sha256)"
  [[ "$built" == "$wanted" ]] && return
  echo "$image was built with another Secure Boot key than $LUFT_SECUREBOOT_CERT, so SushiBoot wouldn't" >&2
  echo "start what this signs. Build it again with os/image/build.sh." >&2
  return 1
}
