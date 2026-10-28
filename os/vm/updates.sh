#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"
name="${LUFT_IMAGE_NAME:-localhost/luft}"

usage() {
  cat <<'USAGE'
Usage: os/vm/updates.sh

Makes two updates for the VM in LUFT_VM (default os/vm/state) to try going
back with: update.img, the system from os/image/build.sh (LUFT_IMAGE_NAME-system:45)
under another version, and broken.img, the same with a login screen that never
starts. Each is sealed with the keys os/image/build.sh signs with and saved on
a drive labelled after it, for os/vm/check.py rollback.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

# shellcheck source=os/image/throwaway-keys.sh
source "$os/image/throwaway-keys.sh"
use_signing_keys
require_signed_by_keys "$name-system:45"
mkdir -p "${LUFT_VM:-$os/vm/state}"
vm="$(cd "${LUFT_VM:-$os/vm/state}" && pwd)"

update() {
  local label="$1" version="$2" change="$3" work="$vm/$1"
  podman build --quiet --no-hosts --no-hostname --tag "$name-$label-system" --build-arg "SYSTEM=$name-system:45" \
    --label "org.opencontainers.image.version=$version" --file - "$vm" >/dev/null <<CONTAINERFILE
ARG SYSTEM
FROM \${SYSTEM}
RUN $change
CONTAINERFILE
  "$os/image/seal.sh" "$name-$label-system" "$name-$label"
  rm -rf "$work"
  mkdir -p "$work"
  podman save --quiet --format oci-archive --output "$work/$label.ociarchive" "$name-$label"
  mkfs.ext4 -q -F -L "$label" -d "$work" "$vm/$label.img" "$(($(du -sm "$work" | cut -f1) + 256))M"
  rm -rf "$work"
  podman rmi --force "$name-$label-system" "$name-$label" >/dev/null
}

update update 1.99-nightly.1 "echo update > /usr/share/luft/vm-update"
update broken 1.99-nightly.2 "printf '#!/bin/sh\\nexit 1\\n' > /usr/bin/kestrel-greeter"
