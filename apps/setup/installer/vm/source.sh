#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
image="$1"
drive="$2"
source="$(dirname "$drive")/source"

rm -rf "$source" "$drive"
mkdir -p "$source/windows"
podman save --quiet --format oci-archive --output "$source/luft.ociarchive" "$image"
"$here/windows-hive.py" "$source/windows/SYSTEM"
mkfs.ext4 -q -F -L luft-source -d "$source" "$drive" "$(($(du -sm "$source" | cut -f1) + 512))M"
rm -rf "$source"
