#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
luft="$(cd "$root/../.." && pwd)"
vm="${SUSHI_VM:-$root/vm}"
tree="$vm/tree"
stage="$vm/security"

rm -rf "$stage"
"$luft/security/scripts/build.sh" "$stage"
podman unshare cp -a "$stage/." "$tree/"
podman run --rm --security-opt label=disable --rootfs "$tree" systemctl enable luft-usb-protection.service trustd.service
