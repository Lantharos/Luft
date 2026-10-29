#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
destdir="$1"
key="$2"
certificate="$3"
boot_menu="$destdir/usr/lib/sushi/efi/SushiBoot.efi"

bun "$luft/os/image/parts/components/install.ts" "$destdir" --part boot
sbsign --key "$key" --cert "$certificate" --output "$boot_menu" "$boot_menu"
